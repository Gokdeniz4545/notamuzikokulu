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
const {
  SITE, SUPABASE_URL,
  productScripts, header, footer, pinVersions,
  esc, excerpt, fmtTL, imageUrls, thumb, srcset,
  catCard, injectBetween, fetchProducts, isTestProduct, priceFields,
  siteGraphLd, ORG_ID, WEBSITE_ID, fetchReviews, ratingOf,
} = require('./shared-chrome');
const { buildProductSchema } = require('../product-schema');
const { categoryIndex } = require('./build-categories');

const ROOT = path.resolve(__dirname, '..');

// ---- ortak chrome (shared-chrome.js tek kaynak) ----
const HEADER = header();
const SCRIPTS = productScripts();

// Ürün sayfalarını yetimlikten çıkarır: yasal linklerin başına 3 iç link
const FOOTER = footer([['products.html', 'Tüm Ürünler'], ['blog.html', 'Blog'], ['siparis-sorgula.html', 'Sipariş Sorgula']]);

// ---- tek ürün sayfası ----
function productHtml(p, noindex, catPage, rating) {
  const url = `${SITE}/urun-${p.slug}.html`;
  const imgs = imageUrls(p.product_images);
  const img = imgs[0] || `${SITE}/images/og-image.png`;
  const catName = p.categories ? p.categories.name : '';
  const rawDesc = excerpt(p.description, 155);
  // Efektif fiyat: indirim varsa indirimli olan (api.js/create_order ile aynı).
  // SSR normal fiyatı gösterirse Google ile kullanıcı farklı fiyat görür.
  const pf = priceFields(p);
  const priceNum = pf.price;
  const desc = (rawDesc && rawDesc.length >= 70) ? rawDesc
    : `${p.name} — ${catName || 'müzik enstrümanı'}. ${fmtTL(priceNum)}, PayTR güvenli ödeme, hızlı kargo. Nota Müzik Market.`;
  const inStock = p.stock > 0;
  const glyph = esc((catName || p.name || '?').charAt(0).toUpperCase());

  // Product #ldProduct'ta. product.js hydration'da AYNI modülle yeniden üretir,
  // bu yüzden SSR ve hydrate çıktısı yapısal olarak özdeş olur.
  const productLd = buildProductSchema({
    name: p.name,
    id: p.id,
    price: priceNum,
    stock: p.stock,
    description: p.description,
    images: imgs,
    categoryName: catName,
    url: url,
  }, rating);
  // BreadcrumbList ayrı script'te (JS dokunmaz, JS render eden bot için de kalır).
  const crumbs = [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE + '/' },
    { '@type': 'ListItem', position: 2, name: 'Ürünler', item: SITE + '/products.html' },
  ];
  if (catPage) {
    crumbs.push({ '@type': 'ListItem', position: 3, name: catPage.label, item: `${SITE}/${catPage.slug}.html` });
  }
  crumbs.push({ '@type': 'ListItem', position: crumbs.length + 1, name: p.name, item: url });
  /* İşletme + site + breadcrumb tek @graph'ta, #ldProduct'tan AYRI script'te.
     DİKKAT: bunlar #ldProduct'a KONMAZ — product.js hydration'da o script'i
     komple eziyor, oraya konan her şey canlıda silinir. */
  const pageLd = {
    '@context': 'https://schema.org',
    '@graph': [
      ...siteGraphLd(),
      { '@type': 'BreadcrumbList', itemListElement: crumbs },
      {
        '@type': 'ItemPage',
        '@id': url + '#webpage',
        url: url,
        name: p.name,
        inLanguage: 'tr-TR',
        isPartOf: { '@id': WEBSITE_ID },
        publisher: { '@id': ORG_ID },
      },
    ],
  };

  /* SSR yıldız + yorum listesi.
     product.js sayfa açılınca bunları zaten yeniden basıyor; SSR kopyası
     AI tarayıcıları içindir (JS çalıştırmıyorlar). Markup product.js:284-296
     ile BİREBİR aynı sınıfları kullanır, yoksa hydration'da sıçrama olur.
     Yorum yoksa hiçbir şey basılmaz — sahte/placeholder puan ASLA. */
  const STAR_D = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z';
  const starsSsr = (v) => `<span class="stars" aria-label="${v} / 5">` +
    [1, 2, 3, 4, 5].map((i) => `<svg viewBox="0 0 24 24" class="${i <= Math.round(v) ? 'star-on' : 'star-off'}"><path d="${STAR_D}"/></svg>`).join('') + '</span>';
  const trDate = (iso) => { try { return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }); } catch (e) { return ''; } };

  const ratingLineSsr = rating
    ? `${starsSsr(rating.avg)} <span>${rating.avg.toFixed(1)} (${rating.count} değerlendirme)</span>`
    : '';
  const reviewsSsr = !rating ? '' : `
  <h2>Değerlendirmeler</h2>
  <div class="review-summary"><span class="review-avg">${rating.avg.toFixed(1)}</span><div>${starsSsr(rating.avg)}<div class="review-count">${rating.count} değerlendirme</div></div></div>
  <div class="review-list">${rating.reviews.slice(0, 5).map((r) => `
      <div class="review-item">
        <div class="review-head">
          <span class="review-author">${esc(r.author_name || 'Müşteri')}</span>
          <span class="review-date">${esc(trDate(r.created_at))}</span>
        </div>
        ${starsSsr(r.rating)}
        ${r.comment ? `<p class="review-comment">${esc(r.comment)}</p>` : ''}
      </div>`).join('')}</div>`;

  const gallery = imgs.length
    ? `<div class="product-gallery-main" id="galMain"><img id="galImg" src="${esc(thumb(imgs[0], 720))}" srcset="${esc(srcset(imgs[0]))}" sizes="(max-width: 768px) 92vw, 460px" data-full="${esc(imgs[0])}" alt="${esc(p.name)}" title="Büyütmek için tıkla" decoding="async" width="800" height="800" fetchpriority="high" /></div>` +
      (imgs.length > 1
        ? `<div class="product-thumbs">${imgs.map((u, i) =>
            `<button type="button" class="product-thumb ${i === 0 ? 'is-active' : ''}" data-i="${i}"><img src="${esc(thumb(u, 360))}" data-full="${esc(u)}" alt="" loading="lazy" decoding="async" width="72" height="72" /></button>`).join('')}</div>`
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
${JSON.stringify(pageLd, null, 2)}
</script>

<link rel="icon" type="image/png" href="images/logo-icon.png" />
<link rel="apple-touch-icon" href="images/logo-icon.png" />
<link rel="preconnect" href="https://kwjtfqhhctqwrfhxghai.supabase.co" crossorigin />
${imgs.length ? `<link rel="preload" as="image" href="${esc(thumb(imgs[0], 720))}" imagesrcset="${esc(srcset(imgs[0]))}" imagesizes="(max-width: 768px) 92vw, 460px" fetchpriority="high" />\n` : ''}<link rel="stylesheet" href="styles.css?v=38" />
<link rel="stylesheet" href="auth.css?v=28" />
<link rel="stylesheet" href="shop.css?v=32" />
<link rel="stylesheet" href="product.css?v=3" />
</head>
<body class="shop-page">

${HEADER}

<main class="product-shell">
  <nav class="product-crumb" id="productCrumb" aria-label="Sayfa yolu"${catPage ? ` data-cat-slug="${esc(catPage.slug)}" data-cat-label="${esc(catPage.label)}"` : ''} data-ssr="1">
    <a href="index.html">Ana Sayfa</a> <span aria-hidden="true">›</span>
    <a href="products.html">Ürünler</a> <span aria-hidden="true">›</span>
${catPage ? `    <a href="${esc(catPage.slug)}.html">${esc(catPage.label)}</a> <span aria-hidden="true">›</span>\n` : ''}    <span>${esc(p.name)}</span>
  </nav>

  <div id="productMain" class="product-main">
    <div class="product-gallery">
      ${gallery}
    </div>
    <div class="product-info">
      <p class="product-cat">${catPage ? `<a href="${esc(catPage.slug)}.html">${esc(catName)}</a>` : esc(catName)}</p>
      <h1 class="product-title">${esc(p.name)}</h1>
      <div class="product-rating-line" id="ratingLine">${ratingLineSsr}</div>
      <p class="product-price">${pf.discountPercent > 0
        ? `<span class="price-old">${esc(fmtTL(pf.oldPrice))}</span> ${esc(fmtTL(pf.price))} <span class="disc-tag">-%${esc(pf.discountPercent)}</span>`
        : esc(fmtTL(pf.price))}</p>
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

  <section id="paytrTaksit" class="product-section" hidden>
    <h2>Taksit Seçenekleri</h2>
    <div id="paytr_taksit_tablosu"></div>
  </section>
  <section id="productReviews" class="product-section">${reviewsSsr}</section>
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
  const raw = await fetchProducts();
  const reviewsByProduct = await fetchReviews();
  // Ürün → kategori landing sayfası eşlemesi (breadcrumb + kategori linki için)
  const catIdx = categoryIndex(raw.filter((p) => !isTestProduct(p)));
  // Test ürünleri (ör. paytr-test): sayfa üretilir ama noindex + sitemap dışı.
  // (Katalog canlı Supabase'den okuduğu için sayfayı üretmezsek link 404 olur.)
  const isTest = isTestProduct;
  const indexable = raw.filter((p) => !isTest(p));
  const skipped = raw.filter(isTest);

  // eski ürün sayfalarını temizle (silinen ürünler artıkta kalmasın)
  fs.readdirSync(ROOT).filter((f) => /^urun-.+\.html$/.test(f)).forEach((f) => fs.unlinkSync(path.join(ROOT, f)));

  raw.forEach((p) => {
    fs.writeFileSync(path.join(ROOT, `urun-${p.slug}.html`), pinVersions(productHtml(p, isTest(p), catIdx[p.slug], ratingOf(reviewsByProduct.get(p.id)))), 'utf8');
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
