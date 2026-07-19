// ============================================================
// products.js — Ürünler katalog sayfası (arama + kategori + ızgara)
// İhtiyaç: window.NMApi
// ============================================================
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const fmtTL = (n) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2, maximumFractionDigits: 2 }).format(Number(n || 0)) + ' TL';
  const norm = (s) => String(s || '').toLocaleLowerCase('tr');

  const gridEl = $('#catalogGrid');
  const catsEl = $('#catalogCats');
  const countEl = $('#catalogCount');
  const searchInput = $('#searchInput');
  const searchClear = $('#searchClear');

  let products = [];
  let catNodes = [];
  let activeCat = 'all';   // slug veya 'all'
  let query = '';
  let wishSet = new Set(); // favorideki ürün id'leri

  let toastEl = null, toastTimer = null;
  function toast(msg) {
    toastEl = toastEl || $('#nmToast');
    if (!toastEl) return;
    toastEl.textContent = msg; void toastEl.offsetWidth;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2400);
  }

  async function loadWishlist() {
    wishSet = new Set();
    if (!window.NMAuth || !window.NMAccount) return;
    const s = await window.NMAuth.getSession();
    if (!s) return;
    try { const { data } = await window.NMAccount.listWishlist(); (data || []).forEach(w => wishSet.add(w.product_id)); } catch {}
  }

  async function onFav(btn) {
    const id = btn.dataset.id;
    const s = window.NMAuth ? await window.NMAuth.getSession() : null;
    if (!s) { toast('Favorilere eklemek için giriş yap'); if (window.openAuthModal) window.openAuthModal('login'); return; }
    const isFav = wishSet.has(id);
    if (isFav) { wishSet.delete(id); btn.setAttribute('aria-pressed', 'false'); }
    else { wishSet.add(id); btn.setAttribute('aria-pressed', 'true'); }
    const { error } = isFav ? await window.NMAccount.removeFromWishlist(id) : await window.NMAccount.addToWishlist(id);
    if (error) {
      if (isFav) wishSet.add(id); else wishSet.delete(id);
      btn.setAttribute('aria-pressed', wishSet.has(id) ? 'true' : 'false');
      toast('İşlem başarısız'); return;
    }
    toast(isFav ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi');
  }

  function descendantSlugs(node) {
    const slugs = new Set([node.slug]);
    const stack = [node.id];
    while (stack.length) {
      const pid = stack.pop();
      catNodes.filter(c => (c.parentId || null) === pid).forEach(c => { slugs.add(c.slug); stack.push(c.id); });
    }
    return slugs;
  }

  async function boot() {
    const [prods, cats] = await Promise.all([
      window.NMApi ? window.NMApi.getAllProducts() : null,
      window.NMApi ? window.NMApi.getCategories() : null,
      loadWishlist(),
    ]);
    products = prods || [];
    catNodes = cats || [];

    // URL ?cat=slug veya ?q=...
    const params = new URLSearchParams(location.search);
    const qCat = params.get('cat');
    if (qCat && catNodes.some(c => c.slug === qCat)) activeCat = qCat;
    const qStr = params.get('q');
    if (qStr) { query = qStr; searchInput.value = qStr; }

    renderCats();
    wireSearch();
    render();

    // favori butonu (delegation — ızgara yeniden çizilse de çalışır)
    gridEl.addEventListener('click', (e) => {
      const fav = e.target.closest('.cat-fav');
      if (!fav) return;
      e.preventDefault();
      e.stopPropagation();
      onFav(fav);
    });

    // oturum değişiminde favori durumunu tazele
    if (window.NMAuth) {
      window.NMAuth.onAuthStateChange(async (s, ev) => {
        if (ev === 'SIGNED_OUT') { wishSet = new Set(); render(); }
        else if (ev === 'SIGNED_IN') { await loadWishlist(); render(); }
      });
    }
  }

  function renderCats() {
    const tops = catNodes.filter(c => !c.parentId);
    catsEl.innerHTML =
      `<button type="button" class="cat-chip ${activeCat === 'all' ? 'is-active' : ''}" data-slug="all">Tümü</button>` +
      tops.map(c => `<button type="button" class="cat-chip ${activeCat === c.slug ? 'is-active' : ''}" data-slug="${esc(c.slug)}">${esc(c.name)}</button>`).join('');
    $$('.cat-chip', catsEl).forEach(b => b.addEventListener('click', () => {
      activeCat = b.dataset.slug;
      $$('.cat-chip', catsEl).forEach(x => x.classList.toggle('is-active', x === b));
      syncUrl();
      render();
    }));
  }

  function wireSearch() {
    searchInput.addEventListener('input', () => {
      query = searchInput.value.trim();
      searchClear.hidden = !query;
      syncUrl();
      render();
    });
    searchClear.addEventListener('click', () => {
      query = ''; searchInput.value = ''; searchClear.hidden = true;
      syncUrl(); render(); searchInput.focus();
    });
    $('#catalogSearch').addEventListener('submit', (e) => e.preventDefault());
    searchClear.hidden = !query;
  }

  function syncUrl() {
    const u = new URL(location.href);
    activeCat && activeCat !== 'all' ? u.searchParams.set('cat', activeCat) : u.searchParams.delete('cat');
    query ? u.searchParams.set('q', query) : u.searchParams.delete('q');
    history.replaceState(null, '', u.pathname + (u.search || ''));
  }

  function filtered() {
    let list = products;
    if (activeCat !== 'all') {
      const node = catNodes.find(c => c.slug === activeCat);
      if (node) {
        const slugs = descendantSlugs(node);
        list = list.filter(p => slugs.has(p.category));
      }
    }
    if (query) {
      const q = norm(query);
      list = list.filter(p => norm(p.name).includes(q) || norm(p.categoryName).includes(q));
    }
    return list;
  }

  function render() {
    const list = filtered();
    countEl.textContent = list.length ? `${list.length} ürün` : '';
    if (!list.length) {
      gridEl.innerHTML = `<div class="shop-empty"><p>${query ? `"${esc(query)}" için sonuç yok.` : 'Bu kategoride ürün yok.'}</p></div>`;
      return;
    }
    gridEl.innerHTML = list.map(card).join('');
  }

  // Responsive görsel: NMApi thumb/srcset (varyant yoksa orijinali döndürür)
  const cThumb = (u, w) => { const a = window.NMApi; return a && a.thumb ? a.thumb(u, w) : u; };
  const cSrcset = (u) => { const a = window.NMApi; return a && a.srcset ? a.srcset(u) : ''; };

  function card(p) {
    const out = p.stock <= 0;
    const fav = wishSet.has(p.id);
    return `
      <a class="cat-card" href="${p.slug ? 'urun-' + esc(p.slug) + '.html' : 'product.html?id=' + esc(p.id)}">
        <div class="cat-card-media">
          ${p.image ? `<img src="${esc(cThumb(p.image, 360))}" srcset="${esc(cSrcset(p.image))}" sizes="(max-width: 768px) 45vw, 240px" data-full="${esc(p.image)}" alt="${esc(p.name)}" width="600" height="800" loading="lazy" decoding="async" />`
                    : `<span class="cat-card-glyph">${esc((p.categoryName || p.name || '?').charAt(0).toUpperCase())}</span>`}
          ${out ? '<span class="cat-card-oos">Tükendi</span>' : ''}
          ${p.discountPercent > 0 ? `<span class="disc-badge${out ? ' disc-below' : ''}" aria-label="%${esc(p.discountPercent)} indirim">%${esc(p.discountPercent)}</span>` : ''}
          <button type="button" class="cat-fav" data-id="${esc(p.id)}" aria-pressed="${fav ? 'true' : 'false'}" aria-label="Favorilere ekle" title="Favorilere ekle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
          </button>
        </div>
        <div class="cat-card-body">
          <span class="cat-card-cat">${esc(p.categoryName || '')}</span>
          <p class="cat-card-name">${esc(p.name)}</p>
          <p class="cat-card-price">${p.discountPercent > 0
            ? `<span class="price-old">${esc(fmtTL(p.oldPrice))}</span> ${esc(fmtTL(p.price))}`
            : esc(fmtTL(p.price))}</p>
        </div>
      </a>`;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
