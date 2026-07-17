// ============================================================
// admin.js — Yönetim paneli (AŞAMA 3)
// Erişim: role='admin' (RLS gerçek koruma; bu guard sadece UX).
// İhtiyaç: window.NMAuth, window.NMAccount, window.NMAdmin, window.openAuthModal
// ============================================================
(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const shell    = $('#adminShell');
  const gate     = $('#adminGate');
  const gateText = $('#adminGateText');
  const gateLogin = $('#adminGateLogin');
  const panel    = $('#adminContent');
  const adminBadge = $('#adminBadge');
  const tabs     = $$('.account-tab');

  const VALID_TABS = ['dashboard', 'orders', 'products', 'categories'];
  let isAdmin = false;

  // ---- helpers ----
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const fmtTL = (n) => new Intl.NumberFormat('tr-TR').format(Number(n || 0)) + ' TL';
  const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return iso || ''; } };
  function slugify(s) {
    const map = { 'ç':'c','ğ':'g','ı':'i','İ':'i','ö':'o','ş':'s','ü':'u','â':'a','î':'i','û':'u' };
    return String(s || '').toLowerCase()
      .replace(/[çğıİöşüâîû]/g, c => map[c] || c)
      .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  }
  let toastEl = null, toastTimer = null;
  function toast(msg) {
    toastEl = toastEl || $('#nmToast');
    if (!toastEl) return;
    toastEl.textContent = msg; void toastEl.offsetWidth;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
  }

  const ORDER_STATUS = {
    pending:   'Onay bekliyor', paid: 'Ödendi', preparing: 'Hazırlanıyor',
    shipped:   'Kargoda', delivered: 'Teslim edildi', cancelled: 'İptal edildi',
    refunded:  'İade edildi', expired: 'Süresi doldu',
  };
  // Yasal ileri geçişler (0009 durum makinesi trigger'ıyla birebir). Boşsa dropdown pasif.
  // pending → paid yalnız ödeme webhook'uyla; iptal 'İptal et' butonuyla. refunded/cancelled dropdown'da YOK.
  const NEXT_STATUS = {
    pending: [], paid: ['preparing', 'shipped', 'delivered'],
    preparing: ['shipped', 'delivered'], shipped: ['delivered'],
    delivered: [], cancelled: [], refunded: [], expired: [],
  };
  const statusCls = (s) => 's-' + s;

  // Sipariş e-postası tetikle (kargo bildirimi / onay yeniden gönderimi). Ortak yardımcı.
  async function sendOrderEmail(merchantOid, type) {
    try {
      const session = await window.NMAuth.getSession();
      const resp = await fetch(window.NM_SUPA.url + '/functions/v1/send-order-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': window.NM_SUPA.anonKey,
          'Authorization': 'Bearer ' + (session ? session.access_token : window.NM_SUPA.anonKey),
        },
        body: JSON.stringify({ merchant_oid: merchantOid, type }),
      });
      const data = await resp.json();
      toast(data.ok ? 'E-posta gönderildi ✓' : ('E-posta gönderilemedi: ' + (data.error || '')));
      return !!data.ok;
    } catch (_) { toast('E-posta gönderilemedi'); return false; }
  }

  // ---- guard + boot ----
  async function boot() {
    const lo = $('#logoutBtn');
    if (lo) lo.addEventListener('click', async () => { await window.NMAuth.signOut(); });
    tabs.forEach(t => t.addEventListener('click', () => selectTab(t.dataset.tab, true)));
    window.addEventListener('popstate', () => { if (isAdmin) routeFromUrl(); });

    const session = window.NMAuth ? await window.NMAuth.getSession() : null;
    await applyAccess(session);

    if (window.NMAuth) {
      window.NMAuth.onAuthStateChange(async (s, event) => {
        if (event === 'SIGNED_OUT') { isAdmin = false; showGate('out'); return; }
        await applyAccess(s);
      });
    }
  }

  async function applyAccess(session) {
    if (!session) { isAdmin = false; showGate('out'); return; }
    const { data } = await window.NMAccount.getProfile();
    if (data && data.role === 'admin') {
      isAdmin = true;
      gate.style.display = 'none';
      shell.hidden = false;
      adminBadge.hidden = false;
      routeFromUrl();
    } else {
      isAdmin = false;
      showGate('forbidden');
    }
  }

  function showGate(kind) {
    shell.hidden = true;
    adminBadge.hidden = true;
    gate.style.display = 'flex';
    if (kind === 'out') {
      gateText.textContent = 'Yönetim paneline erişmek için giriş yap.';
      gateLogin.hidden = false;
    } else {
      gateText.textContent = 'Bu sayfaya erişim yetkin yok.';
      gateLogin.hidden = true;
    }
  }

  function routeFromUrl() {
    const p = new URLSearchParams(location.search);
    let tab = p.get('tab');
    if (!VALID_TABS.includes(tab)) tab = 'dashboard';
    selectTab(tab, false);
  }
  function selectTab(tab, push) {
    if (!VALID_TABS.includes(tab)) tab = 'dashboard';
    tabs.forEach(t => {
      const sel = t.dataset.tab === tab;
      t.setAttribute('aria-selected', sel ? 'true' : 'false');
      t.classList.toggle('is-active', sel);
    });
    if (push) {
      const u = new URL(location.href);
      u.searchParams.set('tab', tab); u.searchParams.delete('id');
      history.pushState(null, '', u.pathname + u.search);
    }
    render(tab);
  }
  async function render(tab) {
    panel.innerHTML = '<p class="account-loading">Yükleniyor…</p>';
    if (tab === 'dashboard') await renderDashboard();
    else if (tab === 'orders') await renderOrders();
    else if (tab === 'products') await renderProducts();
    else if (tab === 'categories') await renderCategories();
  }
  function errorBox(t) { return `<div class="account-empty"><p>${esc(t)}</p></div>`; }

  // ============================================================
  // DASHBOARD
  // ============================================================
  async function renderDashboard() {
    const [s, sales] = await Promise.all([
      window.NMAdmin.getStats(),
      window.NMAdmin.getSalesStats(),
    ]);
    const salesOk = sales && !sales.error;
    panel.innerHTML = `
      <h2 class="account-panel-title">Özet</h2>

      <h3 class="admin-section-title">Satışlar <span class="admin-section-note">(teslim edilen siparişler)</span></h3>
      <div class="admin-stats">
        ${salesCard('Bugün', sales)}
        ${salesCard('Bu hafta', sales)}
        ${salesCard('Bu ay', sales)}
        ${statCard('Bu ayki ciro', salesOk ? fmtTL(sales.month.revenue) : '—', 'accent')}
      </div>

      <h3 class="admin-section-title">Siparişler & Stok</h3>
      <div class="admin-stats">
        ${statCard('Toplam sipariş', s.total)}
        ${statCard('Onay bekleyen', s.pending, 'warn')}
        ${statCard('Hazırlanıyor', s.preparing)}
        ${statCard('Kargoda', s.shipped)}
        ${statCard('Toplam ürün', s.productsTotal)}
        ${statCard(`Stok ≤ ${s.lowStockThreshold}`, s.lowStock, s.lowStock ? 'danger' : '')}
      </div>
      <div class="admin-quick">
        <button type="button" class="auth-btn-ghost" data-go="orders">Siparişlere git</button>
        <button type="button" class="auth-btn-ghost" data-go="products">Ürünlere git</button>
      </div>`;
    $$('[data-go]', panel).forEach(b => b.addEventListener('click', () => selectTab(b.dataset.go, true)));
  }
  function statCard(label, val, tone) {
    return `<div class="stat-card ${tone ? 'stat-' + tone : ''}"><span class="stat-val">${esc(val)}</span><span class="stat-label">${esc(label)}</span></div>`;
  }
  // Satış kartı: ana değer = sipariş adedi, alt satır = ciro
  function salesCard(label, sales) {
    const key = label === 'Bugün' ? 'today' : (label === 'Bu hafta' ? 'week' : 'month');
    const ok = sales && !sales.error && sales[key];
    const count = ok ? sales[key].count : 0;
    const revenue = ok ? fmtTL(sales[key].revenue) : '—';
    return `<div class="stat-card">
      <span class="stat-val">${esc(count)}</span>
      <span class="stat-label">${esc(label)} · satış</span>
      <span class="stat-sub">${esc(revenue)}</span>
    </div>`;
  }

  // ============================================================
  // SİPARİŞLER
  // ============================================================
  let orderFilter = 'all';
  async function renderOrders() {
    const p = new URLSearchParams(location.search);
    if (p.get('id')) return renderOrderDetail(p.get('id'));

    const { data, error } = await window.NMAdmin.listOrders(orderFilter);
    if (error) { panel.innerHTML = errorBox('Siparişler yüklenemedi.'); return; }
    const list = data || [];
    const chips = ['all', 'pending', 'preparing', 'shipped', 'delivered', 'cancelled'];
    panel.innerHTML = `
      <h2 class="account-panel-title">Siparişler</h2>
      <div class="admin-chips">
        ${chips.map(c => `<button type="button" class="admin-chip ${c === orderFilter ? 'is-active' : ''}" data-f="${c}">${c === 'all' ? 'Tümü' : esc(ORDER_STATUS[c])}</button>`).join('')}
      </div>
      ${list.length ? `<div class="admin-table-wrap"><table class="admin-table">
        <thead><tr><th>Sipariş</th><th>Tarih</th><th>Müşteri</th><th>Tutar</th><th>Durum</th></tr></thead>
        <tbody>${list.map(orderRow).join('')}</tbody></table></div>`
        : '<div class="account-empty"><p>Sipariş yok.</p></div>'}`;

    $$('.admin-chip', panel).forEach(b => b.addEventListener('click', () => { orderFilter = b.dataset.f; renderOrders(); }));
    $$('.admin-row', panel).forEach(r => r.addEventListener('click', () => openOrderDetail(r.dataset.id)));
  }
  function customerName(o) {
    if (o.shipping_address && o.shipping_address.full_name) return o.shipping_address.full_name;
    return o.guest_email || '—';
  }
  function orderRow(o) {
    return `<tr class="admin-row" data-id="${esc(o.id)}">
      <td class="mono">#${esc(o.order_number)}</td>
      <td>${esc(fmtDate(o.created_at))}</td>
      <td>${esc(customerName(o))}</td>
      <td>${esc(fmtTL(o.total_amount))}</td>
      <td><span class="status-badge ${statusCls(o.status)}">${esc(ORDER_STATUS[o.status] || o.status)}</span>${o.needs_attention ? ' <span class="admin-attn-dot" title="Dikkat gerekiyor">⚠</span>' : ''}</td>
    </tr>`;
  }
  function openOrderDetail(id) {
    const u = new URL(location.href);
    u.searchParams.set('tab', 'orders'); u.searchParams.set('id', id);
    history.pushState(null, '', u.pathname + u.search);
    renderOrderDetail(id);
  }
  async function renderOrderDetail(id) {
    panel.innerHTML = '<p class="account-loading">Yükleniyor…</p>';
    const { order, items, history: hist, error } = await window.NMAdmin.getOrder(id);
    if (error || !order) { panel.innerHTML = errorBox('Sipariş bulunamadı.'); return; }
    const a = order.shipping_address || {};
    const itemsHtml = items.map(it => `<div class="order-item">
      <span class="order-item-name">${esc(it.product_name)}</span>
      <span class="order-item-qty">${esc(it.quantity)} ×</span>
      <span class="order-item-price">${esc(fmtTL(it.product_price))}</span>
      <span class="order-item-sub">${esc(fmtTL(it.subtotal))}</span></div>`).join('');
    const timeline = hist.map(h => `<div class="timeline-item">
      <span class="timeline-dot ${statusCls(h.status)}"></span>
      <span class="timeline-body"><span class="timeline-status">${esc(ORDER_STATUS[h.status] || h.status)}</span>
      <span class="timeline-date">${esc(fmtDate(h.changed_at))}</span></span></div>`).join('') || '<p class="account-hint">Geçmiş yok.</p>';
    const nexts = NEXT_STATUS[order.status] || [];
    const statusOptions = [order.status, ...nexts].map(s => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${esc(ORDER_STATUS[s] || s)}</option>`).join('');
    const canAdvance = nexts.length > 0;
    const attn = order.needs_attention
      ? `<div class="admin-attn">⚠ ${esc(order.attention_note || 'Bu sipariş dikkat gerektiriyor.')}</div>` : '';
    const emailLine = order.payment_status === 'paid'
      ? `<p class="account-hint">Onay e-postası: ${order.email_status === 'sent' ? 'gönderildi ✓' : order.email_status === 'failed' ? '<b>gönderilemedi</b>' : 'beklemede'} · <button type="button" class="admin-mini" id="resendConfirm">Yeniden gönder</button></p>` : '';

    panel.innerHTML = `
      <button type="button" class="order-back" id="orderBack">← Siparişler</button>
      <div class="order-detail-head"><h2 class="account-panel-title">#${esc(order.order_number)}</h2>
        <span class="status-badge ${statusCls(order.status)}">${esc(ORDER_STATUS[order.status] || order.status)}</span></div>
      <p class="account-hint">${esc(fmtDate(order.created_at))} · ${esc(fmtTL(order.total_amount))}</p>
      ${attn}${emailLine}

      <h3 class="order-section-title">Müşteri / Teslimat</h3>
      <p class="admin-addr">${esc(a.full_name || '')}${a.phone ? ' · ' + esc(a.phone) : ''}${order.guest_email ? ' · ' + esc(order.guest_email) : ''}<br>
        ${esc(a.address_line || '')}${a.district ? ', ' + esc(a.district) : ''}${a.city ? '/' + esc(a.city) : ''} ${esc(a.zip_code || '')}</p>

      <h3 class="order-section-title">Ürünler</h3>
      <div class="order-items">${itemsHtml || '<p class="account-hint">—</p>'}</div>

      <h3 class="order-section-title">Durumu güncelle</h3>
      <div class="admin-form-row">
        <select id="ordStatus" class="admin-input" ${canAdvance ? '' : 'disabled'}>${statusOptions}</select>
        <button type="button" class="auth-btn-primary" id="ordStatusSave" ${canAdvance ? '' : 'disabled'}>Kaydet</button>
      </div>
      ${canAdvance ? '' : `<p class="account-hint">${order.status === 'pending' ? 'Ödeme onayı bekleniyor; ileri durumlar ödemeden sonra açılır.' : 'İleri durum yok.'}</p>`}

      <h3 class="order-section-title">Kargo</h3>
      <div class="admin-form-row">
        <input id="ordTrack" class="admin-input" placeholder="Kargo takip kodu" value="${esc(order.tracking_code || '')}" />
        <input id="ordCargo" class="admin-input" placeholder="Kargo firması" value="${esc(order.cargo_company || '')}" />
        <button type="button" class="auth-btn-ghost" id="ordTrackSave">Kaydet</button>
      </div>

      <h3 class="order-section-title">Durum geçmişi</h3>
      <div class="order-timeline">${timeline}</div>

      ${['paid', 'partial_refund'].includes(order.payment_status) ? `
      <h3 class="order-section-title">İade (PayTR)</h3>
      <p class="account-hint">Ödenen: ${esc(fmtTL(order.total_amount))}${Number(order.refunded_amount) > 0 ? ` · İade edilen: ${esc(fmtTL(order.refunded_amount))}` : ''}</p>
      <div class="admin-form-row">
        <input id="refundAmt" class="admin-input" type="number" min="0" step="0.01" placeholder="Tutar (boş = kalan tümü)" />
        <button type="button" class="admin-danger-btn" id="refundBtn">İade Et</button>
      </div>
      <p class="account-hint">Kısmi iade stoğu geri EKLEMEZ — ürün fiziken döndüyse stoğu Ürünler sekmesinden düzelt.</p>` : (Number(order.refunded_amount) > 0 ? `
      <h3 class="order-section-title">İade</h3>
      <p class="account-hint">Bu sipariş iade edildi — toplam ${esc(fmtTL(order.refunded_amount))}.</p>` : '')}

      ${order.status === 'pending' ? `
      <div class="admin-danger-row">
        <button type="button" class="admin-danger-btn" id="ordCancel">Siparişi iptal et</button>
      </div>` : (['paid', 'preparing', 'shipped', 'delivered'].includes(order.status) ? `
      <p class="account-hint">Ödenmiş sipariş iptal edilemez — kapatmak için yukarıdan <b>İade Et</b> kullan.</p>` : '')}

      <div class="admin-danger-row">
        <button type="button" class="admin-danger-btn" id="ordDelete">Siparişi sil</button>
      </div>
      <p class="account-hint">Silme kalıcıdır ve geri alınamaz — sipariş kalemleri ve geçmişi de birlikte silinir.</p>`;

    $('#orderBack').addEventListener('click', () => selectTab('orders', true));
    const refundBtn = $('#refundBtn');
    if (refundBtn) refundBtn.addEventListener('click', async () => {
      const amt = $('#refundAmt').value.trim();
      if (!confirm(amt ? `${amt} TL iade edilsin mi?` : 'Kalan tutarın tamamı iade edilsin mi?')) return;
      refundBtn.disabled = true;
      try {
        const session = await window.NMAuth.getSession();
        const resp = await fetch(window.NM_SUPA.url + '/functions/v1/paytr-refund', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': window.NM_SUPA.anonKey,
            'Authorization': 'Bearer ' + (session ? session.access_token : window.NM_SUPA.anonKey),
          },
          body: JSON.stringify({ merchant_oid: order.paytr_merchant_oid, amount: amt || null }),
        });
        const data = await resp.json();
        if (!resp.ok || !data.ok) throw new Error(data.error || 'İade başarısız');
        toast(data.full ? 'Tam iade yapıldı' : 'Kısmi iade yapıldı');
        renderOrderDetail(id);
      } catch (e) {
        toast('İade hatası: ' + (e.message || ''));
        refundBtn.disabled = false;
      }
    });
    const statusSaveBtn = $('#ordStatusSave');
    if (statusSaveBtn && canAdvance) statusSaveBtn.addEventListener('click', async () => {
      const newStatus = $('#ordStatus').value;
      if (newStatus === order.status) return;
      statusSaveBtn.disabled = true;
      const { error: e } = await window.NMAdmin.updateOrderStatus(id, newStatus);
      if (e) { statusSaveBtn.disabled = false; return toast('Güncellenemedi: ' + (e.message || '')); }
      toast('Durum güncellendi');
      // 'shipped'e geçince müşteriye kargo bildirimi öner
      if (newStatus === 'shipped' && order.paytr_merchant_oid && confirm('Müşteriye kargo bildirimi e-postası gönderilsin mi?')) {
        await sendOrderEmail(order.paytr_merchant_oid, 'shipped');
      }
      renderOrderDetail(id);
    });
    const resendBtn = $('#resendConfirm');
    if (resendBtn) resendBtn.addEventListener('click', async () => {
      resendBtn.disabled = true;
      const ok = await sendOrderEmail(order.paytr_merchant_oid, 'confirmation');
      if (ok) renderOrderDetail(id); else resendBtn.disabled = false;
    });
    $('#ordTrackSave').addEventListener('click', async () => {
      const track = $('#ordTrack').value.trim();
      const { error: e } = await window.NMAdmin.setTracking(id, track, $('#ordCargo').value.trim());
      if (e) return toast('Güncellenemedi');
      toast('Kargo bilgisi kaydedildi');
      // Takip kodu varsa müşteriye kargo bildirimi göndermeyi öner
      if (track && order.paytr_merchant_oid && confirm('Müşteriye kargo bildirimi e-postası gönderilsin mi?')) {
        await sendOrderEmail(order.paytr_merchant_oid, 'shipped');
      }
    });
    const cancelBtn = $('#ordCancel');
    if (cancelBtn) cancelBtn.addEventListener('click', async () => {
      const reason = prompt('İptal nedeni (opsiyonel):');
      if (reason === null) return;
      const { error: e } = await window.NMAdmin.cancelOrder(id, reason);
      if (e) return toast('İptal edilemedi: ' + (e.message || '')); toast('Sipariş iptal edildi'); renderOrderDetail(id);
    });
    const delBtn = $('#ordDelete');
    if (delBtn) delBtn.addEventListener('click', async () => {
      if (!confirm('Bu sipariş kalıcı olarak silinsin mi? Bu işlem geri alınamaz.')) return;
      delBtn.disabled = true;
      const { error: e } = await window.NMAdmin.deleteOrder(id);
      if (e) { delBtn.disabled = false; return toast('Silinemedi: ' + (e.message || '')); }
      toast('Sipariş silindi');
      selectTab('orders', true);
    });
  }

  // ============================================================
  // ÜRÜNLER
  // ============================================================
  let categoriesCache = [];
  let productsCache = [];   // tüm ürünler (arama client-side filtreler)
  let prodSearch = '';      // ürün arama sorgusu
  function primaryImg(p) {
    const imgs = p.product_images || [];
    const pick = imgs.find(i => i.is_primary) || imgs[0];
    return pick ? window.NMAdmin.publicUrl(pick.storage_path) : null;
  }
  async function renderProducts() {
    const [{ data: prods, error }, { data: cats }] = await Promise.all([
      window.NMAdmin.listProducts(), window.NMAdmin.listCategories(),
    ]);
    categoriesCache = cats || [];
    if (error) { panel.innerHTML = errorBox('Ürünler yüklenemedi.'); return; }
    const list = prods || [];
    const indirimli = list.filter(p => p.discount_price != null).length;
    panel.innerHTML = `
      <div class="account-panel-head"><h2 class="account-panel-title">Ürünler</h2>
        <button type="button" class="account-add-btn" id="addProdBtn">+ Yeni ürün</button></div>

      <div class="disc-bar">
        <div class="disc-bar-head">
          <strong>İndirim Uygula</strong>
          <span class="account-hint" id="discScope">Hiç ürün seçili değil → <b>tüm aktif ürünlere</b> uygulanır</span>
        </div>
        <div class="disc-bar-row">
          <select id="discMode" class="admin-input">
            <option value="percent">Yüzde (%)</option>
            <option value="amount">Tutar (TL)</option>
          </select>
          <input id="discValue" class="admin-input" type="number" min="1" step="0.01" placeholder="örn. 10" />
          <button type="button" class="auth-btn-primary" id="discApply">Uygula</button>
          <button type="button" class="admin-danger-btn" id="discClear">İndirimi Kaldır</button>
        </div>
        <p class="account-hint">Şu an <b>${esc(indirimli)}</b> üründe indirim var. Ürün seçersen sadece onlara, seçmezsen tüm aktif ürünlere uygulanır.</p>
      </div>

      <div class="prod-search-row">
        <input type="search" id="prodSearch" class="admin-input" autocomplete="off"
               placeholder="Ürün ara — ad, kategori veya slug…" value="${esc(prodSearch)}" />
        <span class="account-hint" id="prodCount"></span>
      </div>

      <div id="prodFormHost"></div>
      ${list.length ? `<div class="admin-table-wrap"><table class="admin-table">
        <thead><tr>
          <th><input type="checkbox" id="discAll" aria-label="Tümünü seç" /></th>
          <th></th><th>Ad</th><th>Kategori</th><th>Fiyat</th><th>Stok</th><th>Durum</th><th></th>
        </tr></thead>
        <tbody id="prodTbody"></tbody></table></div>`
        : '<div class="account-empty"><p>Ürün yok.</p></div>'}`;
    productsCache = list;
    $('#addProdBtn').addEventListener('click', () => openProductForm(null));
    const search = $('#prodSearch');
    if (search) {
      search.addEventListener('input', () => { prodSearch = search.value; renderProductRows(); });
    }
    renderProductRows();
    wireDiscountBar();
  }

  // Arama sonucuna göre tablo satırlarını çiz (yeniden sorgu atmadan, anında)
  function renderProductRows() {
    const tbody = $('#prodTbody');
    if (!tbody) return;
    const q = prodSearch.trim().toLocaleLowerCase('tr');
    const shown = q
      ? productsCache.filter(p =>
          (p.name || '').toLocaleLowerCase('tr').includes(q) ||
          (p.categories?.name || '').toLocaleLowerCase('tr').includes(q) ||
          (p.slug || '').toLowerCase().includes(q))
      : productsCache;

    tbody.innerHTML = shown.length
      ? shown.map(productRow).join('')
      : '<tr><td colspan="8"><p class="account-hint" style="padding:14px 0;">Eşleşen ürün yok.</p></td></tr>';

    const cnt = $('#prodCount');
    if (cnt) cnt.textContent = q
      ? `${shown.length} / ${productsCache.length} ürün`
      : `${productsCache.length} ürün`;

    // satırlar yeniden çizildi → olayları yeniden bağla
    $$('.prod-edit', tbody).forEach(b => b.addEventListener('click', () => {
      openProductForm(productsCache.find(x => x.id === b.dataset.id));
    }));
    $$('.disc-pick', tbody).forEach(c => c.addEventListener('change', updateDiscScope));
    const all = $('#discAll');
    if (all) all.checked = false;
    updateDiscScope();
  }
  function productRow(p) {
    const img = primaryImg(p);
    const low = p.stock <= 5;
    const dp = p.discount_price != null ? Number(p.discount_price) : null;
    const on = dp != null && dp > 0 && dp < Number(p.price);
    const pct = on ? Math.round((1 - dp / Number(p.price)) * 100) : 0;
    const fiyat = on
      ? `<span class="disc-old">${esc(fmtTL(p.price))}</span>
         <strong class="disc-new">${esc(fmtTL(dp))}</strong>
         <span class="disc-tag">-%${esc(pct)}</span>`
      : esc(fmtTL(p.price));
    return `<tr>
      <td><input type="checkbox" class="disc-pick" value="${esc(p.id)}" aria-label="Seç" /></td>
      <td>${img ? `<img class="admin-thumb" src="${esc(img)}" alt="" />` : '<span class="admin-thumb admin-thumb-ph">♪</span>'}</td>
      <td>${esc(p.name)}</td>
      <td>${esc(p.categories?.name || '—')}</td>
      <td>${fiyat}</td>
      <td class="${low ? 'stock-low' : ''}">${esc(p.stock)}</td>
      <td>${p.is_active ? '<span class="status-badge s-delivered">Aktif</span>' : '<span class="status-badge s-cancelled">Pasif</span>'}</td>
      <td><button type="button" class="admin-mini prod-edit" data-id="${esc(p.id)}">Düzenle</button></td>
    </tr>`;
  }

  // ---- indirim çubuğu ----
  function selectedProductIds() {
    return $$('.disc-pick:checked', panel).map(c => c.value);
  }
  function updateDiscScope() {
    const n = selectedProductIds().length;
    const el = $('#discScope');
    if (!el) return;
    el.innerHTML = n
      ? `<b>${n} ürün</b> seçili → sadece onlara uygulanır`
      : 'Hiç ürün seçili değil → <b>tüm aktif ürünlere</b> uygulanır';
  }
  function wireDiscountBar() {
    const all = $('#discAll');
    if (all) all.addEventListener('change', () => {
      $$('.disc-pick', panel).forEach(c => { c.checked = all.checked; });
      updateDiscScope();
    });
    $$('.disc-pick', panel).forEach(c => c.addEventListener('change', updateDiscScope));

    const apply = $('#discApply');
    if (apply) apply.addEventListener('click', async () => {
      const mode = $('#discMode').value;
      const val = parseFloat($('#discValue').value);
      const ids = selectedProductIds();
      if (!(val > 0)) { toast('Geçerli bir değer gir'); return; }
      if (mode === 'percent' && val >= 100) { toast('Yüzde 1-99 arasında olmalı'); return; }
      const kapsam = ids.length ? `${ids.length} seçili ürüne` : 'TÜM aktif ürünlere';
      const ne = mode === 'percent' ? `%${val} indirim` : `${val} TL indirim`;
      if (!confirm(`${kapsam} ${ne} uygulansın mı?`)) return;

      apply.disabled = true;
      const res = mode === 'percent'
        ? await window.NMAdmin.applyDiscountPercent(val, ids)
        : await window.NMAdmin.applyDiscountAmount(val, ids);
      apply.disabled = false;
      if (res.error) { toast('Uygulanamadı: ' + (res.error.message || '')); return; }
      toast(`${res.data} üründe indirim uygulandı`);
      renderProducts();
    });

    const clear = $('#discClear');
    if (clear) clear.addEventListener('click', async () => {
      const ids = selectedProductIds();
      const kapsam = ids.length ? `${ids.length} seçili üründeki` : 'TÜM ürünlerdeki';
      if (!confirm(`${kapsam} indirimler kaldırılsın mı?`)) return;
      clear.disabled = true;
      const res = await window.NMAdmin.clearDiscount(ids);
      clear.disabled = false;
      if (res.error) { toast('Kaldırılamadı: ' + (res.error.message || '')); return; }
      toast(`${res.data} üründen indirim kaldırıldı`);
      renderProducts();
    });
  }
  function openProductForm(p) {
    const host = $('#prodFormHost');
    const editing = !!p;
    const a = p || {};
    // Ürün yalnız yaprak (alt kategorisi olmayan) kategoriye atanır; mevcut seçim her zaman listede
    const byId = new Map(categoriesCache.map(x => [x.id, x]));
    const pathLabel = (c) => { const parts = []; let cur = c; while (cur) { parts.unshift(cur.name); cur = cur.parent_id ? byId.get(cur.parent_id) : null; } return parts.join(' › '); };
    const isLeafCat = (c) => !categoriesCache.some(x => x.parent_id === c.id);
    const catOpts = categoriesCache
      .filter(c => isLeafCat(c) || c.id === a.category_id)
      .map(c => `<option value="${esc(c.id)}" ${a.category_id === c.id ? 'selected' : ''}>${esc(pathLabel(c))}</option>`).join('');
    host.innerHTML = `
      <form class="account-form admin-form" id="prodForm">
        <h3 class="address-form-title">${editing ? 'Ürünü düzenle' : 'Yeni ürün'}</h3>
        <div class="account-field-row">
          <div class="account-field"><label>Ad</label><input name="name" type="text" value="${esc(a.name || '')}" required /></div>
          <div class="account-field"><label>Slug</label><input name="slug" type="text" value="${esc(a.slug || '')}" placeholder="otomatik" /></div>
        </div>
        <div class="account-field-row">
          <div class="account-field"><label>Kategori</label><select name="category_id" required><option value="">Seç…</option>${catOpts}</select></div>
          <div class="account-field"><label>Fiyat (TL)</label><input name="price" type="number" min="0" step="0.01" value="${esc(a.price ?? '')}" required /></div>
          <div class="account-field"><label>İndirimli fiyat</label><input name="discount_price" type="number" min="0" step="0.01" value="${esc(a.discount_price ?? '')}" placeholder="boş = indirim yok" /></div>
          <div class="account-field"><label>Stok</label><input name="stock" type="number" min="0" step="1" value="${esc(a.stock ?? 0)}" required /></div>
        </div>
        <div class="account-field"><label>Açıklama</label><textarea name="description" rows="2">${esc(a.description || '')}</textarea></div>
        <label class="auth-check"><input type="checkbox" name="is_active" ${a.is_active !== false ? 'checked' : ''} /><span>Aktif (sitede görünür)</span></label>
        <p class="account-form-msg" hidden></p>
        <div class="address-form-actions">
          <button type="submit" class="auth-btn-primary">${editing ? 'Kaydet' : 'Oluştur'}</button>
          ${editing ? '<button type="button" class="admin-danger-btn" id="prodDelete">Sil</button>' : ''}
          <button type="button" class="auth-btn-ghost" id="prodCancel">Vazgeç</button>
        </div>
        ${editing ? '<div class="admin-images" id="prodImages"></div><div class="admin-images" id="recHost"></div>' : '<p class="account-hint">Görsel ve önerilen ürün eklemek için önce ürünü oluştur.</p>'}
      </form>`;
    host.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const nameInput = host.querySelector('[name=name]');
    const slugInput = host.querySelector('[name=slug]');
    nameInput.addEventListener('input', () => { if (!editing && !slugInput.dataset.touched) slugInput.value = slugify(nameInput.value); });
    slugInput.addEventListener('input', () => { slugInput.dataset.touched = '1'; });

    $('#prodCancel').addEventListener('click', () => { host.innerHTML = ''; });
    $('#prodForm').addEventListener('submit', (e) => onProductSubmit(e, editing ? a.id : null));
    if (editing) {
      const del = $('#prodDelete');
      if (del) del.addEventListener('click', () => onProductDelete(a.id));
      renderProductImages(a.id);
      renderProductRecs(a.id);
    }
  }
  async function renderProductRecs(productId) {
    const host = $('#recHost'); if (!host) return;
    const [{ data: all }, { data: current }] = await Promise.all([
      window.NMAdmin.listProducts(),
      window.NMAdmin.getRecommendations(productId),
    ]);
    const sel = new Set(current || []);
    const others = (all || []).filter(p => p.id !== productId);
    host.innerHTML = `
      <h4 class="admin-img-title">Önerilen (benzer) ürünler</h4>
      <p class="account-hint" style="margin-bottom:8px;">Seçilmezse aynı kategoriden otomatik gösterilir.</p>
      <input type="text" class="admin-input" id="recFilter" placeholder="Ürün ara…" style="width:100%;margin-bottom:10px;" />
      <div class="rec-check-list" id="recList">
        ${others.map(p => `<label class="rec-check" data-name="${esc((p.name || '').toLowerCase())}">
          <input type="checkbox" value="${esc(p.id)}" ${sel.has(p.id) ? 'checked' : ''} />
          <span>${esc(p.name)}${p.categories ? ` <em>· ${esc(p.categories.name)}</em>` : ''}</span>
        </label>`).join('') || '<p class="account-hint">Başka ürün yok.</p>'}
      </div>
      <button type="button" class="auth-btn-ghost" id="recSave" style="margin-top:12px;">Önerileri kaydet</button>`;
    $('#recFilter').addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      $$('.rec-check', host).forEach(l => { l.style.display = l.dataset.name.includes(q) ? '' : 'none'; });
    });
    $('#recSave').addEventListener('click', async () => {
      const ids = $$('#recList input:checked', host).map(c => c.value);
      const { error } = await window.NMAdmin.setRecommendations(productId, ids);
      if (error) { toast('Kaydedilemedi'); return; }
      toast('Öneriler kaydedildi');
    });
  }
  async function onProductSubmit(e, id) {
    e.preventDefault();
    const f = e.target, msg = $('.account-form-msg', f);
    const dpRaw = f.discount_price ? f.discount_price.value.trim() : '';
    const payload = {
      name: f.name.value.trim(),
      slug: (f.slug.value.trim() || slugify(f.name.value)),
      category_id: f.category_id.value || null,
      price: parseFloat(f.price.value),
      discount_price: dpRaw === '' ? null : parseFloat(dpRaw),
      stock: parseInt(f.stock.value, 10) || 0,
      description: f.description.value.trim(),
      is_active: f.is_active.checked,
    };
    if (!payload.name || !payload.category_id || isNaN(payload.price)) { showMsg(msg, 'Ad, kategori ve fiyat zorunlu.', false); return; }
    if (payload.discount_price != null && !(payload.discount_price > 0 && payload.discount_price < payload.price)) {
      showMsg(msg, 'İndirimli fiyat 0\'dan büyük ve normal fiyattan küçük olmalı.', false); return;
    }
    const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    const res = id ? await window.NMAdmin.updateProduct(id, payload) : await window.NMAdmin.createProduct(payload);
    btn.disabled = false;
    if (res.error) { showMsg(msg, res.error.message?.includes('duplicate') ? 'Bu slug zaten var.' : 'Kaydedilemedi: ' + (res.error.message || ''), false); return; }
    toast(id ? 'Ürün güncellendi' : 'Ürün oluşturuldu');
    if (!id && res.data) { openProductForm(res.data); } // edit moduna geç → görsel eklenebilir
    else { $('#prodFormHost').innerHTML = ''; renderProducts(); }
  }
  async function onProductDelete(id) {
    if (!confirm('Ürünü kalıcı silmek istediğine emin misin?')) return;
    const { error } = await window.NMAdmin.deleteProduct(id);
    if (!error) {
      toast('Ürün silindi'); $('#prodFormHost').innerHTML = ''; renderProducts();
      return;
    }
    // Beklenmedik hata → gerçek mesajı göster + pasife alma seçeneği sun
    const ok = confirm('Ürün silinemedi: ' + (error.message || 'bilinmeyen hata') +
      '\n\nBunun yerine pasife almak ister misin? (Sitede görünmez)');
    if (!ok) return;
    const { error: e2 } = await window.NMAdmin.toggleActive(id, false);
    if (e2) { toast('Pasife alınamadı: ' + (e2.message || '')); return; }
    toast('Ürün pasife alındı'); $('#prodFormHost').innerHTML = ''; renderProducts();
  }
  async function renderProductImages(productId) {
    const host = $('#prodImages'); if (!host) return;
    const { data } = await window.NMAdmin.listProductImages(productId);
    const imgs = data || [];
    const last = imgs.length - 1;
    host.innerHTML = `
      <h4 class="admin-img-title">Görseller
        <span class="account-hint">— oklarla sırala, <b>ilk görsel kapak</b> olur</span></h4>
      <div class="admin-img-grid">
        ${imgs.map((i, idx) => `<div class="admin-img-cell ${idx === 0 ? 'is-primary' : ''}" data-id="${esc(i.id)}">
          <img src="${esc(i.url)}" alt="" />
          ${idx === 0 ? '<span class="admin-img-badge">Kapak</span>' : ''}
          <div class="admin-img-ops">
            <button type="button" class="img-move" data-idx="${idx}" data-dir="-1" ${idx === 0 ? 'disabled' : ''} aria-label="Öne al" title="Öne al">‹</button>
            <span class="img-pos">${idx + 1}</span>
            <button type="button" class="img-move" data-idx="${idx}" data-dir="1" ${idx === last ? 'disabled' : ''} aria-label="Geri al" title="Geri al">›</button>
          </div>
          <button type="button" class="admin-img-del" data-id="${esc(i.id)}" data-path="${esc(i.storage_path)}" aria-label="Sil">×</button>
        </div>`).join('')}
      </div>
      <label class="admin-upload">
        <input type="file" accept="image/*" id="prodImgInput" multiple hidden />
        <span>+ Görsel yükle <b>(birden fazla seçebilirsin)</b></span>
      </label>
      <p class="account-hint" id="imgUploadMsg" hidden></p>`;

    // ---- çoklu görsel yükleme (sırayla, ilerleme göstererek) ----
    $('#prodImgInput').addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const msg = $('#imgUploadMsg');
      msg.hidden = false;
      let ok = 0, fail = 0;
      for (let i = 0; i < files.length; i++) {
        msg.textContent = `Yükleniyor… ${i + 1}/${files.length}`;
        const { error } = await window.NMAdmin.uploadProductImage(productId, files[i]);
        if (error) { fail++; console.error('[admin] görsel', files[i].name, error); }
        else ok++;
      }
      toast(fail ? `${ok} yüklendi, ${fail} başarısız` : `${ok} görsel yüklendi`);
      renderProductImages(productId);
    });

    // ---- sıra değiştir (komşuyla yer değiştir) ----
    $$('.img-move', host).forEach(b => b.addEventListener('click', async () => {
      const idx = parseInt(b.dataset.idx, 10);
      const target = idx + parseInt(b.dataset.dir, 10);
      if (target < 0 || target > last) return;
      const ids = imgs.map(i => i.id);
      [ids[idx], ids[target]] = [ids[target], ids[idx]];
      $$('.img-move', host).forEach(x => { x.disabled = true; });
      const { error } = await window.NMAdmin.setImagesOrder(productId, ids);
      if (error) { toast('Sıra kaydedilemedi'); renderProductImages(productId); return; }
      renderProductImages(productId);
    }));

    $$('.admin-img-del', host).forEach(b => b.addEventListener('click', async () => {
      if (!confirm('Görseli sil?')) return;
      const { error } = await window.NMAdmin.deleteProductImage(b.dataset.id, b.dataset.path);
      if (error) { toast('Silinemedi'); return; }
      toast('Görsel silindi'); renderProductImages(productId);
    }));
  }

  // ============================================================
  // KATEGORİLER (iç içe / ağaç)
  // ============================================================
  let catList = [];
  const catChildren = (id) => catList.filter(c => (c.parent_id || null) === (id || null));
  const catHasChildren = (id) => catList.some(c => c.parent_id === id);
  const catById = (id) => catList.find(c => c.id === id);
  function catDescendants(id, acc = new Set()) {
    catList.filter(c => c.parent_id === id).forEach(c => { acc.add(c.id); catDescendants(c.id, acc); });
    return acc;
  }
  function catPathLabel(c) {
    const parts = []; let cur = c;
    while (cur) { parts.unshift(cur.name); cur = cur.parent_id ? catById(cur.parent_id) : null; }
    return parts.join(' › ');
  }
  function flattenCats(parentId = null, depth = 0, out = []) {
    catChildren(parentId).forEach(c => { out.push({ c, depth }); flattenCats(c.id, depth + 1, out); });
    return out;
  }

  async function renderCategories() {
    const { data, error } = await window.NMAdmin.listCategories();
    if (error) { panel.innerHTML = errorBox('Kategoriler yüklenemedi.'); return; }
    catList = data || [];
    const rows = flattenCats();
    panel.innerHTML = `
      <div class="account-panel-head"><h2 class="account-panel-title">Kategoriler</h2>
        <button type="button" class="account-add-btn" id="addCatBtn">+ Yeni kategori</button></div>
      <p class="account-hint">İç içe kategori için "Üst kategori" seç. Ürünler yalnız alt kategorisi olmayan (yaprak) kategorilere atanır.</p>
      <div id="catFormHost"></div>
      ${rows.length ? `<div class="admin-table-wrap"><table class="admin-table">
        <thead><tr><th>Kategori</th><th>Slug</th><th>Tür</th><th></th></tr></thead>
        <tbody>${rows.map(({ c, depth }) => `<tr>
          <td><span style="display:inline-block;width:${depth * 18}px"></span>${depth ? '<span class="cat-tree-mark">└ </span>' : ''}${c.image_path ? `<img src="${esc(c.image_path)}" alt="" class="cat-thumb-sm" />` : ''}${esc(c.name)}</td>
          <td class="mono">${esc(c.slug)}</td>
          <td>${catHasChildren(c.id) ? '<span class="status-badge s-shipped">Üst</span>' : '<span class="status-badge s-delivered">Yaprak</span>'}</td>
          <td><button type="button" class="admin-mini cat-sub" data-id="${esc(c.id)}">+ Alt</button>
              <button type="button" class="admin-mini cat-edit" data-id="${esc(c.id)}">Düzenle</button>
              <button type="button" class="admin-mini cat-del" data-id="${esc(c.id)}">Sil</button></td>
        </tr>`).join('')}</tbody></table></div>`
        : '<div class="account-empty"><p>Kategori yok.</p></div>'}`;
    $('#addCatBtn').addEventListener('click', () => openCatForm(null, null));
    $$('.cat-sub', panel).forEach(b => b.addEventListener('click', () => openCatForm(null, b.dataset.id)));
    $$('.cat-edit', panel).forEach(b => b.addEventListener('click', () => openCatForm(catById(b.dataset.id), null)));
    $$('.cat-del', panel).forEach(b => b.addEventListener('click', () => onCatDelete(b.dataset.id)));
  }
  function openCatForm(c, presetParentId) {
    const host = $('#catFormHost'); const editing = !!c; const a = c || {};
    // üst kategori seçenekleri: kendisi + alt soyu hariç (döngü önleme)
    const exclude = editing ? new Set([a.id, ...catDescendants(a.id)]) : new Set();
    const selectedParent = editing ? (a.parent_id || '') : (presetParentId || '');
    const parentOpts = catList.filter(x => !exclude.has(x.id))
      .map(x => `<option value="${esc(x.id)}" ${x.id === selectedParent ? 'selected' : ''}>${esc(catPathLabel(x))}</option>`).join('');
    host.innerHTML = `
      <form class="account-form admin-form" id="catForm">
        <h3 class="address-form-title">${editing ? 'Kategoriyi düzenle' : 'Yeni kategori'}</h3>
        <div class="account-field"><label>Üst kategori</label>
          <select name="parent_id" class="admin-input"><option value="">— Üst seviye —</option>${parentOpts}</select></div>
        <div class="account-field-row">
          <div class="account-field"><label>Ad</label><input name="name" type="text" value="${esc(a.name || '')}" required /></div>
          <div class="account-field"><label>Slug</label><input name="slug" type="text" value="${esc(a.slug || '')}" placeholder="otomatik" /></div>
          <div class="account-field"><label>Sıra</label><input name="display_order" type="number" value="${esc(a.display_order ?? 0)}" /></div>
        </div>
        <p class="account-form-msg" hidden></p>
        <div class="address-form-actions">
          <button type="submit" class="auth-btn-primary">${editing ? 'Kaydet' : 'Oluştur'}</button>
          <button type="button" class="auth-btn-ghost" id="catCancel">Vazgeç</button>
        </div>
        ${editing ? '<div class="admin-images" id="catImageHost"></div>' : '<p class="account-hint">Görsel eklemek için önce kategoriyi kaydet.</p>'}
      </form>`;
    host.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const nameI = host.querySelector('[name=name]'); const slugI = host.querySelector('[name=slug]');
    nameI.addEventListener('input', () => { if (!editing && !slugI.dataset.touched) slugI.value = slugify(nameI.value); });
    slugI.addEventListener('input', () => { slugI.dataset.touched = '1'; });
    $('#catCancel').addEventListener('click', () => { host.innerHTML = ''; });
    $('#catForm').addEventListener('submit', (e) => onCatSubmit(e, editing ? a.id : null));
    if (editing) renderCatImage(a.id, a.image_path);
  }
  function renderCatImage(id, url) {
    const host = $('#catImageHost'); if (!host) return;
    host.innerHTML = `
      <h4 class="admin-img-title">Kategori görseli</h4>
      ${url ? `<div class="admin-img-grid"><div class="admin-img-cell">
        <img src="${esc(url)}" alt="" />
        <button type="button" class="admin-img-del" id="catImgDel" aria-label="Görseli kaldır">×</button>
      </div></div>` : ''}
      <label class="admin-upload"><input type="file" accept="image/*" id="catImgInput" hidden />
        <span>${url ? 'Görseli değiştir' : '+ Görsel yükle'}</span></label>`;
    $('#catImgInput').addEventListener('change', async (e) => {
      const file = e.target.files[0]; if (!file) return;
      toast('Yükleniyor…');
      const { data, error } = await window.NMAdmin.uploadCategoryImage(id, file);
      if (error) { toast('Yüklenemedi: ' + (error.message || '')); return; }
      toast('Görsel yüklendi'); renderCatImage(id, data.url);
    });
    const del = $('#catImgDel');
    if (del) del.addEventListener('click', async () => {
      if (!confirm('Kategori görselini kaldır?')) return;
      const { error } = await window.NMAdmin.clearCategoryImage(id);
      if (error) { toast('Kaldırılamadı'); return; }
      toast('Görsel kaldırıldı'); renderCatImage(id, null);
    });
  }
  async function onCatSubmit(e, id) {
    e.preventDefault();
    const f = e.target, msg = $('.account-form-msg', f);
    const payload = {
      parent_id: f.parent_id.value || null,
      name: f.name.value.trim(),
      slug: (f.slug.value.trim() || slugify(f.name.value)),
      display_order: parseInt(f.display_order.value, 10) || 0,
    };
    if (!payload.name) { showMsg(msg, 'Ad zorunlu.', false); return; }
    const res = id ? await window.NMAdmin.updateCategory(id, payload) : await window.NMAdmin.createCategory(payload);
    if (res.error) { showMsg(msg, res.error.message?.includes('duplicate') ? 'Bu slug zaten var.' : 'Kaydedilemedi.', false); return; }
    toast(id ? 'Kategori güncellendi' : 'Kategori oluşturuldu');
    if (!id && res.data) {
      // yeni kategori → düzenleme moduna geç ki görsel eklenebilsin
      await renderCategories();
      openCatForm(catById(res.data.id) || res.data, null);
    } else {
      $('#catFormHost').innerHTML = ''; renderCategories();
    }
  }
  async function onCatDelete(id) {
    if (!confirm('Kategoriyi sil?')) return;
    const { error } = await window.NMAdmin.deleteCategory(id);
    if (error) { toast(error.message || 'Silinemedi'); return; }
    toast('Kategori silindi'); renderCategories();
  }

  // ---- ortak ----
  function showMsg(el, text, ok) {
    if (!el) return;
    el.textContent = text; el.hidden = false;
    el.classList.toggle('is-ok', !!ok); el.classList.toggle('is-err', !ok);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
