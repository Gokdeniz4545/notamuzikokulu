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

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.notamuzikmarket.com';

// ---- blog-data.js'i yükle (window shim) ----
const dataSrc = fs.readFileSync(path.join(ROOT, 'blog-data.js'), 'utf8');
const sandbox = { window: {} };
new Function('window', dataSrc)(sandbox.window);
const POSTS = sandbox.window.BLOG_POSTS;
if (!Array.isArray(POSTS) || !POSTS.length) {
  console.error('✗ BLOG_POSTS bulunamadı'); process.exit(1);
}

// ---- yardımcılar ----
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
const stripHtml = (html) => String(html)
  .replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();
const trDate = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtDate = (iso) => trDate.format(new Date(iso));
const readLabel = (p) => p.readMin + ' dk okuma';

// ---- ortak chrome (blog.html ile birebir) ----
const HEADER = `<header class="site-header" id="siteHeader">
  <a href="index.html" class="logo" aria-label="Nota Müzik Market ana sayfa">
    <img class="logo-img" src="images/logo.png" alt="Nota Müzik Market" style="height:40px;width:auto;display:block" />
  </a>
  <nav class="site-nav" aria-label="Birincil">
    <a href="products.html">Ürünler</a>
    <a href="blog.html" aria-current="page">Blog</a>
    <a href="https://www.notamuzikokulu.com/" target="_blank" rel="noopener noreferrer">Okullarımız</a>
    <a href="https://www.notamuzikokulu.com/iletisim/" target="_blank" rel="noopener noreferrer">İletişim</a>
  </nav>
  <div class="header-right">
    <div class="auth-slot" id="authSlot" data-state="loading">
      <button class="auth-link" data-when="out" data-tab="login" type="button">Giriş Yap</button>
      <button class="auth-link auth-link-primary" data-when="out" data-tab="register" type="button">Kayıt Ol</button>
      <a href="account.html" class="account-link" data-when="in" hidden>Hesabım</a>
      <button type="button" id="logoutBtn" class="logout-link" data-when="in" hidden>Çıkış</button>
    </div>
    <a href="account.html?tab=wishlist" class="fav-link" aria-label="Favorilerim" title="Favorilerim">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
      </svg>
    </a>
    <a href="cart.html" class="cart-btn" aria-label="Sepet">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/>
        <circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>
      </svg>
      <span class="cart-badge" id="cartBadge" aria-live="polite">0</span>
    </a>
  </div>
</header>`;

const FOOTER = `<footer class="site-footer">
  <div class="footer-inner">
    <div>
      <p class="footer-logo">NOTA MÜZİK MARKET<sup>®</sup></p>
      <p class="footer-tag">Müziğin dokunuşu — 2026</p>
    </div>
    <nav class="footer-legal" aria-label="Yasal bilgiler">
      <a href="mesafeli-satis.html">Mesafeli Satış Sözleşmesi</a>
      <a href="on-bilgilendirme.html">Ön Bilgilendirme Formu</a>
      <a href="iade-teslimat.html">İade, Teslimat &amp; Cayma</a>
      <a href="kvkk-aydinlatma.html">KVKK Aydınlatma Metni</a>
      <a href="gizlilik.html">Gizlilik Politikası</a>
      <a href="cerez-politikasi.html">Çerez Politikası</a>
      <a href="kullanim-kosullari.html">Kullanım Koşulları</a>
      <a href="iletisim.html">İletişim &amp; Künye</a>
    </nav>
    <div class="footer-social" aria-label="Sosyal medya">
      <a href="#" aria-label="Instagram">Instagram</a>
      <a href="#" aria-label="YouTube">YouTube</a>
      <a href="#" aria-label="X">X</a>
    </div>
  </div>
  <p class="footer-legal-note">© 2026 Süleyman Kesici – Nota Müzik · Tüm hakları saklıdır</p>
</footer>`;

const SCRIPTS = `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.0/dist/umd/supabase.js" integrity="sha384-3wY11tldQ5+yWqAvmTN4XtQvnjoTva0cV15O/O/O5NTtp0ivVopSzLOzsVXWZse9" crossorigin="anonymous"></script>
<script src="supabase-client.js?v=44"></script>
<script src="api.js?v=43"></script>
<script src="cart-store.js?v=34"></script>
<script src="auth-modal.js?v=31" defer></script>
<script src="header-auth.js?v=30" defer></script>`;

// ---- tek yazı sayfası ----
function articleHtml(p, i) {
  const url = `${SITE}/blog-${p.slug}.html`;
  const next = POSTS[(i + 1) % POSTS.length];
  const img = `${SITE}/images/hero-guitar.png`;

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
<link rel="preconnect" href="https://rsms.me/" />
<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
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
let n = 0;
POSTS.forEach((p, i) => {
  const file = path.join(ROOT, `blog-${p.slug}.html`);
  fs.writeFileSync(file, articleHtml(p, i), 'utf8');
  console.log('  ✓ blog-' + p.slug + '.html');
  n++;
});
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(), 'utf8');
console.log('  ✓ sitemap.xml');
console.log(`\n${n} yazı sayfası + sitemap üretildi.`);
