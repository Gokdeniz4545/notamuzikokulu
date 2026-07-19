/* ============================================================
   pages-data.js — elle yazılan içerik sayfalarının tek kaynağı
   scripts/build-categories.js bu diziden <slug>.html üretir.

   Neden build'e bağlı: bu sayfalar elle yazılsaydı header/footer/script
   blokları zamanla bayatlardı (shared-chrome.js'in çözdüğü sorunun ta kendisi).
   İçerik burada, kabuk shared-chrome'dan gelir.

   Her kayıt: slug, title, metaDesc, keywords, eyebrow, h1, lead, body(HTML),
              faq[] (opsiyonel)
   ============================================================ */
(function (window) {
  'use strict';

  window.CONTENT_PAGES = [

    /* ---------------------------------------------------------- */
    {
      slug: 'izmir-muzik-magazasi',
      title: 'İzmir Müzik Aleti Mağazası — Çiğli | Nota Müzik Market',
      metaDesc: 'İzmir Çiğli\'de müzik aleti mağazası. Gitar, dijital piyano, elektronik davul ve keman modellerini mağazamızda çalarak deneyebilirsiniz. Şemikler Mah., her gün 10:00–21:00.',
      keywords: 'izmir müzik aleti, izmir gitar mağazası, çiğli müzik market, izmir enstrüman, izmir dijital piyano',
      eyebrow: 'Mağaza · İzmir / Çiğli',
      h1: 'İzmir\'de Müzik Aleti Nereden Alınır? Çiğli\'deki Mağazamız',
      lead: 'Enstrümanı görmeden, elleyip çalmadan almak istemeyenler için İzmir Çiğli\'de fiziksel mağazamız var.',
      body: `
      <!-- ÇEKİRDEK PASAJ: sayfanın ilk %30'unda, tek blok, bağımsız anlamlı.
           AI'ın "İzmir'de gitar nereden alınır" sorusuna tek parçada cevap
           verebilmesi için tasarlandı — parçalamaya ihtiyaç duymasın. -->
      <p class="lead">Nota Müzik Market, İzmir'in Çiğli ilçesinde fiziksel satış noktası bulunan bir müzik enstrümanı mağazasıdır. Mağaza, Nota Müzik Okulu binası içinde yer alır: <strong>Şemikler Mah. 6205 Sok. No: 4/A, Çiğli / İzmir</strong>. Klasik gitar, elektro gitar, akustik gitar, dijital piyano, keyboard, elektronik davul, cajon, darbuka, keman, saksafon ve klarnet ile baget, tel, kablo, kılıf ve amfi gibi aksesuarlar mağazada bulunur. Enstrümanlar satın alınmadan önce yerinde çalınarak denenebilir; aynı binada ders veren eğitmenler seçim konusunda yönlendirme yapar. Fiyatlar {{FIYAT:klasik-gitar}}'den başlayan klasik gitar, {{FIYAT:elektro-gitar}}'den başlayan elektro gitar ve {{FIYAT:dijital-piyano}}'den başlayan dijital piyano modelleriyle geniş bir aralığa yayılır. Mağaza <strong>her gün 10:00–21:00</strong> arasında açıktır. Telefon: <strong>0543 766 35 37</strong>. Aynı ürünler notamuzikmarket.com üzerinden tüm Türkiye'ye kargoyla da gönderilir; 2.000 TL ve üzeri siparişlerde kargo ücretsizdir, altındaki siparişlerde 199 TL kargo bedeli uygulanır.</p>

      <h2>Neden mağazadan almak fark yaratır?</h2>
      <p>Enstrüman, fotoğraftan seçilmesi en zor ürünlerden biri. Aynı modelin iki ayrı örneği bile elde farklı hissettirebilir. Mağazada şunları yapabilirsiniz:</p>
      <ul>
        <li><strong>Çalarak deneme</strong> — gitarın sap kalınlığı, piyanonun tuş ağırlığı, davulun geri tepmesi ancak elle anlaşılır.</li>
        <li><strong>Boy uyumu kontrolü</strong> — özellikle çocuklar için keman ve klasik gitarda doğru ölçü (1/2, 3/4, 4/4) yerinde ölçülür. Yanlış boy, öğrenmeyi baştan sakatlar.</li>
        <li><strong>Karşılaştırma</strong> — iki modeli yan yana çalıp aradaki farkı duymak, teknik özellik listesi okumaktan çok daha nettir.</li>
        <li><strong>Eğitmen görüşü</strong> — aynı binada ders veren eğitmenlere seviyenizi ve hedefinizi anlatıp öneri alabilirsiniz.</li>
      </ul>

      <h2>Mağazada hangi ürünler var?</h2>
      <p>Kataloğumuzdaki ürünlerin tamamı her an mağazada bulunmayabilir; stok durumu değişkendir. Gelmeden önce aradığınız modeli telefonla teyit etmenizi öneririz.</p>
      <ul>
        <li><a href="elektro-gitar.html">Elektro gitar</a>, <a href="klasik-gitar.html">klasik gitar</a>, <a href="akustik-gitar.html">akustik gitar</a></li>
        <li><a href="dijital-piyano.html">Dijital piyano</a> ve <a href="keyboard-org.html">keyboard / org</a></li>
        <li><a href="elektronik-davul.html">Elektronik davul</a>, <a href="davul-calisma-pedi.html">çalışma pedi</a>, <a href="davul-bageti.html">baget</a></li>
        <li><a href="cajon-darbuka.html">Cajon ve darbuka</a></li>
        <li><a href="keman.html">Keman</a>, <a href="saksafon.html">saksafon</a>, <a href="klarnet.html">klarnet</a></li>
        <li>Aksesuar: <a href="gitar-teli.html">tel</a>, <a href="gitar-kablosu.html">kablo</a>, <a href="gitar-kilifi.html">kılıf</a>, <a href="amfi-pedal.html">amfi ve pedal</a></li>
      </ul>

      <h2>Adres ve ulaşım</h2>
      <table>
        <tr><th>Adres</th><td>Şemikler Mah. 6205 Sok. No: 4/A, Çiğli / İzmir</td></tr>
        <tr><th>Konum</th><td>Nota Müzik Okulu binası içinde</td></tr>
        <tr><th>Telefon</th><td><a href="tel:+905437663537">0543 766 35 37</a></td></tr>
        <tr><th>E-posta</th><td><a href="mailto:info@notamuzikmarket.com">info@notamuzikmarket.com</a></td></tr>
        <tr><th>Çalışma saatleri</th><td>Her gün 10:00 – 21:00</td></tr>
      </table>

      <h2>İzmir dışından sipariş</h2>
      <p>Mağazaya gelemeyenler için tüm ürünler siteden sipariş edilebilir. Siparişler 1-2 iş günü içinde hazırlanır, teslimat bölgeye göre 1-3 iş günü sürer. 2.000 TL ve üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Teslimattan itibaren 14 gün cayma hakkınız vardır ve ödemeler PayTR güvenli ödeme altyapısı üzerinden taksit seçenekleriyle alınır.</p>
`,
      faq: [
        { q: 'İzmir\'de müzik aleti mağazanız nerede?', a: 'Şemikler Mah. 6205 Sok. No: 4/A, Çiğli / İzmir adresinde, Nota Müzik Okulu binası içindeyiz. Her gün 10:00–21:00 arasında açığız. Telefon: 0543 766 35 37.' },
        { q: 'Enstrümanı satın almadan önce deneyebilir miyim?', a: 'Evet. Mağazamızdaki enstrümanlar çalınarak denenebilir. Gitarın sap kalınlığı, dijital piyanonun tuş ağırlığı ya da davulun geri tepmesi gibi özellikler ancak elle anlaşıldığı için denemenizi öneririz.' },
        { q: 'Aradığım model mağazada var mı?', a: 'Kataloğumuzdaki ürünlerin tamamı her an mağazada bulunmayabilir, stok durumu değişkendir. Gelmeden önce 0543 766 35 37 numaralı telefondan aradığınız modeli teyit etmenizi öneririz.' },
        { q: 'Çocuğuma uygun boy enstrümanı mağazada ölçebilir misiniz?', a: 'Evet. Özellikle keman ve klasik gitarda doğru boy (1/2, 3/4, 4/4) çocuğun kol uzunluğuna göre belirlenir ve yerinde ölçülür. Yanlış boy enstrüman, duruş ve tekniği baştan sakatladığı için bu ölçüm önemlidir.' },
        { q: 'İzmir dışına kargo yapıyor musunuz?', a: 'Evet, tüm Türkiye\'ye kargo ile gönderim yapıyoruz. Siparişler 1-2 iş günü içinde hazırlanır, teslimat bölgeye göre 1-3 iş günü sürer. 2.000 TL ve üzeri siparişlerde kargo ücretsizdir.' },
      ],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'hakkimizda',
      title: 'Hakkımızda — Nota Müzik Market',
      metaDesc: 'Nota Müzik Market, İzmir Çiğli\'de Nota Müzik Okulu bünyesinde faaliyet gösteren müzik enstrümanı satıcısıdır. Mağazada deneyerek alım, eğitmen desteği ve fiyat garantisi.',
      keywords: 'nota müzik market hakkında, izmir müzik market, nota müzik okulu, müzik aleti satıcısı izmir',
      eyebrow: 'Kurumsal',
      h1: 'Hakkımızda',
      lead: 'Enstrüman satan değil, enstrüman çalmayı öğreten bir yerin içinden çıktık.',
      body: `
      <p class="lead">Nota Müzik Market, İzmir Çiğli'de <strong>Nota Müzik Okulu</strong> bünyesinde faaliyet gösteren bir müzik enstrümanı satıcısıdır. Mağazamız okulun binası içinde yer alır; yani sattığımız enstrümanların çalındığı, öğretildiği ve gün boyu kullanıldığı bir ortamın içindeyiz.</p>

      <h2>Bu neden fark yaratıyor?</h2>
      <p>Enstrüman satışının en zor tarafı, müşterinin ne aradığını çoğu zaman kendisinin de tam bilmemesi. "Çocuğuma gitar alacağım" diyen bir veli için doğru cevap, kataloğun en pahalı gitarı değil; çocuğun koluna uyan doğru boydaki gitardır.</p>
      <p>Aynı binada ders veren eğitmenlerle çalıştığımız için bu soruları her gün duyuyoruz. Ürün açıklamalarımızdaki öneriler ve bu sitedeki rehberler, katalogdan değil o günlük deneyimden çıkıyor.</p>

      <h2>Nasıl çalışıyoruz?</h2>
      <ul>
        <li><strong>Mağazada deneme</strong> — İzmir'deyseniz enstrümanı çalarak deneyebilir, iki modeli yan yana karşılaştırabilirsiniz. <a href="izmir-muzik-magazasi.html">Mağaza bilgileri →</a></li>
        <li><strong>Doğru ölçü</strong> — keman ve klasik gitarda çocuğun boyuna uygun ölçü yerinde belirlenir.</li>
        <li><strong>Fiyat garantisi</strong> — aynı ürünü yetkili bir satıcıda daha uygun bulursanız o fiyattan satarız. <a href="fiyat-garantisi.html">Koşullar →</a></li>
        <li><strong>Güvenli ödeme</strong> — tüm ödemeler PayTR altyapısı üzerinden alınır; kart bilgileriniz bizim sistemimizde saklanmaz.</li>
        <li><strong>Cayma hakkı</strong> — teslimattan itibaren 14 gün içinde koşulsuz iade.</li>
      </ul>

      <h2>Ürün gruplarımız</h2>
      <p>Gitar (elektro, klasik, akustik), klavyeli çalgılar (dijital piyano, keyboard, org), davul ve perküsyon (elektronik davul, cajon, darbuka, baget, çalışma pedi), yaylı çalgılar (keman), üflemeli çalgılar (saksafon, klarnet) ve bunların aksesuarları. <a href="products.html">Tüm ürünleri görüntüle →</a></p>

      <h2>Firma bilgileri</h2>
      <table>
        <tr><th>Ünvan</th><td>Süleyman Kesici – Nota Müzik</td></tr>
        <tr><th>Adres</th><td>Şemikler Mah. 6205 Sok. No: 4/A, Çiğli / İzmir</td></tr>
        <tr><th>Telefon</th><td><a href="tel:+905437663537">0543 766 35 37</a></td></tr>
        <tr><th>E-posta</th><td><a href="mailto:info@notamuzikmarket.com">info@notamuzikmarket.com</a></td></tr>
        <tr><th>Vergi Dairesi</th><td>Çiğli</td></tr>
        <tr><th>Müzik okulu</th><td><a href="https://www.notamuzikokulu.com/" target="_blank" rel="noopener noreferrer">notamuzikokulu.com</a></td></tr>
      </table>
      <p>Yasal künye ve iletişim ayrıntıları için <a href="iletisim.html">İletişim &amp; Künye</a> sayfasına bakabilirsiniz.</p>
`,
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'fiyat-garantisi',
      title: 'Fiyat Garantisi — Nota Müzik Market',
      metaDesc: 'Aynı ürünü Türkiye\'de yetkili bir satıcıda daha uygun fiyata bulursanız o fiyattan satıyoruz. Fiyat garantisinin koşulları ve başvuru yöntemi.',
      keywords: 'fiyat garantisi, uygun fiyat müzik aleti, enstrüman fiyat eşleştirme',
      eyebrow: 'Taahhüt',
      h1: 'Fiyat Garantisi',
      lead: 'Aynı ürünü daha uygun bulursanız, o fiyattan satıyoruz.',
      body: `
      <p class="lead">Satın almak istediğiniz ürünün aynısını Türkiye'de faaliyet gösteren yetkili bir satıcıda daha uygun fiyata bulursanız, <strong>bize belgesini gösterin, o fiyattan satalım.</strong> Enstrüman alırken fiyat araştırmak için saatlerinizi harcamanıza gerek olmadığını düşünüyoruz.</p>

      <h2>Nasıl başvurulur?</h2>
      <ol>
        <li>Daha uygun fiyatı gördüğünüz sayfanın bağlantısını veya ekran görüntüsünü hazırlayın.</li>
        <li><a href="mailto:info@notamuzikmarket.com">info@notamuzikmarket.com</a> adresine gönderin ya da <a href="tel:+905437663537">0543 766 35 37</a> numarasından ulaşın.</li>
        <li>Kontrolümüz sonrası uygunsa aynı fiyattan satışı onaylıyoruz.</li>
      </ol>

      <h2>Koşullar</h2>
      <ul>
        <li>Ürün <strong>birebir aynı</strong> olmalıdır: aynı marka, aynı model, aynı renk ve aynı paket içeriği.</li>
        <li>Karşılaştırılan satıcı <strong>Türkiye'de faaliyet gösteren, yetkili ve kurumsal</strong> bir satıcı olmalıdır. İkinci el ilanları, bireysel satıcılar ve yurt dışı siteleri kapsam dışıdır.</li>
        <li>Ürün karşı satıcıda <strong>stokta ve satın alınabilir</strong> durumda olmalıdır.</li>
        <li>Karşılaştırma <strong>kargo dahil kapıya teslim toplam tutar</strong> üzerinden yapılır.</li>
        <li>Süreli kampanya, kupon, üyeliğe özel indirim, açık artırma ve stok tükenmesine bağlı tasfiye fiyatları kapsam dışıdır.</li>
        <li>Garanti, siparişiniz tamamlanmadan önce talep edilmelidir.</li>
      </ul>

      <h2>Neden "en ucuz" demiyoruz?</h2>
      <p>Müzik enstrümanı fiyatları döviz kuruna ve kampanyalara bağlı olarak gün içinde bile değişebiliyor. Herhangi bir satıcının "her zaman en ucuz" olduğunu iddia etmesi, o iddiayı her gün yeniden kanıtlamasını gerektirir. Biz iddia etmek yerine <strong>taahhüt vermeyi</strong> tercih ediyoruz: daha uygununu bulursanız o fiyattan satıyoruz.</p>

      <h2>Diğer avantajlar</h2>
      <ul>
        <li>2.000 TL ve üzeri siparişlerde <strong>kargo ücretsiz</strong> (altında 199 TL).</li>
        <li>Teslimattan itibaren <strong>14 gün cayma hakkı</strong>.</li>
        <li>Kredi kartına <strong>taksit</strong> seçenekleri (ürün sayfasında görüntülenir).</li>
        <li>İzmir'deyseniz mağazada <strong>deneyerek</strong> satın alma. <a href="izmir-muzik-magazasi.html">Mağaza bilgileri →</a></li>
      </ul>
`,
      faq: [
        { q: 'Fiyat garantisi nasıl işliyor?', a: 'Aynı ürünü Türkiye\'de faaliyet gösteren yetkili bir satıcıda daha uygun fiyata bulursanız, bağlantısını veya ekran görüntüsünü bize gönderin; kontrol sonrası aynı fiyattan satışı onaylıyoruz.' },
        { q: 'Hangi satıcılar karşılaştırmaya dahil?', a: 'Türkiye\'de faaliyet gösteren yetkili ve kurumsal satıcılar. İkinci el ilanları, bireysel satıcılar ve yurt dışı siteleri kapsam dışıdır. Ürünün karşı satıcıda stokta ve satın alınabilir olması gerekir.' },
        { q: 'Karşılaştırma neye göre yapılıyor?', a: 'Kargo dahil kapıya teslim toplam tutar üzerinden. Süreli kampanya, kupon, üyeliğe özel indirim ve tasfiye fiyatları kapsam dışıdır.' },
        { q: 'Siparişten sonra da başvurabilir miyim?', a: 'Hayır, fiyat garantisi talebinin sipariş tamamlanmadan önce iletilmesi gerekir.' },
      ],
    },

  ];
})(typeof window !== 'undefined' ? window : this);
