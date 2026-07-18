// order-success — sepeti temizle + sipariş numarasını biçimle
// (CSP uyumu için order-success.html'deki inline <script> buraya taşındı)
(function () {
  // Sepeti temizle (ödeme başarılı). Üye sepetini webhook zaten temizledi; yerel de temizlensin.
  try { if (window.NMCart) window.NMCart.clear(); } catch (e) {}
  // Sipariş numarasını ?oid'den biçimle: NM2026000001 → NM-2026-000001
  var oid = new URLSearchParams(location.search).get('oid') || '';
  var m = oid.match(/^NM(\d{4})(\d+)$/);
  var line = document.getElementById('orderNumLine');
  if (m && line) line.innerHTML = 'Sipariş no: <strong>NM-' + m[1] + '-' + m[2] + '</strong>';
  // Misafir takip linkine sipariş no'yu taşı (siparis-sorgula ön-doldursun)
  var gl = document.getElementById('guestTrackLink');
  if (gl && oid) gl.href = 'siparis-sorgula.html?oid=' + encodeURIComponent(oid);

  // ---- Google Ads satın alma dönüşümü ----
  // Tutar checkout'ta saklandı. Yalnızca URL'deki sipariş no saklananla EŞLEŞİRSE
  // tetiklenir → sayfaya elle girilse bile sahte dönüşüm sayılmaz.
  // Tetiklendikten sonra kayıt silinir (yenilemede tekrar sayılmaz).
  try {
    var raw = localStorage.getItem('nm:pending-conversion');
    if (raw && oid) {
      var pc = JSON.parse(raw);
      var fresh = pc && pc.ts && (Date.now() - pc.ts) < 6 * 60 * 60 * 1000; // 6 saat
      if (pc && pc.oid === oid && fresh) {
        localStorage.removeItem('nm:pending-conversion');
        if (window.NMTrack && window.NMTrack.purchase) {
          window.NMTrack.purchase({ oid: oid, value: pc.value });
        }
      }
    }
  } catch (e) {}
})();
