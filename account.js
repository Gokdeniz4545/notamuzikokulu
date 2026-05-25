// ============================================================
// account.js — Hesabım paneli (PR-C: profil + adresler)
// Siparişler + Favoriler PR-D'de doldurulacak.
// İhtiyaç: window.NMAuth, window.NMAccount, window.openAuthModal
// ============================================================
(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const shell    = $('#accountShell');
  const gate     = $('#accountGate');
  const panel    = $('#accountPanel');
  const greeting = $('#acctGreeting');
  const tabs     = $$('.account-tab');

  const VALID_TABS = ['profile', 'addresses', 'orders', 'wishlist'];
  let currentUser = null;

  // ---- yardımcılar ----
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const fmtDate = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return iso; }
  };

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

  // ---- guard + boot ----
  async function boot() {
    // çıkış butonları
    [$('#headerLogout'), $('#acctLogout')].forEach(btn => {
      if (btn) btn.addEventListener('click', async () => {
        await window.NMAuth.signOut();
      });
    });

    // tab tıklama
    tabs.forEach(t => t.addEventListener('click', () => selectTab(t.dataset.tab, true)));

    // url ?tab değişimi (geri/ileri)
    window.addEventListener('popstate', () => { if (currentUser) routeFromUrl(); });

    const session = window.NMAuth ? await window.NMAuth.getSession() : null;
    if (session) showApp(session);
    else { showGate(); if (window.openAuthModal) window.openAuthModal('login'); }

    if (window.NMAuth) {
      window.NMAuth.onAuthStateChange((s, event) => {
        if (event === 'SIGNED_OUT') { currentUser = null; location.href = 'index.html'; return; }
        if (s && (!currentUser || event === 'SIGNED_IN')) showApp(s);
      });
    }
  }

  function showGate() {
    shell.hidden = true;
    gate.style.display = 'flex';
    const hl = $('#headerLogout'); if (hl) hl.hidden = true;
  }

  function showApp(session) {
    currentUser = session.user;
    gate.style.display = 'none';
    shell.hidden = false;
    const hl = $('#headerLogout'); if (hl) hl.hidden = false;
    const meta = currentUser.user_metadata || {};
    greeting.textContent = meta.full_name || currentUser.email || 'Hesabım';
    routeFromUrl();
  }

  function routeFromUrl() {
    const params = new URLSearchParams(location.search);
    let tab = params.get('tab');
    if (!VALID_TABS.includes(tab)) tab = 'profile';
    selectTab(tab, false);
  }

  function selectTab(tab, pushUrl) {
    if (!VALID_TABS.includes(tab)) tab = 'profile';
    tabs.forEach(t => {
      const sel = t.dataset.tab === tab;
      t.setAttribute('aria-selected', sel ? 'true' : 'false');
      t.classList.toggle('is-active', sel);
    });
    if (pushUrl) {
      const url = new URL(location.href);
      url.searchParams.set('tab', tab);
      url.searchParams.delete('id');
      history.pushState(null, '', url.pathname + url.search);
    }
    render(tab);
  }

  async function render(tab) {
    panel.innerHTML = '<p class="account-loading">Yükleniyor…</p>';
    if (tab === 'profile')        await renderProfile();
    else if (tab === 'addresses') await renderAddresses();
    else if (tab === 'orders')    await renderOrders();
    else if (tab === 'wishlist')  await renderWishlist();
  }

  // ============================================================
  // PROFİL
  // ============================================================
  async function renderProfile() {
    const { data, error } = await window.NMAccount.getProfile();
    if (error) { panel.innerHTML = errorBox('Profil yüklenemedi.'); return; }
    const p = data || {};
    panel.innerHTML = `
      <h2 class="account-panel-title">Profilim</h2>
      <form class="account-form" id="profileForm">
        <div class="account-field">
          <label for="pfName">Ad Soyad</label>
          <input id="pfName" name="full_name" type="text" autocomplete="name" value="${esc(p.full_name)}" />
        </div>
        <div class="account-field">
          <label for="pfPhone">Telefon</label>
          <input id="pfPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="05xx xxx xx xx" value="${esc(p.phone)}" />
        </div>
        <div class="account-field">
          <label for="pfEmail">E-posta</label>
          <input id="pfEmail" type="email" value="${esc(currentUser.email)}" readonly />
          <span class="account-hint">E-posta değiştirilemez.</span>
        </div>
        <p class="account-form-msg" hidden></p>
        <button type="submit" class="auth-btn-primary">Değişiklikleri Kaydet</button>
      </form>

      <div class="account-divider"></div>

      <details class="account-accordion">
        <summary>Şifre değiştir</summary>
        <form class="account-form" id="passwordForm">
          <div class="account-field">
            <label for="pwNew">Yeni şifre</label>
            <input id="pwNew" name="password" type="password" autocomplete="new-password" minlength="6" />
          </div>
          <div class="account-field">
            <label for="pwNew2">Yeni şifre (tekrar)</label>
            <input id="pwNew2" name="password2" type="password" autocomplete="new-password" minlength="6" />
          </div>
          <p class="account-form-msg" hidden></p>
          <button type="submit" class="auth-btn-ghost">Şifremi Güncelle</button>
        </form>
      </details>`;

    $('#profileForm').addEventListener('submit', onProfileSubmit);
    $('#passwordForm').addEventListener('submit', onPasswordSubmit);
  }

  async function onProfileSubmit(e) {
    e.preventDefault();
    const msg = $('.account-form-msg', e.target);
    const full_name = e.target.full_name.value.trim();
    const phone = e.target.phone.value.trim();
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    const { error } = await window.NMAccount.updateProfile({ full_name, phone });
    btn.disabled = false;
    if (error) return showMsg(msg, 'Kaydedilemedi: ' + (error.message || ''), false);
    toast('Profil güncellendi');
    showMsg(msg, 'Kaydedildi.', true);
  }

  async function onPasswordSubmit(e) {
    e.preventDefault();
    const msg = $('.account-form-msg', e.target);
    const p1 = e.target.password.value;
    const p2 = e.target.password2.value;
    if (p1.length < 6) return showMsg(msg, 'Şifre en az 6 karakter olmalı.', false);
    if (p1 !== p2) return showMsg(msg, 'Şifreler eşleşmiyor.', false);
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    const { error } = await window.NMAuth.updatePassword(p1);
    btn.disabled = false;
    if (error) return showMsg(msg, window.NMAuth.translateAuthError(error), false);
    e.target.reset();
    toast('Şifren güncellendi');
    showMsg(msg, 'Şifre güncellendi.', true);
  }

  // ============================================================
  // ADRESLER
  // ============================================================
  async function renderAddresses() {
    const { data, error } = await window.NMAccount.listAddresses();
    if (error) { panel.innerHTML = errorBox('Adresler yüklenemedi.'); return; }
    const list = data || [];
    panel.innerHTML = `
      <div class="account-panel-head">
        <h2 class="account-panel-title">Adreslerim</h2>
        <button type="button" class="account-add-btn" id="addAddrBtn">+ Yeni adres</button>
      </div>
      <div id="addrFormHost"></div>
      <div class="address-grid" id="addrGrid">
        ${list.length ? list.map(addressCard).join('') : '<div class="account-empty"><p>Henüz kayıtlı adresin yok.</p></div>'}
      </div>`;

    $('#addAddrBtn').addEventListener('click', () => openAddrForm());
    wireAddressActions();
  }

  function addressCard(a) {
    return `
      <article class="address-card" data-id="${esc(a.id)}">
        <div class="address-card-head">
          <span class="address-title">${esc(a.title || 'Adres')}</span>
          ${a.is_default ? '<span class="address-default-badge">Varsayılan</span>' : ''}
        </div>
        <p class="address-name">${esc(a.full_name)}</p>
        <p class="address-line">${esc(a.address_line)}</p>
        <p class="address-meta">${esc(a.district)}${a.district && a.city ? ' / ' : ''}${esc(a.city)} ${esc(a.zip_code)}</p>
        <p class="address-phone">${esc(a.phone)}</p>
        <div class="address-actions">
          <button type="button" data-act="edit" data-id="${esc(a.id)}">Düzenle</button>
          ${a.is_default ? '' : `<button type="button" data-act="default" data-id="${esc(a.id)}">Varsayılan yap</button>`}
          <button type="button" class="address-del" data-act="delete" data-id="${esc(a.id)}">Sil</button>
        </div>
      </article>`;
  }

  function wireAddressActions() {
    $$('.address-actions button', panel).forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if (act === 'delete') {
          if (!confirm('Bu adresi silmek istediğine emin misin?')) return;
          const { error } = await window.NMAccount.deleteAddress(id);
          if (error) return toast('Silinemedi');
          toast('Adres silindi');
          renderAddresses();
        } else if (act === 'default') {
          const { error } = await window.NMAccount.setDefaultAddress(id);
          if (error) return toast('İşlem başarısız');
          toast('Varsayılan adres güncellendi');
          renderAddresses();
        } else if (act === 'edit') {
          const { data } = await window.NMAccount.listAddresses();
          const addr = (data || []).find(x => x.id === id);
          openAddrForm(addr);
        }
      });
    });
  }

  function openAddrForm(addr) {
    const host = $('#addrFormHost');
    const a = addr || {};
    const editing = !!addr;
    host.innerHTML = `
      <form class="account-form address-form" id="addrForm">
        <h3 class="address-form-title">${editing ? 'Adresi düzenle' : 'Yeni adres'}</h3>
        <div class="account-field-row">
          <div class="account-field">
            <label for="afTitle">Adres başlığı</label>
            <input id="afTitle" name="title" type="text" placeholder="Ev, İş…" value="${esc(a.title)}" />
          </div>
          <div class="account-field">
            <label for="afName">Ad Soyad</label>
            <input id="afName" name="full_name" type="text" autocomplete="name" value="${esc(a.full_name)}" required />
          </div>
        </div>
        <div class="account-field">
          <label for="afPhone">Telefon</label>
          <input id="afPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="05xx xxx xx xx" value="${esc(a.phone)}" required />
        </div>
        <div class="account-field">
          <label for="afLine">Adres</label>
          <textarea id="afLine" name="address_line" rows="2" required>${esc(a.address_line)}</textarea>
        </div>
        <div class="account-field-row">
          <div class="account-field">
            <label for="afCity">İl</label>
            <input id="afCity" name="city" type="text" value="${esc(a.city)}" required />
          </div>
          <div class="account-field">
            <label for="afDistrict">İlçe</label>
            <input id="afDistrict" name="district" type="text" value="${esc(a.district)}" required />
          </div>
          <div class="account-field">
            <label for="afZip">Posta kodu</label>
            <input id="afZip" name="zip_code" type="text" inputmode="numeric" value="${esc(a.zip_code)}" />
          </div>
        </div>
        <label class="auth-check">
          <input type="checkbox" name="is_default" ${a.is_default ? 'checked' : ''} />
          <span>Varsayılan adresim olsun</span>
        </label>
        <p class="account-form-msg" hidden></p>
        <div class="address-form-actions">
          <button type="submit" class="auth-btn-primary">${editing ? 'Güncelle' : 'Kaydet'}</button>
          <button type="button" class="auth-btn-ghost" id="addrCancel">Vazgeç</button>
        </div>
      </form>`;

    host.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    $('#addrCancel').addEventListener('click', () => { host.innerHTML = ''; });
    $('#addrForm').addEventListener('submit', (e) => onAddrSubmit(e, editing ? a.id : null));
  }

  async function onAddrSubmit(e, editId) {
    e.preventDefault();
    const f = e.target;
    const msg = $('.account-form-msg', f);
    const payload = {
      title: f.title.value.trim(),
      full_name: f.full_name.value.trim(),
      phone: f.phone.value.trim(),
      address_line: f.address_line.value.trim(),
      city: f.city.value.trim(),
      district: f.district.value.trim(),
      zip_code: f.zip_code.value.trim(),
      is_default: f.is_default.checked,
    };
    const btn = f.querySelector('button[type=submit]');
    btn.disabled = true;
    const res = editId
      ? await window.NMAccount.updateAddress(editId, payload)
      : await window.NMAccount.addAddress(payload);
    btn.disabled = false;
    if (res.error) return showMsg(msg, 'Kaydedilemedi: ' + (res.error.message || ''), false);
    toast(editId ? 'Adres güncellendi' : 'Adres eklendi');
    $('#addrFormHost').innerHTML = '';
    renderAddresses();
  }

  // ============================================================
  // SİPARİŞLER
  // ============================================================
  const ORDER_STATUS = {
    pending:   { label: 'Onay bekliyor', cls: 's-pending' },
    paid:      { label: 'Ödendi',        cls: 's-paid' },
    preparing: { label: 'Hazırlanıyor',  cls: 's-preparing' },
    shipped:   { label: 'Kargoda',       cls: 's-shipped' },
    delivered: { label: 'Teslim edildi', cls: 's-delivered' },
    cancelled: { label: 'İptal edildi',  cls: 's-cancelled' },
  };
  const statusLabel = (s) => (ORDER_STATUS[s] || { label: s }).label;
  const statusCls   = (s) => (ORDER_STATUS[s] || { cls: 's-pending' }).cls;
  const fmtTL = (n) => new Intl.NumberFormat('tr-TR').format(Number(n)) + ' TL';

  async function renderOrders() {
    const params = new URLSearchParams(location.search);
    const oid = params.get('id');
    if (oid) return renderOrderDetail(oid);

    const { data, error } = await window.NMAccount.listOrders();
    if (error) { panel.innerHTML = errorBox('Siparişler yüklenemedi.'); return; }
    const list = data || [];
    panel.innerHTML = `
      <h2 class="account-panel-title">Siparişlerim</h2>
      ${list.length ? `<div class="order-list">${list.map(orderRow).join('')}</div>`
                    : '<div class="account-empty"><p>Henüz siparişin yok.</p></div>'}`;

    $$('.order-row', panel).forEach(row => {
      row.addEventListener('click', () => openOrderDetail(row.dataset.id));
    });
  }

  function orderRow(o) {
    return `
      <button type="button" class="order-row" data-id="${esc(o.id)}">
        <span class="order-row-main">
          <span class="order-number">#${esc(o.order_number)}</span>
          <span class="order-date">${esc(fmtDate(o.created_at))}</span>
        </span>
        <span class="order-row-side">
          <span class="status-badge ${statusCls(o.status)}">${esc(statusLabel(o.status))}</span>
          <span class="order-total">${esc(fmtTL(o.total_amount))}</span>
        </span>
      </button>`;
  }

  function openOrderDetail(id) {
    const url = new URL(location.href);
    url.searchParams.set('tab', 'orders');
    url.searchParams.set('id', id);
    history.pushState(null, '', url.pathname + url.search);
    renderOrderDetail(id);
  }

  async function renderOrderDetail(id) {
    panel.innerHTML = '<p class="account-loading">Yükleniyor…</p>';
    const { order, items, history: hist, error } = await window.NMAccount.getOrder(id);
    if (error || !order) { panel.innerHTML = errorBox('Sipariş bulunamadı.'); return; }

    const itemsHtml = items.map(it => `
      <div class="order-item">
        <span class="order-item-name">${esc(it.product_name)}</span>
        <span class="order-item-qty">${esc(it.quantity)} ×</span>
        <span class="order-item-price">${esc(fmtTL(it.product_price))}</span>
        <span class="order-item-sub">${esc(fmtTL(it.subtotal))}</span>
      </div>`).join('');

    const timeline = (hist.length ? hist : [{ status: order.status, changed_at: order.created_at }])
      .map(h => `
        <div class="timeline-item">
          <span class="timeline-dot ${statusCls(h.status)}"></span>
          <span class="timeline-body">
            <span class="timeline-status">${esc(statusLabel(h.status))}</span>
            <span class="timeline-date">${esc(fmtDate(h.changed_at))}</span>
          </span>
        </div>`).join('');

    const tracking = order.tracking_code
      ? `<div class="order-tracking">
           <span class="account-hint">Kargo${order.cargo_company ? ' — ' + esc(order.cargo_company) : ''}</span>
           <span class="order-tracking-code">${esc(order.tracking_code)}</span>
         </div>`
      : '';

    panel.innerHTML = `
      <button type="button" class="order-back" id="orderBack">← Siparişlerim</button>
      <div class="order-detail-head">
        <h2 class="account-panel-title">#${esc(order.order_number)}</h2>
        <span class="status-badge ${statusCls(order.status)}">${esc(statusLabel(order.status))}</span>
      </div>
      <p class="account-hint">${esc(fmtDate(order.created_at))} · Toplam ${esc(fmtTL(order.total_amount))}</p>

      <h3 class="order-section-title">Ürünler</h3>
      <div class="order-items">${itemsHtml || '<p class="account-hint">Kalem bulunamadı.</p>'}</div>

      ${tracking}

      <h3 class="order-section-title">Durum geçmişi</h3>
      <div class="order-timeline">${timeline}</div>`;

    $('#orderBack').addEventListener('click', () => selectTab('orders', true));
  }

  // ============================================================
  // FAVORİLER (wishlist)
  // ============================================================
  async function renderWishlist() {
    const { data, error } = await window.NMAccount.listWishlist();
    if (error) { panel.innerHTML = errorBox('Favoriler yüklenemedi.'); return; }
    const list = (data || []).filter(w => w.products);
    panel.innerHTML = `
      <h2 class="account-panel-title">Favorilerim</h2>
      ${list.length ? `<div class="wishlist-grid">${list.map(wishlistCard).join('')}</div>`
                    : '<div class="account-empty"><p>Henüz favori ürünün yok.</p></div>'}`;

    $$('.wishlist-remove', panel).forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const { error: delErr } = await window.NMAccount.removeFromWishlist(id);
        if (delErr) return toast('Çıkarılamadı');
        toast('Favorilerden çıkarıldı');
        renderWishlist();
      });
    });
  }

  function wishlistCard(w) {
    const p = w.products;
    const initial = (p.name || '?').charAt(0).toUpperCase();
    return `
      <article class="wishlist-card" data-id="${esc(p.id)}">
        <a class="wishlist-media" href="index.html" aria-label="${esc(p.name)}">
          <span class="wishlist-glyph" aria-hidden="true">${esc(initial)}</span>
        </a>
        <div class="wishlist-body">
          <p class="wishlist-name">${esc(p.name)}</p>
          <p class="wishlist-price">${esc(fmtTL(p.price))}</p>
        </div>
        <button type="button" class="wishlist-remove" data-id="${esc(p.id)}" aria-label="Favorilerden çıkar">Kaldır</button>
      </article>`;
  }

  // ---- ortak ----
  function showMsg(el, text, ok) {
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    el.classList.toggle('is-ok', !!ok);
    el.classList.toggle('is-err', !ok);
  }
  function errorBox(text) {
    return `<div class="account-empty"><p>${esc(text)}</p></div>`;
  }

  // boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
