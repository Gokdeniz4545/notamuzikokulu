#!/usr/bin/env node
/* ============================================================
   apply-descriptions.js — onaylanmış açıklamaları Supabase'e yazar

   YAZMA YAPAR. service_role anahtarı ister:
     SUPABASE_SERVICE_ROLE_KEY=... node scripts/apply-descriptions.js [dosya]

   Varsayılan dosya: scripts/_draft-descriptions.json
   Biçim: { "<ürün-slug>": "yeni açıklama", ... }

   ⚠ BU SCRIPT GECE ACTION'INA EKLENMEZ. Elle, gözden geçirdikten
   sonra çalıştırılır. Gece rebuild'i sadece OKUR ve yeni metni
   statik sayfalara yansıtır.

   Akış:
     1) node scripts/audit-descriptions.js      → hangi ürünler?
     2) node scripts/backup-descriptions.js     → geri dönüş noktası
     3) _draft-descriptions.json'ı gözden geçir, onaylamadıklarını SİL
     4) node scripts/apply-descriptions.js      → yaz
     5) npm run build                           → statik sayfalara yansıt
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { SUPABASE_URL, fetchProducts } = require('./shared-chrome');

const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
// Bayraklar dosya adı sanılmasın (--dry tek başına verildiğinde varsayılan kullanılır)
const FILE = args.find((a) => !a.startsWith('--')) || path.join(__dirname, '_draft-descriptions.json');

if (!KEY && !DRY) {
  console.error('✗ SUPABASE_SERVICE_ROLE_KEY tanımlı değil.');
  console.error('  Kullanım: SUPABASE_SERVICE_ROLE_KEY=... node scripts/apply-descriptions.js');
  console.error('  Önizleme için: node scripts/apply-descriptions.js --dry');
  process.exit(1);
}
if (!fs.existsSync(FILE)) {
  console.error(`✗ Dosya yok: ${FILE}`);
  console.error('  Önce taslak üret ve gözden geçir (bkz. dosya başlığındaki akış).');
  process.exit(1);
}

async function main() {
  const drafts = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const slugs = Object.keys(drafts);
  if (!slugs.length) { console.log('Dosya boş, yapacak bir şey yok.'); return; }

  // Slug → id eşlemesi + var olmayan slug'ları yakala (sessizce atlamaktan iyidir)
  const products = await fetchProducts();
  const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));

  const missing = slugs.filter((s) => !bySlug[s]);
  if (missing.length) {
    console.error(`✗ ${missing.length} slug kataloğda yok — yazma iptal edildi:`);
    missing.forEach((s) => console.error(`    ${s}`));
    console.error('  (Ürün silinmiş ya da slug yanlış yazılmış olabilir.)');
    process.exit(1);
  }

  const empty = slugs.filter((s) => !String(drafts[s] || '').trim());
  if (empty.length) {
    console.error(`✗ ${empty.length} açıklama boş — yazma iptal edildi (yanlışlıkla içerik silinmesin):`);
    empty.forEach((s) => console.error(`    ${s}`));
    process.exit(1);
  }

  console.log(`${slugs.length} ürün güncellenecek:\n`);
  slugs.forEach((s) => {
    const eski = String(bySlug[s].description || '').replace(/\s+/g, ' ').trim();
    const yeni = String(drafts[s]).replace(/\s+/g, ' ').trim();
    console.log(`  ${s}`);
    console.log(`    eski (${eski.length}): ${eski.slice(0, 70) || '(boş)'}`);
    console.log(`    yeni (${yeni.length}): ${yeni.slice(0, 70)}\n`);
  });

  if (DRY) { console.log('--dry: hiçbir şey yazılmadı.'); return; }

  let ok = 0;
  for (const slug of slugs) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(bySlug[slug].id)}`,
      {
        method: 'PATCH',
        headers: {
          apikey: KEY,
          Authorization: 'Bearer ' + KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ description: drafts[slug] }),
      }
    );
    if (!res.ok) {
      console.error(`✗ ${slug}: ${res.status} ${await res.text()}`);
      console.error(`  ${ok} ürün yazıldı, kalanlar yazılmadı. Yedekten geri alabilirsin.`);
      process.exit(1);
    }
    ok++;
  }

  console.log(`✓ ${ok} açıklama Supabase'e yazıldı.`);
  console.log('  Sonraki adım:  npm run build   (statik sayfalara yansıt)');
}

main().catch((e) => { console.error('✗', e); process.exit(1); });
