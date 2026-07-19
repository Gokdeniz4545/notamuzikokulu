/* ============================================================
   gtag.js — Google Ads dönüşüm takibi (Consent Mode v2 / KVKK uyumlu)

   Neden bu dosya var: CSP inline script'e izin vermiyor (.htaccess),
   bu yüzden gtag kurulumu harici dosyada.

   KVKK: reklam çerezleri VARSAYILAN OLARAK KAPALI başlar. Kullanıcı
   çerez bandından "Pazarlama"yı onaylayana kadar Google kimlik taşıyan
   çerez yazmaz (Consent Mode v2 — onaysız trafik modellenir, ölçüm ölmez).
   Onay değişince cookie-consent.js'in 'nm:consent' olayı ile güncellenir.

   KURULUM: aşağıdaki değerleri Google Ads / Analytics'ten al ve doldur.
     AW_ID          → Google Ads > Araçlar > Dönüşümler > etiket kurulumu
                      Biçim: 'AW-123456789'
     PURCHASE_LABEL → aynı ekrandaki "dönüşüm etiketi"
                      Biçim: 'AbC-D_efGhIjKlMnO'
     GA4_ID         → Analytics > Yönetici > Veri akışları > ölçüm kimliği
                      Biçim: 'G-XXXXXXXXXX'  (organik trafik ölçümü için)
   Hepsi boşken dosya hiçbir şey yapmaz (site etkilenmez).

   NOT: GA4 verisini google-analytics.com'a gönderir. Bu alan adları
   .htaccess'teki CSP connect-src listesinde OLMAK ZORUNDA, yoksa GA4
   sessizce hiç hit göndermez (tek belirti: Realtime raporu boş kalır).
   ============================================================ */
(function () {
  'use strict';

  var AW_ID = 'AW-18327645689';
  var PURCHASE_LABEL = '7NEHCNT_4dIcEPnbpqNE';  // Dönüşümler > "Satın alma işlemi (1)" > etkinlik snippet'i
  var GA4_ID = 'G-HZ4NSTT3CB';  // Analytics > Veri akışları > notamuzikmarket.com

  // Hiçbir kimlik girilmeden istek atma — yanlışlıkla yayına çıkarsa sessiz kalsın
  if (!AW_ID && !GA4_ID) { window.NMTrack = { purchase: function () {}, ready: false }; return; }

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
  // Tek script yeter; Ads ve GA4 aynı dataLayer üzerinden ayrı config alır.
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(AW_ID || GA4_ID);
  document.head.appendChild(s);

  gtag('js', new Date());
  if (AW_ID) gtag('config', AW_ID);
  if (GA4_ID) gtag('config', GA4_ID);

  // ---- 4) Satın alma dönüşümü ----
  // transaction_id = sipariş no → aynı sipariş iki kez sayılmaz (sayfa yenilense bile)
  window.NMTrack = {
    ready: true,
    purchase: function (o) {
      if (!o) return;
      var value = Number(o.value);
      value = isFinite(value) && value > 0 ? value : undefined;
      var oid = String(o.oid || '');

      // Google Ads dönüşümü
      if (AW_ID && PURCHASE_LABEL) {
        gtag('event', 'conversion', {
          send_to: AW_ID + '/' + PURCHASE_LABEL,
          value: value,
          currency: 'TRY',
          transaction_id: oid,
        });
      }

      // GA4 e-ticaret olayı — hangi kanalın (organik/reklam) satış getirdiğini
      // ayırt etmek için şart. Ads dönüşümünden ayrı bir olaydır.
      if (GA4_ID) {
        gtag('event', 'purchase', {
          send_to: GA4_ID,
          value: value,
          currency: 'TRY',
          transaction_id: oid,
        });
      }
    },
  };
})();
