#!/usr/bin/env node
/* ============================================================
   backup-descriptions.js — mevcut ürün açıklamalarını yedekle
   SALT OKUNUR (Supabase'e yazmaz). Çıktı git'e girmez (.gitignore).

   Çalıştır:  node scripts/backup-descriptions.js

   apply-descriptions.js çalıştırmadan ÖNCE mutlaka bunu çalıştır.
   Geri alma:  node scripts/apply-descriptions.js scripts/_backup-descriptions-<tarih>.json
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { fetchProducts } = require('./shared-chrome');

async function main() {
  const products = await fetchProducts();
  const out = {};
  products.forEach((p) => { out[p.slug] = p.description || ''; });

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const file = path.join(__dirname, `_backup-descriptions-${stamp}.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 2), 'utf8');

  const empty = Object.values(out).filter((d) => !d.trim()).length;
  console.log(`✓ ${products.length} açıklama yedeklendi → ${path.basename(file)}`);
  console.log(`  (${empty} tanesi zaten boştu)`);
  console.log(`\nGeri almak için:  node scripts/apply-descriptions.js ${path.relative(process.cwd(), file)}`);
}

main().catch((e) => { console.error('✗', e); process.exit(1); });
