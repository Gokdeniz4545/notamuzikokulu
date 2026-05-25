// ============================================================
// header-auth.js — cart.html / checkout.html header auth slot
// (index.html ve account.html kendi auth UI'larını yönetir)
// İhtiyaç: window.NMAuth, window.openAuthModal
// ============================================================
(function () {
  'use strict';

  function render(session) {
    const state = session ? 'in' : 'out';
    document.querySelectorAll('.auth-slot').forEach(slot => {
      slot.dataset.state = state;
      slot.querySelectorAll('[data-when]').forEach(el => {
        el.hidden = el.dataset.when !== state;
      });
    });
  }

  function wire() {
    document.querySelectorAll('.auth-slot [data-tab]').forEach(b => {
      b.addEventListener('click', () => {
        if (typeof window.openAuthModal === 'function') window.openAuthModal(b.dataset.tab);
      });
    });
    document.querySelectorAll('.auth-slot [data-logout], #logoutBtn').forEach(b => {
      b.addEventListener('click', async () => {
        if (window.NMAuth) await window.NMAuth.signOut();
      });
    });

    if (window.NMAuth) {
      window.NMAuth.getSession().then(render).catch(() => render(null));
      window.NMAuth.onAuthStateChange((s) => render(s));
    } else {
      render(null);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire, { once: true });
  } else {
    wire();
  }
})();
