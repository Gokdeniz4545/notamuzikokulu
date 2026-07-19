/* ============================================================
   shared-chrome.js — üretilen sayfaların ortak kabuğu için tek kaynak

   Üretilen sayfalar (urun-*.html, blog-*.html) elle bakımlı sayfalarla AYNI
   script bloğunu ve AYNI footer'ı taşımalı. Bu listeler eskiden build
   script'lerinin içine elle kopyalanmıştı ve sessizce bayatlıyordu:
     • api.js?v=43 kalmıştı (gerçek: v=44), cookie-consent.js hiç yoktu
     • ürün şablonunun footer'ında 4 yasal link eksikti (Çerez Politikası dahil)
     • blog şablonu İletişim'i başka bir siteye yolluyordu
   Gece yeniden üretimi bu bayat şablonları 80 sayfaya geri basıyordu.

   Artık kabuk kanonik sayfalardan okunuyor:
     • script bloğu  → product.html
     • footer        → cerez-politikasi.html
   Elle bakımlı sayfa neyi taşıyorsa üretilenler de onu taşır.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCRIPTS_FROM = path.join(ROOT, 'product.html');
const FOOTER_FROM = path.join(ROOT, 'cerez-politikasi.html');

const SITE = 'https://www.notamuzikmarket.com';
const SUPABASE_URL = 'https://kwjtfqhhctqwrfhxghai.supabase.co';
const IMG_BUCKET = 'product-images';

const read = (f) => fs.readFileSync(f, 'utf8');

// ---- script bloğu ----

// Sadece o sayfaya özgü script'ler — ortak bloktan çıkarılır
const PAGE_SPECIFIC = /^(product|products|blog|blog-data|product-schema)\.js(\?|$)/;
// Ürün detay sayfasına özgü olanlar (sıra product.html'deki gibi korunur)
const PRODUCT_ONLY = /^(product-schema|product)\.js(\?|$)/;
const srcOf = (tag) => (tag.match(/src="([^"]+)"/) || [, ''])[1];

function scriptTags() {
  const found = read(SCRIPTS_FROM).match(/<script src="[^"]+"[^>]*><\/script>/g) || [];
  if (!found.length) throw new Error('shared-chrome: product.html içinde <script src> bulunamadı');
  return found;
}

/** Her sayfada olan script'ler (supabase, api, sepet, auth, çerez onayı) */
const sharedScripts = () => scriptTags().filter((t) => !PAGE_SPECIFIC.test(srcOf(t))).join('\n');

/** Ortak blok + ürün detay mantığı (product-schema.js + product.js) */
const productScripts = () =>
  scriptTags().filter((t) => !PAGE_SPECIFIC.test(srcOf(t)) || PRODUCT_ONLY.test(srcOf(t))).join('\n');

// ---- header ----

/*
   Header ELLE BAKIMLI SAYFADAN OKUNMUYOR — bilinçli bir istisna.
   Kanonik aday olmaya uygun tek bir sayfa yok: product.html'de hiç <nav> yok,
   iletisim.html'de 2 link var, index.html/blog.html'de 4. Herhangi birini
   kaynak seçmek diğer sayfa tiplerinden iç link SİLER. Bu yüzden header
   burada tanımlı ve en zengin nav (index.html'inki) tüm üretilen sayfalarda
   kullanılır — 97 ürün sayfası da Okullarımız + İletişim linkini kazanır.
   Nav değişecekse burayı değiştir, sonra elle bakımlı sayfaları da eşitle.
*/
const NAV = [
  ['products.html', 'Ürünler'],
  ['blog.html', 'Blog'],
  ['hakkimizda.html', 'Hakkımızda'],
  ['https://www.notamuzikokulu.com/', 'Okullarımız', ' target="_blank" rel="noopener noreferrer"'],
  ['iletisim.html', 'İletişim'],
];

/**
 * Ortak site header'ı.
 * current: aria-current="page" alacak href (ör. 'blog.html'); yoksa hiçbiri.
 */
function header(current = '') {
  const nav = NAV.map(([href, label, attrs = '']) =>
    `    <a href="${href}"${attrs}${href === current ? ' aria-current="page"' : ''}>${label}</a>`
  ).join('\n');

  return `<header class="site-header" id="siteHeader">
  <a href="index.html" class="logo" aria-label="Nota Müzik Market ana sayfa">
    <img class="logo-img" src="images/logo.png" alt="Nota Müzik Market" style="height:40px;width:auto;display:block" />
  </a>
  <nav class="site-nav" aria-label="Birincil">
${nav}
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
}

// ---- footer ----

/**
 * Kanonik footer (yasal linkler + çerez ayarları + sosyal + künye).
 * extraLinks: yasal navigasyonun başına eklenecek [href, etiket] çiftleri —
 * üretilen ürün sayfalarını iç linkle besleyip yetimlikten çıkarmak için.
 */
function footer(extraLinks = []) {
  const found = read(FOOTER_FROM).match(/<footer class="site-footer">[\s\S]*?<\/footer>/);
  if (!found) throw new Error('shared-chrome: cerez-politikasi.html içinde footer bulunamadı');
  let html = found[0];

  if (extraLinks.length) {
    const extra = extraLinks.map(([href, label]) => `      <a href="${href}">${label}</a>`).join('\n');
    const nav = /(<nav class="footer-legal"[^>]*>\n)/;
    if (!nav.test(html)) throw new Error('shared-chrome: footer-legal navigasyonu bulunamadı');
    html = html.replace(nav, `$1${extra}\n`);
  }
  return html;
}

// ---- cache-busting sürümleri ----

// Elle bakımlı sayfalarda görülen en yüksek ?v= değeri = güncel sürüm.
// (Sürümler yalnızca artar, bu yüzden max güvenli ve kendini onarır.)
const VERSION_PAGES = [
  'index.html', 'product.html', 'products.html', 'blog.html',
  'cart.html', 'checkout.html', 'account.html', 'cerez-politikasi.html',
];
const ASSET_V = /([\w-]+\.(?:css|js))\?v=(\d+)/g;

function versionMap() {
  const map = {};
  for (const page of VERSION_PAGES) {
    const fp = path.join(ROOT, page);
    if (!fs.existsSync(fp)) continue;
    for (const [, file, v] of read(fp).matchAll(ASSET_V)) {
      map[file] = Math.max(map[file] || 0, Number(v));
    }
  }
  return map;
}

/**
 * Üretilen HTML'deki tüm ?v= sürümlerini kanonik sayfalardaki güncel değere sabitler.
 * Şablonda styles.css?v=38 yazılı kalsa bile çıktı v=46 olur — aksi halde üretilen
 * sayfalar bayat CSS'i önbellekten çeker (çerez bandı stilsiz kalırdı).
 */
function pinVersions(html) {
  const map = versionMap();
  return html.replace(ASSET_V, (m, file) => (map[file] ? `${file}?v=${map[file]}` : m));
}

// ---- işletme kimliği & varlık grafiği ----

/*
   TEK VARLIK KURALI
   Eskiden index.html'de Organization, iletisim.html'de ayrı bir Store vardı ve
   ikisi @id ile bağlı değildi — AI motorları için iki ayrı işletme gibi
   görünüyordu. Artık tek düğüm var: MusicStore.

   MusicStore → Store → LocalBusiness → hem Organization hem Place alt sınıfı,
   yani ayrı Organization düğümüne gerek yok.

   Bu sabit TÜM üretilen sayfalara basılır (gzip sonrası ~400 byte). Sayfalar
   arası @id çözümlemesi diye bir şey yok: başka sayfada tanımlı düğüme sadece
   {"@id": ...} ile atıf yapmak boş referanstır.
*/
const BUSINESS = {
  name: 'Nota Müzik Market',
  legalName: 'Süleyman Kesici – Nota Müzik',
  telephone: '+905437663537',
  email: 'info@notamuzikmarket.com',
  street: 'Şemikler Mah. 6205 Sok. No: 4/A',
  locality: 'Çiğli',
  region: 'İzmir',
  country: 'TR',
  opens: '10:00',
  closes: '21:00',
  priceRange: '₺₺',
  // Gerçekten sahip olunan, doğrulanabilir profiller. Boş/uydurma profil
  // eklenmez (Google spam sinyali sayar). Google İşletme Profili açılınca
  // Maps URL'i buraya ve hasMap'e eklenecek.
  sameAs: [
    'https://www.facebook.com/people/Nota-M%C3%BCzik-Market/61589354045903/',
    'https://www.instagram.com/notamuzikmarket/',
  ],
  // Google Maps'ten alınacak. DOLU DEĞİLSE geo düğümü hiç yazılmaz —
  // uydurma koordinat Maps eşleşmesini bozar.
  geo: null, // { lat: 38.xxxxx, lng: 27.xxxxx }
  mapUrl: null,
};

const ORG_ID = SITE + '/#organization';
const WEBSITE_ID = SITE + '/#website';
const PLACE_ID = SITE + '/#place';

/** Ana işletme düğümü — MusicStore (Organization + Place birleşimi) */
function organizationLd() {
  const b = BUSINESS;
  const address = {
    '@type': 'PostalAddress',
    streetAddress: b.street,
    addressLocality: b.locality,
    addressRegion: b.region,
    addressCountry: b.country,
  };

  const place = {
    '@type': 'Place',
    '@id': PLACE_ID,
    address: address,
    // Fiziksel satış noktası müzik okulunun binası içinde
    containedInPlace: { '@type': 'Place', name: 'Nota Müzik Okulu' },
  };
  if (b.geo) place.geo = { '@type': 'GeoCoordinates', latitude: b.geo.lat, longitude: b.geo.lng };
  if (b.mapUrl) place.hasMap = b.mapUrl;

  const node = {
    '@type': 'MusicStore',
    '@id': ORG_ID,
    name: b.name,
    legalName: b.legalName,
    url: SITE + '/',
    logo: SITE + '/images/logo-square.png',
    image: SITE + '/images/og-image.png',
    telephone: b.telephone,
    email: b.email,
    priceRange: b.priceRange,
    currenciesAccepted: 'TRY',
    paymentAccepted: 'Kredi kartı, banka kartı, havale/EFT',
    address: address,
    location: place,
    areaServed: { '@type': 'Country', name: 'Türkiye' },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: b.opens,
      closes: b.closes,
    },
    sameAs: b.sameAs,
    /* Müzik okulu AYRI bir varlık — sameAs DEĞİL.
       sameAs "aynı varlığın başka profili" demektir; okulu oraya koymak
       AI'ın mağaza ile okulu tek işletme sanmasına yol açar. */
    parentOrganization: {
      '@type': 'MusicSchool',
      '@id': 'https://www.notamuzikokulu.com/#organization',
      name: 'Nota Müzik Okulu',
      url: 'https://www.notamuzikokulu.com/',
    },
  };
  if (b.geo) node.geo = { '@type': 'GeoCoordinates', latitude: b.geo.lat, longitude: b.geo.lng };
  if (b.mapUrl) node.hasMap = b.mapUrl;
  return node;
}

/** WebSite düğümü + site içi arama eylemi */
function websiteLd() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: BUSINESS.name,
    url: SITE + '/',
    inLanguage: 'tr-TR',
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE}/products.html?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Her sayfanın @graph'ının başına gelen ortak düğümler */
const siteGraphLd = () => [organizationLd(), websiteLd()];

// ---- metin yardımcıları ----

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const stripHtml = (html) => String(html == null ? '' : html)
  .replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ').trim();

const excerpt = (s, n = 155) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t;
};

const fmtTL = (n) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2, maximumFractionDigits: 2 }).format(Number(n || 0)) + ' TL';

// ---- görsel yardımcıları (api.js ile aynı mantık) ----

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

// Responsive varyantlar (api.js ile aynı konvansiyon; generate-thumbnails.mjs üretir)
const RESP_WIDTHS = [360, 720, 1200];
// Kaynak görsel mi? jpg/jpeg/png/webp/avif — ama zaten _<N>.webp varyantı DEĞİL.
const canVariant = (u) => !!u && /\/object\/public\/product-images\/.+\.(jpe?g|png|webp|avif)$/i.test(u) && !/_\d+\.webp$/i.test(u);
const thumb = (u, w) => canVariant(u) ? u.replace(/\.(jpe?g|png|webp|avif)$/i, `_${w}.webp`) : u;
const srcset = (u) => canVariant(u) ? RESP_WIDTHS.map((w) => `${thumb(u, w)} ${w}w`).join(', ') : '';

// ---- katalog kartı ----

// products.js card() ile birebir markup; JS hydrate edince sıçrama olmaz.
// Ürün grid'i, kategori grid'i ve ana sayfa grid'i AYNI kartı kullanmalı,
// yoksa shop.css/products.css stilleri tutmaz.
function catCard(p) {
  const imgs = imageUrls(p.product_images);
  const out = p.stock <= 0;
  const catName = p.categories ? p.categories.name : '';
  const pf = priceFields(p);
  const media = imgs.length
    ? `<img src="${esc(thumb(imgs[0], 360))}" srcset="${esc(srcset(imgs[0]))}" sizes="(max-width: 768px) 45vw, 240px" data-full="${esc(imgs[0])}" alt="${esc(p.name)}" width="600" height="800" loading="lazy" decoding="async" />`
    : `<span class="cat-card-glyph">${esc((catName || p.name || '?').charAt(0).toUpperCase())}</span>`;
  return `
      <a class="cat-card" href="urun-${esc(p.slug)}.html">
        <div class="cat-card-media">
          ${media}
          ${out ? '<span class="cat-card-oos">Tükendi</span>' : ''}
          ${pf.discountPercent > 0 ? `<span class="disc-badge${out ? ' disc-below' : ''}" aria-label="%${esc(pf.discountPercent)} indirim">%${esc(pf.discountPercent)}</span>` : ''}
          <button type="button" class="cat-fav" data-id="${esc(p.id)}" aria-pressed="false" aria-label="Favorilere ekle" title="Favorilere ekle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
          </button>
        </div>
        <div class="cat-card-body">
          <span class="cat-card-cat">${esc(catName)}</span>
          <p class="cat-card-name">${esc(p.name)}</p>
          <p class="cat-card-price">${pf.discountPercent > 0
            ? `<span class="price-old">${esc(fmtTL(pf.oldPrice))}</span> ${esc(fmtTL(pf.price))}`
            : esc(fmtTL(pf.price))}</p>
        </div>
      </a>`;
}

// ---- HTML enjeksiyonu ----

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

// ---- Supabase ----

// Anon key — RLS altında salt-okunur, tarayıcıya da servis ediliyor (api.js).
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3anRmcWhoY3Rxd3JmaHhnaGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDcxOTEsImV4cCI6MjA5NDcyMzE5MX0.B4gLXDpFgUTmyJxvF8PipPyKWPr8tFYsxxYMjM2O7K8';

/* İndirim / efektif fiyat — api.js:97-106 priceFields() ile AYNI kural.
   create_order da COALESCE(discount_price, price) kullanır → gösterilen = ödenen.
   Bu alınmazsa statik sayfa normal fiyatı, canlı sayfa indirimli fiyatı gösterir
   ve Google iki farklı fiyat görür (Merchant Center'da fiyat uyuşmazlığı hatası). */
function priceFields(p) {
  const base = parseFloat(p.price);
  const dp = (p.discount_price == null) ? null : parseFloat(p.discount_price);
  const on = dp != null && dp > 0 && dp < base;
  return {
    price: on ? dp : base,
    oldPrice: on ? base : null,
    discountPercent: on ? Math.round((1 - dp / base) * 100) : 0,
  };
}

/** Aktif ürünleri kategori + görselleriyle çeker (slug'ı olmayanlar elenir). */
async function fetchProducts() {
  const select = 'id,slug,name,price,discount_price,stock,description,is_active,categories(slug,name),product_images(storage_path,is_primary,display_order)';
  const url = `${SUPABASE_URL}/rest/v1/products?select=${encodeURIComponent(select)}&is_active=eq.true&order=name`;
  const res = await fetch(url, { headers: { apikey: ANON, Authorization: 'Bearer ' + ANON } });
  if (!res.ok) { console.error('✗ Supabase hata:', res.status, await res.text()); process.exit(1); }
  return (await res.json()).filter((p) => p.slug);
}

/* Yorumları TEK istekle çeker, product_id → yorum dizisi Map'i döndürür.
   Neden SSR'a taşındı: aggregateRating şimdiye kadar yalnız product.js ile
   runtime'da enjekte ediliyordu. AI tarayıcıları JavaScript ÇALIŞTIRMIYOR,
   yani puanları hiç görmüyorlardı — sıfır GEO değeri.

   Hata durumunda boş Map'e düşer: yorum eksikliği build'i kırmamalı. */
async function fetchReviews() {
  const empty = new Map();
  try {
    const select = 'product_id,author_name,rating,comment,created_at';
    const url = `${SUPABASE_URL}/rest/v1/reviews?select=${encodeURIComponent(select)}&order=created_at.desc`;
    const res = await fetch(url, { headers: { apikey: ANON, Authorization: 'Bearer ' + ANON } });
    if (!res.ok) { console.warn(`  ⚠ yorumlar çekilemedi (${res.status}) — puansız devam ediliyor`); return empty; }
    const rows = await res.json();
    const map = new Map();
    for (const r of rows) {
      if (!r.product_id || !(r.rating > 0)) continue;
      if (!map.has(r.product_id)) map.set(r.product_id, []);
      map.get(r.product_id).push(r);
    }
    return map;
  } catch (e) {
    console.warn('  ⚠ yorumlar çekilemedi:', e.message, '— puansız devam ediliyor');
    return empty;
  }
}

/** Yorum dizisinden product-schema.js'in beklediği rating nesnesi */
function ratingOf(reviews) {
  if (!reviews || !reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length;
  return { avg, count: reviews.length, reviews };
}

/** Test ürünü mü? (sayfa üretilir ama noindex + sitemap dışı) */
const isTestProduct = (p) => /(^|[-_])test([-_]|$)/i.test(p.slug) || /\btest\b/i.test(p.name);

module.exports = {
  SITE, SUPABASE_URL,
  BUSINESS, ORG_ID, WEBSITE_ID, organizationLd, websiteLd, siteGraphLd,
  sharedScripts, productScripts, header, footer, pinVersions,
  esc, stripHtml, excerpt, fmtTL,
  toUrl, imageUrls, canVariant, thumb, srcset,
  catCard, injectBetween, fetchProducts, isTestProduct, priceFields,
  fetchReviews, ratingOf,
};
