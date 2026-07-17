// ============================================================
// generate-thumbnails.mjs — ürün görsellerinin küçük WebP varyantlarını üretir.
// Supabase image transformation (render/image) bu tenant'ta KAPALI olduğu için
// varyantları biz üretip Storage'a koyuyoruz. Orijinal .jpg'ye DOKUNMAZ.
//
// Her products/<pid>/<iid>.jpg için:
//   products/<pid>/<iid>_360.webp   (mobil kart)
//   products/<pid>/<iid>_720.webp   (masaüstü kart / 2x / detay orta)
//   products/<pid>/<iid>_1200.webp  (detay büyük / panel galeri)
// Runtime tarafı (api.js NMApi.thumb/srcset) bu yolları KONVANSİYONLA türetir → DB değişmez.
//
// Kimlik: scripts/import.config.json (service_role) ya da env (migrate-images.mjs ile aynı).
// Çalıştır:
//   node scripts/generate-thumbnails.mjs            (mevcut varyantları atlar — idempotent)
//   node scripts/generate-thumbnails.mjs --force    (hepsini yeniden üret)
//   node scripts/generate-thumbnails.mjs --dry       (hiçbir şey yüklemez, sadece rapor)
//   node scripts/generate-thumbnails.mjs --limit 5   (ilk 5 görsel — test)
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');
// --fix-cache: mevcut varyantları YENİDEN ÜRETMEDEN, sadece doğru cache-control ile yeniden yükler
// (eski yüklemeler 'public, 31536000' = geçersiz veriyordu; multipart cacheControl → 'max-age=31536000').
const FIX_CACHE = process.argv.includes('--fix-cache');
const LIMIT = (() => { const i = process.argv.indexOf('--limit'); return i > -1 ? parseInt(process.argv[i + 1], 10) : 0; })();

// ---- config (migrate-images.mjs ile birebir aynı yükleme) ----
const env = process.env;
let SB;
if (env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_URL) {
  SB = { url: env.SUPABASE_URL, serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY };
} else {
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'import.config.json'), 'utf8'));
  SB = cfg.supabase;
}
if (!SB || !SB.serviceRoleKey) { console.error('HATA: service_role yok.'); process.exit(1); }

const BUCKET = 'product-images';
const CONCURRENCY = 5;
// [genişlik, webp kalitesi]
const VARIANTS = [[360, 70], [720, 72], [1200, 76]];
const H = (extra = {}) => ({ apikey: SB.serviceRoleKey, Authorization: 'Bearer ' + SB.serviceRoleKey, ...extra });

const publicUrl = (p) => `${SB.url}/storage/v1/object/public/${BUCKET}/${p}`;
const variantPath = (storagePath, w) => storagePath.replace(/\.[a-z0-9]+$/i, '') + `_${w}.webp`;

// ÖNEMLİ: cache-control raw header ile GEÇERSİZ kaydoluyor ('public, 31536000').
// Supabase yalnız multipart 'cacheControl' alanını doğru sarıyor → 'public, max-age=31536000' (1 yıl).
async function uploadWebp(vp, buf) {
  const fd = new FormData();
  fd.append('cacheControl', '31536000');
  fd.append('file', new Blob([buf], { type: 'image/webp' }), 'x.webp');
  return fetch(`${SB.url}/storage/v1/object/${BUCKET}/${vp}`, { method: 'POST', headers: H({ 'x-upsert': 'true' }), body: fd });
}

async function listImages() {
  // Sayfalama (Supabase REST varsayılan 1000 satır sınırı) — Range ile hepsini çek
  const out = [];
  let from = 0; const step = 1000;
  for (;;) {
    const url = `${SB.url}/rest/v1/product_images?select=id,product_id,storage_path`;
    const r = await fetch(url, { headers: H({ Range: `${from}-${from + step - 1}` }) });
    if (!r.ok) throw new Error('liste alınamadı: ' + r.status + ' ' + await r.text());
    const rows = await r.json();
    out.push(...rows);
    if (rows.length < step) break;
    from += step;
  }
  return out;
}

// Kategori görselleri de aynı bucket'ta (categories/<uuid>/<dosya>.png) — image_path TAM URL.
// Bunları da varyantla (anasayfa kategori kartları ilk-boyamada büyük PNG indiriyordu).
function toRelative(u) {
  if (!u) return null;
  const m = /\/object\/public\/product-images\/(.+)$/.exec(u);
  return m ? m[1] : (/^https?:/i.test(u) ? null : u);
}
async function listCategoryImages() {
  const r = await fetch(`${SB.url}/rest/v1/categories?select=id,image_path`, { headers: H() });
  if (!r.ok) throw new Error('kategori listesi alınamadı: ' + r.status);
  return (await r.json())
    .map((c) => ({ id: 'cat-' + c.id, storage_path: toRelative(c.image_path) }))
    .filter((c) => c.storage_path);
}

async function exists(p) {
  const r = await fetch(publicUrl(p), { method: 'HEAD' });
  return r.ok;
}

async function processOne(img) {
  const sp = img.storage_path;
  if (!sp) return { id: img.id, ok: false, reason: 'storage_path boş' };
  if (/^https?:\/\//i.test(sp)) return { id: img.id, ok: false, reason: 'harici URL (migrate edilmemiş)' };

  // --fix-cache: yeniden üretme YOK — mevcut varyant baytını indir, doğru cache-control ile yeniden yükle
  if (FIX_CACHE) {
    let fixed = 0;
    for (const [w] of VARIANTS) {
      const vp = variantPath(sp, w);
      const r = await fetch(publicUrl(vp));
      if (!r.ok) continue; // varyant yoksa atla
      const buf = Buffer.from(await r.arrayBuffer());
      if (!DRY) { const up = await uploadWebp(vp, buf); if (!up.ok) return { id: img.id, ok: false, reason: 'fix ' + up.status }; }
      fixed++;
    }
    return { id: img.id, ok: true, fixed };
  }

  // idempotent: --force yoksa ve 3 varyant da varsa atla
  if (!FORCE) {
    const have = await Promise.all(VARIANTS.map(([w]) => exists(variantPath(sp, w))));
    if (have.every(Boolean)) return { id: img.id, ok: true, skipped: true };
  }

  // orijinali BİR kez indir
  const resp = await fetch(publicUrl(sp));
  if (!resp.ok) return { id: img.id, ok: false, reason: 'download ' + resp.status };
  const orig = Buffer.from(await resp.arrayBuffer());
  if (orig.length < 500) return { id: img.id, ok: false, reason: 'boş/çok küçük' };

  // Ürün görselleri kareye pad'lenir (beyaz zemin) → tüm ürünler birebir aynı izle görünür,
  // asla kırpılmaz. Kategori görselleri (cat-*) banner/logo olduğundan sadece genişlikle boyutlanır.
  const isCat = String(img.id).startsWith('cat-');
  let outBytes = 0;
  for (const [w, q] of VARIANTS) {
    const vp = variantPath(sp, w);
    if (!FORCE && await exists(vp)) continue;
    const pipe = isCat
      ? sharp(orig).rotate().resize({ width: w, withoutEnlargement: true })
      : sharp(orig).rotate().resize({ width: w, height: w, fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } });
    const webp = await pipe.webp({ quality: q }).toBuffer();
    outBytes += webp.length;
    if (DRY) continue;
    const up = await uploadWebp(vp, webp);
    if (!up.ok) return { id: img.id, ok: false, reason: 'upload ' + up.status + ' ' + (await up.text()).slice(0, 120) };
  }
  return { id: img.id, ok: true, origBytes: orig.length, outBytes };
}

async function pool(items, worker, size) {
  const results = []; let i = 0;
  async function run() { while (i < items.length) { const idx = i++; results[idx] = await worker(items[idx]); if (idx % 10 === 0) process.stdout.write('.'); } }
  await Promise.all(Array.from({ length: size }, run));
  return results;
}

let imgs = [...await listImages(), ...await listCategoryImages()];
if (LIMIT) imgs = imgs.slice(0, LIMIT);
console.log(`İşlenecek görsel: ${imgs.length}${DRY ? '  [DRY]' : ''}${FORCE ? '  [FORCE]' : ''}`);
const res = await pool(imgs, processOne, CONCURRENCY);
console.log('');
const ok = res.filter((r) => r.ok && !r.skipped);
const skip = res.filter((r) => r.ok && r.skipped);
const fail = res.filter((r) => !r.ok);
const origMB = ok.reduce((s, r) => s + (r.origBytes || 0), 0) / 1e6;
const outMB = ok.reduce((s, r) => s + (r.outBytes || 0), 0) / 1e6;
console.log(`✓ Üretildi: ${ok.length}  ·  ⏭ Atlandı (mevcut): ${skip.length}  ·  ✗ Hata: ${fail.length}`);
if (ok.length) console.log(`   Orijinal ${origMB.toFixed(1)} MB → varyant ${outMB.toFixed(1)} MB (${(100 - outMB / origMB * 100).toFixed(0)}% daha küçük)`);
if (fail.length) fail.slice(0, 30).forEach((r) => console.log(`   - ${r.id}: ${r.reason}`));
