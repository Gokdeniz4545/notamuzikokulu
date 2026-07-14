#!/usr/bin/env node
/* ============================================================
   build-products.js — Supabase → statik ürün SEO sayfaları
   Üretir:
     • urun-<slug>.html   (her aktif ürün için taranabilir SSR sayfa)
     • sitemap-products.xml
   Çalıştır:  node scripts/build-products.js
   NOT: Fiyat/stok DEĞİŞİNCE yeniden çalıştır (statik snapshot bayatlamasın).
   Sayfa açılınca product.js Supabase'den canlı fiyat/stok/galeri ile
   hydrate eder; SSR içerik bot + JS'siz kullanıcı içindir.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { productScripts, footer, pinVersions } = require('./shared-chrome');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.notamuzikmarket.com';
const SUPABASE_URL = 'https://kwjtfqhhctqwrfhxghai.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3anRmcWhoY3Rxd3JmaHhnaGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDcxOTEsImV4cCI6MjA5NDcyMzE5MX0.B4gLXDpFgUTmyJxvF8PipPyKWPr8tFYsxxYMjM2O7K8';
const IMG_BUCKET = 'product-images';

// ---- yardımcılar ----
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const excerpt = (s, n = 155) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t;
};
const fmtTL = (n) => new Intl.NumberFormat('tr-TR').format(Number(n || 0)) + ' TL';

// api.js ile aynı görsel mantığı
const toUrl = (p) => {
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;
  return `${SUPABASE_URL}/storage/v1/object/public/${IMG_BUCKET}/${p}`;
};
function imageUrls(images) {
  if (!images || !images.length) return [];
  return images.slice().sort((a, b) => {
    if ((!!b.is_primary) - (!!a.is_primary)) return (!!b.is_primary) - (!!a.is_primary);
    return (a.display_order || 0) - (b.display_order || 0);
  }).map((i) => toUrl(i.storage_path)).filter(Boolean);
}

// ---- ortak chrome (product.html ile aynı) ----
const HEADER = `<header class="site-header" id="siteHeader">
  <a href="index.html" class="logo" aria-label="Nota Müzik Market ana sayfa">
    <img class="logo-img" src="images/logo.png" alt="Nota Müzik Market" style="height:40px;width:auto;display:block" />
  </a>
  <nav class="site-nav" aria-label="Birincil">
    <a href="products.html">Ürünler</a>
    <a href="blog.html">Blog</a>
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

// product.html'den türetilir — elle sürüm listesi tutmak bayatlamaya yol açıyordu
const SCRIPTS = productScripts();

// ---- ortak footer (ürün sayfalarını yetimlikten çıkarır: yasal + kategori iç linkleri) ----
// cerez-politikasi.html'den türetilir; ilk 3 link ürün sayfalarını iç linkle besler
const FOOTER = footer([['products.html', 'Tüm Ürünler'], ['blog.html', 'Blog'], ['siparis-sorgula.html', 'Sipariş Sorgula']]);

// ---- katalog kartı (products.js card() ile birebir markup; JS hydrate edince sıçrama olmaz) ----
function catCard(p) {
  const imgs = imageUrls(p.product_images);
  const out = p.stock <= 0;
  const catName = p.categories ? p.categories.name : '';
  const media = imgs.length
    ? `<img src="${esc(imgs[0])}" alt="${esc(p.name)}" loading="lazy" decoding="async" />`
    : `<span class="cat-card-glyph">${esc((catName || p.name || '?').charAt(0).toUpperCase())}</span>`;
  return `
      <a class="cat-card" href="urun-${esc(p.slug)}.html">
        <div class="cat-card-media">
          ${media}
          ${out ? '<span class="cat-card-oos">Tükendi</span>' : ''}
          <button type="button" class="cat-fav" data-id="${esc(p.id)}" aria-pressed="false" aria-label="Favorilere ekle" title="Favorilere ekle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
          </button>
        </div>
        <div class="cat-card-body">
          <span class="cat-card-cat">${esc(catName)}</span>
          <p class="cat-card-name">${esc(p.name)}</p>
          <p class="cat-card-price">${esc(fmtTL(p.price))}</p>
        </div>
      </a>`;
}

// İşaretçiler arasına HTML enjekte et (crawler için statik içerik). Yoksa uyar, atla.
function injectBetween(file, tag, html) {
  const fp = path.join(ROOT, file);
  if (!fs.existsSync(fp)) { console.warn(`  ⚠ ${file} yok, atlandı`); return; }
  let s = fs.readFileSync(fp, 'utf8');
  const re = new RegExp(`(<!--BUILD:${tag}:START-->)[\\s\\S]*?(<!--BUILD:${tag}:END-->)`);
  if (!re.test(s)) { console.warn(`  ⚠ ${file}: BUILD:${tag} işaretçisi yok, atlandı`); return; }
  s = s.replace(re, `$1${html}\n      $2`);
  fs.writeFileSync(fp, s, 'utf8');
}

// ---- tek ürün sayfası ----
function productHtml(p, noindex) {
  const url = `${SITE}/urun-${p.slug}.html`;
  const imgs = imageUrls(p.product_images);
  const img = imgs[0] || `${SITE}/images/og-image.png`;
  const catName = p.categories ? p.categories.name : '';
  const rawDesc = excerpt(p.description, 155);
  const desc = (rawDesc && rawDesc.length >= 70) ? rawDesc
    : `${p.name} — ${catName || 'müzik enstrümanı'}. ${fmtTL(p.price)}, PayTR güvenli ödeme, hızlı kargo. Nota Müzik Market.`;
  const inStock = p.stock > 0;
  const glyph = esc((catName || p.name || '?').charAt(0).toUpperCase());
  const priceNum = Number(p.price);

  // Product #ldProduct'ta (product.js hydration'da canlı veriyle bunu değiştirir).
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: excerpt(p.description, 300) || p.name,
    sku: p.id,
    brand: { '@type': 'Brand', name: 'Nota Müzik Market' },
    category: catName || undefined,
    image: imgs.length ? imgs : undefined,
    offers: {
      '@type': 'Offer',
      price: priceNum,
      priceCurrency: 'TRY',
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceValidUntil: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
      url: url,
    },
  };
  // BreadcrumbList ayrı script'te (JS dokunmaz, JS render eden bot için de kalır).
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Ürünler', item: SITE + '/products.html' },
      { '@type': 'ListItem', position: 3, name: p.name, item: url },
    ],
  };

  const gallery = imgs.length
    ? `<div class="product-gallery-main" id="galMain"><img id="galImg" src="${esc(imgs[0])}" alt="${esc(p.name)}" decoding="async" width="800" height="800" fetchpriority="high" /></div>` +
      (imgs.length > 1
        ? `<div class="product-thumbs">${imgs.map((u, i) =>
            `<button type="button" class="product-thumb ${i === 0 ? 'is-active' : ''}" data-i="${i}"><img src="${esc(u)}" alt="" loading="lazy" decoding="async" width="72" height="72" /></button>`).join('')}</div>`
        : '')
    : `<div class="product-gallery-main" id="galMain"><span class="product-gallery-glyph">${glyph}</span></div>`;

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${esc(p.name)} — Nota Müzik Market</title>
<meta name="description" id="metaDesc" content="${esc(desc)}" />
<meta name="keywords" content="${esc(p.name)}${catName ? ', ' + esc(catName) : ''}, müzik enstrümanı, satın al" />
<meta name="robots" id="metaRobots" content="${noindex ? 'noindex, follow' : 'index, follow'}" />
<meta name="theme-color" content="#fafafa" />
<link rel="canonical" id="canonical" href="${url}" />

<meta property="og:type" content="product" />
<meta property="og:site_name" content="Nota Müzik Market" />
<meta property="og:locale" content="tr_TR" />
<meta property="og:title" id="ogTitle" content="${esc(p.name)}" />
<meta property="og:description" id="ogDesc" content="${esc(desc)}" />
<meta property="og:url" id="ogUrl" content="${url}" />
<meta property="og:image" id="ogImage" content="${esc(img)}" />
<meta property="product:price:amount" content="${priceNum}" />
<meta property="product:price:currency" content="TRY" />
<meta property="og:availability" content="${inStock ? 'instock' : 'outofstock'}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" id="twTitle" content="${esc(p.name)}" />
<meta name="twitter:description" id="twDesc" content="${esc(desc)}" />
<meta name="twitter:image" id="twImage" content="${esc(img)}" />

<script type="application/ld+json" id="ldProduct">
${JSON.stringify(productLd, null, 2)}
</script>
<script type="application/ld+json">
${JSON.stringify(breadcrumbLd, null, 2)}
</script>

<link rel="icon" type="image/png" href="images/logo-icon.png" />
<link rel="apple-touch-icon" href="images/logo-icon.png" />
<link rel="preconnect" href="https://rsms.me/" />
<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
<link rel="stylesheet" href="styles.css?v=38" />
<link rel="stylesheet" href="auth.css?v=28" />
<link rel="stylesheet" href="shop.css?v=32" />
<link rel="stylesheet" href="product.css?v=3" />
</head>
<body class="shop-page">

${HEADER}

<main class="product-shell">
  <nav class="product-crumb" id="productCrumb" aria-label="Sayfa yolu">
    <a href="index.html">Ana Sayfa</a> <span aria-hidden="true">›</span>
    <a href="products.html">Ürünler</a> <span aria-hidden="true">›</span>
    <span>${esc(p.name)}</span>
  </nav>

  <div id="productMain" class="product-main">
    <div class="product-gallery">
      ${gallery}
    </div>
    <div class="product-info">
      <p class="product-cat">${esc(catName)}</p>
      <h1 class="product-title">${esc(p.name)}</h1>
      <div class="product-rating-line" id="ratingLine"></div>
      <p class="product-price">${esc(fmtTL(p.price))}</p>
      <p class="product-stock ${inStock ? '' : 'is-out'}">${inStock ? 'Stokta — ' + p.stock + ' adet' : 'Tükendi'}</p>
      <p class="product-desc">${esc(p.description || '')}</p>
      <div class="product-buy">
        <div class="qty-stepper" role="group" aria-label="Adet">
          <button type="button" id="qMinus" aria-label="Azalt">−</button>
          <span class="qty-value" id="qVal">1</span>
          <button type="button" id="qPlus" aria-label="Arttır">+</button>
        </div>
        <button type="button" class="auth-btn-primary" id="addCartBtn" ${inStock ? '' : 'disabled'}>${inStock ? 'Sepete Ekle' : 'Tükendi'}</button>
        <button type="button" class="product-fav" id="favBtn" aria-pressed="false" aria-label="Favorilere ekle">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
        </button>
      </div>
    </div>
  </div>

  <section id="productReviews" class="product-section"></section>
  <section id="productRecommended" class="product-section"></section>
</main>

${FOOTER}

<div class="nm-toast" id="nmToast" role="status" aria-live="polite"></div>

${SCRIPTS}

</body>
</html>
`;
}

// ---- sitemap ----
function buildSitemap(products) {
  const today = new Date().toISOString().slice(0, 10);
  const body = products.map((p) =>
    `  <url>\n    <loc>${SITE}/urun-${p.slug}.html</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
<!-- Otomatik üretildi: node scripts/build-products.js — ${products.length} ürün -->
`;
}

// ---- ana akış ----
async function main() {
  const select = 'id,slug,name,price,stock,description,is_active,categories(slug,name),product_images(storage_path,is_primary,display_order)';
  const url = `${SUPABASE_URL}/rest/v1/products?select=${encodeURIComponent(select)}&is_active=eq.true&order=name`;
  const res = await fetch(url, { headers: { apikey: ANON, Authorization: 'Bearer ' + ANON } });
  if (!res.ok) { console.error('✗ Supabase hata:', res.status, await res.text()); process.exit(1); }
  const raw = (await res.json()).filter((p) => p.slug);
  // Test ürünleri (ör. paytr-test): sayfa üretilir ama noindex + sitemap dışı.
  // (Katalog canlı Supabase'den okuduğu için sayfayı üretmezsek link 404 olur.)
  const isTest = (p) => /(^|[-_])test([-_]|$)/i.test(p.slug) || /\btest\b/i.test(p.name);
  const indexable = raw.filter((p) => !isTest(p));
  const skipped = raw.filter(isTest);

  // eski ürün sayfalarını temizle (silinen ürünler artıkta kalmasın)
  fs.readdirSync(ROOT).filter((f) => /^urun-.+\.html$/.test(f)).forEach((f) => fs.unlinkSync(path.join(ROOT, f)));

  raw.forEach((p) => {
    fs.writeFileSync(path.join(ROOT, `urun-${p.slug}.html`), pinVersions(productHtml(p, isTest(p))), 'utf8');
  });
  fs.writeFileSync(path.join(ROOT, 'sitemap-products.xml'), buildSitemap(indexable), 'utf8');

  // products.html'e statik katalog grid'i enjekte et (crawler/JS'siz için gerçek <a> linkleri)
  injectBetween('products.html', 'GRID', indexable.map(catCard).join(''));

  console.log(`  ✓ ${raw.length} ürün sayfası üretildi (${indexable.length} indexlenebilir)`);
  console.log(`  ✓ products.html statik grid (${indexable.length} ürün linki)`);
  if (skipped.length) console.log(`  ⤫ noindex + sitemap dışı: ${skipped.map((p) => p.slug).join(', ')}`);
  console.log(`  ✓ sitemap-products.xml (${indexable.length} URL)`);
  const noImg = indexable.filter((p) => !imageUrls(p.product_images).length).length;
  if (noImg) console.log(`  ⚠  ${noImg} üründe görsel yok (placeholder glyph kullanıldı)`);
}

main().catch((e) => { console.error('✗', e); process.exit(1); });
