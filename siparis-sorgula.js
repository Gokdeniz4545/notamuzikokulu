// siparis-sorgula — misafir sipariş sorgulama (sipariş no + e-posta → lookup_guest_order RPC)
(function () {
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (m) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const fmtTL = (n) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2 }).format(Number(n)) + ' TL';
  const fmtDate = (s) => { try { return new Date(s).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }); } catch (_) { return s; } };
  const STATUS = {
    pending: 'Onay bekliyor', paid: 'Ödendi', preparing: 'Hazırlanıyor', shipped: 'Kargoda',
    delivered: 'Teslim edildi', cancelled: 'İptal edildi', refunded: 'İade edildi', expired: 'Süresi doldu',
  };
  const clsOf = (s) => (['cancelled', 'refunded', 'expired'].includes(s) ? 's-cancelled' : 's-' + s);

  const form = document.getElementById('lookupForm');
  const result = document.getElementById('lookupResult');
  const msg = document.getElementById('lookupMsg');
  if (!form) return;

  // Sipariş no ön-doldurma (order-success'ten ?oid= ile gelinirse)
  const oid = new URLSearchParams(location.search).get('oid');
  if (oid && form.order_number) {
    const m = String(oid).match(/^NM(\d{4})(\d+)$/);
    form.order_number.value = m ? `NM-${m[1]}-${m[2]}` : oid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = ''; result.innerHTML = '';
    const orderNo = form.order_number.value.trim();
    const email = form.email.value.trim();
    if (!orderNo || !email) { msg.textContent = 'Sipariş numarası ve e-posta gerekli.'; return; }
    if (!window.sb) { msg.textContent = 'Bağlantı hazır değil, sayfayı yenile.'; return; }

    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.dataset.l = btn.dataset.l || btn.textContent; btn.textContent = 'Sorgulanıyor…';
    let data = null, error = null;
    try {
      const r = await window.sb.rpc('lookup_guest_order', { p_order_number: orderNo, p_email: email });
      data = r.data; error = r.error;
    } catch (err) { error = err; }
    btn.disabled = false; btn.textContent = btn.dataset.l;

    if (error) { msg.textContent = 'Bir hata oluştu, lütfen tekrar dene.'; return; }
    if (!data) { msg.textContent = 'Bu bilgilere sahip bir sipariş bulunamadı. Sipariş numaranı ve e-postanı kontrol et.'; return; }
    renderOrder(data);
  });

  function renderOrder(o) {
    const items = (o.items || []).map((it) => `<div class="order-item">
      <span class="order-item-name">${esc(it.product_name)}</span>
      <span class="order-item-qty">${esc(it.quantity)} ×</span>
      <span class="order-item-sub">${esc(fmtTL(it.subtotal))}</span></div>`).join('');
    const track = o.tracking_code
      ? `<p class="account-hint"><strong>Kargo:</strong> ${esc(o.cargo_company || '')} — ${esc(o.tracking_code)}</p>` : '';
    result.innerHTML = `
      <div class="order-detail-head" style="margin-top:8px">
        <h2 class="account-panel-title">#${esc(o.order_number)}</h2>
        <span class="status-badge ${clsOf(o.status)}">${esc(STATUS[o.status] || o.status)}</span>
      </div>
      <p class="account-hint">${esc(fmtDate(o.created_at))} · ${esc(fmtTL(o.total_amount))}${Number(o.refunded_amount) > 0 ? ' · İade: ' + esc(fmtTL(o.refunded_amount)) : ''}</p>
      <div class="order-items">${items}</div>
      ${track}`;
  }
})();
