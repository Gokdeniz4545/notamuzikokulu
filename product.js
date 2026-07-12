// ============================================================
// product.js — ürün detay sayfası
// İhtiyaç: NMApi, NMCart, NMAuth, NMAccount, NMReviews, openAuthModal
// ============================================================
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const fmtTL = (n) => new Intl.NumberFormat('tr-TR').format(Number(n || 0)) + ' TL';
  const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }); } catch { return ''; } };

  const mainEl = $('#productMain');
  const reviewsEl = $('#productReviews');
  const recEl = $('#productRecommended');

  let toastEl = null, toastTimer = null;
  function toast(msg) {
    toastEl = toastEl || $('#nmToast');
    if (!toastEl) return;
    toastEl.textContent = msg; void toastEl.offsetWidth;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2400);
  }

  const STAR = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z';
  function starsHTML(rating) {
    let h = '<span class="stars" aria-label="' + rating + ' / 5">';
    for (let i = 1; i <= 5; i++) {
      h += `<svg viewBox="0 0 24 24" class="${i <= Math.round(rating) ? 'star-on' : 'star-off'}"><path d="${STAR}"/></svg>`;
    }
    return h + '</span>';
  }

  let product = null;
  let session = null;

  // ---- SEO ----
  const SITE_BASE = 'https://www.notamuzikmarket.com';
  // Statik ürün sayfası canonical'ı: önce (varsa) global, sonra sayfadaki <link rel=canonical>, sonra dinamik URL.
  const pageUrl = () => window.__NM_CANONICAL__
    || document.querySelector('link[rel="canonical"]')?.getAttribute('href')
    || (SITE_BASE + '/product.html?id=' + encodeURIComponent(product.id));
  const excerpt = (s, n = 155) => {
    const t = String(s || '').replace(/\s+/g, ' ').trim();
    return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t;
  };
  const setAttr = (id, attr, val) => { const el = document.getElementById(id); if (el) el.setAttribute(attr, val); };
  function setRobots(val) { setAttr('metaRobots', 'content', val); }

  function applyMeta() {
    const desc = excerpt(product.description) || `${product.name} — Nota Müzik Market`;
    const img = product.image || (SITE_BASE + '/images/og-image.png');
    const url = pageUrl();
    document.title = product.name + ' — Nota Müzik Market';
    setAttr('metaDesc', 'content', desc);
    setAttr('canonical', 'href', url);
    setAttr('ogTitle', 'content', product.name);
    setAttr('ogDesc', 'content', desc);
    setAttr('ogUrl', 'content', url);
    setAttr('ogImage', 'content', img);
    setAttr('twTitle', 'content', product.name);
    setAttr('twDesc', 'content', desc);
    setAttr('twImage', 'content', img);
  }

  function applyProductSchema(avg, count, reviews) {
    const node = document.getElementById('ldProduct');
    if (!node) return;
    const imgs = (product.images && product.images.length) ? product.images : (product.image ? [product.image] : []);
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: excerpt(product.description, 300) || product.name,
      sku: product.id,
      brand: { '@type': 'Brand', name: 'Nota Müzik Market' },
      offers: {
        '@type': 'Offer',
        price: Number(product.price),
        priceCurrency: 'TRY',
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: pageUrl(),
      },
    };
    if (imgs.length) schema.image = imgs;
    if (product.categoryName) schema.category = product.categoryName;
    if (count > 0) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: Number(avg.toFixed(1)),
        reviewCount: count,
        bestRating: 5,
        worstRating: 1,
      };
      schema.review = (reviews || []).slice(0, 5).map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.author_name || 'Müşteri' },
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        reviewBody: r.comment || undefined,
        datePublished: r.created_at ? r.created_at.slice(0, 10) : undefined,
      }));
    }
    node.textContent = JSON.stringify(schema);
  }

  async function boot() {
    // Kimlik: ?id= (product.html), gömülü __NM_PID__, ya da statik sayfa URL'sinden slug (urun-<slug>.html).
    // Not: statik sayfalarda __NM_PID__ inline script CSP tarafından engellenebildiği için slug birincil yoldur.
    const id = new URLSearchParams(location.search).get('id') || window.__NM_PID__ || null;
    let slug = null;
    if (!id) {
      const m = location.pathname.match(/\/urun-(.+)\.html$/);
      if (m) slug = decodeURIComponent(m[1]);
    }
    if (!id && !slug) { setRobots('noindex'); mainEl.innerHTML = errBox('Ürün belirtilmedi.'); return; }

    session = window.NMAuth ? await window.NMAuth.getSession() : null;
    product = window.NMApi
      ? (id ? await window.NMApi.getProductById(id) : await window.NMApi.getProductBySlug(slug))
      : null;
    if (!product) {
      if (window.__NM_PID__ || slug) return; // statik sayfa: SSR içerik + head korunur, hydrate edilemedi
      setRobots('noindex'); mainEl.innerHTML = errBox('Ürün bulunamadı veya yayında değil.'); reviewsEl.innerHTML = ''; recEl.innerHTML = ''; return;
    }

    applyMeta();
    $('#productCrumb').innerHTML = `<a href="index.html">Ana Sayfa</a> <span aria-hidden="true">›</span> <span>${esc(product.name)}</span>`;

    renderMain();
    renderReviews();
    renderRecommended();
  }

  function errBox(t) { return `<div class="shop-empty"><p>${esc(t)}</p><a href="index.html" class="auth-btn-primary">Ana sayfaya dön</a></div>`; }

  // ---- üst: galeri + bilgi ----
  function renderMain() {
    const imgs = product.images && product.images.length ? product.images : (product.image ? [product.image] : []);
    const glyph = (product.categoryName || product.name || '?').charAt(0).toUpperCase();
    const inStock = product.stock > 0;
    mainEl.className = 'product-main';
    mainEl.innerHTML = `
      <div class="product-gallery">
        <div class="product-gallery-main" id="galMain">
          ${product.discountPercent > 0 ? `<span class="disc-badge" aria-label="%${esc(product.discountPercent)} indirim">%${esc(product.discountPercent)}</span>` : ''}
          ${imgs.length ? `<img id="galImg" src="${esc(imgs[0])}" alt="${esc(product.name)}" decoding="async" />`
                        : `<span class="product-gallery-glyph">${esc(glyph)}</span>`}
        </div>
        ${imgs.length > 1 ? `<div class="product-thumbs">${imgs.map((u, i) =>
          `<button type="button" class="product-thumb ${i === 0 ? 'is-active' : ''}" data-i="${i}"><img src="${esc(u)}" alt="" /></button>`).join('')}</div>` : ''}
      </div>
      <div class="product-info">
        <p class="product-cat">${esc(product.categoryName || '')}</p>
        <h1 class="product-title">${esc(product.name)}</h1>
        <div class="product-rating-line" id="ratingLine"></div>
        <p class="product-price">${product.discountPercent > 0
          ? `<span class="price-old">${esc(fmtTL(product.oldPrice))}</span> ${esc(fmtTL(product.price))} <span class="disc-tag">-%${esc(product.discountPercent)}</span>`
          : esc(fmtTL(product.price))}</p>
        <p class="product-stock ${inStock ? '' : 'is-out'}">${inStock ? 'Stokta — ' + product.stock + ' adet' : 'Tükendi'}</p>
        <p class="product-desc">${esc(product.description || '')}</p>
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
      </div>`;

    // galeri thumb geçişi
    let idx = 0;
    $$('.product-thumb', mainEl).forEach(btn => btn.addEventListener('click', () => {
      idx = parseInt(btn.dataset.i, 10);
      const img = $('#galImg'); if (img) img.src = imgs[idx];
      $$('.product-thumb', mainEl).forEach(b => b.classList.toggle('is-active', b === btn));
    }));

    // adet
    let qty = 1;
    const qVal = $('#qVal');
    $('#qMinus').addEventListener('click', () => { qty = Math.max(1, qty - 1); qVal.textContent = qty; });
    $('#qPlus').addEventListener('click', () => { const max = inStock ? product.stock : 1; qty = Math.min(max, qty + 1); qVal.textContent = qty; });

    // sepete ekle (stok tavanı: fazladan tıklama stoğu aşamaz)
    $('#addCartBtn').addEventListener('click', async () => {
      if (!inStock || !window.NMCart) return;
      const full = await window.NMCart.add(product.id, qty, product.stock);
      if (!full) { toast('Stok sınırına ulaşıldı'); return; }
      toast('Sepete eklendi');
      const b = $('#addCartBtn'); const old = b.textContent;
      b.textContent = 'Eklendi ✓'; b.disabled = true;
      setTimeout(() => { b.textContent = old; b.disabled = !inStock; }, 1100);
    });

    // favori
    initFav();
  }

  async function initFav() {
    const btn = $('#favBtn');
    if (!btn) return;
    let isFav = false;
    if (session && window.NMAccount) {
      try {
        const { data } = await window.NMAccount.listWishlist();
        isFav = (data || []).some(w => w.product_id === product.id);
      } catch {}
    }
    btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
    btn.addEventListener('click', async () => {
      const s = window.NMAuth ? await window.NMAuth.getSession() : null;
      if (!s) { toast('Favorilere eklemek için giriş yap'); if (window.openAuthModal) window.openAuthModal('login'); return; }
      isFav = !isFav;
      btn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
      const { error } = isFav
        ? await window.NMAccount.addToWishlist(product.id)
        : await window.NMAccount.removeFromWishlist(product.id);
      if (error) { isFav = !isFav; btn.setAttribute('aria-pressed', isFav ? 'true' : 'false'); toast('İşlem başarısız'); return; }
      toast(isFav ? 'Favorilere eklendi' : 'Favorilerden çıkarıldı');
    });
  }

  // ---- yorumlar ----
  async function renderReviews() {
    if (!window.NMReviews) { reviewsEl.innerHTML = ''; applyProductSchema(0, 0, []); return; }
    const { data: reviews } = await window.NMReviews.listReviews(product.id);
    const list = reviews || [];
    const avg = list.length ? (list.reduce((s, r) => s + r.rating, 0) / list.length) : 0;

    // schema.org Product (+ AggregateRating) — yorum verisi hazırken
    applyProductSchema(avg, list.length, list);

    // üst bilgi satırındaki yıldız
    const rl = $('#ratingLine');
    if (rl) rl.innerHTML = list.length ? `${starsHTML(avg)} <span>${avg.toFixed(1)} (${list.length} değerlendirme)</span>` : '<span>Henüz değerlendirme yok</span>';

    const itemsHtml = list.length ? list.map(r => `
      <div class="review-item">
        <div class="review-head">
          <span class="review-author">${esc(r.author_name || 'Müşteri')}</span>
          <span class="review-date">${esc(fmtDate(r.created_at))}</span>
        </div>
        ${starsHTML(r.rating)}
        ${r.comment ? `<p class="review-comment">${esc(r.comment)}</p>` : ''}
      </div>`).join('') : '<p class="review-empty">İlk değerlendirmeyi sen yap.</p>';

    reviewsEl.innerHTML = `
      <h2>Değerlendirmeler</h2>
      ${list.length ? `<div class="review-summary"><span class="review-avg">${avg.toFixed(1)}</span><div>${starsHTML(avg)}<div class="review-count">${list.length} değerlendirme</div></div></div>` : ''}
      <div class="review-list">${itemsHtml}</div>
      <div id="reviewFormHost"></div>`;

    renderReviewForm();
  }

  async function renderReviewForm() {
    const host = $('#reviewFormHost');
    if (!host) return;
    if (!session) {
      host.innerHTML = '<p class="review-note">Değerlendirme yapmak için <a href="#" id="revLogin">giriş yap</a>.</p>';
      const l = $('#revLogin'); if (l) l.addEventListener('click', (e) => { e.preventDefault(); if (window.openAuthModal) window.openAuthModal('login'); });
      return;
    }
    const eligible = await window.NMReviews.canReview(product.id);
    if (!eligible) {
      host.innerHTML = '<p class="review-note">Yalnızca bu ürünü satın alıp teslim alan müşteriler değerlendirme yapabilir.</p>';
      return;
    }
    const mine = await window.NMReviews.getMyReview(product.id);
    let rating = mine ? mine.rating : 0;

    host.innerHTML = `
      <form class="review-form" id="reviewForm">
        <h3>${mine ? 'Değerlendirmeni güncelle' : 'Bu ürünü değerlendir'}</h3>
        <div class="review-stars-input" id="starsInput" role="radiogroup" aria-label="Puan">
          ${[1, 2, 3, 4, 5].map(i => `<button type="button" data-v="${i}" class="${i <= rating ? 'on' : ''}" aria-label="${i} yıldız"><svg viewBox="0 0 24 24"><path d="${STAR}"/></svg></button>`).join('')}
        </div>
        <textarea name="comment" placeholder="Ürün hakkındaki görüşün (opsiyonel)">${esc(mine ? mine.comment || '' : '')}</textarea>
        <p class="account-form-msg" hidden></p>
        <div style="display:flex;gap:10px;">
          <button type="submit" class="auth-btn-primary">${mine ? 'Güncelle' : 'Gönder'}</button>
          ${mine ? '<button type="button" class="auth-btn-ghost" id="revDelete">Sil</button>' : ''}
        </div>
      </form>`;

    const starBtns = $$('#starsInput button', host);
    starBtns.forEach(b => b.addEventListener('click', () => {
      rating = parseInt(b.dataset.v, 10);
      starBtns.forEach(x => x.classList.toggle('on', parseInt(x.dataset.v, 10) <= rating));
    }));

    $('#reviewForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = $('.account-form-msg', host);
      if (rating < 1) { showMsg(msg, 'Lütfen puan seç (1-5 yıldız).', false); return; }
      const comment = e.target.comment.value.trim();
      let authorName = 'Müşteri';
      try { const { data } = await window.NMAccount.getProfile(); authorName = (data && data.full_name) || (session.user && session.user.email) || 'Müşteri'; } catch {}
      const { error } = await window.NMReviews.addReview(product.id, rating, comment, authorName);
      if (error) { showMsg(msg, 'Kaydedilemedi: ' + (error.message || ''), false); return; }
      toast('Değerlendirmen kaydedildi');
      renderReviews();
    });

    const del = $('#revDelete');
    if (del) del.addEventListener('click', async () => {
      if (!confirm('Değerlendirmeni sil?')) return;
      const { error } = await window.NMReviews.deleteReview(product.id);
      if (error) { toast('Silinemedi'); return; }
      toast('Değerlendirme silindi'); renderReviews();
    });
  }

  // ---- önerilen ürünler ----
  async function renderRecommended() {
    if (!window.NMApi) { recEl.innerHTML = ''; return; }
    const items = await window.NMApi.getRecommended(product.id, product.category);
    if (!items || !items.length) { recEl.innerHTML = ''; return; }
    recEl.innerHTML = `
      <h2>Benzer ürünler</h2>
      <div class="rec-grid">
        ${items.map(p => `
          <a class="rec-card" href="${p.slug ? 'urun-' + esc(p.slug) + '.html' : 'product.html?id=' + esc(p.id)}">
            <div class="rec-media">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async" />` : `<span>${esc((p.name || '?').charAt(0).toUpperCase())}</span>`}</div>
            <div class="rec-body"><p class="rec-name">${esc(p.name)}</p><p class="rec-price">${p.discountPercent > 0
              ? `<span class="price-old">${esc(fmtTL(p.oldPrice))}</span> ${esc(fmtTL(p.price))}`
              : esc(fmtTL(p.price))}</p></div>
          </a>`).join('')}
      </div>`;
  }

  function showMsg(el, text, ok) {
    if (!el) return;
    el.textContent = text; el.hidden = false;
    el.classList.toggle('is-ok', !!ok); el.classList.toggle('is-err', !ok);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
