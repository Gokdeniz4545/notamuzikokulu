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

const read = (f) => fs.readFileSync(f, 'utf8');

// ---- script bloğu ----

// Sadece o sayfaya özgü script'ler — ortak bloktan çıkarılır
const PAGE_SPECIFIC = /^(product|products|blog|blog-data)\.js(\?|$)/;
const srcOf = (tag) => (tag.match(/src="([^"]+)"/) || [, ''])[1];

function scriptTags() {
  const found = read(SCRIPTS_FROM).match(/<script src="[^"]+"[^>]*><\/script>/g) || [];
  if (!found.length) throw new Error('shared-chrome: product.html içinde <script src> bulunamadı');
  return found;
}

/** Her sayfada olan script'ler (supabase, api, sepet, auth, çerez onayı) */
const sharedScripts = () => scriptTags().filter((t) => !PAGE_SPECIFIC.test(srcOf(t))).join('\n');

/** Ortak blok + ürün detay mantığı (product.js) — sıra product.html'deki gibi korunur */
const productScripts = () =>
  scriptTags().filter((t) => !PAGE_SPECIFIC.test(srcOf(t)) || srcOf(t).startsWith('product.js')).join('\n');

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

module.exports = { sharedScripts, productScripts, footer, pinVersions };
