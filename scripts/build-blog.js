#!/usr/bin/env node
/* ============================================================
   build-blog.js — tek kaynak (blog-data.js) → statik çıktı
   Üretir:
     • blog-<slug>.html  (her yazı için taranabilir, SSR sayfa)
     • sitemap.xml       (anasayfa + ürünler + blog + yazılar + yasal)
   Çalıştır:  node scripts/build-blog.js
   NOT: Bu bir dev-time script'tir (runtime build değil). İçerik
   değişince yeniden çalıştır, çıktı dosyalarını commit'le.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { SITE, sharedScripts, header, footer, pinVersions, esc, stripHtml } = require('./shared-chrome');

const ROOT = path.resolve(__dirname, '..');

// ---- blog-data.js'i yükle (window shim) ----
const dataSrc = fs.readFileSync(path.join(ROOT, 'blog-data.js'), 'utf8');
const sandbox = { window: {} };
new Function('window', dataSrc)(sandbox.window);
const POSTS = sandbox.window.BLOG_POSTS;
if (!Array.isArray(POSTS) || !POSTS.length) {
  console.error('✗ BLOG_POSTS bulunamadı'); process.exit(1);
}

// ---- yardımcılar ----
const trDate = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtDate = (iso) => trDate.format(new Date(iso));
const readLabel = (p) => p.readMin + ' dk okuma';

// ---- ortak chrome (shared-chrome.js tek kaynak) ----
const HEADER = header('blog.html');

// cerez-politikasi.html'den türetilir
const FOOTER = footer();

// product.html'den türetilir — elle sürüm listesi tutmak bayatlamaya yol açıyordu
const SCRIPTS = sharedScripts();

// ---- tek yazı sayfası ----
function articleHtml(p, i) {
  const url = `${SITE}/blog-${p.slug}.html`;
  const next = POSTS[(i + 1) % POSTS.length];
  const img = `${SITE}/images/og-image.png`;

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        'headline': p.title,
        'description': p.dek,
        'articleBody': stripHtml(p.body),
        'keywords': p.keywords,
        'articleSection': p.category,
        'inLanguage': 'tr-TR',
        'datePublished': p.date,
        'dateModified': p.date,
        'wordCount': stripHtml(p.body).split(' ').length,
        'mainEntityOfPage': { '@type': 'WebPage', '@id': url },
        'url': url,
        'image': img,
        'author': { '@type': 'Organization', 'name': 'Nota Müzik Market', 'url': SITE + '/' },
        'publisher': {
          '@type': 'Organization',
          'name': 'Nota Müzik Market',
          'logo': { '@type': 'ImageObject', 'url': SITE + '/images/logo-square.png' }
        }
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Ana Sayfa', 'item': SITE + '/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': SITE + '/blog.html' },
          { '@type': 'ListItem', 'position': 3, 'name': p.title, 'item': url }
        ]
      }
    ]
  };

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${esc(p.title)} — Nota Müzik Market</title>
<meta name="description" content="${esc(p.dek)}" />
<meta name="keywords" content="${esc(p.keywords)}" />
<meta name="robots" content="index, follow" />
<meta name="theme-color" content="#fafafa" />
<link rel="canonical" href="${url}" />

<meta property="og:type" content="article" />
<meta property="og:site_name" content="Nota Müzik Market" />
<meta property="og:locale" content="tr_TR" />
<meta property="og:title" content="${esc(p.title)}" />
<meta property="og:description" content="${esc(p.dek)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${img}" />
<meta property="article:published_time" content="${p.date}" />
<meta property="article:section" content="${esc(p.category)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(p.title)}" />
<meta name="twitter:description" content="${esc(p.dek)}" />
<meta name="twitter:image" content="${img}" />

<link rel="icon" type="image/png" href="images/logo-icon.png" />
<link rel="apple-touch-icon" href="images/logo-icon.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap" />
<link rel="stylesheet" href="styles.css?v=38" />
<link rel="stylesheet" href="auth.css?v=28" />
<link rel="stylesheet" href="shop.css?v=32" />
<link rel="stylesheet" href="blog.css?v=2" />
<link rel="stylesheet" href="legal.css?v=1" />

<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>
<body class="shop-page blog-page blog-article-page">

${HEADER}

<main class="blog-shell">
  <article class="reader reader-static">
    <div class="reader-inner">
      <a class="reader-back" href="blog.html">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Tüm yazılar
      </a>

      <p class="reader-eyebrow">${esc(p.category)}</p>
      <h1 class="reader-title">${esc(p.title)}</h1>
      <p class="reader-meta">${esc(fmtDate(p.date))}  ·  ${esc(readLabel(p))}</p>
      <div class="reader-rule" aria-hidden="true"></div>

      <div class="reader-body">${p.body.trim()}</div>

      <footer class="reader-foot">
        <a class="reader-cta" href="products.html">Ürünlere göz at →</a>
        <div class="reader-next">
          <span class="reader-next-label">Sıradaki yazı</span>
          <a class="reader-next-link" href="blog-${next.slug}.html">${esc(next.title)}</a>
        </div>
      </footer>
    </div>
  </article>
</main>

${FOOTER}

<div class="nm-toast" id="nmToast" role="status" aria-live="polite"></div>

${SCRIPTS}

</body>
</html>
`;
}

// ---- sitemap ----
function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  // statik indexlenebilir sayfalar (utility/noindex hariç)
  const staticPages = [
    { loc: SITE + '/',              lastmod: '2026-06-26' },
    { loc: SITE + '/products.html', lastmod: '2026-06-26' },
    { loc: SITE + '/blog.html',     lastmod: today },
  ];
  // Yasal sayfalar CANLIYA alınınca (commit + deploy) aşağıdaki satırı
  // staticPages'e ekle; sitemap'te henüz yayında olmayan URL = 404 riski.
  const LEGAL_LIVE = true;
  const legalPages = [
    { loc: SITE + '/mesafeli-satis.html',     lastmod: today },
    { loc: SITE + '/on-bilgilendirme.html',   lastmod: today },
    { loc: SITE + '/iade-teslimat.html',      lastmod: today },
    { loc: SITE + '/kvkk-aydinlatma.html',    lastmod: today },
    { loc: SITE + '/gizlilik.html',           lastmod: today },
    { loc: SITE + '/cerez-politikasi.html',   lastmod: today },
    { loc: SITE + '/kullanim-kosullari.html', lastmod: today },
    { loc: SITE + '/iletisim.html',           lastmod: today },
    { loc: SITE + '/acik-riza.html',          lastmod: today },
  ];
  if (LEGAL_LIVE) staticPages.push(...legalPages);
  const articlePages = POSTS.map((p) => ({ loc: `${SITE}/blog-${p.slug}.html`, lastmod: p.date }));

  // tekilleştir
  const seen = new Set();
  const all = [...staticPages, ...articlePages].filter((u) => {
    if (seen.has(u.loc)) return false; seen.add(u.loc); return true;
  });

  const body = all.map((u) =>
    `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n  </url>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
<!--
  Otomatik üretildi: node scripts/build-blog.js
  Not: <priority>/<changefreq> kaldırıldı (Google yok sayıyor).
  Ürün detay sayfaları (product.html?id=...) Supabase'den dinamik;
  deploy'da DB'den çekilip ayrı bir sitemap-products.xml üretilmeli.
-->
`;
}

// ---- yaz ----
// Artık dosyaları temizle: blog-data.js'ten bir yazı silinirse sayfası
// diskte kalıp sitemap dışı bir yetim olarak indekslenmeye devam ederdi.
// SADECE blog-data.js'te olmayan blog-*.html'ler silinir (blog.html değil).
const validFiles = new Set(POSTS.map((p) => `blog-${p.slug}.html`));
fs.readdirSync(ROOT)
  .filter((f) => /^blog-.+\.html$/.test(f) && !validFiles.has(f))
  .forEach((f) => { fs.unlinkSync(path.join(ROOT, f)); console.log('  ⤫ artık dosya silindi: ' + f); });

let n = 0;
POSTS.forEach((p, i) => {
  const file = path.join(ROOT, `blog-${p.slug}.html`);
  fs.writeFileSync(file, pinVersions(articleHtml(p, i)), 'utf8');
  console.log('  ✓ blog-' + p.slug + '.html');
  n++;
});
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(), 'utf8');
console.log('  ✓ sitemap.xml');
console.log(`\n${n} yazı sayfası + sitemap üretildi.`);
