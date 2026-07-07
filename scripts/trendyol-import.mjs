// ============================================================
// Trendyol → Supabase toplu ürün içe aktarma (tek seferlik araç)
// Bağımlılık yok — Node 18+ global fetch kullanır.
//
// Çalıştır:  node scripts/trendyol-import.mjs
//   --dry    sadece önizleme yapar, hiçbir şey yazmaz
//
// Kimlik bilgileri: önce ORTAM DEĞİŞKENİ, yoksa scripts/import.config.json (ikisi de git'e gitmez)
//   Önerilen: `node --env-file=scripts/.env scripts/trendyol-import.mjs`
//   Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//        TRENDYOL_SUPPLIER_ID, TRENDYOL_API_KEY, TRENDYOL_API_SECRET
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY = process.argv.includes('--dry');

// ---- config ----
// Öncelik: ortam değişkeni (güvenli). Yoksa scripts/import.config.json (fallback).
const env = process.env;
let TY, SB;
if (env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_URL && env.TRENDYOL_API_KEY) {
  TY = { supplierId: env.TRENDYOL_SUPPLIER_ID, apiKey: env.TRENDYOL_API_KEY, apiSecret: env.TRENDYOL_API_SECRET };
  SB = { url: env.SUPABASE_URL, serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY };
} else {
  const cfgPath = path.join(__dirname, 'import.config.json');
  if (!fs.existsSync(cfgPath)) {
    console.error('HATA: Kimlik bilgisi yok. Ortam değişkenlerini ayarla (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TRENDYOL_API_KEY ...) veya scripts/import.config.json oluştur.');
    process.exit(1);
  }
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  TY = cfg.trendyol;
  SB = cfg.supabase;
}
if (!SB || !SB.serviceRoleKey || SB.serviceRoleKey.includes('BURAYA')) {
  console.error('HATA: Supabase service_role anahtarı eksik (env: SUPABASE_SERVICE_ROLE_KEY veya import.config.json).');
  process.exit(1);
}

const BUCKET = 'product-images';

// Trendyol kategori adı → site kategori slug eşlemesi
const CAT_MAP = {
  'Gitar': 'guitars',
  'Bateri': 'drums',
  'Davul': 'drums',
  'Piyano': 'keys',
  'Org': 'keys',
  'Keman': 'strings',
  'Baget': 'access',
  'Gitar Aksesuarı': 'access',
  'Gitar Teli': 'access',
  'Enstrüman Teli': 'access',
  'Piyano Taburesi': 'access',
  'Oto Kokusu': 'access',
  'Efekt Aleti': 'access',
  'Müzik Aleti Aksesuarı': 'access',
  'Amfi': 'access',
};
const FALLBACK_CAT = 'access';

// ---- yardımcılar ----
const tyAuth = 'Basic ' + Buffer.from(`${TY.apiKey}:${TY.apiSecret}`).toString('base64');
const tyHeaders = { Authorization: tyAuth, 'User-Agent': `${TY.supplierId} - SelfIntegration` };

const sbHeaders = (extra = {}) => ({
  apikey: SB.serviceRoleKey,
  Authorization: 'Bearer ' + SB.serviceRoleKey,
  ...extra,
});

function slugify(s) {
  const map = { 'ç':'c','ğ':'g','ı':'i','İ':'i','ö':'o','ş':'s','ü':'u','â':'a','î':'i','û':'u' };
  return String(s || '').toLowerCase()
    .replace(/[çğıİöşüâîû]/g, c => map[c] || c)
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

// Ürünün rengini çıkar (standart 'Renk' attribute'unu tercih et)
function colorOf(p) {
  const renks = (p.attributes || []).filter(a => a.attributeName === 'Renk');
  if (!renks.length) return '';
  const std = renks.find(a => a.attributeValueId) || renks[0];
  return (std.attributeValue || '').trim();
}

// HTML açıklamayı düz metne çevir (paragraf/madde yapısını koru)
function htmlToText(html) {
  if (!html) return '';
  let t = String(html);
  t = t.replace(/<\s*br\s*\/?\s*>/gi, '\n');
  t = t.replace(/<\/\s*(p|div|h[1-6]|li)\s*>/gi, '\n');
  t = t.replace(/<\s*li[^>]*>/gi, '• ');
  t = t.replace(/<[^>]+>/g, '');
  t = t.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<')
       .replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;/gi, "'");
  t = t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').replace(/^[ \t]+|[ \t]+$/gm, '');
  return t.trim();
}

// ---- Trendyol: tüm ürünleri çek ----
async function fetchAllProducts() {
  const all = [];
  let page = 0, totalPages = 1;
  do {
    const url = `https://apigw.trendyol.com/integration/product/sellers/${TY.supplierId}/products?page=${page}&size=50`;
    const res = await fetch(url, { headers: tyHeaders });
    if (!res.ok) throw new Error(`Trendyol API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    totalPages = data.totalPages;
    all.push(...data.content);
    page++;
  } while (page < totalPages);
  return all;
}

// ---- Supabase REST yardımcıları ----
async function sbGet(table, query) {
  const res = await fetch(`${SB.url}/rest/v1/${table}?${query}`, { headers: sbHeaders() });
  if (!res.ok) throw new Error(`SB GET ${table} ${res.status}: ${await res.text()}`);
  return res.json();
}
async function sbInsert(table, row) {
  const res = await fetch(`${SB.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: sbHeaders({ 'Content-Type': 'application/json', Prefer: 'return=representation' }),
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`SB INSERT ${table} ${res.status}: ${await res.text()}`);
  const arr = await res.json();
  return arr[0];
}
async function sbDelete(table, query) {
  const res = await fetch(`${SB.url}/rest/v1/${table}?${query}`, { method: 'DELETE', headers: sbHeaders() });
  if (!res.ok) throw new Error(`SB DELETE ${table} ${res.status}: ${await res.text()}`);
}
// Bir ürüne görselleri ekle — Trendyol CDN linkini doğrudan sakla (indirme yok).
// (Görseli indirip Supabase'e yüklemek tek IP'den 300+ istekte CDN burst-limit'ine
//  takılıyordu. Hotlink: ziyaretçi sayfa başına ~4 görseli kendi IP'sinden yükler.)
// storage_path tam URL ise app onu doğrudan kullanır (api.js toUrl / NMAdmin.publicUrl).
async function addImages(productId, imgs) {
  let n = 0;
  for (let i = 0; i < imgs.length; i++) {
    try {
      await sbInsert('product_images', {
        product_id: productId, storage_path: imgs[i],
        is_primary: i === 0, display_order: i,
      });
      n++;
    } catch (e) { console.warn(`   ⚠ görsel ${i} eklenemedi: ${e.message}`); }
  }
  return n;
}

// ---- ana akış ----
async function main() {
  console.log(DRY ? '🔍 ÖNİZLEME modu (hiçbir şey yazılmayacak)\n' : '🚀 İçe aktarma başlıyor\n');

  // kategori slug → id haritası
  const cats = await sbGet('categories', 'select=id,slug');
  const catIdBySlug = Object.fromEntries(cats.map(c => [c.slug, c.id]));
  for (const slug of new Set(Object.values(CAT_MAP).concat(FALLBACK_CAT))) {
    if (!catIdBySlug[slug]) { console.error(`HATA: '${slug}' kategorisi sitede yok.`); process.exit(1); }
  }

  // mevcut ürünler + görsel sayıları (tekrar çalıştırmada atla / görsel tamamla)
  const existing = await sbGet('products', 'select=id,slug,product_images(id)');
  const bySlug = new Map(existing.map(p => [p.slug, { id: p.id, imgCount: (p.product_images || []).length }]));

  const products = await fetchAllProducts();
  console.log(`Trendyol'da ${products.length} ürün bulundu.\n`);

  // Aynı modelin (productMainId) kaç renk varyantı var → ayırt etmek için
  const variantCount = {};
  for (const p of products) {
    const k = p.productMainId || p.title || '';
    variantCount[k] = (variantCount[k] || 0) + 1;
  }

  let created = 0, backfilled = 0, skipped = 0, failed = 0, imgCount = 0;

  for (const p of products) {
    const title = p.title || p.productMainId || 'Ürün';
    // Çok renkli model → rengi başa al (kartta görünür); başlıkta zaten varsa ekleme
    const color = colorOf(p);
    const isVariant = (variantCount[p.productMainId || title] || 1) > 1;
    let name = (color && isVariant && !slugify(title).includes(slugify(color)))
      ? `${color} — ${title}`
      : title;
    name = name.slice(0, 255);

    const baseSlug = (slugify(title).slice(0, 170) + '-' + slugify(p.barcode || p.stockCode || '')).replace(/-+$/,'');
    const slug = baseSlug.slice(0, 250);
    const imgs = (p.images || []).map(i => i.url).filter(Boolean);
    const ex = bySlug.get(slug);

    // Zaten var ve görselleri tam (Trendyol'daki kadar) → atla
    if (ex && ex.imgCount >= imgs.length && ex.imgCount > 0) { skipped++; continue; }

    const catSlug = CAT_MAP[p.categoryName] || FALLBACK_CAT;
    const row = {
      slug, name,
      category_id: catIdBySlug[catSlug],
      price: Number(p.salePrice ?? p.listPrice ?? 0),
      stock: Number(p.quantity ?? 0),
      description: htmlToText(p.description),
      is_active: !!(p.approved && p.onSale),
    };

    if (DRY) {
      console.log(`• ${name.slice(0,60)}  [${catSlug}]  ${row.price}₺  stok:${row.stock}  görsel:${imgs.length}`);
      created++;
      continue;
    }

    try {
      let prodId, tag;
      if (ex) {
        // ürün var ama görselleri eksik → eskileri sil, baştan ekle (tutarlı sıra)
        prodId = ex.id;
        await sbDelete('product_images', `product_id=eq.${ex.id}`);
        tag = 'görsel yenilendi'; backfilled++;
      } else {
        const prod = await sbInsert('products', row);
        prodId = prod.id; tag = 'yeni'; created++;
      }
      const n = await addImages(prodId, imgs);
      imgCount += n;
      console.log(`✓ [${tag}] ${name.slice(0,48)}  (${n}/${imgs.length} görsel)`);
    } catch (e) {
      failed++;
      console.error(`✗ ${name.slice(0,48)} — ${e.message}`);
    }
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`Yeni: ${created}  |  Görsel tamamlanan: ${backfilled}  |  Atlanan: ${skipped}  |  Hatalı: ${failed}  |  Yüklenen görsel: ${imgCount}`);
  if (DRY) console.log('\n(Önizlemeydi — gerçek aktarım için --dry olmadan çalıştır.)');
}

main().catch(e => { console.error('\nKRİTİK HATA:', e.message); process.exit(1); });
