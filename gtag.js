/* ============================================================
   gtag.js — Google Ads dönüşüm takibi (Consent Mode v2 / KVKK uyumlu)

   Neden bu dosya var: CSP inline script'e izin vermiyor (.htaccess),
   bu yüzden gtag kurulumu harici dosyada.

   KVKK: reklam çerezleri VARSAYILAN OLARAK KAPALI başlar. Kullanıcı
   çerez bandından "Pazarlama"yı onaylayana kadar Google kimlik taşıyan
   çerez yazmaz (Consent Mode v2 — onaysız trafik modellenir, ölçüm ölmez).
   Onay değişince cookie-consent.js'in 'nm:consent' olayı ile güncellenir.

   KURULUM: aşağıdaki iki değeri Google Ads'ten al ve doldur.
     AW_ID          → Google Ads > Araçlar > Dönüşümler > etiket kurulumu
                      Biçim: 'AW-123456789'
     PURCHASE_LABEL → aynı ekrandaki "dönüşüm etiketi"
                      Biçim: 'AbC-D_efGhIjKlMnO'
   İkisi de boşken dosya hiçbir şey yapmaz (site etkilenmez).
   ============================================================ */
(function () {
  'use strict';

  var AW_ID = 'AW-18327645689';
  var PURCHASE_LABEL = '7NEHCNT_4dIcEPnbpqNE';  // Dönüşümler > "Satın alma işlemi (1)" > etkinlik snippet'i

  // ID girilmeden hiçbir istek atma — yanlışlıkla yayına çıkarsa sessiz kalsın
  if (!AW_ID) { window.NMTrack = { purchase: function () {}, ready: false }; return; }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  // ---- 1) Consent Mode v2: her şey REDDEDİLMİŞ başlar ----
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  });

  // ---- 2) Kayıtlı onay varsa hemen uygula ----
  function applyConsent(c) {
    if (!c) return;
    var marketing = c.marketing ? 'granted' : 'denied';
    gtag('consent', 'update', {
      ad_storage: marketing,
      ad_user_data: marketing,
      ad_personalization: marketing,
      analytics_storage: c.analytics ? 'granted' : 'denied',
    });
  }
  try { if (window.NMConsent) applyConsent(window.NMConsent.get()); } catch (e) {}

  // Kullanıcı bandan seçim yapınca güncelle
  document.addEventListener('nm:consent', function (ev) { applyConsent(ev && ev.detail); });

  // ---- 3) gtag.js'i yükle ----
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(AW_ID);
  document.head.appendChild(s);

  gtag('js', new Date());
  gtag('config', AW_ID);

  // ---- 4) Satın alma dönüşümü ----
  // transaction_id = sipariş no → aynı sipariş iki kez sayılmaz (sayfa yenilense bile)
  window.NMTrack = {
    ready: true,
    purchase: function (o) {
      if (!o || !PURCHASE_LABEL) return;
      var value = Number(o.value);
      gtag('event', 'conversion', {
        send_to: AW_ID + '/' + PURCHASE_LABEL,
        value: isFinite(value) && value > 0 ? value : undefined,
        currency: 'TRY',
        transaction_id: String(o.oid || ''),
      });
    },
  };
})();
