// ============================================================
// checkout.js — Ödeme sayfası (misafir + üye)
// create_order RPC ile sipariş oluşturur (ödeme PayTR AŞAMA 2B).
// İhtiyaç: window.NMCart, window.NMApi, window.NMAuth, window.NMAccount, window.sb
// ============================================================
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const content = $('#checkoutContent');

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const fmtTL = (n) => new Intl.NumberFormat('tr-TR').format(Number(n)) + ' TL';

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

  let session = null;
  let profile = null;
  let addresses = [];
  let products = {};
  let cartRows = [];     // [[id, qty], ...] (mevcut ürünler)
  let subtotal = 0;

  async function boot() {
    session = window.NMAuth ? await window.NMAuth.getSession() : null;

    const entries = window.NMCart ? window.NMCart.entries() : [];
    if (!entries.length) { renderEmpty(); return; }

    const ids = entries.map(([id]) => id);
    const list = (window.NMApi ? await window.NMApi.getProductsByIds(ids) : []) || [];
    products = {};
    list.forEach(p => { products[p.id] = p; });
    cartRows = entries.filter(([id]) => products[id]);
    if (!cartRows.length) { renderEmpty(); return; }

    subtotal = 0;
    cartRows.forEach(([id, qty]) => { subtotal += products[id].price * qty; });

    if (session) {
      const [pf, ad] = await Promise.all([
        window.NMAccount.getProfile(),
        window.NMAccount.listAddresses(),
      ]);
      profile = pf.data || {};
      addresses = ad.data || [];
    }

    renderForm();
  }

  function renderEmpty() {
    content.innerHTML = `
      <div class="shop-empty">
        <p>Sepetin boş — ödeme yapılacak ürün yok.</p>
        <a href="index.html" class="auth-btn-primary">Alışverişe başla</a>
      </div>`;
  }

  function summaryHtml() {
    const items = cartRows.map(([id, qty]) => {
      const p = products[id];
      return `<div class="co-sum-row"><span>${esc(p.name)} × ${esc(qty)}</span><span>${esc(fmtTL(p.price * qty))}</span></div>`;
    }).join('');
    return `
      <aside class="co-summary">
        <h2 class="cart-summary-title">Sipariş özeti</h2>
        <div class="co-sum-items">${items}</div>
        <div class="cart-summary-row"><span>Ara toplam</span><span>${esc(fmtTL(subtotal))}</span></div>
        <div class="cart-summary-row"><span>Kargo</span><span>Ücretsiz</span></div>
        <div class="cart-summary-row cart-summary-total"><span>Toplam</span><span>${esc(fmtTL(subtotal))}</span></div>
        <p class="co-pay-note">Ödeme entegrasyonu (PayTR) yakında. Şimdilik siparişin "onay bekliyor" olarak oluşturulur.</p>
      </aside>`;
  }

  function addressFieldsHtml(a) {
    a = a || {};
    return `
      <div class="account-field-row">
        <div class="account-field"><label for="coName">Ad Soyad</label>
          <input id="coName" name="full_name" type="text" autocomplete="name" value="${esc(a.full_name || (profile && profile.full_name) || '')}" required /></div>
        <div class="account-field"><label for="coPhone">Telefon</label>
          <input id="coPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="05xx xxx xx xx" value="${esc(a.phone || (profile && profile.phone) || '')}" required /></div>
      </div>
      ${session ? '' : `
      <div class="account-field"><label for="coEmail">E-posta</label>
        <input id="coEmail" name="email" type="email" inputmode="email" autocomplete="email" required />
        <span class="account-hint">Sipariş bilgilendirmesi bu adrese gönderilir.</span></div>`}
      <div class="account-field"><label for="coLine">Adres</label>
        <textarea id="coLine" name="address_line" rows="2" required>${esc(a.address_line || '')}</textarea></div>
      <div class="account-field-row">
        <div class="account-field"><label for="coCity">İl</label>
          <input id="coCity" name="city" type="text" value="${esc(a.city || '')}" required /></div>
        <div class="account-field"><label for="coDistrict">İlçe</label>
          <input id="coDistrict" name="district" type="text" value="${esc(a.district || '')}" required /></div>
        <div class="account-field"><label for="coZip">Posta kodu</label>
          <input id="coZip" name="zip_code" type="text" inputmode="numeric" value="${esc(a.zip_code || '')}" /></div>
      </div>
      ${session ? `
      <label class="auth-check"><input type="checkbox" id="coSaveAddr" checked />
        <span>Bu adresi hesabıma kaydet</span></label>` : ''}`;
  }

  function renderForm() {
    let addressSection = '';

    if (session && addresses.length) {
      const cards = addresses.map((a, i) => `
        <label class="co-addr-option">
          <input type="radio" name="addr" value="${esc(a.id)}" ${i === 0 ? 'checked' : ''} />
          <span class="co-addr-body">
            <span class="co-addr-title">${esc(a.title || 'Adres')}${a.is_default ? ' · Varsayılan' : ''}</span>
            <span class="co-addr-line">${esc(a.full_name)} — ${esc(a.address_line)}, ${esc(a.district)}/${esc(a.city)}</span>
          </span>
        </label>`).join('');
      addressSection = `
        <div class="co-addr-list">
          ${cards}
          <label class="co-addr-option">
            <input type="radio" name="addr" value="__new__" />
            <span class="co-addr-body"><span class="co-addr-title">+ Yeni adres gir</span></span>
          </label>
        </div>
        <div id="coNewAddr" class="co-new-addr" hidden>${addressFieldsHtml()}</div>`;
    } else {
      addressSection = `<div id="coNewAddr">${addressFieldsHtml()}</div>`;
    }

    content.innerHTML = `
      <div class="co-layout">
        <form class="co-form" id="checkoutForm" novalidate>
          <h2 class="co-section-title">Teslimat adresi</h2>
          ${addressSection}
          <p class="account-form-msg" hidden></p>
          <button type="submit" class="auth-btn-primary co-submit">Siparişi Tamamla</button>
        </form>
        ${summaryHtml()}
      </div>`;

    // yeni adres radio → form göster/gizle
    $$('input[name="addr"]', content).forEach(r => {
      r.addEventListener('change', () => {
        const host = $('#coNewAddr');
        if (!host) return;
        host.hidden = $('input[name="addr"]:checked', content).value !== '__new__';
      });
    });

    $('#checkoutForm').addEventListener('submit', onSubmit);
  }

  function collectAddress() {
    // kayıtlı adres seçili mi?
    const sel = $('input[name="addr"]:checked', content);
    if (sel && sel.value !== '__new__') {
      const a = addresses.find(x => x.id === sel.value);
      if (a) return { address: addrToJson(a), saveNew: false, guestEmail: null, guestPhone: null };
    }
    // manuel form
    const f = $('#checkoutForm');
    const get = (n) => { const el = f.elements[n]; return el ? el.value.trim() : ''; };
    const a = {
      full_name: get('full_name'),
      phone: get('phone'),
      address_line: get('address_line'),
      city: get('city'),
      district: get('district'),
      zip_code: get('zip_code'),
    };
    const email = session ? null : get('email');
    const saveNew = session && $('#coSaveAddr') ? $('#coSaveAddr').checked : false;
    return { manual: a, address: addrToJson(a, email), saveNew, guestEmail: email, guestPhone: a.phone };
  }

  function addrToJson(a, email) {
    const o = {
      full_name: a.full_name, phone: a.phone, address_line: a.address_line,
      city: a.city, district: a.district, zip_code: a.zip_code,
    };
    if (email) o.email = email;
    return o;
  }

  function validate(addr, guestEmail) {
    const a = addr;
    if (!a.full_name || !a.phone || !a.address_line || !a.city || !a.district) return 'Lütfen zorunlu alanları doldur.';
    if (!session) {
      if (!guestEmail) return 'E-posta adresi gerekli.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) return 'Geçerli bir e-posta gir.';
    }
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const msg = $('.account-form-msg', content);
    const { manual, address, saveNew, guestEmail, guestPhone } = collectAddress();

    const err = validate(address, guestEmail);
    if (err) { showMsg(msg, err, false); return; }

    const btn = $('.co-submit', content);
    btn.disabled = true;
    btn.textContent = 'Sipariş oluşturuluyor…';

    // üye + yeni adres kaydet (opsiyonel)
    if (session && saveNew && manual) {
      try { await window.NMAccount.addAddress({ ...manual, title: 'Adres', is_default: addresses.length === 0 }); }
      catch (e2) { console.error('[checkout] adres kaydı', e2); }
    }

    const p_items = cartRows.map(([id, qty]) => ({ product_id: id, quantity: qty }));
    const params = { p_items, p_address: address };
    if (!session) { params.p_guest_email = guestEmail; params.p_guest_phone = guestPhone; }

    let res;
    try {
      res = await window.sb.rpc('create_order', params);
    } catch (e3) {
      res = { error: e3 };
    }

    if (res.error) {
      btn.disabled = false;
      btn.textContent = 'Siparişi Tamamla';
      const m = res.error.message || '';
      showMsg(msg, m.includes('Stok') ? m : 'Sipariş oluşturulamadı. Lütfen tekrar dene.', false);
      return;
    }

    const orderId = res.data;
    let orderNumber = null;
    if (session && orderId) {
      try {
        const { data } = await window.sb.from('orders').select('order_number').eq('id', orderId).single();
        orderNumber = data ? data.order_number : null;
      } catch { /* RLS / network → numarasız göster */ }
    }

    if (window.NMCart) await window.NMCart.clear();
    renderSuccess(orderNumber);
  }

  function renderSuccess(orderNumber) {
    content.innerHTML = `
      <div class="co-success">
        <span class="auth-check-icon" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
        <h2>Siparişin alındı!</h2>
        ${orderNumber ? `<p class="co-success-num">Sipariş no: <strong>${esc(orderNumber)}</strong></p>` : ''}
        <p>Siparişin "onay bekliyor" durumunda oluşturuldu. Ödeme entegrasyonu (PayTR) yakında eklenecek.</p>
        <div class="co-success-actions">
          ${session ? '<a href="account.html?tab=orders" class="auth-btn-primary">Siparişlerim</a>' : ''}
          <a href="index.html" class="auth-btn-ghost">Alışverişe devam et</a>
        </div>
      </div>`;
    if (window.NMCart) window.NMCart.updateBadges();
  }

  function showMsg(el, text, ok) {
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    el.classList.toggle('is-ok', !!ok);
    el.classList.toggle('is-err', !ok);
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
