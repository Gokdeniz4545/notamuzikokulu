// ============================================================
// cart.js — Sepetim sayfası
// İhtiyaç: window.NMCart (cart-store.js), window.NMApi (api.js)
// ============================================================
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const content = $('#cartContent');

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const fmtTL = (n) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2, maximumFractionDigits: 2 }).format(Number(n)) + ' TL';

  let toastEl = null, toastTimer = null;
  function toast(msg) {
    toastEl = toastEl || $('#nmToast');
    if (!toastEl) return;
    toastEl.textContent = msg;
    void toastEl.offsetWidth;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2400);
  }

  let products = {}; // id -> product

  async function render() {
    const entries = window.NMCart ? window.NMCart.entries() : [];
    if (!entries.length) {
      content.innerHTML = `
        <div class="shop-empty">
          <p>Sepetin boş.</p>
          <a href="index.html" class="auth-btn-primary">Alışverişe başla</a>
        </div>`;
      return;
    }

    const ids = entries.map(([id]) => id);
    const list = (window.NMApi ? await window.NMApi.getProductsByIds(ids) : []) || [];
    products = {};
    list.forEach(p => { products[p.id] = p; });

    // ürünü bulunamayanları (silinmiş) sessizce çıkar
    const rows = entries.filter(([id]) => products[id]);
    const missing = entries.filter(([id]) => !products[id]);
    missing.forEach(([id]) => window.NMCart.remove(id));

    if (!rows.length) {
      content.innerHTML = `
        <div class="shop-empty">
          <p>Sepetindeki ürünler artık mevcut değil.</p>
          <a href="index.html" class="auth-btn-primary">Alışverişe başla</a>
        </div>`;
      return;
    }

    let subtotal = 0;
    const itemsHtml = rows.map(([id, qty]) => {
      const p = products[id];
      const line = p.price * qty;
      subtotal += line;
      const initial = (p.name || '?').charAt(0).toUpperCase();
      const maxStock = p.stock > 0 ? p.stock : 1;
      return `
        <article class="cart-item" data-id="${esc(id)}">
          <div class="cart-item-media"><span class="cart-item-glyph" aria-hidden="true">${esc(initial)}</span></div>
          <div class="cart-item-info">
            <p class="cart-item-name">${esc(p.name)}</p>
            <p class="cart-item-unit">${esc(fmtTL(p.price))}</p>
            ${p.stock <= 0 ? '<p class="cart-item-oos">Stokta yok</p>' : ''}
          </div>
          <div class="cart-item-qty" role="group" aria-label="Adet">
            <button type="button" class="qty-btn" data-act="dec" data-id="${esc(id)}" aria-label="Azalt">−</button>
            <span class="qty-value" data-qty="${esc(id)}">${esc(qty)}</span>
            <button type="button" class="qty-btn" data-act="inc" data-id="${esc(id)}" data-max="${esc(maxStock)}" aria-label="Arttır">+</button>
          </div>
          <div class="cart-item-line" data-line="${esc(id)}">${esc(fmtTL(line))}</div>
          <button type="button" class="cart-item-remove" data-act="remove" data-id="${esc(id)}" aria-label="Kaldır">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </article>`;
    }).join('');

    content.innerHTML = `
      <div class="cart-layout">
        <div class="cart-items">${itemsHtml}</div>
        <aside class="cart-summary">
          <h2 class="cart-summary-title">Özet</h2>
          <div class="cart-summary-row"><span>Ara toplam</span><span data-subtotal>${esc(fmtTL(subtotal))}</span></div>
          <div class="cart-summary-row"><span>Kargo</span><span data-shipping>${esc(shipLabel(subtotal))}</span></div>
          <div class="cart-summary-row cart-summary-total"><span>Toplam</span><span data-total>${esc(fmtTL(subtotal + shipFee(subtotal)))}</span></div>
          <a href="checkout.html" class="auth-btn-primary cart-checkout-btn">Ödemeye Geç</a>
        </aside>
      </div>`;

    wire();
  }

  function wire() {
    $$('[data-act]', content).forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        const cur = window.NMCart.getQty(id);
        if (act === 'inc') {
          const max = parseInt(btn.dataset.max, 10) || 99;
          if (cur >= max) { toast('Stok sınırına ulaşıldı'); return; }
          await window.NMCart.setQty(id, cur + 1);
          updateRow(id);
        } else if (act === 'dec') {
          if (cur <= 1) { await window.NMCart.remove(id); render(); return; }
          await window.NMCart.setQty(id, cur - 1);
          updateRow(id);
        } else if (act === 'remove') {
          await window.NMCart.remove(id);
          toast('Üründen çıkarıldı');
          render();
        }
      });
    });
  }

  function updateRow(id) {
    const p = products[id];
    const qty = window.NMCart.getQty(id);
    const qEl = $(`[data-qty="${cssEsc(id)}"]`, content);
    const lEl = $(`[data-line="${cssEsc(id)}"]`, content);
    if (qEl) qEl.textContent = String(qty);
    if (lEl && p) lEl.textContent = fmtTL(p.price * qty);
    recalcTotals();
  }

  function recalcTotals() {
    let subtotal = 0;
    window.NMCart.entries().forEach(([id, qty]) => {
      if (products[id]) subtotal += products[id].price * qty;
    });
    const sub = $('[data-subtotal]', content);
    const shp = $('[data-shipping]', content);
    const tot = $('[data-total]', content);
    if (sub) sub.textContent = fmtTL(subtotal);
    if (shp) shp.textContent = shipLabel(subtotal);
    if (tot) tot.textContent = fmtTL(subtotal + shipFee(subtotal));
  }

  // Kargo: ara toplam < 2000 TL ise 199 TL, değilse ücretsiz (create_order ile aynı kural)
  const FREE_SHIP_MIN = 2000, SHIP_FEE = 199;
  function shipFee(sub) { return (sub > 0 && sub < FREE_SHIP_MIN) ? SHIP_FEE : 0; }
  function shipLabel(sub) { return shipFee(sub) > 0 ? fmtTL(SHIP_FEE) : 'Ücretsiz'; }

  function cssEsc(s) {
    return (window.CSS && CSS.escape) ? CSS.escape(s) : String(s).replace(/["\\]/g, '\\$&');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render, { once: true });
  } else {
    render();
  }
})();
