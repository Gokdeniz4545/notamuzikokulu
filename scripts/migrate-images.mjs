// ============================================================
// migrate-images.mjs — Trendyol (dsmcdn) hotlink görsellerini
// Supabase Storage'a taşır (CDN bağımlılığını + rich-result riskini kaldırır).
// - product_images.storage_path LIKE '%dsmcdn%' olanları indirir
// - product-images bucket'ına products/<product_id>/<image_id>.jpg olarak yükler
// - storage_path'i göreli path ile günceller (toUrl bunu /public/ ile çözer)
// Kimlik: scripts/import.config.json (service_role) ya da env.
// Çalıştır:  node scripts/migrate-images.mjs [--dry]
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes('--dry');

// ---- config ----
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
const CONCURRENCY = 8;
const H = (extra = {}) => ({ apikey: SB.serviceRoleKey, Authorization: 'Bearer ' + SB.serviceRoleKey, ...extra });

async function listHotlinked() {
  const url = `${SB.url}/rest/v1/product_images?select=id,product_id,storage_path,display_order&storage_path=like.*dsmcdn*`;
  const r = await fetch(url, { headers: H() });
  if (!r.ok) throw new Error('liste alınamadı: ' + r.status + ' ' + await r.text());
  return r.json();
}

async function migrateOne(img) {
  // 1) indir
  const src = img.storage_path;
  const resp = await fetch(src);
  if (!resp.ok) return { id: img.id, ok: false, reason: 'download ' + resp.status };
  const buf = Buffer.from(await resp.arrayBuffer());
  if (buf.length < 500) return { id: img.id, ok: false, reason: 'boş/çok küçük (' + buf.length + 'b)' };

  const dest = `products/${img.product_id}/${img.id}.jpg`;
  if (DRY) return { id: img.id, ok: true, dry: true, dest, bytes: buf.length };

  // 2) Storage'a yükle (upsert)
  const up = await fetch(`${SB.url}/storage/v1/object/${BUCKET}/${dest}`, {
    method: 'POST',
    headers: H({ 'Content-Type': 'image/jpeg', 'x-upsert': 'true', 'cache-control': '31536000' }),
    body: buf,
  });
  if (!up.ok) return { id: img.id, ok: false, reason: 'upload ' + up.status + ' ' + (await up.text()).slice(0, 120) };

  // 3) DB güncelle
  const patch = await fetch(`${SB.url}/rest/v1/product_images?id=eq.${img.id}`, {
    method: 'PATCH',
    headers: H({ 'Content-Type': 'application/json', Prefer: 'return=minimal' }),
    body: JSON.stringify({ storage_path: dest }),
  });
  if (!patch.ok) return { id: img.id, ok: false, reason: 'db ' + patch.status };
  return { id: img.id, ok: true, dest, bytes: buf.length };
}

async function pool(items, worker, size) {
  const results = []; let i = 0;
  async function run() { while (i < items.length) { const idx = i++; results[idx] = await worker(items[idx]); if (idx % 20 === 0) process.stdout.write('.'); } }
  await Promise.all(Array.from({ length: size }, run));
  return results;
}

const imgs = await listHotlinked();
console.log(`Taşınacak (dsmcdn) görsel: ${imgs.length}${DRY ? '  [DRY RUN]' : ''}`);
const res = await pool(imgs, migrateOne, CONCURRENCY);
console.log('');
const ok = res.filter((r) => r.ok);
const fail = res.filter((r) => !r.ok);
const bytes = ok.reduce((s, r) => s + (r.bytes || 0), 0);
console.log(`✓ Başarılı: ${ok.length}  (${(bytes / 1e6).toFixed(1)} MB)`);
if (fail.length) {
  console.log(`✗ Başarısız: ${fail.length}`);
  fail.slice(0, 30).forEach((r) => console.log(`   - ${r.id}: ${r.reason}`));
}
