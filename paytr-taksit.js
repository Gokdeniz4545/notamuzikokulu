// ============================================================
// paytr-taksit.js — PayTR taksit tablosu (ürün fiyatına göre)
// PayTR script'i #paytr_taksit_tablosu içine innerHTML ile basar.
// (document.write / eval yok → enforce CSP ile uyumlu; paytr.com script-src'de izinli.)
// Kullanım: window.NMTaksit.render(tutarTL)   — tutar TL cinsinden (kuruş DEĞİL).
// ============================================================
(function () {
  'use strict';

  const TOKEN = '6bf38a21d38b212ed9f371f55cb6c686b64f19e58626864fb62b16a224e742b0';
  const MERCHANT_ID = '718292';
  let currentScript = null;

  function render(amount) {
    const host = document.getElementById('paytr_taksit_tablosu');
    if (!host) return;

    const amt = Math.round(Number(amount) || 0);
    const section = document.getElementById('paytrTaksit');

    // Geçersiz/sıfır tutar → bölümü gizle
    if (!amt || amt <= 0) {
      host.innerHTML = '';
      if (section) section.hidden = true;
      return;
    }

    // Önceki script'i temizle (fiyat değişirse tabloyu yenile)
    if (currentScript && currentScript.parentNode) currentScript.parentNode.removeChild(currentScript);
    host.innerHTML = '';

    const s = document.createElement('script');
    s.src = 'https://www.paytr.com/odeme/taksit-tablosu/v2'
      + '?token=' + encodeURIComponent(TOKEN)
      + '&merchant_id=' + encodeURIComponent(MERCHANT_ID)
      + '&amount=' + amt
      + '&taksit=0&tumu=0';
    s.async = true;
    // Not: inline onerror= yerine JS ataması (CSP)
    s.onload = () => { if (section) section.hidden = false; };
    s.onerror = () => { host.innerHTML = ''; if (section) section.hidden = true; };
    document.body.appendChild(s);
    currentScript = s;
  }

  window.NMTaksit = { render };
})();
