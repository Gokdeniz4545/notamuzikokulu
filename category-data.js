/* ============================================================
   category-data.js — kategori landing sayfalarının TEK kaynağı
   scripts/build-categories.js bu diziden <slug>.html üretir.
   (blog-data.js ile aynı desen; tarayıcıya SERVİS EDİLMEZ, sadece build girdisi.)

   Her kayıt:
     slug        → çıktı dosyası: <slug>.html
     h1/title/metaDesc/keywords
     intro       → H1 altındaki tek paragraf (özet)
     body        → 600+ kelime HTML rehber metni (<h2>/<p>/<ul>)
     faq[]       → <details> SSS + FAQPage şeması
     related[]   → blog-data.js slug'ları
     minProducts → altına düşerse sayfa noindex + sitemap dışı kalır

   ÜRÜN EŞLEMESİ (hibrit — üç seviye, sırayla uygulanır):
     cats[]   → Supabase kategori slug'ları (kaba filtre)
     include  → kategori içinde ad regex'i ile daraltma
     exclude  → yanlış eşleşmeleri at
     plus[]   → cats dışından ürün slug'ı ile tekil ekleme
     minus[]  → sonuçtan ürün slug'ı ile tekil çıkarma
   plus/minus regex'ten güvenlidir: ürün adı değişince sessizce kaymaz.

   NEDEN hibrit: Supabase kategorileri landing sayfalarıyla örtüşmüyor.
   'gitar-teli', 'gitar-kilifi' ve 'gitar-kablosu' ayrı kategori değil —
   üçü de 'aksesuar-gitar' içinde. Aynı şekilde baget ve çalışma pedi
   'aksesuar-davul' içinde birlikte duruyor.
   ============================================================ */
(function (window) {
  'use strict';

  window.CATEGORY_PAGES = [

    /* ---------------------------------------------------------- */
    {
      slug: 'elektro-gitar',
      short: "Elektro Gitar",
      cats: ['elektro', 'tam-set-elektro'],
      minProducts: 3,
      h1: 'Elektro Gitar Modelleri ve Fiyatları',
      title: 'Elektro Gitar Fiyatları ve Modelleri | Nota Müzik Market',
      metaDesc: 'Başlangıç ve sahne seviyesi elektro gitar modelleri, sahne setleri ve fiyatları. Manyetik tipleri, kasa farkları ve ilk gitar seçimi rehberiyle birlikte.',
      keywords: 'elektro gitar, elektro gitar fiyatları, elektro gitar seti, elektronik gitar, yeni başlayanlar için elektro gitar',
      intro: 'Elektro gitar, tek başına ses vermeyen ama doğru amfiyle her tarzı çalabilen bir enstrüman. Aşağıda başlangıç seviyesinden sahne setlerine kadar modelleri bulacaksın — altında ise ilk gitarını seçerken gerçekten işine yarayacak bir rehber var.',
      body: `
<h2>Elektro gitar nasıl seçilir?</h2>
<p>İlk elektro gitarını alırken en sık yapılan hata, bütçenin tamamını gitara ayırıp amfiyi unutmak. Elektro gitar akustik gitardan farklı olarak tek başına neredeyse duyulmaz; sesi manyetiklerden alıp amfiye taşıyan bir zincirin parçasıdır. Bu yüzden bütçeni gitar, amfi ve kablo arasında bölmen gerekir. Sahne setleri tam olarak bu yüzden var: kılıf, kablo ve amfiyi tek pakette verip eksik parça bırakmıyorlar.</p>

<h2>Manyetik tipleri: SSS, HSS ve HSH ne demek?</h2>
<p>Gitar ilanlarında gördüğün bu harfler, gitarın üzerindeki manyetiklerin dizilimini anlatır. Kısaca:</p>
<ul>
  <li><strong>S (single coil)</strong> — ince, parlak, net bir ton. Blues, funk, pop ve country için klasik seçim. Yüksek gain'de hafif uğultu yapabilir.</li>
  <li><strong>H (humbucker)</strong> — daha kalın, daha yüksek çıkışlı ve uğultusuz. Rock ve metal için tercih edilir.</li>
  <li><strong>SSS</strong> — üç single coil. En geniş "vintage" ton aralığı.</li>
  <li><strong>HSS</strong> — köprüde humbucker, diğer ikisi single. Tek gitarla hem temiz hem distortion çalmak isteyenler için en dengeli seçenek.</li>
  <li><strong>HSH</strong> — köprü ve manyetik humbucker, ortada single. Ağır tarzlarda esneklik sağlar.</li>
</ul>
<p>Ne çalacağına henüz karar vermediysen HSS dizilim en güvenli başlangıç. Tek gitarla hem temiz arpejleri hem sert riffleri karşılar.</p>

<h2>ST kasa nedir, neden bu kadar yaygın?</h2>
<p>Kataloğumuzdaki birçok modelde geçen "ST kasa" ifadesi, gitar dünyasının en çok kopyalanan gövde formunu tarif eder. Bu formun bu kadar yaygın olmasının pratik sebepleri var: gövde vücuda oturacak şekilde oyulmuştur, uzun süre çalarken kolu yormaz, ağırlık dengesi ayakta çalmaya uygundur ve kontrol düğmeleri sağ elin doğal konumundadır. Yeni başlayan biri için tanıdık ve rahat bir başlangıç noktasıdır.</p>

<h2>Başlangıç için nelere ihtiyacın var?</h2>
<p>Gitarın kendisi dışında ilk günden lazım olacaklar şunlar:</p>
<ul>
  <li><strong>Amfi</strong> — ev çalışması için küçük watt'lı bir amfi fazlasıyla yeter. Kulaklık çıkışı olan modeller apartmanda çalışmayı çok kolaylaştırır.</li>
  <li><strong>Enstrüman kablosu</strong> — gitarı amfiye bağlar. Kalitesiz kablo cızırtı ve sinyal kaybı yapar; 3 veya 6 metrelik mono jak kablo standarttır.</li>
  <li><strong>Kılıf</strong> — taşıma sırasında en sık hasar gören yer gitarın burnu ve sap birleşimidir.</li>
  <li><strong>Pena</strong> — 0.60-0.73 mm arası orta sertlik başlangıç için en affedici aralık.</li>
  <li><strong>Akort aleti</strong> — telefon uygulaması da iş görür, ama klipsli akortçu gürültülü ortamda daha güvenilirdir.</li>
</ul>

<h2>Tel kalınlığı ve ilk değişim</h2>
<p>Fabrikadan çıkan çoğu elektro gitar 09-42 kalınlıkta telle gelir. Bu ince set, parmak ucu henüz nasır tutmamış yeni başlayanlar için en rahatıdır; bas telleri daha kolay bükülür ve el yorulmaz. Parmakların alıştıkça 10-46'ya geçip daha dolu bir ton alabilirsin. Teller paslandığında, tonu matlaştığında veya akordu tutmamaya başladığında değiştirilir — düzenli çalan biri için bu genellikle iki-üç ayda bir demektir.</p>

<h2>Sahne seti mi, tek gitar mı?</h2>
<p>Eğer elinde hiç ekipman yoksa sahne setleri neredeyse her zaman daha mantıklı. Ayrı ayrı alındığında gitar + amfi + kablo + kılıf toplamı, set fiyatının üzerine çıkar. Halihazırda bir amfin varsa ve sadece gitarı yenilemek istiyorsan tek gitar almak daha doğru olur.</p>

<h2>Kargo ve ödeme</h2>
<p>Tüm elektro gitar siparişleri özel ambalajla gönderilir. 2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR altyapısı üzerinden alınır ve taksit seçenekleri ürün sayfasında görüntülenir.</p>
`,
      faq: [
        { q: 'Yeni başlayan biri için hangi elektro gitar uygun?', a: 'HSS manyetik dizilimli, ST kasa bir model en dengeli başlangıçtır: tek gitarla hem temiz hem distortion tonları karşılar. Hiç ekipmanın yoksa amfi ve kablo içeren bir sahne seti almak, parçaları ayrı ayrı almaktan daha ekonomik olur.' },
        { q: 'Elektro gitar amfisiz çalınır mı?', a: 'Çalınır ama sesi çok kısıktır — sessiz bir odada ancak kendi duyabileceğin kadar. Pratik yapmak için amfi ya da kulaklık çıkışı olan bir arayüz gerekir. Apartmanda çalışacaksan kulaklık destekli mini amfiler en pratik çözümdür.' },
        { q: 'SSS ve HSS manyetik arasındaki fark nedir?', a: 'SSS üç single coil manyetik demektir; ince, parlak ve vintage bir ton verir. HSS ise köprüde humbucker taşır, bu da daha kalın ve yüksek çıkışlı bir ses sağlar. Rock ve metal çalacaksan HSS, blues ve funk ağırlıklı çalacaksan SSS daha uygundur.' },
        { q: 'Elektro gitar teli ne zaman değiştirilir?', a: 'Tel matlaştığında, üzerinde pas veya kir birikmesi başladığında ya da akordu tutmakta zorlandığında değiştirilir. Düzenli çalan biri için ortalama iki-üç ay, ara sıra çalan için altı aya kadar çıkabilir.' },
        { q: 'Elektro gitar siparişinde kargo ücreti var mı?', a: '2.000 TL ve üzeri siparişlerde kargo ücretsizdir. 2.000 TL altındaki siparişlerde 199 TL kargo bedeli uygulanır. Gitarlar darbeye karşı özel ambalajla gönderilir.' },
      ],
      related: ['yeni-baslayan-elektro-gitar', 'kucuk-mekan-buyuk-ses', 'enstruman-bakimi-101'],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'elektronik-davul',
      short: "Elektronik Davul",
      cats: ['dijital-bateri', 'drums'],
      minProducts: 3,
      h1: 'Elektronik Davul ve Dijital Bateri Setleri',
      title: 'Elektronik Davul Setleri ve Fiyatları | Nota Müzik Market',
      metaDesc: 'Apartmanda çalınabilen elektronik davul ve dijital bateri setleri. Kulaklıkla sessiz çalışma, pad sayısı, hi-hat pedalı ve başlangıç seti seçim rehberi.',
      keywords: 'elektronik davul, dijital bateri, bateri takımı, profesyonel davul, sessiz davul seti, apartmanda davul',
      intro: 'Davul çalmak isteyip komşu endişesiyle vazgeçenler için elektronik davul tam bir çözüm. Kulaklık taktığın anda oda sessizleşir, sen tam sesi duyarsın. Aşağıda setleri ve altında hangi setin kime uygun olduğunu anlatan rehberi bulacaksın.',
      body: `
<h2>Elektronik davul akustik davuldan ne kadar sessiz?</h2>
<p>Elektronik davulun ana avantajı ses seviyesini tamamen senin kontrolüne vermesi. Kulaklık taktığında odaya yayılan tek ses, bagetin kauçuk ya da mesh pad'e çarpma sesidir — bu da normal bir konuşma sesinin altında kalır. Akustik bir davul setinin 100 desibeli aşabildiği düşünülürse, apartman için aradaki fark belirleyicidir.</p>
<p>Tamamen sessiz demek doğru olmaz: darbe sesi ve özellikle kick pedalının zemine ilettiği titreşim alt kata geçebilir. Bu titreşimi kesmek için setin altına kalın bir halı veya yalıtım paspası sermek çok işe yarar.</p>

<h2>Mesh pad mi, kauçuk pad mi?</h2>
<p>Pad, bagetle vurduğun yüzeydir ve iki ana tipi vardır:</p>
<ul>
  <li><strong>Kauçuk pad</strong> — daha sert bir geri tepme verir, daha ekonomiktir, vuruş sesi biraz daha yüksektir. Başlangıç setlerinde yaygındır.</li>
  <li><strong>Mesh (file) pad</strong> — gergin file yüzey, gerçek deriye çok daha yakın bir his ve belirgin şekilde daha sessiz bir vuruş sunar. Gerginliği ayarlanabilen modellerde geri tepmeyi kendine göre kurabilirsin.</li>
</ul>
<p>Uzun süre çalışacaksan ve apartmanda oturuyorsan mesh pad'li setler kayda değer bir konfor farkı yaratır.</p>

<h2>Kaç pad'lik set almalıyım?</h2>
<p>Standart bir başlangıç seti genelde şunları içerir: bir trampet, üç tom, bir kick (bas davul) tetikleyici, bir hi-hat ve bir-iki zil pad'i. Bu dizilim gerçek bir davul setinin temel yerleşimini karşılar ve öğrenirken kas hafızasını doğru kurmanı sağlar. Daha az pad'li kompakt setler yer sıkıntısı olan odalar için uygundur ama ileride akustik sete geçecekseniz alışma süreci biraz uzar.</p>

<h2>Hi-hat pedalı neden önemli?</h2>
<p>Hi-hat, davulda ritmi taşıyan ana parçadır ve açık-kapalı geçişleri müziğin nefes almasını sağlar. Ayrı hi-hat pedalı olan setlerde bu geçişi ayağınla kontrol edersin — yani gerçek davulda öğreneceğin tekniği birebir çalışırsın. Pedalsız, sadece anahtarla açık/kapalı yapan basit sistemler öğrenmeyi sınırlar. Setin ürün açıklamasında "hi-hat pedallı" ifadesini aramanı öneririz.</p>

<h2>Çocuk için elektronik davul</h2>
<p>Çocuklar için tasarlanmış başlangıç setleri daha küçük gövdeli, daha alçak stand yüksekliğine sahip ve genellikle kulaklık ile baget hediyeli gelir. Burada asıl kritik nokta boy değil, motivasyon: elektronik setin kulaklıkla çalışabilmesi, çocuğun "gürültü yapma" uyarısı almadan istediği saatte pratik yapabilmesi anlamına gelir. Bu da düzenli çalışma alışkanlığının önündeki en büyük engeli kaldırır.</p>

<h2>Katlanabilir ve taşınabilir setler</h2>
<p>Rulo şeklinde toplanabilen veya baget üzerine sensör yerleştiren taşınabilir sistemler, yer kaplamaması ve seyahatte kullanılabilmesiyle öne çıkar. Gerçek bir setin his ve dinamiğini tam vermezler, ancak ritim çalışması, egzersiz ve "her yerde pratik yapma" ihtiyacı için oldukça kullanışlıdırlar.</p>

<h2>Yanında alman gerekenler</h2>
<ul>
  <li><strong>Kulaklık</strong> — kapalı kulak üstü modeller sızıntıyı azaltır. Setle birlikte hediye gelen modeller başlangıç için yeterlidir.</li>
  <li><strong>Baget</strong> — 5A en yaygın ve en dengeli kalınlıktır. Kırılma ihtimaline karşı yedek bulundurmak iyi fikir.</li>
  <li><strong>Tabure</strong> — yükseklik ayarlı bir tabure duruşunu düzeltir ve uzun çalışmada bel ağrısını önler.</li>
  <li><strong>Yalıtım paspası</strong> — kick titreşimini alt kata iletmemek için.</li>
</ul>

<h2>Kargo ve ödeme</h2>
<p>2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR güvenli ödeme altyapısı üzerinden alınır, taksit seçenekleri ürün sayfasında listelenir.</p>
`,
      faq: [
        { q: 'Elektronik davul apartmanda çalınır mı?', a: 'Evet, elektronik davulun en büyük avantajı budur. Kulaklık taktığında odaya yayılan tek ses bagetin pad\'e çarpma sesidir. Kick pedalının zemine ilettiği titreşimi de azaltmak için setin altına kalın halı veya yalıtım paspası sermeniz önerilir.' },
        { q: 'Mesh pad ile kauçuk pad arasındaki fark nedir?', a: 'Mesh (file) pad gerçek davul derisine daha yakın bir his verir ve belirgin şekilde daha sessizdir; birçok modelde gerginliği ayarlanabilir. Kauçuk pad daha sert geri teper, daha ekonomiktir ve vuruş sesi biraz daha yüksektir.' },
        { q: 'Elektronik davul için kulaklık şart mı?', a: 'Sessiz çalışmak istiyorsan şart. Kulaklık olmadan setin sesini hoparlörden vermen gerekir ki bu da elektronik davulun sessizlik avantajını ortadan kaldırır. Kapalı kulak üstü modeller en iyi sonucu verir.' },
        { q: 'Çocuğum için kaç yaşında elektronik davul alabilirim?', a: 'Genellikle 6-7 yaş civarında baget tutup koordinasyon kurmak mümkün hale gelir. Çocuklar için tasarlanmış başlangıç setleri daha alçak stand yüksekliğine sahiptir. Kulaklıkla çalışılabilmesi, çocuğun saat kısıtı olmadan pratik yapabilmesini sağladığı için düzenli çalışmayı kolaylaştırır.' },
        { q: 'Hi-hat pedallı set almak gerekli mi?', a: 'Gerçek davul tekniğini öğrenmek istiyorsan evet. Ayrı hi-hat pedalı açık-kapalı geçişini ayağınla kontrol etmeni sağlar; bu akustik sete geçtiğinde birebir kullanacağın tekniktir. Pedalsız sistemler bu tekniği çalışmanı sınırlar.' },
      ],
      related: ['sessiz-davul-aeroband', 'disa-donukler-davul', 'cocuga-ilk-enstruman'],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'dijital-piyano',
      short: "Dijital Piyano",
      cats: ['piyanolar'],
      minProducts: 3,
      h1: 'Dijital Piyano Modelleri ve Fiyatları',
      title: 'Dijital Piyano Fiyatları — 88 Tuş Çekiç Aksiyonlu | Nota Müzik Market',
      metaDesc: '88 tuş çekiç aksiyonlu dijital piyano modelleri ve fiyatları. Tuş hassasiyeti, polifoni, mobilyalı ve standlı modeller arasındaki farkları anlatan seçim rehberi.',
      keywords: 'dijital piyano, dijital piyano fiyatları, elektronik piyano, piyano, 88 tuş dijital piyano, çekiçli tuş piyano',
      intro: 'Dijital piyano, akustik piyanonun tuş hissini elektronik bir gövdede sunar: akort gerektirmez, kulaklıkla sessiz çalışılır ve çok daha az yer kaplar. Aşağıda modelleri, altında ise "88 tuş" ve "çekiç aksiyonu" gibi terimlerin ne anlama geldiğini bulacaksın.',
      body: `
<h2>88 tuş neden standart?</h2>
<p>Akustik bir konser piyanosunda 88 tuş vardır ve klasik repertuvarın tamamı bu aralığa göre yazılmıştır. 61 veya 76 tuşlu enstrümanlar başlangıçta yeterli gelir, ancak repertuvar ilerledikçe parçanın en pes ya da en tiz notasına ulaşamama sorunu çıkar. Piyano eğitimi almayı ya da klasik parçalar çalışmayı planlıyorsan 88 tuş, ileride enstrüman değiştirmemek için en doğru başlangıçtır.</p>

<h2>Çekiç aksiyonu (hammer action) nedir?</h2>
<p>Bu, dijital piyanoyu keyboard'dan ayıran en önemli özelliktir. Akustik piyanoda tuşa bastığında bir çekiç teli tokatlar; pes tuşlardaki çekiçler daha ağır, tiz tuşlardakiler daha hafiftir. Bu yüzden akustik piyanonun sol tarafı sağ tarafından daha ağır hissettirir.</p>
<p>Çekiç aksiyonlu dijital piyanolar bu mekanik ağırlığı fiziksel olarak taklit eder. Önemi şurada: parmak kaslarını doğru geliştirmeni sağlar. Hafif tuşlu bir enstrümanda çalışıp sonra akustik piyanoya oturan biri, tuşların beklediğinden çok ağır geldiğini fark eder ve tekniğini baştan kurmak zorunda kalır. "Kademeli çekiç" ifadesi ise bu ağırlık farkının klavye boyunca aşamalandırıldığını gösterir — akustik hissine en yakın sistemdir.</p>

<h2>Tuş hassasiyeti (velocity) ne işe yarar?</h2>
<p>Hassasiyet, tuşa ne kadar hızlı bastığının sesin gürlüğünü etkilemesidir. Bu olmadan enstrüman her vuruşta aynı seviyede ses çıkarır ve müzikten ifade tamamen kaybolur — ne kreşendo yapabilirsin ne de bir melodiyi eşlikten öne çıkarabilirsin. Çok kademeli hassasiyet ayarı sunan modellerde bu tepkiyi kendi dokunuşuna göre ayarlayabilirsin.</p>

<h2>Polifoni kaç olmalı?</h2>
<p>Polifoni, enstrümanın aynı anda çalabildiği maksimum nota sayısıdır. "Ben aynı anda on parmakla çalıyorum, 10 yeter" diye düşünmek yanıltıcı: sustain pedalına bastığında önceki notalar sönerken çalmaya devam eder ve sayaca eklenir. Buna bir de katmanlı ses (örneğin piyano + yaylı) eklenirse rakam hızla büyür. 64 polifoni başlangıç için yeterlidir; 128 ve üzeri, pedal yoğun klasik parçalarda nota kesilmesi yaşamamanı garanti eder.</p>

<h2>Mobilyalı mı, standlı mı?</h2>
<ul>
  <li><strong>Mobilyalı (konsol) modeller</strong> — ahşap gövde ve sabit ayak yapısıyla gelir, genellikle üç pedal içerir. Evde sabit bir yere kurulacaksa hem görsel olarak hem sağlamlık açısından daha iyidir.</li>
  <li><strong>Metal standlı modeller</strong> — daha hafiftir, sökülüp taşınabilir. Öğrenci evi, küçük daire veya ders/sahne için taşınacak enstrümanlarda pratiktir.</li>
</ul>

<h2>Pedal meselesi</h2>
<p>En az bir sustain (damper) pedalı şarttır — piyano repertuvarının neredeyse tamamı pedal kullanır. Mobilyalı modellerde üç pedal (sustain, sostenuto, soft) sabit gelir. Standlı modellerde çoğunlukla tek pedal verilir; bu başlangıç ve orta seviye için yeterlidir.</p>

<h2>Akort ve bakım</h2>
<p>Dijital piyanonun en rahat yanlarından biri: akort gerektirmez. Akustik piyano yılda bir-iki kez akortçu çağırmayı gerektirirken dijital piyano ilk günkü perdesini korur. Nem ve sıcaklık değişimlerinden de etkilenmez. Bakımı tozdan korumak ve tuşları nemli olmayan yumuşak bir bezle silmekten ibarettir.</p>

<h2>Kulaklıkla çalışma</h2>
<p>Kulaklık girişi, apartmanda ya da geç saatte çalışmak isteyenler için belirleyici bir özelliktir. Kulaklık takıldığında hoparlörler devre dışı kalır ve enstrüman dışarıya hiç ses vermez. Piyano çalışmasının uzun ve tekrarlı doğası düşünülürse bu, ev içi huzur açısından küçümsenmeyecek bir avantajdır.</p>

<h2>Kargo ve ödeme</h2>
<p>Dijital piyanolar hacimli ürünlerdir ve özel ambalajla gönderilir. 2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR üzerinden alınır ve taksit seçenekleri ürün sayfasında görüntülenir.</p>
`,
      faq: [
        { q: 'Dijital piyano ile keyboard arasındaki fark nedir?', a: 'En temel fark tuş yapısı: dijital piyano 88 çekiç aksiyonlu ağırlıklı tuş taşır ve akustik piyano hissini taklit eder. Keyboard ise genellikle 61 hafif tuşludur, onlarca ses ve ritim sunar. Piyano eğitimi alacaksan dijital piyano, çok sesli aranjman ve eşlik yapacaksan keyboard uygundur.' },
        { q: '88 tuş şart mı, 61 tuş yetmez mi?', a: '61 tuş başlangıçta yeterli gelir ama klasik repertuvar 88 tuşa göre yazılmıştır. Piyano eğitimi almayı planlıyorsan ilerledikçe parçanın en pes veya en tiz notasına ulaşamama sorunu yaşarsın. İleride enstrüman değiştirmemek için 88 tuşla başlamak daha ekonomiktir.' },
        { q: 'Çekiç aksiyonlu tuş ne demek?', a: 'Akustik piyanodaki çekiç mekanizmasının ağırlığını fiziksel olarak taklit eden tuş sistemidir. Pes tuşlar daha ağır, tiz tuşlar daha hafif hisseder. Parmak kaslarını doğru geliştirir; hafif tuşlu enstrümanda çalışan biri akustik piyanoya geçtiğinde tekniğini baştan kurmak zorunda kalır.' },
        { q: 'Dijital piyano akort gerektirir mi?', a: 'Hayır. Dijital piyano sesi elektronik olarak ürettiği için ilk günkü perdesini korur, nem ve sıcaklık değişimlerinden etkilenmez. Akustik piyanonun yılda bir-iki kez gerektirdiği akort masrafı dijitalde yoktur.' },
        { q: 'Polifoni sayısı ne kadar önemli?', a: 'Aynı anda çalınabilen maksimum nota sayısıdır. Sustain pedalına bastığında sönmekte olan notalar da sayılır, katmanlı ses kullanırsan rakam hızla artar. 64 polifoni başlangıç için yeterli, 128 ve üzeri pedal yoğun klasik parçalarda nota kesilmesini önler.' },
      ],
      related: ['dijital-piyano-mu-keyboard-mu', 'kisiligine-gore-enstruman', 'ice-donukler-icin-enstruman'],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'klasik-gitar',
      short: "Klasik Gitar",
      cats: ['klasik'],
      minProducts: 3,
      h1: 'Klasik Gitar Modelleri ve Fiyatları',
      title: 'Klasik Gitar Fiyatları ve Modelleri | Nota Müzik Market',
      metaDesc: 'Naylon telli klasik gitar modelleri, 3/4 ve 4/4 boy seçenekleri ve fiyatları. Elektro klasik gitar farkı ve başlangıç için doğru boyu seçme rehberi.',
      keywords: 'klasik gitar, klasik gitar fiyatları, elektro klasik gitar, naylon telli gitar, 3/4 klasik gitar',
      intro: 'Klasik gitar, naylon telleri ve geniş sapıyla müziğe başlamanın en yumuşak yollarından biri. Parmak ucunu daha az yorar, akustik olarak yeterince gürdür ve hiçbir ek ekipman gerektirmez. Aşağıda modeller, altında boy ve tel seçimi rehberi var.',
      body: `
<h2>Klasik gitar neden başlangıç için önerilir?</h2>
<p>Klasik gitarın naylon telleri, çelik telli akustik gitarlara kıyasla parmak ucuna belirgin şekilde daha az baskı yapar. İlk haftalarda parmak uçlarının acıması, müziğe yeni başlayanların en sık pes etme sebeplerinden biridir; naylon tel bu eşiği ciddi biçimde düşürür. Ayrıca sapı daha geniş olduğu için parmaklar teller arasında birbirine değmeden yerleşir — akor basmayı öğrenirken bu büyük kolaylık sağlar.</p>
<p>Bir diğer avantaj: amfi, kablo, pena gibi hiçbir ek ekipman gerektirmez. Gitarı kutudan çıkarıp akort ettiğin an çalmaya başlayabilirsin.</p>

<h2>Boy seçimi: 4/4 mü, 3/4 mü?</h2>
<p>Klasik gitarlar standart ölçülerle üretilir ve doğru boy, özellikle çocuklarda öğrenme hızını doğrudan etkiler. Kabaca:</p>
<ul>
  <li><strong>4/4 (tam boy)</strong> — yaklaşık 12 yaş ve üzeri, yetişkinler. Standart ölçü.</li>
  <li><strong>3/4</strong> — yaklaşık 8-12 yaş arası çocuklar ve küçük yapılı gençler.</li>
  <li><strong>1/2</strong> — yaklaşık 6-8 yaş arası.</li>
</ul>
<p>Ölçüyü belirlerken yaş tek başına yeterli değil; kolun uzunluğu daha belirleyicidir. Basit bir kontrol: çocuk gitarı normal çalma pozisyonunda tutarken sol kolunu rahatça uzatıp sapın en uç perdesine parmak ucuyla ulaşabiliyorsa boy doğrudur. Omuz yukarı kalkıyor veya vücut yana eğiliyorsa gitar büyük demektir. Büyük gitar sadece zor değil, yanlış duruş alışkanlığı da kazandırır.</p>

<h2>Elektro klasik gitar nedir?</h2>
<p>Elektro klasik, normal bir klasik gitarın gövdesine manyetik ve preamp yerleştirilmiş halidir. Akustik olarak tıpkı klasik gitar gibi çalınır — ama kabloyla amfiye ya da ses sistemine bağlanabilir. Sahnede, kilisede, düğünde veya kayıt yaparken mikrofon kurmadan doğrudan hat çıkışı vermeni sağlar. Evde çalacaksan ihtiyacın yoktur; sahne veya kayıt planın varsa fark yaratır.</p>
<p>"İnce kasa" (thinline) modeller ise gövde derinliği azaltılmış elektro klasiklerdir. Akustik hacimden bir miktar feda ederler ama kucakta çok daha rahat dururlar ve amfiden çalındığında bu fark önemsizleşir.</p>

<h2>Naylon tel bakımı</h2>
<p>Naylon teller çelik tellere göre daha uzun ömürlüdür çünkü paslanmazlar. Yine de zamanla esnekliklerini kaybederler: ton matlaşır, akort tutmaz ve özellikle sarımlı bas teller pürüzlenir. Düzenli çalan biri için altı ay ile bir yıl arası bir değişim aralığı makuldür.</p>
<p>Yeni takılan naylon teller birkaç gün boyunca sürekli akorttan düşer — bu bir arıza değil, naylonun gerilim altında uzamasının doğal sonucudur. İlk hafta her çalışma öncesi akort etmen normaldir; sonrasında oturur.</p>

<h2>Yanında alman gerekenler</h2>
<ul>
  <li><strong>Kılıf</strong> — gitarın en kırılgan noktası sap-gövde birleşimidir; taşıma sırasında koruma şart.</li>
  <li><strong>Akort aleti</strong> — klipsli akortçular gürültülü ortamda telefon uygulamasından daha güvenilirdir.</li>
  <li><strong>Ayak taburesi veya destek</strong> — klasik gitar oturuşunda sol ayağın yükseltilmesi doğru duruş için önemlidir.</li>
  <li><strong>Yedek tel</strong> — tel kopması genelde en olmadık anda olur.</li>
</ul>

<h2>Kargo ve ödeme</h2>
<p>Gitarlar darbeye karşı özel ambalajla gönderilir. 2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR güvenli ödeme altyapısı üzerinden alınır.</p>
`,
      faq: [
        { q: 'Klasik gitar mı akustik gitar mı ile başlamalıyım?', a: 'Klasik gitarın naylon telleri parmak ucunu çok daha az yorar ve geniş sapı akor basmayı kolaylaştırır, bu yüzden başlangıç için genellikle daha rahattır. Çalmak istediğin müzik pop/rock ağırlıklıysa ve çelik telin parlak tonunu istiyorsan akustik gitara da başlayabilirsin.' },
        { q: 'Çocuğum için kaç numara klasik gitar almalıyım?', a: 'Kabaca 6-8 yaş için 1/2, 8-12 yaş için 3/4, 12 yaş ve üzeri için 4/4 tam boy uygundur. Ama yaştan çok kol uzunluğu belirleyicidir: çocuk normal çalma pozisyonunda sapın en uç perdesine omzunu kaldırmadan ulaşabiliyorsa boy doğrudur.' },
        { q: 'Elektro klasik gitar ile klasik gitar arasındaki fark nedir?', a: 'Elektro klasik, klasik gitarın gövdesine manyetik ve preamp eklenmiş halidir. Akustik olarak aynı şekilde çalınır ama kabloyla amfiye veya ses sistemine bağlanabilir. Evde çalacaksan gerekmez; sahne, düğün veya kayıt planın varsa mikrofon kurmadan doğrudan hat çıkışı verir.' },
        { q: 'Klasik gitar teli ne sıklıkla değişir?', a: 'Naylon teller paslanmadığı için çelik tellerden uzun ömürlüdür. Düzenli çalan biri için altı ay ile bir yıl arası makul bir aralıktır. Ton matlaştığında, akort tutmadığında veya sarımlı bas teller pürüzlendiğinde değiştirilir.' },
        { q: 'Yeni taktığım teller neden sürekli akorttan düşüyor?', a: 'Bu normaldir. Naylon teller gerilim altında birkaç gün boyunca uzamaya devam eder. İlk hafta her çalışma öncesi akort etmen gerekebilir, sonrasında akort oturur ve stabil hale gelir.' },
      ],
      related: ['cocuga-ilk-enstruman', 'kisiligine-gore-enstruman', 'enstruman-bakimi-101'],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'cajon-darbuka',
      short: "Cajon & Darbuka",
      cats: ['perkusyon'],
      minProducts: 3,
      h1: 'Cajon ve Darbuka Modelleri',
      title: 'Cajon ve Darbuka Fiyatları | Nota Müzik Market',
      metaDesc: 'Cajon ve darbuka modelleri ile fiyatları. Üzerine oturup çalınan cajon, çocuk cajonları ve darbuka arasındaki farkları anlatan seçim rehberi.',
      keywords: 'cajon, cajon fiyatları, darbuka, perküsyon, kahon, çocuk cajon',
      intro: 'Cajon ve darbuka, koca bir davul seti kurmadan ritim çalmanın en pratik yolları. İkisi de tek parça, taşınabilir ve elle çalınır. Aşağıda modeller, altında hangisinin sana uygun olduğunu anlatan rehber var.',
      body: `
<h2>Cajon nedir?</h2>
<p>Cajon, üzerine oturup ön yüzüne elle vurarak çalınan kutu biçiminde bir perküsyon enstrümanıdır. İspanyolca'da "sandık" anlamına gelir ve Peru kökenlidir. Tek bir kutudan bütün bir davul setinin temel seslerini çıkarabilmesi onu bu kadar popüler yaptı: ön yüzün üst kenarına vurduğunda trampet benzeri çıtırtılı bir ses, ortasına vurduğunda kick davul gibi derin bir bas alırsın.</p>
<p>Çoğu cajonun içinde gergin teller veya bir bahar bulunur; trampetin karakteristik "hışırtılı" tınısını veren şey budur. Bu sayede akustik bir sahne performansında tek başına ritim bölümünü taşıyabilir.</p>

<h2>Cajon kimlere uygun?</h2>
<p>Cajon şu durumlarda öne çıkar:</p>
<ul>
  <li><strong>Yer sorunu varsa</strong> — bir davul setinin kapladığı alanın onda birini kaplar, oturma taburesi görevi bile görür.</li>
  <li><strong>Akustik çalıyorsan</strong> — gitar eşliğinde davul seti çoğu zaman fazla gelir; cajon dengeyi bozmaz.</li>
  <li><strong>Taşıman gerekiyorsa</strong> — tek parça, kolay taşınır, kurulum gerektirmez.</li>
  <li><strong>Bütçe kısıtlıysa</strong> — ritim öğrenmenin en ekonomik giriş noktalarından biridir.</li>
</ul>
<p>Çocuklar için üretilen daha küçük gövdeli cajonlar da vardır. Bunlar hem oturma yüksekliği hem de vuruş yüzeyi açısından küçük bedenlere göre ölçeklendirilmiştir; standart bir cajona oturan çocuk ayaklarını yere basamadığı için doğru pozisyon alamaz.</p>

<h2>Darbuka nedir, cajondan farkı ne?</h2>
<p>Darbuka, kadeh biçimli gövdesi ve tek deri yüzeyiyle Orta Doğu ve Anadolu müziğinin temel ritim enstrümanıdır. Kucakta ya da bacak üstünde yatay tutularak çalınır. Cajondan en belirgin farkı ses karakteri: darbuka çok daha keskin, tiz ve parmak vuruşlarına duyarlıdır. "Dum" (merkeze vurulan derin ses) ve "tek" (kenara vurulan keskin ses) olmak üzere iki ana vuruş üzerine kurulu zengin bir teknik geleneği vardır.</p>
<p>Kabaca ayırmak gerekirse: pop, akustik, latin ve batı müziği eşliği için cajon; Türk halk müziği, arabesk, oryantal ve Orta Doğu ritimleri için darbuka daha doğal durur.</p>

<h2>Cajon nasıl çalınır? Başlangıç ipuçları</h2>
<ul>
  <li><strong>Oturuş</strong> — cajonun üstüne otur, hafifçe öne eğil. Ayaklar yere tam bassın.</li>
  <li><strong>Bas (kick) sesi</strong> — ön yüzün orta bölgesine avuç içinin dolgun kısmıyla vur, eli hemen çek. Elini yüzeyde bırakırsan ses boğulur.</li>
  <li><strong>Trampet sesi</strong> — üst kenara, parmak uçlarıyla vur. Buradaki teller devreye girer ve çıtırtılı ton oluşur.</li>
  <li><strong>İlk ritim</strong> — bas–trampet–bas–trampet dizisi neredeyse tüm pop şarkılarının temel kalıbıdır. Yavaş başla, metronomla çalış.</li>
</ul>

<h2>Bakım</h2>
<p>Cajon ahşap bir gövdedir; nemden ve doğrudan güneşten uzak tutulmalıdır. Radyatör yanında ya da rutubetli bir bodrumda bırakılan gövde zamanla çatlayabilir. Ön yüzeyi (tapa) temizlemek için kuru veya çok hafif nemli yumuşak bez yeterlidir; kimyasal temizleyici kullanma.</p>
<p>Darbukada ise deri yüzey kritik: alüminyum gövdeli modellerde genelde sentetik deri kullanılır ve bu nem değişimlerine dayanıklıdır. Yine de aşırı sıcak ya da soğukta bırakmamak, derinin gerginliğini korur.</p>

<h2>Kargo ve ödeme</h2>
<p>2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR güvenli ödeme altyapısı üzerinden alınır.</p>
`,
      faq: [
        { q: 'Cajon nedir, nasıl çalınır?', a: 'Cajon, üzerine oturup ön yüzüne elle vurarak çalınan kutu biçiminde bir perküsyon enstrümanıdır. Ön yüzün ortasına vurduğunda kick davul gibi derin bir bas, üst kenarına vurduğunda içindeki teller sayesinde trampet benzeri çıtırtılı bir ses alırsın. Tek kutudan davul setinin temel seslerini verir.' },
        { q: 'Cajon mu darbuka mı almalıyım?', a: 'Çalacağın müziğe bağlı. Pop, akustik gitar eşliği, latin ve batı müziği için cajon daha uygundur. Türk halk müziği, arabesk, oryantal ve Orta Doğu ritimleri için darbuka daha doğal durur. Darbuka daha keskin ve parmak vuruşlarına duyarlı, cajon daha geniş ve davul setine yakın bir ses verir.' },
        { q: 'Cajon çalmak zor mu, nota bilmek gerekir mi?', a: 'Nota bilgisi gerekmez. İki temel vuruşu (bas ve trampet) öğrendiğinde çoğu pop şarkısına eşlik edebilirsin. Ritim duygusu ve metronomla düzenli çalışma, teknik bilgiden daha belirleyicidir.' },
        { q: 'Çocuk için cajon uygun mu?', a: 'Evet, ama boyu önemli. Çocuklar için üretilen küçük gövdeli cajonlar hem oturma yüksekliği hem vuruş yüzeyi açısından ölçeklendirilmiştir. Standart bir cajona oturan çocuk ayaklarını yere basamadığı için doğru pozisyon alamaz ve rahat çalamaz.' },
        { q: 'Cajon apartmanda çalınabilir mi?', a: 'Davul setine göre çok daha sessizdir ama tamamen sessiz değildir; bas vuruşları alt kata iletilebilir. Altına kalın bir halı sermek titreşimi belirgin şekilde azaltır. Gece geç saatler dışında çoğu apartmanda sorun yaratmaz.' },
      ],
      related: ['disa-donukler-davul', 'kisiligine-gore-enstruman', 'cocuga-ilk-enstruman'],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'keman',
      short: "Keman",
      cats: ['kemanlar', 'strings'],
      minProducts: 3,
      h1: 'Keman Modelleri ve Fiyatları',
      title: 'Keman Fiyatları — 4/4 ve 3/4 Keman Setleri | Nota Müzik Market',
      metaDesc: 'El yapımı keman modelleri, 4/4 ve 3/4 boy seçenekleri ve tam setler. Yay, reçine, kılıf dahil setler ve doğru keman boyunu seçme rehberi.',
      keywords: 'keman, keman fiyatları, 4/4 keman, 3/4 keman, keman seti, el yapımı keman',
      intro: 'Keman, öğrenmesi sabır isteyen ama karşılığını fazlasıyla veren bir enstrüman. Doğru boy ve tam bir set ile başlamak, ilk aylardaki zorluğu ciddi biçimde azaltır. Aşağıda modeller, altında boy seçimi ve başlangıç rehberi var.',
      body: `
<h2>Keman boyu nasıl belirlenir?</h2>
<p>Keman, perdesiz bir enstrüman olduğu için doğru boy diğer enstrümanlardan daha kritiktir. Büyük gelen bir keman sadece rahatsız etmez; sol kolun açısını bozar, parmak aralıklarını yanlış öğretir ve entonasyonu (nota doğruluğunu) baştan sakatlar.</p>
<p>Ölçüm yöntemi basittir: kişi kolunu yana doğru omuz hizasında düz uzatır. Boyundaki çene bölgesinden avuç içinin ortasına kadar olan mesafe ölçülür. Kabaca:</p>
<ul>
  <li><strong>4/4 (tam boy)</strong> — yaklaşık 58 cm ve üzeri kol mesafesi; genellikle 12 yaş ve üstü ile yetişkinler.</li>
  <li><strong>3/4</strong> — yaklaşık 53-58 cm; genellikle 9-12 yaş.</li>
  <li><strong>1/2</strong> — yaklaşık 48-53 cm; genellikle 7-9 yaş.</li>
</ul>
<p>Sınırdaysan küçük olanı tercih et. Küçük keman zorlanmadan çalınır ve teknik doğru oturur; büyük keman ise yanlış duruş alışkanlığı kazandırır ve bunu sonradan düzeltmek çok daha zordur.</p>

<h2>Tam set ne içerir, neden önemli?</h2>
<p>Keman tek başına çalınamaz — yanında en az yay ve reçine olması şarttır. Tam setler bu parçaları bir arada verir:</p>
<ul>
  <li><strong>Yay</strong> — kemanın sesini üreten asıl parça. Kılları gergin olmalı, çalışma sonrası mutlaka gevşetilmelidir.</li>
  <li><strong>Reçine</strong> — yay kıllarına sürtünme kazandıran katı reçine. Reçinesiz yay tel üzerinde kayar ve neredeyse hiç ses çıkmaz. Yeni başlayanların "kemanım ses vermiyor" şikayetinin en yaygın sebebi budur.</li>
  <li><strong>Omuz yastığı</strong> — kemanı omuz ile çene arasında kavratır. Onsuz enstrümanı tutmak için sol el devreye girer ve sol elin parmakları serbest kalamaz.</li>
  <li><strong>Kılıf</strong> — keman ince ahşaptan yapılmıştır ve darbeye karşı hassastır.</li>
</ul>

<h2>Reçine nasıl kullanılır?</h2>
<p>Yeni bir yayın kılları fabrika çıkışında hiç reçine görmemiştir. İlk kullanımdan önce reçineyi yay kıllarına baştan uca, orta baskıyla ve birkaç dakika boyunca sürtmen gerekir — ilk uygulamada beklediğinden uzun sürer. Sonrasında her birkaç çalışmada bir kısa bir tazeleme yeterlidir. Aşırı reçine ise cırtlak ve tozlu bir ton yapar; dengeyi kulağınla bulacaksın.</p>

<h2>Akort ve ilk haftalar</h2>
<p>Kemanın dört teli pesten tize G–D–A–E olarak akort edilir. İnce ayar için kuyruk takozundaki ince ayar vidaları, büyük ayar için burgular kullanılır. Yeni bir kemanda burgular sıkı olabilir; zorlarken teli koparmamak için yavaş ve sabırlı hareket et.</p>
<p>İlk haftalarda çıkan cırtlak sesler normaldir. Bunun sebebi genellikle üç şeyden biridir: yayın tele fazla ya da az baskı yapması, yayın telle dik açıyı kaybetmesi ya da yayın köprüye çok yaklaşması. Yayı köprü ile klavye arasındaki orta bölgede, tele dik tutarak çalışmak bu sorunların çoğunu çözer.</p>

<h2>Bakım</h2>
<p>Her çalışmadan sonra iki şey yap: teller ve gövde üzerindeki reçine tozunu kuru yumuşak bir bezle sil, ve yayın kıllarını gevşet. Gergin bırakılan yay zamanla kavisini kaybeder ve çubuk kalıcı olarak düzleşebilir. Kemanı ani sıcaklık değişimlerinden ve doğrudan güneşten koru; ahşap gövde çalışır ve çatlayabilir.</p>

<h2>Kargo ve ödeme</h2>
<p>Kemanlar kılıfı içinde ve ek koruma ambalajıyla gönderilir. 2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR üzerinden alınır.</p>
`,
      faq: [
        { q: 'Keman boyu nasıl ölçülür?', a: 'Kolunu yana doğru omuz hizasında düz uzat; çene bölgesinden avuç içinin ortasına kadar olan mesafeyi ölç. Yaklaşık 58 cm ve üzeri 4/4 tam boy, 53-58 cm arası 3/4, 48-53 cm arası 1/2 kemana denk gelir. Sınırdaysan daima küçük olanı seç.' },
        { q: 'Keman setinde neler olmalı?', a: 'En az keman, yay, reçine, omuz yastığı ve kılıf bulunmalıdır. Reçine olmadan yay tel üzerinde kayar ve keman neredeyse hiç ses vermez; omuz yastığı olmadan da sol el enstrümanı tutmakla meşgul olduğu için parmaklar serbest kalamaz.' },
        { q: 'Kemanım neden ses vermiyor?', a: 'En yaygın sebep yaya hiç reçine sürülmemiş olmasıdır. Yeni bir yayın kılları fabrika çıkışında reçine görmemiştir; ilk kullanımdan önce baştan uca, orta baskıyla birkaç dakika reçine sürmen gerekir. Bu ilk uygulama beklediğinden uzun sürer.' },
        { q: 'Çocuğum kaç yaşında kemana başlayabilir?', a: 'Genellikle 6-7 yaş civarında 1/2 veya daha küçük boy kemanla başlanabilir. Belirleyici olan yaş değil kol uzunluğu ve çocuğun dikkat süresidir. Keman perdesiz olduğu için düzenli ve kısa çalışmalar, seyrek uzun çalışmalardan çok daha verimlidir.' },
        { q: 'Çalıştıktan sonra yayı gevşetmek gerekir mi?', a: 'Evet, mutlaka. Gergin bırakılan yay zamanla kavisini kaybeder ve çubuk kalıcı olarak düzleşebilir. Her çalışma sonunda yayı gevşetmek ve teller üzerindeki reçine tozunu kuru bezle silmek, enstrümanın ömrünü belirgin şekilde uzatır.' },
      ],
      related: ['keman-kimlere-gore', 'ice-donukler-icin-enstruman', 'enstruman-bakimi-101'],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'davul-bageti',
      short: "Davul Bageti",
      cats: ['aksesuar-davul'],
      include: /baget|çubu/i,
      exclude: /ped[iı]\b|pad[iı]?\b/i,
      minProducts: 3,
      h1: 'Davul Bageti ve Baget Takımları',
      title: 'Davul Bageti Fiyatları — 5A Baget Modelleri | Nota Müzik Market',
      metaDesc: 'Akçaağaç ve renkli davul bageti modelleri, 5A ve 5B kalınlıkları, ışıklı bagetler. Doğru baget kalınlığını seçme ve baget ömrünü uzatma rehberi.',
      keywords: 'davul bageti, baget, 5A baget, bateri bageti, akçaağaç baget, davul çubuğu',
      intro: 'Baget, davulcunun elindeki tek temas noktası — ve şaşırtıcı biçimde tonu, hızı ve yorulmayı doğrudan etkiler. Aşağıda modeller, altında hangi kalınlığın kime uygun olduğunu anlatan rehber var.',
      body: `
<h2>Baget numaraları ne anlama geliyor?</h2>
<p>Baget üzerindeki 7A, 5A, 5B, 2B gibi kodlar bir standarttan çok gelenekten gelir ama pratikte tutarlı bir anlam taşırlar. İki bileşeni var:</p>
<ul>
  <li><strong>Rakam</strong> — kabaca çapı belirtir ve ters çalışır: rakam <em>küçüldükçe</em> baget kalınlaşır. 7A ince, 5A orta, 2B kalındır.</li>
  <li><strong>Harf</strong> — kullanım alanını gösterir. <strong>A</strong> (orchestra) daha ince ve hafif, <strong>B</strong> (band) daha kalın ve ağırdır. <strong>S</strong> (street) en kalın gruptur, bando ve marş davulları içindir.</li>
</ul>

<h2>Hangi kalınlığı seçmeliyim?</h2>
<ul>
  <li><strong>5A</strong> — en yaygın ve en güvenli başlangıç. Ağırlık ile kontrol arasında dengeli; pop, rock, funk, jazz dahil neredeyse her tarzda iş görür. Ne almanı bilmiyorsan 5A al.</li>
  <li><strong>7A</strong> — daha ince ve hafif. Jazz, akustik setler ve sessiz çalışma için. Küçük eller ve çocuklar için de rahattır.</li>
  <li><strong>5B</strong> — 5A'dan kalın. Daha yüksek ses ve daha güçlü vuruş sağlar; rock ve daha sert tarzlar için tercih edilir. Uzun çalışmalarda bileği daha çok yorar.</li>
</ul>
<p>Çocuklar ve yeni başlayanlar için 7A veya 5A ideal. Kalın baget başlangıçta "daha sağlam" gibi görünse de, bilek tekniği henüz oturmamışken fazladan ağırlık yorulmayı hızlandırır ve hız gelişimini yavaşlatır.</p>

<h2>Ahşap türü: akçaağaç, meşe, ceviz</h2>
<ul>
  <li><strong>Akçaağaç (maple)</strong> — en hafif tür. Hızlı pasajlarda ve kontrol gerektiren çalışmalarda avantajlı, bileği en az yoran seçenek. Buna karşılık en çabuk aşınan türdür.</li>
  <li><strong>Ceviz (hickory)</strong> — orta ağırlıkta ve titreşimi iyi emer. Dayanıklılık ile his arasında en dengeli tercih; profesyonellerin en çok kullandığı türdür.</li>
  <li><strong>Meşe (oak)</strong> — en ağır ve en dayanıklı. En uzun ömürlüdür ama titreşimi daha çok bileğe iletir.</li>
</ul>

<h2>Uç (tip) şekli tonu nasıl değiştirir?</h2>
<p>Bagetin ucu zile ve deriye temas eden yüzeydir; şekli tınıyı belirgin biçimde etkiler. Yuvarlak uçlar zilden odaklanmış, net bir ton çıkarır. Damla ve fıçı biçimli uçlar daha geniş ve dolgun bir ses verir. Naylon uçlu bagetler ise zilde daha parlak ve keskin bir tınla sonuçlanır, ayrıca ahşap uca göre daha uzun ömürlüdür.</p>

<h2>Baget ne zaman değiştirilir?</h2>
<p>Bagetler tükenen malzemedir; kırılmadan da değiştirilmeleri gerekebilir. Şu işaretlere bak:</p>
<ul>
  <li>Gövdede çatlak veya kıymık — hemen değiştir, çalarken elini kesebilir.</li>
  <li>Uçta belirgin aşınma veya yassılaşma — ton bozulur, zile temas alanı değişir.</li>
  <li>Baget masaya yuvarlandığında zıplayarak dönüyorsa eğrilmiştir; çift kullanımda dengesizlik yaratır.</li>
  <li>İki bagetin sesi birbirinden farklı geliyorsa çift olarak değiştir.</li>
</ul>
<p>Düzenli çalışan biri için yedek bir çift bulundurmak neredeyse zorunludur — baget genelde en olmadık anda kırılır.</p>

<h2>Işıklı bagetler</h2>
<p>Hareket duyarlı LED'li bagetler karanlık ortamda görsel bir etki yaratır. Sahne ve gösteri amaçlıdırlar; ağırlık dengesi standart ahşap bagetlerden farklı olabileceği için ana çalışma bageti olarak değil, ek olarak düşünülmelidir.</p>

<h2>Kargo ve ödeme</h2>
<p>2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR güvenli ödeme altyapısı üzerinden alınır.</p>
`,
      faq: [
        { q: '5A baget ne demek, hangi kalınlığı seçmeliyim?', a: '5A orta kalınlıkta, en yaygın kullanılan baget ölçüsüdür ve neredeyse her tarzda iş görür — ne alacağını bilmiyorsan 5A al. Rakam küçüldükçe baget kalınlaşır: 7A ince ve hafif, 5B daha kalın ve güçlü, 2B en kalın gruptandır.' },
        { q: 'A ve B harfleri arasındaki fark nedir?', a: 'A (orchestra) daha ince ve hafif bagetleri, B (band) daha kalın ve ağır olanları belirtir. A tipi kontrol ve hız gerektiren tarzlarda, B tipi daha yüksek ses ve güçlü vuruş isteyen rock gibi tarzlarda tercih edilir.' },
        { q: 'Akçaağaç baget mi ceviz baget mi daha iyi?', a: 'Akçaağaç en hafiftir, hızlı pasajlarda avantaj sağlar ve bileği en az yorar ama en çabuk aşınır. Ceviz orta ağırlıktadır, titreşimi iyi emer ve dayanıklılık ile his arasında en dengeli seçenektir. Meşe en dayanıklı ama en ağır olanıdır.' },
        { q: 'Baget ne zaman değiştirilmeli?', a: 'Gövdede çatlak veya kıymık varsa hemen değiştir. Uçta belirgin aşınma, masada yuvarlandığında zıplayarak dönme (eğrilme) veya iki bagetin sesinin farklılaşması da değişim işaretidir. Bagetler çift olarak değiştirilmelidir.' },
        { q: 'Çocuk için hangi baget uygun?', a: '7A veya 5A uygundur. Kalın baget başlangıçta daha sağlam görünse de, bilek tekniği oturmamışken fazladan ağırlık yorulmayı hızlandırır ve hız gelişimini yavaşlatır. Hafif baget doğru tekniği kurmayı kolaylaştırır.' },
      ],
      related: ['enstruman-bakimi-101', 'disa-donukler-davul', 'sessiz-davul-aeroband'],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'davul-calisma-pedi',
      short: "Davul Çalışma Pedi",
      cats: ['aksesuar-davul'],
      include: /ped[iı]\b|pad[iı]?\b/i,
      minProducts: 3,
      h1: 'Davul Çalışma Pedi ve Antrenman Setleri',
      title: 'Davul Çalışma Pedi Fiyatları — Sessiz Antrenman | Nota Müzik Market',
      metaDesc: 'Standlı davul çalışma pedi ve antrenman setleri. Sessiz pratik, rudiment çalışması ve doğru bilek tekniği için pad seçim rehberi.',
      keywords: 'davul çalışma pedi, antrenman pedi, sessiz davul, practice pad, davul egzersiz pedi, bateri çalışma seti',
      intro: 'Çalışma pedi, davulun en sessiz ve en ucuz parçası — ama teknik gelişiminde en belirleyicilerinden biri. Profesyoneller bile ısınmalarının çoğunu pad üzerinde yapar. Aşağıda modeller, altında nasıl kullanılacağı var.',
      body: `
<h2>Çalışma pedi ne işe yarar?</h2>
<p>Çalışma pedi (practice pad), üzerine bagetle vurularak davul derisinin geri tepmesini taklit eden küçük bir yüzeydir. Amacı ses çıkarmak değil, tam tersi: neredeyse hiç ses çıkarmadan vuruş tekniğini çalıştırmak.</p>
<p>Davulda ilerlemenin büyük kısmı el tekniğinden gelir — vuruşların eşitliği, bilek kontrolü, hız ve dinamik farkları. Bunların hiçbiri koca bir set kurmayı gerektirmez. Bu yüzden çalışma pedi hem yeni başlayanların ilk aylarında hem de profesyonellerin günlük ısınmasında kullanılır.</p>

<h2>Kimler için mantıklı?</h2>
<ul>
  <li><strong>Apartmanda oturanlar</strong> — pad'in sesi bagetin yüzeye çarpma sesinden ibarettir; saat kısıtı olmadan çalışabilirsin.</li>
  <li><strong>Henüz set almamış olanlar</strong> — davula başlamak için önce set almak zorunda değilsin. Temel teknikleri pad üzerinde öğrenip sete sonra geçebilirsin.</li>
  <li><strong>Seyahat edenler</strong> — çantaya girer, otel odasında bile çalışabilirsin.</li>
  <li><strong>Set sahibi olanlar</strong> — ısınma ve rudiment çalışması için sete oturmaya gerek yoktur.</li>
</ul>

<h2>Standlı mı, masaüstü mü?</h2>
<p>Standsız pad'ler masaya ya da kucağa konulur; ucuzdur ve taşınması kolaydır. Ancak doğru yükseklik ayarlanamadığı için uzun çalışmalarda omuz ve bilek açısı bozulur.</p>
<p>Standlı modeller pad'i gerçek bir trampet yüksekliğine getirir. Bunun önemi şu: sete geçtiğinde kaslarının öğrendiği açı ve mesafe birebir aynı olur. Ciddi çalışacaksan yükseklik ayarlı stand kayda değer bir fark yaratır.</p>

<h2>Pad üzerinde ne çalışılır?</h2>
<p>Pad çalışmasının çekirdeği "rudiment" denilen temel vuruş kalıplarıdır. Başlangıç için üç tanesi yeterli:</p>
<ul>
  <li><strong>Single stroke roll</strong> — sağ-sol-sağ-sol, tek tek. Eşitlik ve hız için temel.</li>
  <li><strong>Double stroke roll</strong> — sağ-sağ-sol-sol. Bilek ve parmak kontrolünü geliştirir.</li>
  <li><strong>Paradiddle</strong> — sağ-sol-sağ-sağ / sol-sağ-sol-sol. Setteki geçişlerin temelini oluşturur.</li>
</ul>
<p>Metronom olmadan pad çalışması yarım kalır. Yavaş bir tempoda (örneğin 60 BPM) başla, vuruşlar tamamen eşitlenene kadar tempoyu artırma. Hız, eşitlik oturduktan sonra kendiliğinden gelir.</p>

<h2>Günde ne kadar çalışmalı?</h2>
<p>Pad çalışmasında süre değil düzen önemlidir. Günde 15 dakika düzenli çalışmak, haftada bir 2 saat çalışmaktan çok daha hızlı sonuç verir. Kas hafızası tekrar sıklığıyla oluşur. Ayrıca kısa seanslar bilek zorlanmasını da önler.</p>

<h2>Tam setler ne içerir?</h2>
<p>Kataloğumuzdaki antrenman setleri genellikle pad, ayarlanabilir metal stand, bir çift 5A baget ve taşıma çantasından oluşur. Bu kombinasyon, ayrı ayrı satın almaya göre hem daha ekonomiktir hem de eksik parça kalmaz — özellikle ilk kez alıyorsan setle başlamak daha pratiktir.</p>

<h2>Kargo ve ödeme</h2>
<p>2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR güvenli ödeme altyapısı üzerinden alınır.</p>
`,
      faq: [
        { q: 'Davul çalışma pedi ne işe yarar?', a: 'Bagetle üzerine vurularak davul derisinin geri tepmesini taklit eden sessiz bir yüzeydir. Vuruş eşitliği, bilek kontrolü, hız ve dinamik çalışmayı koca bir set kurmadan yapmanı sağlar. Profesyoneller bile günlük ısınmalarının çoğunu pad üzerinde yapar.' },
        { q: 'Sadece pad ile davul öğrenilir mi?', a: 'Temel el tekniğinin tamamı pad üzerinde öğrenilebilir — vuruş eşitliği, rudimentler, bilek kontrolü. Ancak ayak koordinasyonu (kick ve hi-hat pedalı) ve setteki geçişler için eninde sonunda bir sete geçmen gerekir. Pad, sete geçişi çok kolaylaştırır.' },
        { q: 'Standlı pad almak gerekli mi?', a: 'Ciddi çalışacaksan evet. Standlı model pad\'i gerçek trampet yüksekliğine getirir, böylece kaslarının öğrendiği açı ve mesafe sete geçtiğinde birebir aynı olur. Standsız pad\'lerde yükseklik ayarlanamadığı için uzun çalışmalarda omuz ve bilek açısı bozulur.' },
        { q: 'Pad üzerinde günde ne kadar çalışmalıyım?', a: 'Süre değil düzen önemlidir. Günde 15 dakika düzenli çalışmak, haftada bir kez 2 saat çalışmaktan çok daha hızlı sonuç verir çünkü kas hafızası tekrar sıklığıyla oluşur. Kısa seanslar bilek zorlanmasını da önler.' },
        { q: 'Çalışma pedi gerçekten sessiz mi?', a: 'Elektronik davuldan bile sessizdir; çıkan tek ses bagetin kauçuk yüzeye çarpma sesidir ve normal konuşma sesinin altında kalır. Apartmanda saat kısıtı olmadan çalışmak için en uygun seçenektir.' },
      ],
      related: ['sessiz-davul-aeroband', 'disa-donukler-davul', 'enstruman-bakimi-101'],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'gitar-teli',
      short: "Gitar Teli",
      cats: ['aksesuar-gitar'],
      include: /\btel(i|leri)?\b/i,
      exclude: /keman|viyola|çello/i,
      minProducts: 3,
      h1: 'Gitar Teli Modelleri ve Fiyatları',
      title: 'Gitar Teli Fiyatları — Elektro, Akustik, Klasik | Nota Müzik Market',
      metaDesc: 'Elektro, akustik ve klasik gitar teli setleri ve fiyatları. 09-42 ve 10-47 kalınlıkları, tel değişim zamanı ve doğru set seçme rehberi.',
      keywords: 'gitar teli, gitar teli fiyatları, elektro gitar teli, akustik gitar teli, klasik gitar teli, 09-42 tel',
      intro: 'Gitar teli, enstrümanının sesini en ucuza en çok değiştiren parçası. Yanlış set aldığında gitarın sapına zarar bile verebilirsin. Aşağıda setler, altında hangi telin hangi gitara gittiğini anlatan rehber var.',
      body: `
<h2>Önce en önemlisi: gitar tipine uygun tel al</h2>
<p>Bu, yeni başlayanların en sık ve en pahalıya mal olan hatasıdır. Üç ana tel ailesi birbirinin yerine kullanılamaz:</p>
<ul>
  <li><strong>Klasik gitar telleri (naylon)</strong> — yumuşak, düşük gerilimli. Klasik gitarların sapı ve gövdesi bu düşük gerilime göre tasarlanmıştır.</li>
  <li><strong>Akustik gitar telleri (bronz/fosfor bronz)</strong> — çelik, yüksek gerilimli. Ahşap gövdeyi akustik olarak sürmek için tasarlanmıştır.</li>
  <li><strong>Elektro gitar telleri (nikel/çelik)</strong> — manyetik alanı etkileyecek şekilde üretilmiştir. Akustik gitar telinden daha ince ve daha düşük gerilimlidir.</li>
</ul>
<p><strong>Klasik gitara çelik tel takmak</strong> en tehlikeli hatadır: klasik gitarın sapında çelik telin yarattığı gerilime dayanacak bir takviye çubuğu (truss rod) çoğunlukla yoktur. Sap eğilir, köprü yerinden kalkabilir ve gitar kalıcı olarak hasar görür. Klasik gitar naylon tel kullanır — istisnası yoktur.</p>

<h2>Kalınlık (gauge) ne anlama geliyor?</h2>
<p>09-42 ya da 10-47 gibi rakamlar, setin en ince telinin ve en kalın telinin inç cinsinden kalınlığını gösterir. 09-42, en ince telin 0.009 inç olduğu anlamına gelir.</p>
<ul>
  <li><strong>09-42 (ince / light)</strong> — elektro gitarda en yaygın başlangıç seti. Basması kolay, bükmesi (bending) rahat. Parmak ucu henüz nasır tutmamış yeni başlayanlar için en affedici seçenek.</li>
  <li><strong>10-46 (orta)</strong> — biraz daha kalın ton ve daha fazla sustain. Parmaklar alıştıktan sonra doğal geçiş noktası. Düşük akortlarda tel gevşemesini önler.</li>
  <li><strong>10-47 (akustik, light)</strong> — akustik gitarda yaygın başlangıç kalınlığı. Akustik teller elektro tellerden daha kalın olur çünkü gövdeyi sürecek enerjiyi üretmeleri gerekir.</li>
</ul>

<h2>Kalınlık değiştirirken dikkat</h2>
<p>Setler arasında büyük bir sıçrama yaparsan (örneğin 09'dan 11'e) sapa binen toplam gerilim değişir ve gitarın ayarı bozulabilir: tel yüksekliği değişir, perdeler vızıldayabilir. Bir kademe (09'dan 10'a) geçişlerde çoğu gitar sorunsuz uyum sağlar; daha büyük atlamalarda gitarın ayarını yaptırmak gerekebilir.</p>

<h2>Tel ne zaman değiştirilir?</h2>
<p>Kopmasını beklemek yaygın ama yanlış bir alışkanlık. Şu işaretler zamanı geldiğini gösterir:</p>
<ul>
  <li><strong>Ton matlaştı</strong> — yeni telin parlaklığı gitti, ses cansız duyuluyor.</li>
  <li><strong>Akort tutmuyor</strong> — çaldıkça sürekli akorttan düşüyor.</li>
  <li><strong>Görünür pas veya kararma</strong> — özellikle sarımlı bas tellerde.</li>
  <li><strong>Pürüzlenme</strong> — parmağını tel üzerinde kaydırdığında pürüz hissediyorsan sarım aşınmıştır.</li>
</ul>
<p>Kaba bir zamanlama: her gün çalan biri için 1-2 ay, haftada birkaç kez çalan için 3-4 ay, ara sıra çalan için 6 aya kadar. Terli el ve nemli ortam bu süreleri belirgin şekilde kısaltır.</p>

<h2>Tel ömrünü uzatma</h2>
<p>En etkili iki alışkanlık basit: <strong>çalmadan önce ellerini yıka</strong> ve <strong>çaldıktan sonra telleri kuru bezle sil</strong>. Tellerin ana düşmanı elden geçen ter ve yağdır; bunlar sarımın altına girip içeriden korozyona yol açar. Sadece bu iki alışkanlık tel ömrünü belirgin biçimde uzatır.</p>

<h2>Takarken</h2>
<p>Telleri teker teker değiştirmek, hepsini birden çıkarmaktan daha güvenlidir — sapa binen gerilim aniden sıfırlanmaz. Yeni takılan teller ilk birkaç gün akorttan düşer; bu normaldir, tel gerilim altında oturuyordur. Her teli taktıktan sonra hafifçe çekip germek bu süreci kısaltır.</p>

<h2>Kargo ve ödeme</h2>
<p>2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR güvenli ödeme altyapısı üzerinden alınır.</p>
`,
      faq: [
        { q: 'Klasik gitara çelik tel takılır mı?', a: 'Hayır, kesinlikle takılmamalıdır. Klasik gitarın sapında çelik telin yarattığı yüksek gerilime dayanacak takviye çubuğu (truss rod) çoğunlukla bulunmaz. Sap eğilir, köprü yerinden kalkabilir ve gitar kalıcı hasar görür. Klasik gitar yalnızca naylon tel kullanır.' },
        { q: '09-42 ve 10-46 arasındaki fark nedir?', a: 'Rakamlar setin en ince ve en kalın telinin inç cinsinden kalınlığıdır. 09-42 daha ince olduğu için basması ve bükmesi kolaydır, yeni başlayanlar için idealdir. 10-46 daha kalın bir ton ve daha fazla sustain verir, parmaklar alıştıktan sonra doğal geçiş noktasıdır.' },
        { q: 'Gitar teli ne sıklıkla değiştirilmeli?', a: 'Her gün çalan biri için 1-2 ay, haftada birkaç kez çalan için 3-4 ay, ara sıra çalan için 6 aya kadar. Ton matlaştığında, akort tutmadığında, tellerde pas göründüğünde veya parmak kaydırırken pürüz hissettiğinde değiştir — kopmasını bekleme.' },
        { q: 'Tel kalınlığını değiştirmek gitara zarar verir mi?', a: 'Bir kademelik geçişlerde (09\'dan 10\'a) çoğu gitar sorunsuz uyum sağlar. Büyük sıçramalarda (09\'dan 11\'e) sapa binen toplam gerilim belirgin değişir; tel yüksekliği bozulabilir ve perdeler vızıldayabilir. Bu durumda gitarın ayarını yaptırmak gerekir.' },
        { q: 'Tellerin ömrü nasıl uzatılır?', a: 'İki basit alışkanlık en etkilisidir: çalmadan önce elleri yıkamak ve çaldıktan sonra telleri kuru yumuşak bir bezle silmek. Tellerin ana düşmanı elden geçen ter ve yağdır; bunlar sarımın altına girerek içeriden korozyona yol açar.' },
      ],
      related: ['enstruman-bakimi-101', 'yeni-baslayan-elektro-gitar'],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'gitar-kablosu',
      short: "Gitar Kablosu",
      cats: ['aksesuar-gitar'],
      include: /kablo/i,
      minProducts: 3,
      h1: 'Gitar Kablosu ve Jak Kabloları',
      title: 'Gitar Kablosu Fiyatları — 3M ve 6M Jak Kablo | Nota Müzik Market',
      metaDesc: 'Profesyonel gitar kablosu ve mono jak kablo modelleri. 3 metre ve 6 metre seçenekleri, ekranlama, cızırtı sorunları ve kablo seçim rehberi.',
      keywords: 'gitar kablosu, jak kablo, enstrüman kablosu, 6 metre gitar kablosu, mono jak kablo',
      intro: 'Kablo, gitar zincirinin en çok küçümsenen ama en çok soruna yol açan parçası. Cızırtı, sinyal kaybı ve sahnede kesilen sesin çoğu kablodan gelir. Aşağıda modeller, altında neye dikkat edeceğin var.',
      body: `
<h2>Enstrüman kablosu hoparlör kablosundan farklıdır</h2>
<p>Dışarıdan aynı görünseler de bu iki kablo tamamen farklı işler için üretilir ve karıştırılmaları sorun çıkarır. Enstrüman kablosu <strong>ekranlıdır</strong>: iç iletkenin etrafını saran metal örgü, dışarıdan gelen elektriksel gürültüyü toplayıp toprağa aktarır. Gitar manyetiğinin ürettiği sinyal çok zayıf olduğu için bu koruma şarttır — olmadığı zaman kablo bir anten gibi davranır ve floresan lambadan telefona kadar her şeyin gürültüsünü toplar.</p>
<p>Hoparlör kablosu ise ekransızdır ve yüksek akım taşımak için kalın iletkenlere sahiptir. Gitar-amfi arasına hoparlör kablosu takarsan uğultu ve cızırtı alırsın.</p>

<h2>Uzunluk seçimi: 3 metre mi 6 metre mi?</h2>
<p>Kablo uzadıkça <strong>kapasitans</strong> artar ve bu, sinyalin yüksek frekanslarını bir miktar yutar — yani ton hafifçe matlaşır. Bu etki birkaç metrede fark edilmez ama çok uzun kablolarda duyulur hale gelir.</p>
<ul>
  <li><strong>3 metre</strong> — ev, stüdyo ve oturarak çalışma için ideal. Ayak altında dolaşmaz, ton kaybı ihmal edilebilir.</li>
  <li><strong>6 metre</strong> — sahne, prova odası ve ayakta hareket ederek çalmak için. Amfiden uzaklaşma özgürlüğü verir.</li>
</ul>
<p>Genel kural: ihtiyacın olan en kısa kabloyu al. Gereğinden uzun kablo hem ton kaybı hem de dolanma sorunu demektir.</p>

<h2>Mono jak nedir?</h2>
<p>Gitar kablolarında kullanılan 6.35 mm (1/4 inç) <strong>mono</strong> (TS) jak, ucunda tek bir siyah halka taşır. Pasif gitar manyetikleri tek kanallı sinyal ürettiği için mono jak doğru olandır. Ucunda iki halka olan stereo (TRS) jaklar kulaklık ve dengeli hat bağlantıları içindir; gitar-amfi arasında kullanılmaz.</p>

<h2>Cızırtı ve kopukluk nereden gelir?</h2>
<p>Bir kablo arızalandığında belirtiler tanıdıktır: kabloyu oynattığında ses kesiliyor, sürekli cızırtı var ya da ses tamamen gidip geliyor. Sebepler:</p>
<ul>
  <li><strong>Lehim çatlağı</strong> — en yaygın arıza. Jak ucunda, kablonun sürekli bükülen kısmında oluşur.</li>
  <li><strong>Ekran kopması</strong> — dış örgü kopmuşsa gürültü koruması ortadan kalkar; sürekli uğultu alırsın.</li>
  <li><strong>Kirli jak</strong> — oksitlenen jak ucu temassızlık yapar. Kuru bez veya kontak temizleyiciyle silinebilir.</li>
</ul>
<p>Sorunun kablodan mı geldiğini anlamanın en hızlı yolu: başka bir kabloyla dene. Cızırtı gidiyorsa suçlu bulunmuştur.</p>

<h2>Kablo ömrünü uzatma</h2>
<p>Kablonun düşmanı keskin bükülmedir. Sarma şekli doğrudan ömrünü belirler: kabloyu dirsek etrafına gergin sarmak iç iletkeni zorlar. Bunun yerine gevşek halkalar yapıp bir kablo bağıyla tutturmak, jak diplerine yük binmesini önler. Ayrıca kabloyu jakından tutup çekerek prizden çıkarma alışkanlığı lehim noktalarını hızla yorar — daima jak gövdesinden tutarak çıkar.</p>

<h2>Yedek kablo</h2>
<p>Sahnede ya da provada çalan herkesin çantasında yedek bir kablo bulunmalıdır. Kablo arızası genellikle uyarı vermeden, tam performans sırasında ortaya çıkar ve başka hiçbir parça onun yerini tutamaz.</p>

<h2>Kargo ve ödeme</h2>
<p>2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR güvenli ödeme altyapısı üzerinden alınır.</p>
`,
      faq: [
        { q: 'Gitar kablosu ile hoparlör kablosu aynı mı?', a: 'Hayır. Gitar (enstrüman) kablosu ekranlıdır; iç iletkeni saran metal örgü dış gürültüyü engeller. Gitar manyetiğinin sinyali çok zayıf olduğu için bu koruma şarttır. Hoparlör kablosu ekransızdır ve gitar-amfi arasına takıldığında uğultu ve cızırtı yapar.' },
        { q: '3 metre mi 6 metre gitar kablosu mu almalıyım?', a: 'Evde ve stüdyoda oturarak çalışacaksan 3 metre yeterlidir ve ayak altında dolaşmaz. Sahnede veya prova odasında ayakta hareket edeceksen 6 metre gerekir. Genel kural: ihtiyacın olan en kısa kabloyu al, çünkü uzunluk arttıkça ton hafifçe matlaşır.' },
        { q: 'Kablomdan cızırtı geliyor, sebebi ne olabilir?', a: 'En yaygın sebep jak ucundaki lehim çatlağıdır — kabloyu oynattığında ses kesiliyorsa bu neredeyse kesindir. Ekran örgüsünün kopması sürekli uğultuya, jak ucunun oksitlenmesi ise temassızlığa yol açar. Başka bir kabloyla deneyerek sorunu hızlıca teyit edebilirsin.' },
        { q: 'Mono jak ne demek?', a: '6.35 mm jak ucunda tek siyah halka bulunan bağlantı tipidir (TS). Pasif gitar manyetikleri tek kanallı sinyal ürettiği için gitar kablolarında mono jak kullanılır. İki halkalı stereo (TRS) jaklar kulaklık ve dengeli hat bağlantıları içindir.' },
        { q: 'Kablo nasıl sarılmalı?', a: 'Dirsek etrafına gergin sarmak iç iletkeni zorlar ve lehim noktalarını yorar. Bunun yerine gevşek halkalar yapıp kablo bağıyla tutturmak gerekir. Ayrıca kabloyu kablodan çekerek değil, daima jak gövdesinden tutarak çıkarmalısın.' },
      ],
      related: ['enstruman-bakimi-101', 'kucuk-mekan-buyuk-ses'],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'gitar-kilifi',
      short: "Gitar Kılıfı",
      cats: ['aksesuar-gitar'],
      include: /k[iı]l[iı]f/i,
      minProducts: 3,
      h1: 'Gitar Kılıfı Modelleri',
      title: 'Gitar Kılıfı Fiyatları — Klasik ve Akustik | Nota Müzik Market',
      metaDesc: 'Klasik ve akustik gitar kılıfı modelleri, 3/4 ve 4/4 boy seçenekleri. Gitarını taşırken koruyacak doğru kılıfı seçme rehberi.',
      keywords: 'gitar kılıfı, klasik gitar kılıfı, akustik gitar kılıfı, gitar çantası, 4/4 gitar kılıfı',
      intro: 'Gitarların büyük çoğunluğu çalınırken değil, taşınırken hasar görür. Doğru kılıf, enstrümanının en ucuz sigortası. Aşağıda modeller, altında boy ve koruma seviyesi rehberi var.',
      body: `
<h2>Kılıf neden gerekli?</h2>
<p>Gitar ince ahşap levhalardan yapılmış, içi boş bir gövdedir. Dayanıklı görünse de iki yeri özellikle kırılgandır: <strong>sap ile gövdenin birleştiği bölge</strong> ve <strong>kafa (headstock)</strong>. Gitar elden kaydığında ya da bir yere çarptığında kırılan yer neredeyse her zaman burasıdır — ve sap kırığı, çoğu zaman gitarın değerinden pahalıya mal olan bir tamirdir.</p>
<p>İkinci risk daha sinsi: sıcaklık ve nem. Kışın soğuk arabadan sıcak eve giren bir gitar ani genleşme yaşar; bu, cila çatlaklarına ve derz açılmalarına yol açabilir. Yastıklı bir kılıf bu geçişi yavaşlatarak ahşağa nefes alacak zaman tanır.</p>

<h2>Doğru boyu seç</h2>
<p>Kılıf gitarın boyuna göre alınmalıdır. Kataloğumuzda başlıca üç seçenek var:</p>
<ul>
  <li><strong>4/4 klasik gitar kılıfı</strong> — tam boy klasik gitarlar için (yaklaşık 12 yaş ve üzeri).</li>
  <li><strong>3/4 klasik gitar kılıfı</strong> — 3/4 boy gitarlar için (yaklaşık 8-12 yaş).</li>
  <li><strong>Akustik gitar kılıfı</strong> — çelik telli akustik gitarların gövde formuna göre kesilmiştir.</li>
</ul>
<p>Neden akustik ve klasik kılıfı ayrı? Akustik gitarların gövdesi genellikle daha derin ve omuz hattı farklıdır. Klasik kılıfa akustik gitar zorlanarak sokulduğunda fermuar gerilir ve gövdeye baskı biner. Büyük kılıfa küçük gitar koymak da güvenli değildir: içeride sallanan gitar, kılıfın koruma amacını ortadan kaldırır.</p>

<h2>Yastık kalınlığı ve koruma seviyesi</h2>
<p>Kılıflar koruma açısından kabaca üçe ayrılır:</p>
<ul>
  <li><strong>İnce kılıf (gigbag)</strong> — toz ve çiziğe karşı korur, darbeye karşı çok az. Sadece evde saklama veya çok kısa mesafeler için.</li>
  <li><strong>Yastıklı kılıf</strong> — 10-20 mm sünger dolgu. Günlük taşıma, okul, ders ve toplu taşıma için en dengeli seçenek. Çoğu kullanıcı için doğru olan budur.</li>
  <li><strong>Sert kutu (hardcase)</strong> — en yüksek koruma, en ağır ve en hacimli. Uçak ve uzun yol taşımaları için.</li>
</ul>

<h2>Nelere bakmalı?</h2>
<ul>
  <li><strong>Sırt askıları</strong> — çift askı gitarı sırt çantası gibi taşımanı sağlar; tek omuz askısı uzun mesafede omzu yorar ve gitarın dengesini bozar.</li>
  <li><strong>Fermuar kalitesi</strong> — kılıfın en sık bozulan parçasıdır. Geniş dişli fermuarlar daha uzun ömürlüdür.</li>
  <li><strong>Kafa bölgesi dolgusu</strong> — headstock en kırılgan yer olduğu için o bölgede ekstra sünger olması önemlidir.</li>
  <li><strong>Cep</strong> — tel, pena, akortçu ve kablo için ön cep pratikte çok işe yarar.</li>
</ul>

<h2>Gitarı kılıfta saklamak</h2>
<p>Gitarı kullanmadığında kılıfta saklamak tozdan ve ani nem değişimlerinden korur. Uzun süre saklayacaksan telleri tamamen gevşetmene gerek yok — ama bir tam ton kadar indirmek sapa binen gerilimi azaltır. Kılıfı radyatör yanında, doğrudan güneş alan bir pencere önünde veya rutubetli bir bodrumda bırakma.</p>

<h2>Kargo ve ödeme</h2>
<p>2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR güvenli ödeme altyapısı üzerinden alınır.</p>
`,
      faq: [
        { q: 'Klasik gitar kılıfına akustik gitar sığar mı?', a: 'Genellikle sığmaz veya zorlanarak girer. Akustik gitarların gövdesi daha derin ve omuz hattı farklıdır; zorlandığında fermuar gerilir ve gövdeye baskı biner. Gitar tipine uygun kılıf almak gerekir.' },
        { q: '3/4 gitarım için 4/4 kılıf alabilir miyim?', a: 'Alınabilir ama önerilmez. Büyük kılıf içinde gitar sallanır ve bu, kılıfın darbe koruma amacını ortadan kaldırır. Taşıma sırasında gitar kılıfın içinde hareket ederek kafa veya sap bölgesinden zarar görebilir.' },
        { q: 'İnce kılıf yeterli mi, yastıklı mı almalıyım?', a: 'İnce kılıf (gigbag) sadece toz ve çiziğe karşı korur, darbeye karşı neredeyse hiç koruma sağlamaz. Gitarını okula, derse veya toplu taşımayla taşıyacaksan 10-20 mm sünger dolgulu yastıklı kılıf almalısın. Çoğu kullanıcı için doğru seçim yastıklı olandır.' },
        { q: 'Gitar en çok nerede hasar görür?', a: 'Sap ile gövdenin birleştiği bölge ve kafa (headstock) kısmı en kırılgan yerlerdir. Gitar elden kaydığında veya bir yere çarptığında kırılan yer neredeyse her zaman burasıdır. Bu yüzden kılıfın kafa bölgesinde ekstra dolgu olması önemlidir.' },
        { q: 'Gitarı sürekli kılıfta saklamak zararlı mı?', a: 'Aksine faydalıdır; tozdan ve ani nem değişimlerinden korur. Sadece kılıfı radyatör yanında, doğrudan güneş alan pencere önünde veya rutubetli bir bodrumda bırakmamaya dikkat et. Uzun süreli saklamada telleri bir tam ton indirmek sapa binen gerilimi azaltır.' },
      ],
      related: ['enstruman-bakimi-101', 'cocuga-ilk-enstruman'],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'amfi-pedal',
      short: "Amfi & Pedal",
      cats: ['amfi-pedal'],
      plus: ['m-vave-tank-mini-gitar-multi-efekt-pedali-sarj-edilebilir-bluetooth-ve-ir-destekli-pinkir'],
      minProducts: 3,
      h1: 'Gitar Amfisi ve Efekt Pedalları',
      title: 'Mini Gitar Amfisi ve Efekt Pedalı Fiyatları | Nota Müzik Market',
      metaDesc: 'Bluetooth destekli mini gitar amfisi ve çok efektli pedal modelleri. Kulaklıkla sessiz çalışma, IR desteği ve ev tipi amfi seçim rehberi.',
      keywords: 'gitar amfisi, mini amfi, efekt pedalı, kulaklık amfisi, bluetooth amfi, multi efekt',
      intro: 'Elektro gitar tek başına duyulmaz — sesi amfi verir, karakteri ise efektler. Ev için dev bir amfiye ihtiyacın yok; küçük amfiler ve modelleme pedalları bugün şaşırtıcı derecede yetenekli. Aşağıda modeller ve seçim rehberi var.',
      body: `
<h2>Ev için kaç watt amfi gerekir?</h2>
<p>Yeni başlayanların en yaygın yanılgısı "watt ne kadar yüksekse o kadar iyi" düşüncesidir. Gerçekte ev kullanımı için düşük watt daha iyidir. Sebebi şu: lambalı ya da modelleme amfiler karakteristik tonlarını belli bir ses seviyesinde vermeye başlar. Büyük bir amfiyi ev seviyesinde kısık çalarsan hem güzel tonunu alamazsın hem de boşuna yer ve para harcamış olursun.</p>
<p>Ev çalışması, kulaklıkla pratik ve küçük oda kayıtları için kompakt amfiler fazlasıyla yeterlidir. Küçük prova ve akustik sahne için orta seviye, davullu grup provası içinse belirgin şekilde daha güçlü sistemler gerekir.</p>

<h2>Kulaklık çıkışı: apartmanın kurtarıcısı</h2>
<p>Kulaklık çıkışı olan bir amfi, elektro gitarı gecenin herhangi bir saatinde çalışılabilir hale getirir. Kulaklık takıldığında hoparlör devre dışı kalır ve dışarıya hiç ses çıkmaz — üstelik hoparlörden duyulmayan detayları da duyarsın. Apartmanda oturuyorsan bu özelliği listenin en üstüne koy.</p>

<h2>Bluetooth ne işe yarar?</h2>
<p>Bluetooth destekli amfiler telefonundan şarkı çalıp üzerine gitar çalmanı sağlar. Bu basit gibi görünen özellik pratikte çok değerlidir: parçaya eşlik ederek çalışmak, ritim duygusunu ve akort hassasiyetini metronomdan daha hızlı geliştirir. Ayrıca amfiyi kullanmadığın zamanlarda küçük bir hoparlör olarak da iş görür.</p>

<h2>IR desteği nedir?</h2>
<p>IR (Impulse Response), gerçek bir hoparlör kabinin ve mikrofon yerleşiminin akustik parmak izini dijital olarak taklit eden bir teknolojidir. Önemi özellikle kayıt ve kulaklıkla çalışmada ortaya çıkar: IR olmadan doğrudan alınan gitar sinyali ince ve cırtlak duyulur. IR devrede olduğunda ise sanki önünde gerçek bir kabin varmış ve önüne mikrofon konmuş gibi dolgun bir ses alırsın.</p>

<h2>Multi efekt pedalı mı, tek tek pedallar mı?</h2>
<p>Efekt pedalları gitarın tonunu şekillendirir: distortion, delay, reverb, chorus gibi.</p>
<ul>
  <li><strong>Multi efekt (çok efektli) pedallar</strong> — onlarca efekti tek kutuda toplar. Yeni başlayanlar için çok daha mantıklıdır: hangi efektin ne yaptığını tek bir cihazla, ayrı ayrı satın almadan öğrenirsin. Hangi seslerin hoşuna gittiğini keşfetmenin en ucuz yolu budur.</li>
  <li><strong>Tek efektli pedallar</strong> — her biri bir işi yapar ve genelde o işi daha iyi yapar. Ne istediğini tam bildiğinde ve o efekti sık kullandığında anlamlıdır.</li>
</ul>
<p>Öneri: multi efektle başla, zevkini keşfet, sonra en çok kullandığın iki-üç efekti tek pedal olarak yükselt.</p>

<h2>Şarj edilebilir olması ne kazandırır?</h2>
<p>Dahili bataryalı amfi ve pedallar seni prizden bağımsız kılar. Balkonda, parkta, kamp ateşi başında ya da elektrik olmayan bir sahnede çalabilirsin. Ayrıca kablo karmaşasını azaltır — özellikle küçük bir odada bu fark edilir bir konfor.</p>

<h2>Sinyal zinciri nasıl kurulur?</h2>
<p>Temel dizilim şöyledir: <strong>gitar → kablo → pedal → kablo → amfi</strong>. İki kabloya ihtiyacın olduğunu unutma; pedal aldıysan ikinci bir kablo da almalısın. Birden fazla pedal varsa sıralama tonu belirgin şekilde etkiler — genel kabul gören sıra: akort → distortion/overdrive → modülasyon (chorus, flanger) → delay → reverb.</p>

<h2>Kargo ve ödeme</h2>
<p>2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR güvenli ödeme altyapısı üzerinden alınır.</p>
`,
      faq: [
        { q: 'Ev için kaç watt gitar amfisi yeterli?', a: 'Ev kullanımında düşük watt daha iyidir. Büyük amfiler karakteristik tonlarını yüksek ses seviyesinde verir; ev seviyesinde kısık çalarsan hem o tonu alamazsın hem boşuna yer kaplar. Kompakt amfiler ev çalışması, kulaklıkla pratik ve küçük oda kayıtları için fazlasıyla yeterlidir.' },
        { q: 'Kulaklıkla gitar çalışmak için ne gerekir?', a: 'Kulaklık çıkışı olan bir amfi veya pedal yeterlidir. Kulaklık takıldığında hoparlör devre dışı kalır ve dışarıya hiç ses çıkmaz, böylece gecenin herhangi bir saatinde çalışabilirsin. Apartmanda oturuyorsan bu özelliği öncelikli aramalısın.' },
        { q: 'IR desteği ne demek, gerekli mi?', a: 'IR (Impulse Response), gerçek bir hoparlör kabininin ve mikrofon yerleşiminin akustik karakterini dijital olarak taklit eder. Kulaklıkla çalışırken ve kayıt yaparken önemlidir: IR olmadan doğrudan alınan gitar sinyali ince ve cırtlak duyulurken, IR devrede olduğunda dolgun ve doğal bir ses alırsın.' },
        { q: 'Multi efekt pedalı mı tek pedallar mı almalıyım?', a: 'Yeni başlıyorsan multi efekt çok daha mantıklıdır: onlarca efekti tek kutuda dener, hangisinin ne yaptığını ayrı ayrı satın almadan öğrenirsin. Zevkini keşfettikten sonra en çok kullandığın iki-üç efekti tek pedal olarak yükseltebilirsin.' },
        { q: 'Pedal aldım, kaç kablo gerekir?', a: 'İki kablo gerekir: biri gitardan pedala, diğeri pedaldan amfiye. Birden fazla pedal kullanacaksan her ek pedal için bir kablo daha lazım olur. Pedal siparişi verirken ikinci kabloyu unutmamak gerekir.' },
      ],
      related: ['kucuk-mekan-buyuk-ses', 'yeni-baslayan-elektro-gitar'],
    },

    /* ==========================================================
       Aşağıdakiler minProducts eşiğinin ALTINDA — sayfa üretilir
       ama noindex + sitemap dışı kalır. Stok arttığında eşik
       kendiliğinden aşılır ve indekslenmeye başlarlar; elle
       müdahale gerekmez. İçerik şimdiden tam yazıldı ki o gün
       geldiğinde sayfa hazır olsun.
       ========================================================== */

    /* ---------------------------------------------------------- */
    {
      slug: 'akustik-gitar',
      short: "Akustik Gitar",
      cats: ['akustik'],
      minProducts: 3,
      h1: 'Akustik Gitar Modelleri ve Fiyatları',
      title: 'Akustik Gitar Fiyatları ve Modelleri | Nota Müzik Market',
      metaDesc: 'Akustik ve elektro akustik gitar modelleri ile fiyatları. Klasik gitardan farkı, gövde formları ve başlangıç için akustik gitar seçme rehberi.',
      keywords: 'akustik gitar, akustik gitar fiyatları, elektro akustik gitar, çelik telli gitar',
      intro: 'Akustik gitar, çelik telleriyle parlak ve gür bir ses verir — şarkı eşliği için en yaygın tercih. Aşağıda modeller, altında klasik gitardan farkını ve seçim kriterlerini anlatan rehber var.',
      body: `
<h2>Akustik gitar ile klasik gitar arasındaki fark</h2>
<p>İkisi de kabloya ihtiyaç duymadan çalınır ama önemli farkları vardır:</p>
<ul>
  <li><strong>Tel</strong> — akustik gitar çelik tel kullanır, klasik gitar naylon. Çelik tel daha parlak ve gür bir ses verir; naylon daha yumuşak ve sıcaktır.</li>
  <li><strong>Sap genişliği</strong> — klasik gitarın sapı belirgin şekilde geniştir, bu parmak arası mesafeyi artırır. Akustik gitarın sapı daha dardır ve akor basmak, özellikle barre akorlarda, el için daha kolaydır.</li>
  <li><strong>Parmak konforu</strong> — çelik tel parmak ucuna daha çok baskı yapar. İlk haftalar naylon tele göre daha zorlayıcıdır.</li>
  <li><strong>Kullanım</strong> — klasik gitar klasik repertuvar ve fingerstyle için; akustik gitar pop, rock, folk ve şarkı eşliği için tipik tercihtir.</li>
</ul>

<h2>Elektro akustik ne demek?</h2>
<p>Elektro akustik, gövdesine manyetik ve preamp yerleştirilmiş bir akustik gitardır. Akustik olarak normal şekilde çalınır, ama kabloyla ses sistemine veya amfiye bağlanabilir. Sahnede, düğünde, kilisede ya da kayıt sırasında mikrofon kurmadan doğrudan hat çıkışı vermeni sağlar.</p>
<p>Çoğu elektro akustikte gövde kenarında bir preamp paneli bulunur; buradan ses seviyesi ve tonu ayarlayabilir, çoğu modelde dahili akortçuyu kullanabilirsin. Evde çalacaksan bu özelliklere ihtiyacın olmaz; sahne planın varsa fark yaratır.</p>

<h2>Gövde formu tonu nasıl etkiler?</h2>
<p>Akustik gitarların gövde boyutu doğrudan ses karakterini belirler. Büyük gövdeler daha çok hava hareket ettirdiği için daha gür ve daha baslı bir ton üretir; şarkı eşliğinde ve pena ile ritim çalmada güçlüdürler. Daha küçük gövdeler ise dengeli ve net bir orta bölge sunar, parmakla çalmada (fingerstyle) ve kayıt ortamında daha kolay kontrol edilir. Küçük gövdeler ayrıca kucakta daha rahat durur — bu, ince yapılı kişiler ve gençler için önemli bir konfor farkıdır.</p>

<h2>Cutaway (oyuk) gerekli mi?</h2>
<p>Gövdenin sap birleşimindeki oyuğa cutaway denir ve üst perdelere ulaşmayı kolaylaştırır. Sadece akor çalıp şarkı söyleyeceksen buna ihtiyacın olmaz. Solo çalmayı, üst perdelerde melodi işlemeyi planlıyorsan belirgin bir kolaylık sağlar.</p>

<h2>Başlangıç için tel kalınlığı</h2>
<p>Akustik gitarda 10-47 (extra light / light) setler yeni başlayanlar için en rahat aralıktır. Daha kalın setler daha dolgun ve gür bir ton verir ama parmak ucuna belirgin şekilde daha çok baskı yapar. Parmakların alıştıkça kalın sete geçebilirsin.</p>

<h2>Bakım</h2>
<p>Akustik gitarın gövdesi ince ahşaptır ve nemden etkilenir. Aşırı kuru ortamda derz açılması, aşırı nemli ortamda ise sap eğilmesi görülebilir. Radyatör yanı, doğrudan güneş alan pencere önü ve rutubetli bodrum kaçınılması gereken yerlerdir. Çalışma sonrası telleri kuru bezle silmek, çelik tellerin ömrünü belirgin şekilde uzatır.</p>

<h2>Kargo ve ödeme</h2>
<p>2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR güvenli ödeme altyapısı üzerinden alınır.</p>
`,
      faq: [
        { q: 'Akustik gitar mı klasik gitar mı almalıyım?', a: 'Pop, rock, folk çalıp şarkı söyleyeceksen akustik gitar; klasik repertuvar ve fingerstyle çalışacaksan klasik gitar uygundur. Klasik gitarın naylon telleri parmak ucunu daha az yorar, bu yüzden ilk haftalar daha kolaydır; akustik gitarın sapı daha dar olduğu için akor basmak daha rahattır.' },
        { q: 'Elektro akustik gitar ne demek?', a: 'Gövdesine manyetik ve preamp yerleştirilmiş akustik gitardır. Normal şekilde akustik çalınır ama kabloyla ses sistemine bağlanabilir. Sahnede veya kayıtta mikrofon kurmadan doğrudan hat çıkışı verir. Evde çalacaksan gerekmez.' },
        { q: 'Akustik gitarda cutaway gerekli mi?', a: 'Sadece akor çalıp şarkı söyleyeceksen gerekmez. Cutaway, gövdedeki oyuk sayesinde üst perdelere ulaşmayı kolaylaştırır; solo çalmayı ve üst perdelerde melodi işlemeyi planlıyorsan belirgin kolaylık sağlar.' },
        { q: 'Akustik gitar için hangi tel kalınlığı uygun?', a: '10-47 (light) setler yeni başlayanlar için en rahat aralıktır. Daha kalın setler daha gür ve dolgun ton verir ama parmak ucuna belirgin şekilde daha çok baskı yapar. Parmakların alıştıkça kalın sete geçebilirsin.' },
      ],
      related: ['yeni-baslayan-elektro-gitar', 'enstruman-bakimi-101', 'kisiligine-gore-enstruman'],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'keyboard-org',
      short: "Keyboard & Org",
      cats: ['orglar'],
      minProducts: 3,
      h1: 'Keyboard ve Org Modelleri',
      title: 'Keyboard ve Org Fiyatları — 61 Tuş Modeller | Nota Müzik Market',
      metaDesc: '61 tuş org ve keyboard modelleri ile fiyatları. Tuş hassasiyeti, oktav sayısı ve dijital piyano ile keyboard arasındaki farkı anlatan seçim rehberi.',
      keywords: 'keyboard, org, org fiyatları, 61 tuş org, keyboard fiyatları, elektronik org',
      intro: 'Keyboard ve org, tek enstrümanla onlarca ses ve ritmi çalabilmeni sağlar. Piyanodan daha hafif, daha taşınabilir ve genellikle daha ekonomiktir. Aşağıda modeller, altında seçim rehberi var.',
      body: `
<h2>Keyboard mu dijital piyano mu?</h2>
<p>Bu, klavye alacak herkesin ilk sorusu ve cevabı tamamen amacına bağlı.</p>
<ul>
  <li><strong>Keyboard/org</strong> — genellikle 61 hafif tuş, onlarca hazır ses (piyano, org, yaylı, üflemeli), otomatik eşlik ritimleri ve kayıt özellikleri. Hafiftir, taşınır, daha az yer kaplar.</li>
  <li><strong>Dijital piyano</strong> — 88 çekiç aksiyonlu ağırlıklı tuş, akustik piyano hissini taklit eder. Ses çeşitliliği daha azdır ama piyano tonu ve tuş hissi çok daha gerçekçidir.</li>
</ul>
<p>Konservatuvar ya da klasik piyano eğitimi hedefliyorsan dijital piyano gerekir. Şarkı eşliği yapmak, aranjman denemek, farklı enstrüman sesleriyle üretmek ya da düğün/etkinlik çalmak istiyorsan keyboard doğru seçimdir.</p>

<h2>61 tuş yeterli mi?</h2>
<p>61 tuş beş oktav demektir ve pop, arabesk, halk müziği ile şarkı eşliğinin neredeyse tamamını karşılar. Bu tarzlarda sağ el melodi, sol el akor çalar ve beş oktav bunun için fazlasıyla yeterlidir.</p>
<p>Sınırın hissedildiği yer klasik repertuvardır: klasik parçalar 88 tuşa göre yazıldığı için bazı eserlerde en pes veya en tiz notaya ulaşamazsın. Klasik piyano çalışmayacaksan 61 tuş uzun süre yetecektir.</p>

<h2>Tuş hassasiyeti neden önemli?</h2>
<p>Hassasiyetli (velocity sensitive) klavyede tuşa sertçe bastığında ses güçlü, yumuşak bastığında kısık çıkar. Bu olmadan her nota aynı gürlükte duyulur ve müzikten ifade tamamen kaybolur — bir melodiyi eşlikten öne çıkaramaz, kreşendo yapamazsın.</p>
<p>Hassasiyeti olmayan ucuz klavyeler oyuncak seviyesindedir ve öğrenme sürecini sakatlar: doğru dinamik kontrolünü hiç öğrenemezsin. Alacağın modelde "tuş hassasiyetli" ifadesini mutlaka ara. Çok kademeli hassasiyet ayarı sunan modellerde tepkiyi kendi dokunuşuna göre kalibre edebilirsin.</p>

<h2>Otomatik eşlik ve ritimler</h2>
<p>Orgların en güçlü yanı otomatik eşlik sistemidir: sol elle bir akor bastığında enstrüman o akora uygun bas, davul ve eşlik partisini kendi çalar. Tek başına çalarken bile dolu bir grup sesi elde edersin. Bu özellik özellikle düğün, etkinlik ve tek kişilik performanslarda belirleyicidir.</p>

<h2>Nelere bakmalı?</h2>
<ul>
  <li><strong>Kulaklık çıkışı</strong> — apartmanda geç saatte çalışmak için şart.</li>
  <li><strong>Sustain pedal girişi</strong> — piyano tonlarında pedal kullanabilmek için gerekir.</li>
  <li><strong>USB/MIDI</strong> — bilgisayara bağlanıp kayıt yapmak veya sanal enstrüman kullanmak istersen.</li>
  <li><strong>Adaptör ve stand</strong> — kutudan çıkmayabilir; sipariş verirken kontrol et.</li>
  <li><strong>Hoparlör gücü</strong> — dahili hoparlörler ev için yeterlidir; sahne için harici ses sistemi gerekir.</li>
</ul>

<h2>Kargo ve ödeme</h2>
<p>2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR güvenli ödeme altyapısı üzerinden alınır.</p>
`,
      faq: [
        { q: 'Keyboard mu dijital piyano mu almalıyım?', a: 'Klasik piyano eğitimi hedefliyorsan 88 çekiç aksiyonlu tuşa sahip dijital piyano gerekir. Şarkı eşliği yapmak, farklı enstrüman sesleriyle aranjman denemek veya etkinlik çalmak istiyorsan keyboard/org daha uygundur — hafif, taşınabilir ve çok daha fazla ses seçeneği sunar.' },
        { q: '61 tuş yeterli mi?', a: '61 tuş beş oktavdır ve pop, arabesk, halk müziği ile şarkı eşliğinin neredeyse tamamını karşılar. Sınır klasik repertuvarda hissedilir; klasik parçalar 88 tuşa göre yazıldığı için bazı eserlerde en pes veya en tiz notaya ulaşamazsın.' },
        { q: 'Tuş hassasiyeti ne demek, önemli mi?', a: 'Tuşa sertçe bastığında sesin güçlü, yumuşak bastığında kısık çıkmasıdır. Çok önemlidir: hassasiyet olmadan her nota aynı gürlükte duyulur ve müzikten ifade kaybolur. Hassasiyeti olmayan klavyelerde doğru dinamik kontrolünü hiç öğrenemezsin.' },
        { q: 'Otomatik eşlik ne işe yarar?', a: 'Sol elle bir akor bastığında enstrüman o akora uygun bas, davul ve eşlik partisini kendi çalar. Tek başına çalarken bile dolu bir grup sesi elde edersin. Düğün, etkinlik ve tek kişilik performanslarda belirleyici bir özelliktir.' },
      ],
      related: ['dijital-piyano-mu-keyboard-mu', 'cocuga-ilk-enstruman', 'kisiligine-gore-enstruman'],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'saksafon',
      short: "Saksafon",
      cats: ['saksafon'],
      minProducts: 3,
      h1: 'Saksafon Modelleri ve Fiyatları',
      title: 'Saksafon Fiyatları ve Modelleri | Nota Müzik Market',
      metaDesc: 'Saksafon modelleri ve fiyatları. Alto ve tenor farkı, kamış seçimi, başlangıç için saksafon seçme ve bakım rehberi.',
      keywords: 'saksafon, saksafon fiyatları, alto saksafon, saksofon, üflemeli enstrüman',
      intro: 'Saksafon, nefesli enstrümanlar içinde insan sesine en çok benzetilen çalgı. Caz, pop, arabesk ve halk müziğinde eşit rahatlıkla kullanılır. Aşağıda modeller, altında başlangıç rehberi var.',
      body: `
<h2>Hangi saksafonla başlanır?</h2>
<p>Saksafon ailesinin başlıca üyeleri boyut ve perdeye göre ayrılır. Başlangıç için genel kabul <strong>alto saksafon</strong>dur:</p>
<ul>
  <li><strong>Alto</strong> — orta boy, taşıması ve tutması en rahat olan. Nefes ihtiyacı tenora göre daha az, parmak aralıkları küçük ellere de uygun. Öğretim materyalinin çoğu alto için yazılmıştır.</li>
  <li><strong>Tenor</strong> — daha büyük ve ağır, daha kalın ve dolgun bir ton verir. Caz ve rock'ta çok sevilir ama daha fazla nefes ve daha büyük el açıklığı ister.</li>
  <li><strong>Soprano</strong> — düz gövdeli, en tiz üyesi. Entonasyonu (nota doğruluğunu) tutturmak belirgin şekilde zordur; başlangıç için önerilmez.</li>
</ul>
<p>Çocuklar ve yeni başlayan yetişkinler için alto neredeyse her zaman doğru başlangıçtır.</p>

<h2>Kamış (reed) meselesi</h2>
<p>Saksafonun sesini üreten şey metal gövde değil, ağızlığa takılan ince kamıştır. Kamışlar sertlik derecesine göre numaralandırılır (genellikle 1'den 5'e):</p>
<ul>
  <li><strong>1,5 - 2</strong> — yumuşak. Yeni başlayanlar için: daha az nefes basıncı ister, ses çıkarmak kolaydır.</li>
  <li><strong>2,5 - 3</strong> — orta. Ağız kasları (embouchure) geliştikçe geçilecek aralık; daha dolgun ve kontrollü ton.</li>
  <li><strong>3,5 ve üzeri</strong> — sert. Deneyimli çalıcılar için; güçlü nefes desteği gerektirir.</li>
</ul>
<p>Kamışlar tükenen malzemedir; ıslanıp kuruyarak yıpranır ve çatlar. Her zaman birkaç yedek bulundurmak gerekir.</p>

<h2>İlk günler nasıl geçer?</h2>
<p>Saksafonda ilk hedef parmak değil, ağızdır. Doğru "embouchure" — yani alt dudağın dişleri örtmesi, üst dişlerin ağızlığa dayanması ve ağız kenarlarının sızdırmaz şekilde kapanması — sesin temelidir. İlk günlerde sadece ağızlık ve boyunla düzgün, sabit bir ses üretmeye çalışmak, tüm enstrümanla acele etmekten daha hızlı sonuç verir.</p>
<p>İlk çıkan seslerin cırtlak veya kaçık olması normaldir. Sebep genellikle üçünden biridir: kamış çok sert, ağız kasları henüz zayıf, ya da nefes desteği karından değil göğüsten geliyor.</p>

<h2>Bakım — en kritik alışkanlık</h2>
<p>Saksafon bakımında tek bir alışkanlık diğerlerinin toplamından önemlidir: <strong>her çalışmadan sonra gövdenin içini kurulamak</strong>. Nefesle giren nem gövdede birikir ve pedlerin (delikleri kapatan keçe yastıklar) çürümesine yol açar. Ped değişimi masraflı bir tamirdir.</p>
<p>Bunun için ucunda ağırlık olan bir temizlik bezi (swab) kullanılır: gövdeden geçirilerek nem alınır. Ayrıca kamış her kullanımdan sonra ağızlıktan çıkarılıp kurutulmalı, ağızlık ise düzenli olarak ılık suyla yıkanmalıdır. Enstrüman kullanılmadığında daima kılıfında saklanmalıdır.</p>

<h2>Kargo ve ödeme</h2>
<p>2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR güvenli ödeme altyapısı üzerinden alınır.</p>
`,
      faq: [
        { q: 'Başlangıç için hangi saksafon uygun?', a: 'Alto saksafon genel kabul gören başlangıç seçimidir. Orta boyu sayesinde tutması rahat, nefes ihtiyacı tenora göre az ve parmak aralıkları küçük ellere de uygundur. Öğretim materyalinin çoğu da alto için yazılmıştır.' },
        { q: 'Alto ve tenor saksafon arasındaki fark nedir?', a: 'Tenor daha büyük ve ağırdır, daha kalın ve dolgun bir ton verir; caz ve rock\'ta çok sevilir. Ancak daha fazla nefes desteği ve daha büyük el açıklığı ister. Alto daha küçük, daha kolay taşınır ve başlangıç için daha uygundur.' },
        { q: 'Saksafon kamışı kaç numara olmalı?', a: 'Yeni başlayanlar için 1,5-2 numara yumuşak kamışlar uygundur; daha az nefes basıncı ister ve ses çıkarmak kolaydır. Ağız kasları geliştikçe 2,5-3 aralığına geçilir. Kamışlar tükenen malzemedir, yedek bulundurmak gerekir.' },
        { q: 'Saksafon bakımı nasıl yapılır?', a: 'En kritik alışkanlık her çalışmadan sonra gövdenin içini temizlik bezi (swab) ile kurulamaktır. Nefesle giren nem gövdede birikerek pedlerin çürümesine yol açar ve ped değişimi masraflı bir tamirdir. Kamış çıkarılıp kurutulmalı, ağızlık düzenli ılık suyla yıkanmalıdır.' },
      ],
      related: ['kisiligine-gore-enstruman', 'enstruman-bakimi-101'],
    },

    /* ---------------------------------------------------------- */
    {
      slug: 'klarnet',
      short: "Klarnet",
      cats: ['klarnet'],
      minProducts: 3,
      h1: 'Klarnet Modelleri ve Fiyatları',
      title: 'Klarnet Fiyatları ve Modelleri | Nota Müzik Market',
      metaDesc: 'Sol klarnet ve si bemol klarnet modelleri ile fiyatları. Türk müziğinde sol klarnet, kamış seçimi ve başlangıç için klarnet rehberi.',
      keywords: 'klarnet, klarnet fiyatları, sol klarnet, si bemol klarnet, klarnet satın al',
      intro: 'Klarnet, Türk müziğinin en tanıdık nefesli sesi — ve klasik müzikten caza kadar her yerde. Aşağıda modeller, altında sol klarnet ile si bemol arasındaki farkı ve başlangıç rehberini bulacaksın.',
      body: `
<h2>Sol klarnet mi, si bemol klarnet mi?</h2>
<p>Bu, Türkiye'de klarnet alacak herkesin karşılaştığı ilk ve en önemli ayrımdır.</p>
<ul>
  <li><strong>Sol klarnet</strong> — Türk müziğinin klarneti. Si bemol klarnetten daha uzundur, daha pes ve daha yumuşak, "yanık" olarak tanımlanan bir tona sahiptir. Türk halk müziği, roman havası, fasıl ve arabeskte kullanılan ses budur. Türkiye'de "klarnet" denince akla gelen tını sol klarnettir.</li>
  <li><strong>Si bemol (Bb) klarnet</strong> — dünya standardı. Klasik müzik, orkestra, bando ve caz repertuvarının tamamı bunun için yazılmıştır. Konservatuvar eğitimi bu enstrüman üzerinden yürür.</li>
</ul>
<p>Karar şuna bağlı: <strong>Türk müziği çalacaksan sol klarnet, klasik/orkestra/konservatuvar hedefliyorsan si bemol klarnet</strong> al. İkisinin parmak sistemi aynı olduğu için birinde öğrendiğin teknik diğerine büyük ölçüde aktarılır — ama repertuvar ve tını tamamen farklıdır.</p>

<h2>Kamış (reed) seçimi</h2>
<p>Klarnetin sesini üreten şey ağızlığa takılan ince kamıştır. Sertlik numarasına göre seçilir:</p>
<ul>
  <li><strong>1,5 - 2</strong> — yumuşak; yeni başlayanlar için. Az nefes basıncıyla ses verir.</li>
  <li><strong>2,5 - 3</strong> — orta; ağız kasları geliştikçe geçilir, daha dolgun ve kontrollü ton verir.</li>
  <li><strong>3,5 ve üzeri</strong> — sert; deneyimli çalıcılar için, güçlü nefes desteği ister.</li>
</ul>
<p>Kamış tükenen bir malzemedir. Islanıp kuruma döngüsüyle yıpranır, çatlar ve tonu bozulur — yedeksiz kalmamak gerekir.</p>

<h2>İlk ses nasıl çıkar?</h2>
<p>Klarnette ilk zorluk parmaklar değil ağızdır. Doğru embouchure şöyle kurulur: alt dudak dişlerin üzerine hafifçe kıvrılır, üst dişler ağızlığın üstüne dayanır, ağız kenarları sızdırmayacak şekilde kapanır. Çene aşağı doğru düz tutulur, şişirilmez.</p>
<p>İlk çıkan seslerin cırtlak olması ya da hiç ses gelmemesi son derece normaldir. En yaygın sebepler: kamış çok sert, kamış ağızlığa yanlış hizalanmış, ağız kenarlarından hava kaçıyor ya da nefes karından değil göğüsten geliyor. Nefes desteğinin diyaframdan gelmesi, klarnette tonun temelidir.</p>

<h2>Bakım</h2>
<p>Klarnet bakımında en önemli alışkanlık, saksafonda olduğu gibi, <strong>her çalışmadan sonra gövdenin içini kurulamaktır</strong>. Nefesle giren nem gövdede birikir; ahşap gövdelerde çatlamaya, tüm modellerde ped (delik yastığı) çürümesine yol açar.</p>
<p>Ek olarak: enstrümanı parçalarına ayırırken mantar bağlantılara mantar yağı sürmek sıkışmayı önler. Kamış her kullanımdan sonra çıkarılıp kurutulmalı, ağızlık düzenli olarak ılık suyla (sıcak değil) yıkanmalıdır. Enstrüman kullanılmadığında kılıfında saklanmalıdır.</p>

<h2>Kargo ve ödeme</h2>
<p>2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır. Ödemeler PayTR güvenli ödeme altyapısı üzerinden alınır.</p>
`,
      faq: [
        { q: 'Sol klarnet ile si bemol klarnet arasındaki fark nedir?', a: 'Sol klarnet daha uzundur, daha pes ve yumuşak bir tona sahiptir; Türk halk müziği, fasıl, roman havası ve arabeskte kullanılan ses budur. Si bemol klarnet dünya standardıdır ve klasik müzik, orkestra, bando ile caz repertuvarı bunun için yazılmıştır.' },
        { q: 'Türk müziği için hangi klarnet gerekir?', a: 'Sol klarnet. Türkiye\'de "klarnet" denince akla gelen o karakteristik yanık tını sol klarnete aittir. Konservatuvar veya orkestra hedefliyorsan si bemol klarnet almalısın.' },
        { q: 'Yeni başlayan için hangi kamış numarası uygun?', a: '1,5-2 numara yumuşak kamışlar uygundur; daha az nefes basıncı ister ve ses çıkarmak kolaydır. Ağız kasları geliştikçe 2,5-3 aralığına geçilir. Kamışlar yıprandığı için her zaman yedek bulundurmak gerekir.' },
        { q: 'Klarnetim ses vermiyor, sebebi ne olabilir?', a: 'En yaygın sebepler: kamışın çok sert olması, kamışın ağızlığa yanlış hizalanması, ağız kenarlarından hava kaçması veya nefesin diyaframdan değil göğüsten gelmesi. İlk günlerde cırtlak ses çıkması tamamen normaldir; ağız kasları geliştikçe düzelir.' },
      ],
      related: ['kisiligine-gore-enstruman', 'enstruman-bakimi-101'],
    },

  ];
})(typeof window !== 'undefined' ? window : this);
