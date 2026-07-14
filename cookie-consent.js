// ============================================================
// cookie-consent.js — KVKK uyumlu çerez onay bandı
// Gereklilikler: açık rıza (zorunlu olmayan çerezler için), kategori bazlı,
// reddetmek kabul etmek kadar kolay, sonradan değiştirilebilir, kayıt tutulur.
// Tercih: localStorage 'nm:cookie-consent:v1'
// Diğer scriptler window.NMConsent.get() ile tercihi okuyabilir.
// ============================================================
(function () {
  'use strict';

  const KEY = 'nm:cookie-consent:v1';
  const POLICY = 'cerez-politikasi.html';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); }
    catch { return null; }
  }
  function save(prefs) {
    const rec = {
      necessary: true,                    // zorunlu çerezler kapatılamaz
      analytics: !!prefs.analytics,
      marketing: !!prefs.marketing,
      ts: new Date().toISOString(),
      v: 1,
    };
    try { localStorage.setItem(KEY, JSON.stringify(rec)); } catch { /* private mode */ }
    document.dispatchEvent(new CustomEvent('nm:consent', { detail: rec }));
    return rec;
  }

  // ---- banner / ayar paneli ----
  let el = null;

  function close() {
    if (!el) return;
    el.classList.remove('is-open');
    setTimeout(() => { if (el) { el.remove(); el = null; } }, 260);
  }

  function render(showSettings) {
    if (el) el.remove();
    const cur = read() || { analytics: false, marketing: false };

    el = document.createElement('div');
    el.className = 'cc-bar';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', 'Çerez tercihleri');
    el.innerHTML = `
      <div class="cc-card">
        <div class="cc-main">
          <p class="cc-title">Çerez Tercihleri</p>
          <p class="cc-text">
            Sitemizin çalışması için zorunlu çerezleri kullanıyoruz. İzninizle, siteyi
            geliştirmek için analitik ve pazarlama çerezleri de kullanabiliriz.
            Ayrıntılar için <a href="${POLICY}">Çerez Politikası</a>.
          </p>

          <div class="cc-opts" ${showSettings ? '' : 'hidden'}>
            <label class="cc-opt is-locked">
              <input type="checkbox" checked disabled />
              <span><b>Zorunlu çerezler</b> — oturum, sepet ve güvenlik. Kapatılamaz.</span>
            </label>
            <label class="cc-opt">
              <input type="checkbox" id="ccAnalytics" ${cur.analytics ? 'checked' : ''} />
              <span><b>Analitik çerezler</b> — sayfa kullanımını anonim ölçmek için.</span>
            </label>
            <label class="cc-opt">
              <input type="checkbox" id="ccMarketing" ${cur.marketing ? 'checked' : ''} />
              <span><b>Pazarlama çerezleri</b> — ilgi alanına göre içerik/reklam.</span>
            </label>
          </div>
        </div>

        <div class="cc-actions">
          ${showSettings
            ? `<button type="button" class="cc-btn cc-primary" id="ccSaveSel">Seçimi Kaydet</button>`
            : `<button type="button" class="cc-btn cc-ghost" id="ccSettings">Ayarlar</button>`}
          <button type="button" class="cc-btn cc-ghost" id="ccReject">Sadece Zorunlu</button>
          <button type="button" class="cc-btn cc-primary" id="ccAccept">Tümünü Kabul Et</button>
        </div>
      </div>`;

    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-open'));

    const $ = (s) => el.querySelector(s);
    const acc = $('#ccAccept'); if (acc) acc.addEventListener('click', () => { save({ analytics: true, marketing: true }); close(); });
    const rej = $('#ccReject'); if (rej) rej.addEventListener('click', () => { save({ analytics: false, marketing: false }); close(); });
    const set = $('#ccSettings'); if (set) set.addEventListener('click', () => render(true));
    const sav = $('#ccSaveSel');
    if (sav) sav.addEventListener('click', () => {
      save({ analytics: $('#ccAnalytics').checked, marketing: $('#ccMarketing').checked });
      close();
    });
  }

  // Footer'daki "Çerez Ayarları" bağlantısı → paneli tekrar aç (rızayı geri çekebilme)
  function wireReopen() {
    document.querySelectorAll('[data-cookie-settings]').forEach((a) => {
      a.addEventListener('click', (e) => { e.preventDefault(); render(true); });
    });
  }

  function init() {
    wireReopen();
    if (!read()) render(false);   // henüz tercih yoksa bandı göster
  }

  window.NMConsent = {
    get: () => read() || { necessary: true, analytics: false, marketing: false },
    open: () => render(true),
    allowsAnalytics: () => !!(read() || {}).analytics,
    allowsMarketing: () => !!(read() || {}).marketing,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
