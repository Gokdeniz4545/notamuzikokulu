// ============================================================
// auth-modal — open / close / tab / form handlers
// İhtiyaç duyduğu global'ler: window.NMAuth (supabase-client.js)
// ============================================================
(function () {
  let modal, card, tabBtns, stateNodes, errorNode, infoNode;
  let booted = false;
  let lastEmail = '';

  // index.html / account.html ile birebir aynı markup — sayfada yoksa enjekte edilir
  const MODAL_HTML = `
<div class="auth-modal" id="authModal" hidden role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
  <div class="auth-modal-card" role="document">
    <button type="button" class="auth-close" aria-label="Kapat">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
    <div class="auth-tabs" role="tablist" aria-label="Hesap">
      <button type="button" class="auth-tab" role="tab" data-tab="login" aria-selected="true">Giriş Yap</button>
      <button type="button" class="auth-tab" role="tab" data-tab="register" aria-selected="false">Kayıt Ol</button>
    </div>
    <div class="auth-state is-active" data-state="login" role="tabpanel">
      <form class="auth-form" id="authLoginForm" autocomplete="on" novalidate>
        <div class="auth-field"><label for="authLoginEmail">E-posta</label>
          <input id="authLoginEmail" name="email" type="email" inputmode="email" autocomplete="email" required /></div>
        <div class="auth-field"><label for="authLoginPassword">Şifre</label>
          <input id="authLoginPassword" name="password" type="password" autocomplete="current-password" minlength="6" required /></div>
        <div class="auth-row-between"><span></span><a href="#" id="authForgotLink">Şifremi unuttum</a></div>
        <p class="auth-error" hidden></p>
        <button type="submit" class="auth-btn-primary">Giriş Yap</button>
      </form>
      <p class="auth-foot">Hesabın yok mu? <a href="#" id="authToRegister">Kayıt ol</a></p>
    </div>
    <div class="auth-state" data-state="register" role="tabpanel">
      <form class="auth-form" id="authRegisterForm" autocomplete="on" novalidate>
        <div class="auth-field"><label for="authRegName">Ad Soyad</label>
          <input id="authRegName" name="fullName" type="text" autocomplete="name" required /></div>
        <div class="auth-field"><label for="authRegEmail">E-posta</label>
          <input id="authRegEmail" name="email" type="email" inputmode="email" autocomplete="email" required /></div>
        <div class="auth-field"><label for="authRegPassword">Şifre</label>
          <input id="authRegPassword" name="password" type="password" autocomplete="new-password" minlength="6" required /></div>
        <label class="auth-check"><input type="checkbox" name="kvkk" required />
          <span><a href="kvkk-aydinlatma.html" target="_blank" rel="noopener">KVKK Aydınlatma Metni</a>'ni okudum, <a href="kullanim-kosullari.html" target="_blank" rel="noopener">Kullanım Koşulları</a> ve <a href="gizlilik.html" target="_blank" rel="noopener">Gizlilik Politikası</a>'nı kabul ediyorum.</span></label>
        <p class="auth-error" hidden></p>
        <button type="submit" class="auth-btn-primary">Kayıt Ol</button>
      </form>
      <p class="auth-foot">Zaten hesabın var mı? <a href="#" id="authToLogin">Giriş yap</a></p>
    </div>
    <div class="auth-state" data-state="forgot" role="tabpanel">
      <h3 class="auth-heading">Şifreni mi unuttun?</h3>
      <p class="auth-sub">E-postanı gir, sıfırlama bağlantısını gönderelim.</p>
      <form class="auth-form" id="authForgotForm" autocomplete="on" novalidate>
        <div class="auth-field"><label for="authForgotEmail">E-posta</label>
          <input id="authForgotEmail" name="email" type="email" inputmode="email" autocomplete="email" required /></div>
        <p class="auth-error" hidden></p><p class="auth-info" hidden></p>
        <button type="submit" class="auth-btn-primary">Sıfırlama Bağlantısını Gönder</button>
        <button type="button" class="auth-btn-ghost" id="authBackToLogin">Geri dön</button>
      </form>
    </div>
    <div class="auth-state" data-state="reset" role="tabpanel">
      <h3 class="auth-heading">Yeni şifre belirle</h3>
      <p class="auth-sub">Hesabın için yeni bir şifre seç.</p>
      <form class="auth-form" id="authResetForm" autocomplete="on" novalidate>
        <div class="auth-field"><label for="authResetPwd">Yeni şifre</label>
          <input id="authResetPwd" name="password" type="password" autocomplete="new-password" minlength="6" required /></div>
        <div class="auth-field"><label for="authResetPwd2">Yeni şifre (tekrar)</label>
          <input id="authResetPwd2" name="password2" type="password" autocomplete="new-password" minlength="6" required /></div>
        <p class="auth-error" hidden></p><p class="auth-info" hidden></p>
        <button type="submit" class="auth-btn-primary">Şifremi Güncelle</button>
      </form>
    </div>
    <div class="auth-state" data-state="check-email" role="tabpanel">
      <div class="auth-check-email">
        <span class="auth-check-icon" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
        <h3>Mailini kontrol et</h3>
        <p><span class="auth-email-strong" id="authCheckEmailAddr">…</span> adresine doğrulama bağlantısı gönderdik.</p>
        <p>Linke tıkladığında otomatik olarak giriş yapacaksın.</p>
        <span class="auth-spam-hint">Gelmediyse spam / önemsiz klasörünü kontrol et.</span>
        <p class="auth-error" hidden></p><p class="auth-info" hidden></p>
        <button type="button" class="auth-btn-primary" id="authResendBtn" style="margin-top:18px;">Tekrar gönder</button>
        <button type="button" class="auth-btn-ghost" id="authCheckCloseBtn">Kapat</button>
      </div>
    </div>
    <div class="auth-state" data-state="verified" role="tabpanel">
      <div class="auth-check-email">
        <span class="auth-check-icon" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
        <h3>E-postan doğrulandı ✓</h3>
        <p>Hoş geldin — otomatik giriş yapıldı.</p>
      </div>
    </div>
  </div>
</div>`;

  function $(sel, root) { return (root || modal).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || modal).querySelectorAll(sel)); }

  function boot() {
    if (booted) return;
    modal = document.getElementById('authModal');
    if (!modal) {
      // Sayfada inline modal yoksa enjekte et (cart.html, checkout.html vb.)
      document.body.insertAdjacentHTML('beforeend', MODAL_HTML);
      modal = document.getElementById('authModal');
    }
    if (!modal) return;
    card       = $('.auth-modal-card');
    tabBtns    = $$('.auth-tab');
    stateNodes = $$('.auth-state');

    // Tab switch (login/register)
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Close handlers
    $('.auth-close').addEventListener('click', closeAuthModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeAuthModal(); });

    // Forms
    $('#authLoginForm').addEventListener('submit', onLoginSubmit);
    $('#authRegisterForm').addEventListener('submit', onRegisterSubmit);
    $('#authForgotForm').addEventListener('submit', onForgotSubmit);
    $('#authResetForm').addEventListener('submit', onResetSubmit);

    // Inline state switches
    $('#authForgotLink').addEventListener('click', (e) => { e.preventDefault(); goState('forgot'); });
    $('#authBackToLogin').addEventListener('click', (e) => { e.preventDefault(); goState('login'); });
    $('#authResendBtn').addEventListener('click', onResend);
    $('#authCheckCloseBtn').addEventListener('click', closeAuthModal);
    $('#authToRegister').addEventListener('click', (e) => { e.preventDefault(); switchTab('register'); });
    $('#authToLogin').addEventListener('click', (e) => { e.preventDefault(); switchTab('login'); });

    // ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) closeAuthModal();
    });

    // data-auth-open="login|register|forgot" → modalı aç
    // (inline onclick="openAuthModal(...)" yerine — CSP script-src'yi katı tutmak için)
    document.addEventListener('click', (e) => {
      const opener = e.target.closest('[data-auth-open]');
      if (opener) { e.preventDefault(); openAuthModal(opener.getAttribute('data-auth-open') || 'login'); }
    });

    // PASSWORD_RECOVERY event (Supabase tetikleyebilir)
    if (window.NMAuth) {
      window.NMAuth.onAuthStateChange((session, event) => {
        if (event === 'PASSWORD_RECOVERY') {
          openAuthModal('login');
          goState('reset');
        }
      });
    }

    booted = true;
    handleUrlState();
  }

  function handleUrlState() {
    const params = new URLSearchParams(location.search);
    const auth = params.get('auth');
    if (!auth) return;

    if (auth === 'login')    { openAuthModal('login'); cleanUrlParam(); }
    else if (auth === 'register') { openAuthModal('register'); cleanUrlParam(); }
    else if (auth === 'recover')  { openAuthModal('login'); goState('reset'); cleanUrlParam(); }
    else if (auth === 'verified') {
      openAuthModal('login');
      goState('verified');
      cleanUrlParam();
      // 2sn sonra modal'ı kapat — session SDK tarafından çoktan kuruldu
      setTimeout(() => { closeAuthModal(); }, 2200);
    }
  }

  function cleanUrlParam() {
    const url = new URL(location.href);
    url.searchParams.delete('auth');
    history.replaceState(null, '', url.pathname + (url.search ? url.search : '') + url.hash);
  }

  // ----- public API -----
  function openAuthModal(tab) {
    if (!booted) boot();
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('auth-locked');
    // next frame → transition fire
    requestAnimationFrame(() => modal.classList.add('is-open'));

    if (tab === 'register') goState('register');
    else if (tab === 'forgot') goState('forgot');
    else goState('login');
  }

  function closeAuthModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('auth-locked');
    setTimeout(() => { modal.hidden = true; clearError(); clearInfo(); }, 240);
  }

  function switchTab(tab) {
    tabBtns.forEach(b => {
      const sel = b.dataset.tab === tab;
      b.setAttribute('aria-selected', sel ? 'true' : 'false');
    });
    goState(tab);
  }

  function goState(name) {
    clearError();
    clearInfo();
    stateNodes.forEach(n => {
      const active = n.dataset.state === name;
      n.classList.toggle('is-active', active);
    });
    // tab visual'ı sadece login/register için
    if (name === 'login' || name === 'register') {
      tabBtns.forEach(b => b.setAttribute('aria-selected', b.dataset.tab === name ? 'true' : 'false'));
      document.querySelector('.auth-tabs').hidden = false;
    } else {
      document.querySelector('.auth-tabs').hidden = true;
    }
    // focus ilk input
    const active = stateNodes.find(n => n.dataset.state === name);
    if (active) {
      const input = active.querySelector('input:not([type=hidden]):not([disabled])');
      if (input) setTimeout(() => input.focus(), 50);
    }
  }

  function showError(msg) {
    errorNode = $('.auth-state.is-active .auth-error');
    if (!errorNode) return;
    errorNode.textContent = msg;
    errorNode.hidden = false;
  }
  function clearError() {
    $$('.auth-error').forEach(n => { n.textContent = ''; n.hidden = true; });
  }
  function showInfo(msg) {
    infoNode = $('.auth-state.is-active .auth-info');
    if (!infoNode) return;
    infoNode.textContent = msg;
    infoNode.hidden = false;
  }
  function clearInfo() {
    $$('.auth-info').forEach(n => { n.textContent = ''; n.hidden = true; });
  }

  function setBusy(form, busy) {
    const btn = form.querySelector('.auth-btn-primary');
    if (!btn) return;
    btn.disabled = busy;
    btn.dataset.label = btn.dataset.label || btn.textContent;
    btn.textContent = busy ? 'Lütfen bekle…' : btn.dataset.label;
  }

  // ----- form handlers -----
  async function onLoginSubmit(e) {
    e.preventDefault();
    if (!window.NMAuth) return showError('Bağlantı hazır değil, sayfayı yenile.');
    clearError();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    setBusy(e.target, true);
    const { data, error } = await window.NMAuth.signIn({ email, password });
    setBusy(e.target, false);
    if (error) return showError(window.NMAuth.translateAuthError(error));
    closeAuthModal();
  }

  async function onRegisterSubmit(e) {
    e.preventDefault();
    if (!window.NMAuth) return showError('Bağlantı hazır değil, sayfayı yenile.');
    clearError();
    const fullName = e.target.fullName.value.trim();
    const email    = e.target.email.value.trim();
    const password = e.target.password.value;
    const kvkk     = e.target.kvkk.checked;
    if (!kvkk) return showError('Devam etmek için KVKK metnini onayla.');
    if (password.length < 6) return showError('Şifre en az 6 karakter olmalı.');
    setBusy(e.target, true);
    const { data, error } = await window.NMAuth.signUp({ email, password, fullName });
    setBusy(e.target, false);
    if (error) return showError(window.NMAuth.translateAuthError(error));
    lastEmail = email;
    $('#authCheckEmailAddr').textContent = email;
    goState('check-email');
  }

  async function onForgotSubmit(e) {
    e.preventDefault();
    if (!window.NMAuth) return showError('Bağlantı hazır değil, sayfayı yenile.');
    clearError();
    const email = e.target.email.value.trim();
    setBusy(e.target, true);
    const { error } = await window.NMAuth.resetPassword(email);
    setBusy(e.target, false);
    if (error) return showError(window.NMAuth.translateAuthError(error));
    showInfo('Sıfırlama bağlantısı e-postana gönderildi. Gelen kutunu kontrol et.');
  }

  async function onResetSubmit(e) {
    e.preventDefault();
    if (!window.NMAuth) return showError('Bağlantı hazır değil, sayfayı yenile.');
    clearError();
    const pwd1 = e.target.password.value;
    const pwd2 = e.target.password2.value;
    if (pwd1.length < 6) return showError('Şifre en az 6 karakter olmalı.');
    if (pwd1 !== pwd2) return showError('Şifreler eşleşmiyor.');
    setBusy(e.target, true);
    const { error } = await window.NMAuth.updatePassword(pwd1);
    setBusy(e.target, false);
    if (error) return showError(window.NMAuth.translateAuthError(error));
    showInfo('Şifren güncellendi. Devam edebilirsin.');
    setTimeout(() => closeAuthModal(), 1500);
  }

  async function onResend() {
    if (!window.NMAuth || !lastEmail) return;
    clearError(); clearInfo();
    const btn = $('#authResendBtn');
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = 'Gönderiliyor…';
    const { error } = await window.NMAuth.resendConfirmation(lastEmail);
    btn.disabled = false;
    btn.textContent = label;
    if (error) return showError(window.NMAuth.translateAuthError(error));
    showInfo('Yeni doğrulama maili gönderildi.');
  }

  // expose
  window.openAuthModal  = openAuthModal;
  window.closeAuthModal = closeAuthModal;

  // boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
