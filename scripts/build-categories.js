#!/usr/bin/env node
/* ============================================================
   build-categories.js — category-data.js → kategori landing sayfaları
   Üretir:
     • <slug>.html            (12+ ticari intent landing sayfası)
     • sitemap-categories.xml (yalnız indexlenebilir olanlar)
   Ayrıca index.html'e kategori bloğunu enjekte eder.

   Çalıştır:  node scripts/build-categories.js
   SIRA ÖNEMLİ: build-products → build-categories → build-blog
   (kategori sayfaları ürün verisine, blog linkleri kategori
   sayfalarının varlığına bağlı)

   Neden ayrı sitemap: sitemap.xml'i build-blog, sitemap-products.xml'i
   build-products yazıyor. Kategorileri birine eklemek scriptleri
   birbirine bağımlı kılardı; ayrı dosya bağımsızlığı korur.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const {
  SITE, sharedScripts, header, footer, pinVersions,
  esc, stripHtml, fmtTL, catCard, injectBetween, fetchProducts, isTestProduct,
  priceFields, siteGraphLd, ORG_ID, WEBSITE_ID,
} = require('./shared-chrome');

const ROOT = path.resolve(__dirname, '..');

// ---- category-data.js'i yükle (build-blog.js ile aynı window shim) ----
const dataSrc = fs.readFileSync(path.join(ROOT, 'category-data.js'), 'utf8');
const sandbox = { window: {} };
new Function('window', dataSrc)(sandbox.window);
const CATS = sandbox.window.CATEGORY_PAGES;
if (!Array.isArray(CATS) || !CATS.length) {
  console.error('✗ CATEGORY_PAGES bulunamadı'); process.exit(1);
}

// ---- içerik sayfaları (hakkımızda, izmir mağaza, fiyat garantisi) ----
const pagesSrc = fs.readFileSync(path.join(ROOT, 'pages-data.js'), 'utf8');
const pagesBox = { window: {} };
new Function('window', pagesSrc)(pagesBox.window);
const CONTENT_PAGES = pagesBox.window.CONTENT_PAGES || [];

// ---- blog başlıkları (ilgili yazılar bloğu için) ----
const blogSrc = fs.readFileSync(path.join(ROOT, 'blog-data.js'), 'utf8');
const blogBox = { window: {} };
new Function('window', blogSrc)(blogBox.window);
const POSTS = blogBox.window.BLOG_POSTS || [];
const postBySlug = Object.fromEntries(POSTS.map((p) => [p.slug, p]));

const HEADER = header('products.html');
const FOOTER = footer([['products.html', 'Tüm Ürünler'], ['blog.html', 'Blog'], ['siparis-sorgula.html', 'Sipariş Sorgula']]);
const SCRIPTS = sharedScripts();

/* ---- ürün eşlemesi ----
   Üç seviye sırayla: cats (kaba filtre) → include/exclude (daraltma)
   → plus/minus (slug ile tekil düzeltme). Ayrıntı: category-data.js başlığı. */
function matchProducts(cat, products) {
  const inCats = new Set(cat.cats || []);
  let list = products.filter((p) => p.categories && inCats.has(p.categories.slug));

  if (cat.include) list = list.filter((p) => cat.include.test(p.name));
  if (cat.exclude) list = list.filter((p) => !cat.exclude.test(p.name));

  if (cat.plus && cat.plus.length) {
    const have = new Set(list.map((p) => p.slug));
    for (const slug of cat.plus) {
      const found = products.find((p) => p.slug === slug);
      if (!found) { console.warn(`  ⚠ ${cat.slug}: plus slug bulunamadı → ${slug}`); continue; }
      if (!have.has(slug)) list.push(found);
    }
  }
  if (cat.minus && cat.minus.length) {
    const drop = new Set(cat.minus);
    list = list.filter((p) => !drop.has(p.slug));
  }

  return list.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

/* ---- fiyat istatistiği ----
   AI "uygun fiyatlı X" sorgusunda "en ucuz" yazan siteyi değil, SOMUT FİYAT
   VERİSİ sunan siteyi alıntılıyor. Bu yüzden her kategoriye gerçek min/max.

   stock > 0 filtresi ŞART: tükenmiş ürünün fiyatını "başlangıç fiyatı" diye
   vermek hem yanıltıcı hem reklam mevzuatı riski.
   priceFields() indirimli fiyatı verir — catCard ile aynı kaynak, yoksa aynı
   sayfada iki farklı "en düşük fiyat" görünür. */
function priceStats(list) {
  const prices = list.filter((p) => p.stock > 0).map((p) => priceFields(p).price)
    .filter((n) => isFinite(n) && n > 0);
  if (!prices.length) return { count: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices), count: prices.length };
}

const trToday = () => new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });

/* ---- mağaza & satış bilgisi bloğu ----
   ÜRÜN IZGARASININ ALTINA gelir (rehber metninden sonra).

   Başta grid'in üstündeydi — AI alıntılarının %44'ü sayfanın ilk %30'undan
   çıktığı için oraya konmuştu. Ama görsel olarak ürünleri ekranın çok
   aşağısına itiyordu; kullanıcı isteğiyle aşağı alındı.
   Alıntılanabilirlik açısından kayıp sınırlı: fiyat cümlesi hâlâ metinde,
   AggregateOffer ve iki MusicStore düğümü şemada, adres/telefon
   izmir-muzik-magazasi.html'de tam kapsamda duruyor. */
function storeInfoBlock(cat, stats) {
  // min === max (tek fiyat) durumunda "X ile X arasında" demek garip olur
  const ad = esc(cat.short || cat.h1);
  const fiyat = !stats.count ? ''
    : stats.min === stats.max
      ? `Stoktaki <strong>${ad}</strong> ürünü ${esc(fmtTL(stats.min))} fiyatla listeleniyor.`
      : `<strong>${ad}</strong> modellerimiz ${esc(fmtTL(stats.min))} ile ${esc(fmtTL(stats.max))} arasında; stoktaki en uygun model ${esc(fmtTL(stats.min))} fiyatla listeleniyor.`;
  const yerel = cat.localNote
    ? esc(cat.localNote)
    : `Ürünler İzmir'deki mağazalarımızda çalınarak denenebilir; tüm Türkiye'ye kargo ile gönderilir.`;

  return `
  <section class="cat-answer" aria-labelledby="magazaBaslik">
    <h2 id="magazaBaslik">Mağazalarımız ve Satış Koşulları</h2>
    ${fiyat ? `<p class="cat-answer-price">${fiyat}</p>` : ''}
    <p class="cat-answer-local">${yerel} İzmir'de iki mağazamız var: <strong>Karşıyaka</strong> (Şemikler Mah. 6205 Sok. No: 4/A) ve <strong>Menemen Ulukent</strong> (9 Eylül Mah. 268. Sok. No: 27/A) — her gün 10:00–21:00. <a href="izmir-muzik-magazasi.html">Mağazalarımız hakkında →</a></p>
    <p class="cat-answer-terms">2.000 TL ve üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Siparişler 1-2 iş günü içinde hazırlanır, teslimat bölgeye göre 1-3 iş günü sürer. Teslimattan itibaren 14 gün cayma hakkınız vardır. Ödemeler PayTR güvenli ödeme altyapısı üzerinden alınır ve kredi kartına taksit seçenekleri ürün sayfasında görüntülenir.</p>
    ${stats.count ? `<p class="cat-price-asof">Fiyatlar ${trToday()} tarihinde güncellenmiştir. <a href="fiyat-garantisi.html">Fiyat garantimiz →</a></p>` : ''}
  </section>`;
}

// ---- SSS: <details> kullanılır, inline onclick YOK (CSP inline script'i engelliyor) ----
const faqHtml = (faq) => !faq || !faq.length ? '' : `
  <section class="cat-faq" id="sss" aria-labelledby="sssBaslik">
    <h2 id="sssBaslik">Sık Sorulan Sorular</h2>
    ${faq.map((f) => `<details class="cat-faq-item">
      <summary>${esc(f.q)}</summary>
      <div class="cat-faq-answer"><p>${esc(f.a)}</p></div>
    </details>`).join('\n    ')}
  </section>`;

const relatedHtml = (slugs) => {
  const posts = (slugs || []).map((s) => postBySlug[s]).filter(Boolean);
  if (!posts.length) return '';
  return `
  <section class="cat-related" aria-labelledby="ilgiliBaslik">
    <h2 id="ilgiliBaslik">İlgili Yazılar</h2>
    <ul class="cat-related-list">
      ${posts.map((p) => `<li><a href="blog-${esc(p.slug)}.html">${esc(p.title)}</a></li>`).join('\n      ')}
    </ul>
  </section>`;
};

function categoryHtml(cat, products, noindex) {
  const url = `${SITE}/${cat.slug}.html`;
  const img = `${SITE}/images/og-image.png`;
  const stats = priceStats(products);

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      ...siteGraphLd(),
      {
        '@type': 'CollectionPage',
        '@id': url + '#webpage',
        name: cat.h1,
        description: cat.metaDesc,
        url: url,
        inLanguage: 'tr-TR',
        isPartOf: { '@id': WEBSITE_ID },
        publisher: { '@id': ORG_ID },
      },
      {
        // ItemList sadece url+name taşır. Product nesnesi GÖMÜLMEZ:
        // fiyat burada bayatlar ve ürün sayfasındaki şemayla çelişirdi.
        '@type': 'ItemList',
        name: cat.h1,
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: p.name,
          url: `${SITE}/urun-${p.slug}.html`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE + '/' },
          { '@type': 'ListItem', position: 2, name: 'Ürünler', item: SITE + '/products.html' },
          { '@type': 'ListItem', position: 3, name: cat.h1, item: url },
        ],
      },
    ],
  };

  /* AggregateOffer ayrı düğüm — ItemList'in İÇİNE gömülmez.
     Gömülseydi her ListItem'a fiyat yazmak gerekirdi, o fiyatlar bayatlar ve
     ürün sayfasındaki Offer ile çelişirdi. Gece rebuild bu düğümü her gün
     tazeliyor, bayatlama riski yok. */
  if (stats.count) {
    ld['@graph'].push({
      '@type': 'AggregateOffer',
      '@id': url + '#offers',
      priceCurrency: 'TRY',
      lowPrice: stats.min,
      highPrice: stats.max,
      offerCount: stats.count,
      offeredBy: { '@id': ORG_ID },
    });
  }

  if (cat.faq && cat.faq.length) {
    ld['@graph'].push({
      '@type': 'FAQPage',
      mainEntity: cat.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  // catalog-grid + cat-card: products.css'teki mevcut stiller (products.html
  // ile aynı markup). Yeni sınıf uydurmak stilsiz grid demek olurdu.
  const grid = products.length
    ? `<div class="catalog-grid">${products.map(catCard).join('')}\n      </div>`
    : `<p class="cat-empty">Bu kategoride şu an ürün bulunmuyor. <a href="products.html">Tüm ürünlere göz at →</a></p>`;

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${esc(cat.title)}</title>
<meta name="description" content="${esc(cat.metaDesc)}" />
<meta name="keywords" content="${esc(cat.keywords)}" />
<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}" />
<meta name="theme-color" content="#fafafa" />
<link rel="canonical" href="${url}" />

<meta property="og:type" content="website" />
<meta property="og:site_name" content="Nota Müzik Market" />
<meta property="og:locale" content="tr_TR" />
<meta property="og:title" content="${esc(cat.title)}" />
<meta property="og:description" content="${esc(cat.metaDesc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${img}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(cat.title)}" />
<meta name="twitter:description" content="${esc(cat.metaDesc)}" />
<meta name="twitter:image" content="${img}" />

<link rel="icon" type="image/png" href="images/logo-icon.png" />
<link rel="apple-touch-icon" href="images/logo-icon.png" />
<link rel="preconnect" href="https://kwjtfqhhctqwrfhxghai.supabase.co" crossorigin />
<link rel="stylesheet" href="styles.css?v=38" />
<link rel="stylesheet" href="auth.css?v=28" />
<link rel="stylesheet" href="shop.css?v=32" />
<link rel="stylesheet" href="products.css?v=1" />
<link rel="stylesheet" href="category.css?v=1" />

<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
</head>
<body class="shop-page category-page">

${HEADER}

<main class="cat-shell">
  <nav class="product-crumb" aria-label="Sayfa yolu">
    <a href="index.html">Ana Sayfa</a> <span aria-hidden="true">›</span>
    <a href="products.html">Ürünler</a> <span aria-hidden="true">›</span>
    <span>${esc(cat.h1)}</span>
  </nav>

  <header class="cat-head">
    <h1>${esc(cat.h1)}</h1>
    <p class="cat-intro">${esc(cat.intro)}</p>
    <p class="cat-count">${products.length} ürün listeleniyor</p>
    <nav class="cat-jump" aria-label="Sayfa içi kısayollar">
      <a href="#rehber">Satın alma rehberi</a>
${cat.faq && cat.faq.length ? '      <a href="#sss">Sık sorulan sorular</a>\n' : ''}    </nav>
  </header>

  <section class="cat-products" aria-label="${esc(cat.h1)} ürünleri">
    ${grid}
  </section>

  <article class="cat-body" id="rehber">
${cat.body.trim()}
  </article>
${faqHtml(cat.faq)}
${storeInfoBlock(cat, stats)}
${relatedHtml(cat.related)}

  <p class="cat-allcta"><a href="products.html">Tüm ürünleri görüntüle →</a></p>
</main>

${FOOTER}

<div class="nm-toast" id="nmToast" role="status" aria-live="polite"></div>

${SCRIPTS}

</body>
</html>
`;
}

/* ---- içerik sayfası şablonu ----
   legal-shell/legal-css yapısını kullanır (mevcut yasal sayfalarla aynı),
   böylece yeni CSS dosyası açmaya gerek kalmaz — pinVersions() yalnız
   VERSION_PAGES'te GÖRÜLEN dosyaları günceller, yeni bir dosya sonsuza
   kadar ?v=1'de donardı. */
function contentPageHtml(pg, priceTokens) {
  const url = `${SITE}/${pg.slug}.html`;
  const img = `${SITE}/images/og-image.png`;
  /* {{FIYAT:slug}} yer tutucularını gerçek min fiyatla doldur.
     İzmir sayfasının çekirdek pasajına canlı fiyat çıpası girmesini sağlıyor;
     gece rebuild her gün tazeliyor, elle güncelleme gerekmiyor. */
  const fill = (s) => String(s).replace(/\{\{FIYAT:([a-z-]+)\}\}/g,
    (m, slug) => priceTokens[slug] || 'uygun fiyatlarla');

  const graph = [
    ...siteGraphLd(),
    {
      '@type': 'WebPage',
      '@id': url + '#webpage',
      name: pg.h1,
      description: fill(pg.metaDesc),
      url: url,
      inLanguage: 'tr-TR',
      isPartOf: { '@id': WEBSITE_ID },
      publisher: { '@id': ORG_ID },
      about: { '@id': ORG_ID },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: pg.h1, item: url },
      ],
    },
  ];
  if (pg.faq && pg.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: pg.faq.map((f) => ({
        '@type': 'Question', name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: fill(f.a) },
      })),
    });
  }

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${esc(pg.title)}</title>
<meta name="description" content="${esc(fill(pg.metaDesc))}" />
<meta name="keywords" content="${esc(pg.keywords)}" />
<meta name="robots" content="index, follow" />
<meta name="theme-color" content="#fafafa" />
<link rel="canonical" href="${url}" />

<meta property="og:type" content="website" />
<meta property="og:site_name" content="Nota Müzik Market" />
<meta property="og:locale" content="tr_TR" />
<meta property="og:title" content="${esc(pg.title)}" />
<meta property="og:description" content="${esc(pg.metaDesc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${img}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(pg.title)}" />
<meta name="twitter:description" content="${esc(pg.metaDesc)}" />
<meta name="twitter:image" content="${img}" />

<link rel="icon" type="image/png" href="images/logo-icon.png" />
<link rel="apple-touch-icon" href="images/logo-icon.png" />
<link rel="stylesheet" href="styles.css?v=38" />
<link rel="stylesheet" href="auth.css?v=28" />
<link rel="stylesheet" href="shop.css?v=32" />
<link rel="stylesheet" href="legal.css?v=1" />
<link rel="stylesheet" href="category.css?v=1" />

<script type="application/ld+json">
${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)}
</script>
</head>
<body class="shop-page">

${HEADER}

<main class="legal-shell">
  <a href="index.html" class="legal-back">← Ana sayfa</a>

  <div class="legal-hero">
    <p class="legal-eyebrow">${esc(pg.eyebrow)}</p>
    <h1 class="legal-title">${esc(pg.h1)}</h1>
    <p class="legal-updated">${esc(pg.lead)}</p>
  </div>

  <div class="legal-body">
${fill(pg.body).trim()}
  </div>
${faqHtml((pg.faq||[]).map(f=>({q:f.q,a:fill(f.a)})))}
</main>

${FOOTER}

<div class="nm-toast" id="nmToast" role="status" aria-live="polite"></div>

${SCRIPTS}

</body>
</html>
`;
}

// ---- sitemap ----
function buildSitemap(indexable) {
  const today = new Date().toISOString().slice(0, 10);
  const body = indexable.map((c) =>
    `  <url>\n    <loc>${SITE}/${c.slug}.html</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
<!-- Otomatik üretildi: node scripts/build-categories.js — ${indexable.length} kategori -->
`;
}

// ---- ana sayfa kategori bloğu ----
function homeCategoriesHtml(rows) {
  return `
      <div class="home-cat-grid">
${rows.map((r) => `        <a class="home-cat-link" href="${esc(r.cat.slug)}.html">
          <span class="home-cat-name">${esc(r.cat.short || r.cat.h1)}</span>
          <span class="home-cat-count">${r.products.length} ürün${(() => { const s = priceStats(r.products); return s.count ? ` · ${esc(fmtTL(s.min))}'den` : ''; })()}</span>
        </a>`).join('\n')}
      </div>`;
}

// ---- ana akış ----
async function main() {
  const all = await fetchProducts();
  const products = all.filter((p) => !isTestProduct(p));

  const rows = CATS.map((cat) => ({ cat, products: matchProducts(cat, products) }));

  // Temizlik: SADECE category-data.js'teki slug listesine göre sil.
  // Geniş regex ASLA kullanılmaz — kategori dosyaları index.html, blog.html
  // ile aynı isim uzayında ve hatalı bir desen ana sayfayı silebilir.
  for (const { cat } of rows) {
    const fp = path.join(ROOT, `${cat.slug}.html`);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }

  const indexable = [];
  for (const { cat, products: list } of rows) {
    const min = cat.minProducts == null ? 3 : cat.minProducts;
    const thin = list.length < min;
    fs.writeFileSync(
      path.join(ROOT, `${cat.slug}.html`),
      pinVersions(categoryHtml(cat, list, thin)),
      'utf8'
    );
    if (thin) {
      console.log(`  ⤫ ${cat.slug}.html — ${list.length} ürün (< ${min}) → noindex, sitemap dışı`);
    } else {
      indexable.push(cat);
      console.log(`  ✓ ${cat.slug}.html — ${list.length} ürün`);
    }
  }

  // Kategori min fiyatları — içerik sayfalarındaki {{FIYAT:slug}} için
  const priceTokens = {};
  for (const { cat, products: list } of rows) {
    const st = priceStats(list);
    if (st.count) priceTokens[cat.slug] = fmtTL(st.min);
  }

  // İçerik sayfaları (hakkımızda, izmir mağaza, fiyat garantisi)
  for (const pg of CONTENT_PAGES) {
    fs.writeFileSync(path.join(ROOT, `${pg.slug}.html`), pinVersions(contentPageHtml(pg, priceTokens)), 'utf8');
    console.log(`  ✓ ${pg.slug}.html (içerik sayfası)`);
  }

  fs.writeFileSync(path.join(ROOT, 'sitemap-categories.xml'), buildSitemap(indexable), 'utf8');

  // Ana sayfaya kategori bloğu (link equity'yi dağıtır — index.html'de
  // şimdiye kadar hiç ürün/kategori linki yoktu)
  const homeRows = rows.filter((r) => indexable.includes(r.cat));
  injectBetween('index.html', 'CATEGORIES', homeCategoriesHtml(homeRows));

  /* Elle bakımlı sayfalara ortak varlık grafiği.
     Elle JSON yapıştırmak yerine enjekte ediliyor: aynı @id ile farklı içerik
     varlık çakışması yaratır, tek kaynak shared-chrome.js olmalı. */
  const siteLd = `\n<script type="application/ld+json">\n${JSON.stringify({ '@context': 'https://schema.org', '@graph': siteGraphLd() }, null, 2)}\n</script>\n`;
  // Not: hakkimizda / izmir-muzik-magazasi / fiyat-garantisi bu script
  // tarafından üretiliyor ve grafiği zaten içinde — buraya eklenmez.
  ['index.html', 'iletisim.html', 'products.html', 'blog.html',
   'acik-riza.html', 'cerez-politikasi.html', 'gizlilik.html', 'iade-teslimat.html',
   'kullanim-kosullari.html', 'kvkk-aydinlatma.html', 'mesafeli-satis.html',
   'on-bilgilendirme.html', 'siparis-sorgula.html']
    .forEach((f) => injectBetween(f, 'SITELD', siteLd));

  const orphan = products.filter((p) => !rows.some((r) => r.products.includes(p)));
  console.log(`\n  ✓ ${rows.length} kategori sayfası (${indexable.length} indexlenebilir)`);
  console.log(`  ✓ sitemap-categories.xml (${indexable.length} URL)`);
  if (orphan.length) {
    console.log(`  ⚠ ${orphan.length} ürün hiçbir kategori sayfasında yok:`);
    orphan.forEach((p) => console.log(`      ${p.categories ? p.categories.slug : '(kategorisiz)'} — ${p.name.slice(0, 55)}`));
  }
}

/* Ürün slug'ı → kategori sayfası. build-products.js bunu kullanarak
   ürün sayfalarına kategori linki basar (aksi halde kategori adı düz
   metin kalıyor ve landing sayfalarına hiç iç link akmıyor). */
function categoryIndex(products) {
  const idx = {};
  for (const cat of CATS) {
    for (const p of matchProducts(cat, products)) {
      // Bir ürün birden çok sayfada olabilir; ilk (en spesifik) eşleşme kalır
      if (!idx[p.slug]) idx[p.slug] = { slug: cat.slug, label: cat.short || cat.h1 };
    }
  }
  return idx;
}

module.exports = { categoryIndex };

if (require.main === module) {
  main().catch((e) => { console.error('✗', e); process.exit(1); });
}
