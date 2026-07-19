#!/usr/bin/env node
/* ============================================================
   audit-descriptions.js — ince ürün açıklamalarını raporlar
   SALT OKUNUR: hiçbir dosya yazmaz, Supabase'e dokunmaz.

   Çalıştır:  node scripts/audit-descriptions.js
              node scripts/audit-descriptions.js 30   (ilk 30)

   Skor = öncelik. Yüksek skor "önce bunu düzelt" demektir:
     • açıklama ne kadar kısaysa o kadar yüksek
     • stokta + görselli ürünler öne çıkar (satılabilir olanı önce düzelt)
     • kalabalık kategorideki ürünler öne çıkar (kategori sayfasını besler)
   ============================================================ */

const { fetchProducts, imageUrls, isTestProduct } = require('./shared-chrome');

const LIMIT = Number(process.argv[2]) || 30;
const THIN = 200; // karakter — bunun altı "ince içerik" sayılır

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();

// Trendyol'dan kopyalanmış CAPS-LOCK spec dökümü mü?
const isCapsDump = (s) => {
  const letters = s.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, '');
  if (letters.length < 30) return false;
  const upper = letters.replace(/[^A-ZÇĞİÖŞÜ]/g, '').length;
  return upper / letters.length > 0.7;
};

// Açıklama sadece ürün adının tekrarı mı?
const isNameEcho = (desc, name) => {
  const d = clean(desc).toLowerCase();
  const n = clean(name).toLowerCase();
  return d.length > 0 && (d === n || n.indexOf(d) === 0 || d.indexOf(n) === 0) && d.length < n.length + 20;
};

function problem(p) {
  const d = clean(p.description);
  if (!d) return 'BOŞ';
  if (isNameEcho(d, p.name)) return 'ad tekrarı';
  if (isCapsDump(d)) return 'CAPS spec dökümü';
  if (d.length < 60) return 'çok kısa';
  if (d.length < THIN) return 'kısa';
  return null;
}

async function main() {
  const all = (await fetchProducts()).filter((p) => !isTestProduct(p));

  // kategori büyüklüğü (kalabalık kategori = kategori sayfasına daha çok katkı)
  const catSize = {};
  all.forEach((p) => {
    const c = p.categories ? p.categories.slug : '-';
    catSize[c] = (catSize[c] || 0) + 1;
  });

  const rows = all.map((p) => {
    const d = clean(p.description);
    const imgs = imageUrls(p.product_images).length;
    const cat = p.categories ? p.categories.slug : '-';
    const score =
      Math.max(0, THIN - d.length) +        // kısalık ağırlığı (0-200)
      (p.stock > 0 ? 40 : 0) +              // satılabilir olan öncelikli
      (imgs > 0 ? 30 : 0) +                 // görselli olan öncelikli
      Math.min(30, (catSize[cat] || 0) * 2); // kalabalık kategori bonusu
    return { p, d, imgs, cat, score, problem: problem(p) };
  }).filter((r) => r.problem)
    .sort((a, b) => b.score - a.score);

  const capsCount = rows.filter((r) => r.problem === 'CAPS spec dökümü').length;
  const emptyCount = rows.filter((r) => r.problem === 'BOŞ').length;

  console.log(`\n${all.length} aktif üründen ${rows.length} tanesinde açıklama sorunu var.`);
  console.log(`  BOŞ: ${emptyCount} · ad tekrarı: ${rows.filter((r) => r.problem === 'ad tekrarı').length} · CAPS dökümü: ${capsCount} · kısa: ${rows.filter((r) => /kısa/.test(r.problem)).length}\n`);
  console.log(`En öncelikli ${Math.min(LIMIT, rows.length)} ürün:\n`);

  console.log('| # | Skor | Sorun | Kar. | Görsel | Stok | Kategori | Ürün |');
  console.log('|---|------|-------|------|--------|------|----------|------|');
  rows.slice(0, LIMIT).forEach((r, i) => {
    console.log(
      `| ${i + 1} | ${r.score} | ${r.problem} | ${r.d.length} | ${r.imgs} | ${r.p.stock} | ${r.cat} | ${r.p.name.slice(0, 48)} |`
    );
  });

  console.log(`\nSonraki adım:  node scripts/backup-descriptions.js   (yedek al)`);
  console.log(`Slug listesi (draft üretimi için):\n`);
  console.log(rows.slice(0, LIMIT).map((r) => r.p.slug).join('\n'));
}

main().catch((e) => { console.error('✗', e); process.exit(1); });
