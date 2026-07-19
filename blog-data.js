// ============================================================
//  blog-data.js — Nota Müzik Market Günlük (blog)
//  10 yazı. SEO/GEO için: net giriş, H2 başlıklar, listeler,
//  sonda "Özetle" kutusu. Gövde HTML olarak saklanır; blog.js
//  hem kartları hem okuma modunu buradan üretir.
//  Ürün bağlantıları kategori landing sayfalarına gider (category-data.js).
// ============================================================

const BLOG_POSTS = [
  {
    slug: 'kisiligine-gore-enstruman',
    title: 'Kişiliğine Göre Hangi Enstrüman Sana Uygun?',
    category: 'Kişilik',
    date: '2026-06-18',
    readMin: 5,
    dek: 'Doğru enstrüman, en pahalı olan değil; mizacına en çok benzeyendir. Beş kişilik tipini beş çalgıyla eşleştirdik.',
    keywords: 'kişiliğe göre enstrüman, hangi enstrümanı çalmalıyım, enstrüman seçimi, müzik aleti seçme rehberi',
    body: `
      <p class="lead">Enstrüman seçerken çoğu kişi yanlış soruyu sorar: "Hangisi daha havalı?" Doğru soru şu: <strong>"Hangisi bana benziyor?"</strong> Çünkü çalmaya devam etmeni sağlayan şey ilk haftanın heyecanı değil, çalgının senin tabiatınla kurduğu uyumdur. Aşağıda beş kişilik eğilimini, onlara en çok yakışan çalgılarla eşleştirdik.</p>

      <h2>Sahne ışığını seven, dışa dönük: Elektro gitar</h2>
      <p>İlgi odağı olmaktan keyif alıyor, hızlı sonuç istiyorsan elektro gitar seni mutlu eder. Birkaç akorla tanıdık şarkıları çalmaya başlarsın; gürültü ve karakter onun doğasında var. <a href="elektro-gitar.html">Siyah Strat formundaki elektro gitarımız</a> blues'tan rock'a geniş bir alan açar.</p>

      <h2>Sakin, içe dönük, derinlik arayan: Klasik gitar veya piyano</h2>
      <p>Tek başına, kulaklık takmadan, kendi temponda ilerlemeyi seviyorsan yumuşak naylon telli <a href="klasik-gitar.html">klasik gitar</a> ya da bir <a href="dijital-piyano.html">dijital piyano</a> ideal. İkisi de "kendinle baş başa" çalmaya en uygun çalgılar.</p>

      <h2>Enerjik, hareketli, ritim tutan: Davul</h2>
      <p>Ayağın sürekli tempo tutuyorsa cevabın davul. Fiziksel, boşaltıcı ve son derece tatmin edici. Apartmanda yaşıyorsan kulaklıkla çalışabileceğin bir <a href="elektronik-davul.html">elektronik davul</a> bu enerjiyi komşunla sorun yaşamadan açığa çıkarır.</p>

      <h2>Detaycı, sabırlı, mükemmeliyetçi: Keman</h2>
      <p>Küçük ilerlemelerden tatmin oluyor, "doğru ses" için çalışmaya razıysan keman tam sana göre. Perdesiz oluşu disiplin ister ama karşılığında derin bir tatmin verir.</p>

      <h2>Meraklı, çok yönlü, denemeyi seven: Keyboard</h2>
      <p>Tek bir tını sana yetmiyorsa, yüzlerce ses ve hazır ritim sunan bir <a href="keyboard-org.html">keyboard</a> oyun alanın olur. Bir gün piyano, ertesi gün org veya yaylı taklidi — keşfetmeyi seven kişilikler için biçilmiş kaftan.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <ul>
          <li><strong>Dışa dönük</strong> → elektro gitar</li>
          <li><strong>İçe dönük / sakin</strong> → klasik gitar veya piyano</li>
          <li><strong>Enerjik</strong> → davul</li>
          <li><strong>Detaycı</strong> → keman</li>
          <li><strong>Meraklı</strong> → keyboard</li>
        </ul>
        <p>Kararsızsan: çoğu kişi için <em>klavye</em> en az hayal kırıklığı yaratan başlangıçtır — el-göz koordinasyonu nettir ve ilk melodiyi dakikalar içinde çalarsın.</p>
      </div>
    `
  },

  {
    slug: 'ice-donukler-icin-enstruman',
    title: 'İçe Dönükler İçin 5 Sakin Enstrüman',
    category: 'Kişilik',
    date: '2026-06-10',
    readMin: 4,
    dek: 'Sahne değil, kendi odan. Kalabalık değil, kulaklık. İçe dönük müzisyenin en rahat edeceği çalgılar.',
    keywords: 'içe dönükler için enstrüman, sessiz enstrüman, tek başına çalınan müzik aleti, introvert müzik',
    body: `
      <p class="lead">İçe dönük olmak "utangaç" demek değil; <strong>enerjini tek başınayken topluyorsun</strong> demek. Bu yüzden seni sahneye iten değil, kendi dünyana çeken çalgılar sana daha çok yakışır. İşte sessiz ve içsel beş seçenek.</p>

      <h2>1. Klasik gitar</h2>
      <p>Naylon telleri parmağına naziktir, sesi yumuşaktır, gece bile çalabilirsin. Tek başına şarkı söyleyip kendine eşlik etmenin en güzel yollarından biri. <a href="klasik-gitar.html">Mavi klasik gitarımız</a> başlangıç için ideal.</p>

      <h2>2. Dijital piyano</h2>
      <p>Kulaklık girişi sayesinde gecenin üçünde bile kimseyi rahatsız etmeden çalışırsın. <a href="dijital-piyano.html">88 tuşlu dijital piyano</a>, akustik bir piyanonun mahremiyetini sana özel bir dünyada sunar.</p>

      <h2>3. Elektronik davul (kulaklıkla)</h2>
      <p>Davul gürültülü zorunda değil. <a href="elektronik-davul.html">Pedli elektronik bir set</a>, kulaklıkla çalışıldığında dışarıya neredeyse hiç ses sızdırmaz. İçe dönük ama enerjisini boşaltmak isteyenler için ideal ikili.</p>

      <h2>4. Keman</h2>
      <p>Keman, sadece sen ve telin arasında geçen sabırlı bir diyalogdur. Sessiz bir odada saatlerce kendini kaybetmek isteyenler için derin bir çalgı.</p>

      <h2>5. Keyboard (kulaklıkla)</h2>
      <p>Yüzlerce sesi keşfetmek, kendi başına minik besteler yapmak için ideal. <a href="keyboard-org.html">Portatif bir keyboard</a> hem küçük yer kaplar hem de kulaklıkla tamamen sessiz çalışır.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <p>İçe dönükler için ortak nokta: <strong>kulaklık desteği ve düşük ses</strong>. Hangisini seçersen seç, gece çalışabileceğin, kimseden izin istemeden başına buyruk pratik yapabileceğin bir çalgı, devam etme ihtimalini katlar.</p>
      </div>
    `
  },

  {
    slug: 'disa-donukler-davul',
    title: 'Dışa Dönük ve Enerjik Kişiler Neden Davula Âşık Olur?',
    category: 'Kişilik',
    date: '2026-06-02',
    readMin: 4,
    dek: 'Yerinde duramayan, ayağıyla tempo tutan, enerjisini boşaltmak isteyenler için davulun cazibesini açıklıyoruz.',
    keywords: 'davul kimlere uygun, enerjik kişiler için enstrüman, davul çalmaya başlamak, elektronik davul seti',
    body: `
      <p class="lead">Bir grupta gözünü hep davulcudan alamıyor, parmaklarınla masaya ritim tutuyorsan tesadüf değil. <strong>Davul, fiziksel enerjisi yüksek ve dışa dönük kişilerin en doğal çalgısıdır.</strong> İşte nedeni.</p>

      <h2>Çünkü bedeniyle çalmak ister</h2>
      <p>Davul, parmak ucu inceliğiyle değil; kollar, bacaklar ve tüm gövdeyle çalınır. Hareket etmeyi seven biri için bu bir kısıt değil, tam aksine en büyük keyif kaynağıdır.</p>

      <h2>Çünkü anında tatmin verir</h2>
      <p>İlk gün bile basit bir "boom-tak" ritmi tutabilir, bir şarkıya eşlik edebilirsin. Hızlı sonuç isteyen enerjik bir kişilik için bu motivasyonu canlı tutar.</p>

      <h2>Çünkü stresi boşaltır</h2>
      <p>Yoğun bir günün sonunda davula oturmak, en iyi rahatlama yöntemlerinden biridir. Gürültü sorun olur diye düşünme: <a href="elektronik-davul.html">AeroBand elektronik davul seti</a> ya da <a href="elektronik-davul.html">Nitro elektronik davul</a> gibi setlerle kulaklık takıp tüm enerjini sessizce boşaltabilirsin.</p>

      <h2>Başlarken neye dikkat etmeli?</h2>
      <ul>
        <li><strong>Mekân:</strong> Apartmandaysan akustik değil, elektronik set seç.</li>
        <li><strong>Baget:</strong> Dengeli bir <a href="davul-bageti.html">5B baget</a> el yormaz, hızlı geçişlerde kontrolü artırır.</li>
        <li><strong>Kulaklık:</strong> Kapalı kulaklıkla hem komşunu hem kendini korursun.</li>
      </ul>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <p>Davul; hareketli, sabırsız ama tutkulu kişilikler için ideal. Apartman hayatıyla çelişmesi gerekmez — <strong>elektronik bir set + kulaklık</strong> ikilisi, enerjini kimseyi rahatsız etmeden açığa çıkarır.</p>
      </div>
    `
  },

  {
    slug: 'yeni-baslayan-elektro-gitar',
    title: 'Sıfırdan Elektro Gitar: İlk 30 Günde Neler Yapabilirsin?',
    category: 'Başlangıç',
    date: '2026-05-24',
    readMin: 5,
    dek: 'Hiç çalmadıysan bile ilk ay sonunda tanıdık riffleri çalabilirsin. Gerçekçi bir 30 günlük yol haritası.',
    keywords: 'yeni başlayanlar için elektro gitar, sıfırdan gitar öğrenmek, ilk gitar, elektro gitar başlangıç',
    body: `
      <p class="lead">"Yaşım geçti, ellerim tutmaz" diye düşünme. <strong>Elektro gitar, ilk sonuç veren çalgılardan biridir;</strong> çünkü tek bir parmakla bastığın "power chord" bile kulağa dolu gelir. İşte sıfırdan başlayan birinin ilk ayda gerçekçi olarak ne yapabileceği.</p>

      <h2>1. Hafta — Tanışma</h2>
      <ul>
        <li>Gitarı doğru tutmayı ve akort etmeyi öğrenirsin (telefon uygulaması yeterli).</li>
        <li>Tek tel üzerinde temiz ses çıkarmayı çalışırsın.</li>
        <li>İlk power chord'u (5'li akor) öğrenirsin — bütün rock müziğin temeli.</li>
      </ul>

      <h2>2. Hafta — İlk riff</h2>
      <p>Tek telli basit rifflerle tanıdık melodileri çalmaya başlarsın. Bu noktada bir <a href="amfi-pedal.html">mini amfi</a> işini eğlenceye çevirir; gerçek "elektro" sesi duymak motivasyonu uçurur.</p>

      <h2>3. Hafta — Akor geçişleri</h2>
      <p>İki-üç power chord arasında geçiş yapmayı çalışırsın. Yavaş ama temiz çal; hız sonra gelir. Bu hafta sonunda basit bir şarkının nakaratına eşlik edebilirsin.</p>

      <h2>4. Hafta — İlk şarkı</h2>
      <p>30. günün sonunda tanıdık bir parçanın ana riffini baştan sona çalabilir hâle gelirsin. Bu, devam etmen için gereken o "ben yapabiliyorum" anıdır.</p>

      <h2>Hangi gitarla başlamalı?</h2>
      <p>Başlangıç için çok ağır ve çok pahalı bir model şart değil. <a href="elektro-gitar.html">Klasik Strat formundaki bir elektro gitar</a> rahat çalınır, her tarza uyar. Yanına bir <a href="gitar-kablosu.html">kaliteli kablo</a> ve küçük bir amfi ekleyince setin tamamlanır.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <p>İlk ayın hedefi virtüöz olmak değil; <strong>bir riff çalabilmek</strong>. Günde 15–20 dakika düzenli pratik, ayda 1 saatlik düzensiz çalışmadan kat kat etkilidir. Başlangıç seti: gitar + kablo + mini amfi.</p>
      </div>
    `
  },

  {
    slug: 'sessiz-davul-aeroband',
    title: 'Komşuyu Rahatsız Etmeden Davul: AeroBand Elektronik Set',
    category: 'Ürün İncelemesi',
    date: '2026-05-15',
    readMin: 4,
    dek: 'Apartmanda davul çalmak hayal değil. Kablosuz, taşınabilir AeroBand setiyle neler yapabileceğine bakıyoruz.',
    keywords: 'sessiz davul seti, apartmanda davul, AeroBand elektronik davul, taşınabilir davul seti',
    body: `
      <p class="lead">"Davul çalmak isterdim ama apartmanda imkânsız" cümlesini çok duyuyoruz. Oysa <strong>elektronik davul setleri tam da bu sorun için var.</strong> <a href="elektronik-davul.html">AeroBand elektronik davul seti</a>, kablosuz ve taşınabilir yapısıyla bu işi bir adım öteye taşıyor.</p>

      <h2>Neden sessiz?</h2>
      <p>Akustik bir davul havayı titreştirerek ses üretir — bu yüzden gürültülüdür. Elektronik set ise pedlere vurduğunda sesi <strong>kulaklığına</strong> gönderir. Dışarıya yalnızca bagetin pede hafif teması duyulur. Yani sen tüm gücünle çalarken yan oda sessizdir.</p>

      <h2>Bu setle neler yapabilirsin?</h2>
      <ul>
        <li><strong>Gece pratiği:</strong> Kulaklık tak, saat farketmeksizin çalış.</li>
        <li><strong>Taşıma:</strong> Kompakt yapısı sayesinde toplayıp bir köşeye kaldırabilirsin.</li>
        <li><strong>Eşlik:</strong> Telefonundan şarkı açıp ritim tutarak gerçek grup hissi yakalarsın.</li>
        <li><strong>Gerçekçi his:</strong> Pedler gerçek davul tepkisi verdiği için akustiğe geçişin kolay olur.</li>
      </ul>

      <h2>Kimler için ideal?</h2>
      <p>Apartmanda yaşayan, ritim duygusunu geliştirmek isteyen, küçük bir alanı olan herkes için. Çocuğunu davula yönlendirmek isteyen ama gürültüden çekinen aileler için de güvenli bir başlangıç.</p>

      <h2>Yanına ne almalı?</h2>
      <p>Kapalı bir kulaklık ve dengeli bir <a href="davul-bageti.html">akçaağaç 5B baget</a> seti deneyimini tamamlar. Baget, davulun "lastiği" gibidir — doğru olanı eli yormaz.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <p>AeroBand seti, "davul = gürültü" denklemini bozuyor. <strong>Kulaklık + kompakt yapı</strong> sayesinde apartmanda bile tam güçle çalabilir, istediğin saatte pratik yapabilirsin.</p>
      </div>
    `
  },

  {
    slug: 'dijital-piyano-mu-keyboard-mu',
    title: 'Dijital Piyano mu, Keyboard mu? Başlangıç İçin Net Cevap',
    category: 'Rehber',
    date: '2026-05-06',
    readMin: 5,
    dek: 'İkisi de tuşlu ama amaçları farklı. Hangisini kime önerdiğimizi tablo netliğinde anlatıyoruz.',
    keywords: 'dijital piyano mu keyboard mu, keyboard ve piyano farkı, başlangıç için tuşlu çalgı, piyano almak',
    body: `
      <p class="lead">En sık aldığımız soru bu. Kısa cevap: <strong>Piyano çalmayı öğrenmek istiyorsan dijital piyano; ses ve ritimlerle denemeler yapmak, taşınabilirlik istiyorsan keyboard.</strong> Uzun cevabı aşağıda.</p>

      <h2>Temel fark: tuş hissi</h2>
      <p>Bir <a href="dijital-piyano.html">dijital piyano</a>, akustik piyano gibi <strong>ağırlıklı tuşlara</strong> sahiptir; parmak gücün gelişir, ileride akustiğe geçmen kolay olur. <a href="keyboard-org.html">Keyboard</a> ise daha hafif tuşludur, parmakla bastırması kolaydır ama "piyano hissi" vermez.</p>

      <h2>Tuş sayısı</h2>
      <ul>
        <li><strong>Dijital piyano:</strong> Genelde 88 tuş — tam piyano repertuvarını çalabilirsin.</li>
        <li><strong>Keyboard:</strong> 61 tuş yaygındır — başlangıç ve pop/şarkı eşliği için fazlasıyla yeterli.</li>
      </ul>

      <h2>Ses ve ritim</h2>
      <p>Keyboard'un asıl gücü çok yönlülüğü: yüzlerce farklı ses (org, yaylı, synth) ve hazır ritimler sunar. <a href="keyboard-org.html">Keyboard GO S61</a> tam da bu keşif duygusu için tasarlanmış. Dijital piyano ise az sayıda ama çok kaliteli piyano tınısına odaklanır.</p>

      <h2>Hangisi kime?</h2>
      <ul>
        <li><strong>Çocuğunu piyano dersine yazdıracaksan</strong> → dijital piyano (88 ağırlıklı tuş).</li>
        <li><strong>Hobi olarak şarkılara eşlik etmek, taşımak istiyorsan</strong> → keyboard.</li>
        <li><strong>Yerin ve bütçen kısıtlıysa</strong> → 61 tuşlu keyboard mantıklı bir başlangıç.</li>
        <li><strong>Klasik piyano hedefin varsa</strong> → baştan dijital piyano al, sonra pişman olma.</li>
      </ul>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <p><strong>Ciddi piyano eğitimi → dijital piyano. Esnek, eğlenceli, taşınabilir başlangıç → keyboard.</strong> Yanlış cevap yok; sadece hedefine göre doğru cevap var.</p>
      </div>
    `
  },

  {
    slug: 'keman-kimlere-gore',
    title: 'Keman Kimin Enstrümanı? Sabırlı ve Detaycı Ruhlar İçin',
    category: 'Kişilik',
    date: '2026-04-27',
    readMin: 4,
    dek: 'Perdesi yok, kolay değil — ama hiçbir çalgı keman kadar derin bir tatmin vermez. Keman kime göre?',
    keywords: 'keman kimlere uygun, keman çalmaya başlamak, yeni başlayanlar için keman, keman zor mu',
    body: `
      <p class="lead">Keman, müziğin en romantik ama en sabır isteyen çalgılarından biri. Perdesi olmadığı için doğru sesi <strong>kulağınla bulmak</strong> zorundasın. Bu yüzden keman, belirli bir mizaca özel olarak hitap eder.</p>

      <h2>Keman şu kişiliklere göre</h2>
      <ul>
        <li><strong>Sabırlı olanlar:</strong> İlk haftalar gıcırtılı geçer; bunu sorun değil, süreç olarak görenler kazanır.</li>
        <li><strong>Detaycılar:</strong> Bir milimetrelik parmak farkı sesi değiştirir. Bu hassasiyeti zevkli bulanlar için ideal.</li>
        <li><strong>İçe dönükler:</strong> Tek başına, sessiz odada çalışmayı sevenlerin çalgısı.</li>
        <li><strong>Duygusal anlatımı sevenler:</strong> Keman, insan sesine en yakın çalgı kabul edilir.</li>
      </ul>

      <h2>Başlarken doğru set</h2>
      <p>Yeni başlayan için en pratik seçenek, her şeyiyle gelen bir set. <a href="keman.html">Sert kutusu, yayı ve reçinesiyle gelen 4/4 keman setimiz</a> ilk gün çalmaya başlamana yetecek her şeyi içerir. Daha sıcak, doğal bir tını istersen <a href="keman.html">doğal vernikli ahşap gövdeli keman</a> da güzel bir seçenek.</p>

      <h2>İhmal edilen ama kritik parça: tel</h2>
      <p>Kemanın sesinin yarısı telinden gelir. Eğitim sürecinde yıpranan teller sesi köreltir; <a href="keman.html">berrak ve sıcak ton veren bir keman tel seti</a> ile değiştirmek, yeni bir keman almak kadar fark yaratır.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <p>Keman; sabırlı, detaycı ve içsel kişiler için bir ödül gibidir. İlk ay zor geçebilir ama doğru bir set (kutu + yay + reçine) ve sağlam bir tel ile başlarsan, o "ilk temiz ton" anı tüm çabaya değer.</p>
      </div>
    `
  },

  {
    slug: 'kucuk-mekan-buyuk-ses',
    title: 'Küçük Odada Büyük Ses: Mini Amfi ve M-VAVE ile Pratik',
    category: 'Ürün İncelemesi',
    date: '2026-04-18',
    readMin: 4,
    dek: 'Stüdyo gerekmez. Cebine sığan bir amfiyle evdeki pratiğini nasıl gerçek bir deneyime çevirirsin?',
    keywords: 'mini amfi, gitar amfisi, M-VAVE mini amfi, küçük gitar amfisi, ev pratiği için amfi',
    body: `
      <p class="lead">Elektro gitarın gerçek karakteri amfiden çıkar. Ama büyük bir kombo amfi herkes için pratik değil. İyi haber: <strong>avuç içi büyüklüğünde mini amfiler, ev pratiği için fazlasıyla yeterli.</strong></p>

      <h2>Mini amfi neyi çözer?</h2>
      <ul>
        <li><strong>Yer sorunu:</strong> Masanın üstüne, rafa, çantaya sığar.</li>
        <li><strong>Ses sorunu:</strong> Düşük seviyede bile dolgun bir ton verir; gece pratiği için ideal.</li>
        <li><strong>Motivasyon:</strong> Kuru telden değil, gerçek "elektro" sesten çalışmak pratiği bağımlılık yapar.</li>
      </ul>

      <h2>İki pratik seçenek</h2>
      <p><a href="amfi-pedal.html">Mini Amfi Seti</a>, cebine sığan, antrenmanlarına gücünden ödün vermeden eşlik eden sade bir çözüm. Daha fazlasını isteyenler için <a href="amfi-pedal.html">M-VAVE Mini Amfi</a> şarjlı ve Bluetooth destekli; telefonundan şarkı açıp üzerine çalabilir, kablosuz pratik yapabilirsin.</p>

      <h2>Sesi büyüten ipuçları</h2>
      <ul>
        <li>Amfiyi yere değil, sert bir yüzeye (masa) koy — bas frekanslar belirginleşir.</li>
        <li>Köşeye yakın yerleştir; duvar sesi doğal olarak güçlendirir.</li>
        <li>Kaliteli bir <a href="gitar-kablosu.html">enstrüman kablosu</a> kullan; ucuz kablo cızırtı ve sinyal kaybı yapar.</li>
      </ul>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <p>Küçük mekânda büyük ses için stüdyo değil, doğru mini amfi yeterli. <strong>Sade bir başlangıç için Mini Amfi Seti, kablosuz ve şarjlı bir deneyim için M-VAVE.</strong> İkisi de evdeki pratiği gerçek bir keyfe çevirir.</p>
      </div>
    `
  },

  {
    slug: 'enstruman-bakimi-101',
    title: 'Enstrüman Bakımı 101: Tel, Kablo ve Baget Ömrü',
    category: 'Bakım',
    date: '2026-04-09',
    readMin: 5,
    dek: 'Çalgın kötü ses vermiyor olabilir — sadece bakımsızdır. Tel, kablo ve baget üçlüsünde bilmen gereken her şey.',
    keywords: 'enstrüman bakımı, gitar teli ne zaman değişir, enstrüman kablosu seçimi, baget ömrü, davul baget',
    body: `
      <p class="lead">Çoğu kişi çalgısının "eskidiğini" düşünür, oysa sorun genelde küçük sarf parçalarındadır. <strong>Tel, kablo ve baget; düzenli bakım istenen üç parçadır</strong> ve ucuzdur. İşte ne zaman değiştirmen gerektiği.</p>

      <h2>Teller — sesin yarısı burada</h2>
      <p>Teller terle, tozla ve zamanla okside olur; tınısı matlaşır, akort tutmaz. Belirtiler:</p>
      <ul>
        <li>Parlaklığını yitirmiş, mat bir ses</li>
        <li>Akordun çabuk bozulması</li>
        <li>Telde kararma veya pürüz hissi</li>
      </ul>
      <p>Sık çalıyorsan <strong>1–2 ayda bir</strong> değiştirmek mantıklı. Elektro gitar için dengeli bir <a href="gitar-teli.html">09-42 tel seti</a>, keman için <a href="keman.html">berrak tonlu bir keman tel seti</a> çalgıyı yenilenmiş gibi hissettirir.</p>

      <h2>Kablo — sessiz katil</h2>
      <p>Cızırtının, ses kesilmelerinin ve sinyal kaybının çoğu kablodandır, çalgıdan değil. İyi bir kablonun özellikleri:</p>
      <ul>
        <li>Düşük gürültü için sağlam ekranlama</li>
        <li>Dayanıklı, kolay kopmayan lehim noktaları</li>
        <li>İhtiyacına uygun uzunluk (evde 3–6 m yeterli)</li>
      </ul>
      <p><a href="gitar-kablosu.html">Kirlin LightGear 6M kablo</a> gibi düşük gürültülü ve korumalı bir kablo, hem sahnede hem stüdyoda güvenilirdir.</p>

      <h2>Baget — davulcunun lastiği</h2>
      <p>Bagetler çatlar, soyulur ve dengesini kaybeder. Çatlak bir baget hem sesi bozar hem bileğini yorar. <a href="davul-bageti.html">Akçaağaç 5B baget</a> dengeli ağırlığıyla hızlı geçişlerde eli yormaz; çatlama gördüğünde hemen değiştir.</p>

      <h2>Genel bakım refleksleri</h2>
      <ul>
        <li>Çaldıktan sonra teli kuru bezle sil — ömrü uzar.</li>
        <li>Çalgıyı kılıfında, nemden ve doğrudan güneşten uzak sakla.</li>
        <li>Yedek tel, kablo ve baget bulundur; en kötü anda elinin altında olsun.</li>
      </ul>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <p>Çalgın "bitmedi", muhtemelen sadece bakım istiyor. <strong>Tel (1–2 ayda bir), kablo (cızırtı varsa) ve baget (çatlayınca)</strong> üçlüsünü takip et — küçük masrafla büyük ses farkı.</p>
      </div>
    `
  },

  {
    slug: 'cocuga-ilk-enstruman',
    title: 'Çocuğunuza İlk Enstrüman: Yaşa ve Mizaca Göre Seçim',
    category: 'Rehber',
    date: '2026-03-30',
    readMin: 5,
    dek: 'Yanlış çalgı, çocuğu müzikten soğutur. Yaş, fiziksel uygunluk ve mizaca göre doğru ilk adımı seçin.',
    keywords: 'çocuk için ilk enstrüman, kaç yaşında müzik aleti, çocuğa hangi enstrüman, çocuk müzik eğitimi',
    body: `
      <p class="lead">Çocuğa enstrüman seçerken iki tuzak var: çok zor bir çalgıyla cesaretini kırmak ya da hiç ilgisini çekmeyen bir şeye zorlamak. Doğru seçim <strong>yaş + fiziksel uygunluk + mizaç</strong> üçgeninde saklı.</p>

      <h2>Yaşa göre kabaca harita</h2>
      <ul>
        <li><strong>4–6 yaş:</strong> Ritim ve kulak gelişimi dönemi. Basit perküsyon, küçük bir <a href="keyboard-org.html">keyboard</a> ile renkli, oyunlaştırılmış başlangıç.</li>
        <li><strong>7–9 yaş:</strong> El-göz koordinasyonu oturur. Keyboard/piyano veya küçük boy keman (1/2, 3/4) uygundur.</li>
        <li><strong>10+ yaş:</strong> Fiziksel olarak gitar ve davula hazır. Tercih artık çocuğun kendi merakına bırakılabilir.</li>
      </ul>

      <h2>Mizaca göre yönlendirme</h2>
      <ul>
        <li><strong>Hareketli, enerjik çocuk:</strong> Davul enerjisini kanalize eder. Gürültü endişesi için <a href="elektronik-davul.html">elektronik davul</a> + kulaklık.</li>
        <li><strong>Sakin, sabırlı çocuk:</strong> Piyano veya keman uyum sağlar.</li>
        <li><strong>Meraklı, çabuk sıkılan çocuk:</strong> Yüzlerce ses sunan keyboard ilgisini canlı tutar.</li>
      </ul>

      <h2>Pratik tavsiyeler</h2>
      <ul>
        <li><strong>Boy/beden:</strong> Keman ve gitarda çocuğun bedenine uygun ölçü şart; büyük çalgı motivasyonu kırar.</li>
        <li><strong>Ses kontrolü:</strong> Kulaklık takılabilen çalgılar (keyboard, elektronik davul) evde huzuru korur.</li>
        <li><strong>Bütçe:</strong> İlk çalgı en pahalı olan olmasın; çocuğun ilgisi netleşince yükseltirsin.</li>
      </ul>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <p>İdeal ilk enstrüman; çocuğun <strong>yaşına uygun ölçüde, mizacını destekleyen ve evde ses sorunu yaratmayan</strong> bir çalgıdır. Küçük yaşta keyboard ve perküsyon güvenli başlangıçtır; mizaç netleştikçe gitar, keman ya da davula yönelebilir.</p>
      </div>
    `
  },

  /* ============================================================
     Ticari intent yazıları — satın alma niyetli aramaları karşılar
     ("fiyatları", "hangisini almalıyım", "X mi Y mi").
     Her yazı bir kategori landing sayfasına link verir.
     ============================================================ */

  {
    slug: 'elektro-gitar-fiyatlari-rehberi',
    title: 'Elektro Gitar Fiyatları: Bütçene Göre Ne Alabilirsin?',
    category: 'Rehber',
    date: '2026-07-02',
    readMin: 6,
    dek: 'Elektro gitar fiyatlarını belirleyen şey marka değil, malzeme ve işçilik. Bütçe aralıklarına göre neyin gerçekçi olduğunu anlattık.',
    keywords: 'elektro gitar fiyatları, elektro gitar seti fiyat, ucuz elektro gitar, elektro gitar kaç para',
    body: `
      <p class="lead">"Elektro gitar kaç para?" sorusunun tek bir cevabı yok — ama fiyatı neyin belirlediğini bilirsen, bütçenin karşılığında ne alman gerektiğini de bilirsin. Bu yazıda fiyatı oluşturan kalemleri tek tek açıp, hangi bütçede neyin gerçekçi olduğunu anlatıyoruz.</p>

      <h2>Fiyatı belirleyen 4 şey</h2>
      <p><strong>1. Ahşap ve gövde yapımı.</strong> Tek parça gövde mi, yapıştırılmış katmanlar mı? Sap gövdeye vidalı mı, geçme mi? Bunlar hem sustain'i hem de gitarın uzun vadede formunu korumasını etkiler.</p>
      <p><strong>2. Manyetikler.</strong> Gitarın sesini üreten asıl parça. Seri üretim seramik manyetiklerle el sarımı alnico manyetikler arasında hem ton hem fiyat farkı büyüktür.</p>
      <p><strong>3. Donanım.</strong> Burgular, köprü ve tel tutucu. Ucuz burgu akort tutmaz — ve akort tutmayan gitar, ne kadar güzel görünürse görünsün çalınmaz.</p>
      <p><strong>4. Kurulum (setup).</strong> Perde uçlarının törpülenmesi, tel yüksekliği ayarı, entonasyon. Bu işçilik gözle görülmez ama çalarken ilk hissedilen şeydir.</p>

      <h2>Giriş seviyesi: ilk gitarın</h2>
      <p>Bu aralıkta hedefin "hayatının gitarı" değil, <strong>çalmayı öğrenmeni engellemeyecek bir enstrüman</strong> olmalı. Aranacak özellikler: akort tutan burgular, kabul edilebilir tel yüksekliği ve pürüzsüz perde uçları. ST kasa, HSS manyetik dizilimli bir model tarzdan bağımsız iş görür.</p>
      <p>Bu seviyede en sık yapılan hata bütçenin tamamını gitara ayırmak. Elektro gitar amfisiz neredeyse duyulmaz — <a href="amfi-pedal.html">amfi</a> ve <a href="gitar-kablosu.html">kablo</a> için pay ayırmadığın bir bütçe planı eksiktir.</p>

      <h2>Orta seviye: ikinci gitar veya ciddi başlangıç</h2>
      <p>Burada fark manyetiklerde ve donanımda hissedilir. Daha net bir temiz ton, distortion altında dağılmayan bir karakter, akordunu günlerce koruyan burgular. Sahneye çıkmayı ya da kayıt yapmayı düşünüyorsan bu aralık mantıklı bir yatırım noktasıdır.</p>

      <h2>Sahne setleri: neden daha hesaplı?</h2>
      <p>Elinde hiç ekipman yoksa <a href="elektro-gitar.html">sahne setleri</a> neredeyse her zaman daha avantajlı. Gitar, kılıf, kablo ve amfiyi ayrı ayrı topladığında çıkan tutar, set fiyatının üzerine çıkar. Ayrıca eksik parça kalmaz — ilk gün çalmaya başlayabilirsin.</p>
      <p>Zaten bir amfin varsa ve sadece gitarı yenilemek istiyorsan tek gitar almak daha doğrudur; ikinci bir amfi için para vermenin anlamı yok.</p>

      <h2>Ucuz gitarda nelere dikkat etmeli?</h2>
      <ul>
        <li><strong>Perde uçları</strong> — sap kenarında elini kesecek kadar keskin çıkıntı varsa çalmak eziyet olur.</li>
        <li><strong>Tel yüksekliği</strong> — teller klavyeden çok yüksekse basmak zorlaşır ve yeni başlayan biri "ben yapamıyorum" sanır.</li>
        <li><strong>Burgu kalitesi</strong> — birkaç dakikada akortu bozuluyorsa çalışma keyfi kalmaz.</li>
        <li><strong>Elektronik gürültüsü</strong> — potansiyometreyi çevirirken cızırtı geliyorsa lehim veya pot kalitesi zayıftır.</li>
      </ul>

      <h2>Taksit ve kargo</h2>
      <p>Tüm siparişlerde PayTR güvenli ödeme altyapısı kullanılır ve kredi kartına taksit seçenekleri ürün sayfasında görüntülenir. 2.000 TL üzeri siparişlerde kargo ücretsizdir; altındaki siparişlerde 199 TL kargo bedeli uygulanır.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <ul>
          <li>Fiyatı belirleyen: <strong>ahşap, manyetik, donanım ve kurulum</strong> — marka değil.</li>
          <li>Bütçeyi gitar + amfi + kablo olarak böl; sadece gitara harcama.</li>
          <li>Hiç ekipmanın yoksa <strong>sahne seti</strong> ayrı ayrı almaktan hesaplıdır.</li>
          <li>Ucuz gitarda önce <strong>perde uçlarına, tel yüksekliğine ve burgulara</strong> bak.</li>
        </ul>
      </div>
    `
  },

  {
    slug: 'baslangic-elektro-gitar-secimi',
    title: 'Yeni Başlayanlar İçin Elektro Gitar: Nereden Başlamalı?',
    category: 'Rehber',
    date: '2026-07-04',
    readMin: 6,
    dek: 'HSS mi SSS mi, hangi tel, hangi amfi? İlk elektro gitarını alırken gerçekten önemli olan kararları sıraladık.',
    keywords: 'yeni başlayanlar için elektro gitar, başlangıç elektro gitar, ilk gitar hangisi, elektro gitar seti başlangıç',
    body: `
      <p class="lead">İlk elektro gitarını seçerken karşına çıkan terimlerin çoğu — HSS, alnico, tremolo, 22 perde — bu aşamada kararını değiştirmez. Gerçekten fark yaratan üç karar var: <strong>manyetik dizilimi, ekipman bütünlüğü ve gitarın kurulumu.</strong> Diğerlerini sonra öğrenirsin.</p>

      <h2>1. Manyetik dizilimi: HSS ile başla</h2>
      <p>Gitar ilanlarındaki SSS, HSS, HSH harfleri manyetiklerin dizilimini anlatır. S single coil (ince, parlak), H humbucker (kalın, güçlü) demektir.</p>
      <p>Yeni başlayan biri için <strong>HSS</strong> en güvenli seçim: köprüdeki humbucker rock ve distortion tonlarını, diğer iki single coil ise temiz ve funk tonlarını karşılar. Ne çalacağına henüz karar vermemişsen tek gitarla en geniş alanı bu dizilim açar.</p>

      <h2>2. Amfiyi unutma</h2>
      <p>En sık yapılan hata bu. Elektro gitar akustik gitardan farklı olarak <strong>tek başına neredeyse duyulmaz.</strong> Amfi olmadan aldığın gitar, çalışmaya başlayamadığın bir gitardır.</p>
      <p>Ev için büyük amfiye gerek yok — aksine, küçük amfiler ev seviyesinde daha iyi ton verir. Apartmanda oturuyorsan <strong>kulaklık çıkışı olan</strong> bir <a href="amfi-pedal.html">mini amfi</a> aramanı öneririz; gecenin herhangi bir saatinde çalışabilirsin.</p>

      <h2>3. İlk gün gerekenler listesi</h2>
      <ul>
        <li><strong>Gitar</strong> — HSS, ST kasa, akort tutan burgularla.</li>
        <li><strong>Amfi</strong> — kulaklık çıkışlı, kompakt.</li>
        <li><strong><a href="gitar-kablosu.html">Enstrüman kablosu</a></strong> — ekranlı, mono jak. Ev için 3 metre yeterli.</li>
        <li><strong><a href="gitar-kilifi.html">Kılıf</a></strong> — gitarlar çalınırken değil taşınırken kırılır.</li>
        <li><strong>Pena</strong> — 0.60-0.73 mm arası orta sertlik en affedicisi.</li>
        <li><strong>Akort aleti</strong> — klipsli akortçu telefon uygulamasından güvenilirdir.</li>
      </ul>
      <p>Bu listeyi ayrı ayrı toplamak yerine <a href="elektro-gitar.html">sahne seti</a> almak çoğu zaman hem daha ucuz hem daha pratiktir.</p>

      <h2>Hangi telle başlamalı?</h2>
      <p>Fabrikadan çıkan çoğu elektro gitar <strong>09-42</strong> kalınlıkta telle gelir ve bu, yeni başlayanlar için doğru olandır. İnce tel daha kolay basılır, bükmesi rahattır ve henüz nasır tutmamış parmak uçlarını daha az yorar. Parmakların alıştıkça 10-46'ya geçip daha dolgun bir ton alabilirsin. <a href="gitar-teli.html">Tel setleri</a> hakkında ayrıntı için tel rehberimize bakabilirsin.</p>

      <h2>İlk ay ne bekleyebilirsin?</h2>
      <p>Gerçekçi bir tablo çizelim:</p>
      <ul>
        <li><strong>1. hafta</strong> — parmak uçları acır, bu normaldir. Akort etmeyi ve tek tek notaları basmayı öğrenirsin.</li>
        <li><strong>2. hafta</strong> — ilk akorlar (Em, Am, E, A) oturmaya başlar. Geçişler yavaştır, sorun değil.</li>
        <li><strong>3-4. hafta</strong> — akor geçişleri hızlanır, basit bir şarkıya eşlik edebilirsin.</li>
      </ul>
      <p>Buradaki tek kural: <strong>her gün 15 dakika, haftada bir 2 saatten iyidir.</strong> Kas hafızası tekrar sıklığıyla oluşur, toplam süreyle değil.</p>

      <h2>Yeni başlayanların en sık üç hatası</h2>
      <p><strong>Bütçenin tamamını gitara harcamak.</strong> Amfisiz gitar sessiz bir tahtadır.</p>
      <p><strong>Kurulumu ihmal etmek.</strong> Tel yüksekliği yanlış bir gitarda çalmak gereksiz yere zordur; çoğu yeni başlayan bunu kendi beceriksizliği sanıp bırakır.</p>
      <p><strong>Çok hızlı başlamak.</strong> Metronomla yavaş çalışmak sıkıcı gelir ama hız, ancak temiz çalmanın üzerine kurulur.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <ul>
          <li>Dizilim seçemiyorsan <strong>HSS</strong> al — tek gitarla en geniş alanı açar.</li>
          <li><strong>Amfi bütçenin parçası</strong>; apartmandaysan kulaklık çıkışlı model seç.</li>
          <li><strong>09-42 tel</strong> ile başla, parmakların alışınca kalınlaştır.</li>
          <li>Günde 15 dakika düzenli çalışma, haftada bir uzun seanstan hızlı sonuç verir.</li>
        </ul>
      </div>
    `
  },

  {
    slug: 'dijital-piyano-fiyatlari-88-tus',
    title: 'Dijital Piyano Fiyatları: 88 Tuş ve Çekiç Aksiyonu Ne Demek?',
    category: 'Rehber',
    date: '2026-07-06',
    readMin: 6,
    dek: 'Dijital piyano fiyatını en çok tuş mekanizması belirler. 88 tuş, çekiç aksiyonu ve polifoni terimlerini sade dille açıkladık.',
    keywords: 'dijital piyano fiyatları, 88 tuş dijital piyano, çekiç aksiyonlu piyano, elektronik piyano fiyat',
    body: `
      <p class="lead">Dijital piyano ilanlarında en çok geçen üç terim şunlar: 88 tuş, çekiç aksiyonu ve polifoni. Fiyat farkının büyük kısmı da tam olarak bu üçünden çıkıyor. Ne anlama geldiklerini bilirsen, ödediğin paranın karşılığında ne aldığını da bilirsin.</p>

      <h2>88 tuş: neden standart?</h2>
      <p>Akustik konser piyanosunda 88 tuş vardır ve klasik repertuvarın tamamı bu aralığa göre yazılmıştır. 61 tuşlu bir enstrüman başlangıçta yeterli gelir; sınır, repertuvar ilerledikçe ortaya çıkar — parçanın en pes ya da en tiz notasına ulaşamazsın.</p>
      <p>Piyano eğitimi almayı planlıyorsan 88 tuşla başlamak ileride enstrüman değiştirmemek anlamına gelir ve uzun vadede daha ekonomiktir.</p>

      <h2>Çekiç aksiyonu: fiyatın en büyük kalemi</h2>
      <p>Akustik piyanoda tuşa bastığında bir çekiç teli tokatlar. Pes tuşlardaki çekiçler ağır, tiz tuşlardakiler hafiftir — bu yüzden akustik piyanonun sol tarafı sağından daha ağır hissettirir.</p>
      <p>Çekiç aksiyonlu dijital piyanolar bu mekanik ağırlığı <strong>fiziksel olarak</strong> taklit eder ve mekanizma karmaşık olduğu için fiyatın en büyük kalemidir. Peki gerekli mi? Piyano çalmayı ciddi öğrenecekseniz evet: hafif tuşlu bir enstrümanda çalışan biri akustik piyanoya oturduğunda tuşları beklediğinden çok ağır bulur ve tekniğini baştan kurmak zorunda kalır.</p>
      <p><strong>"Kademeli çekiç"</strong> ifadesi bu ağırlık farkının klavye boyunca aşamalandırıldığını gösterir; akustik hissine en yakın sistemdir.</p>

      <h2>Tuş hassasiyeti</h2>
      <p>Hassasiyet, tuşa ne kadar hızlı bastığının sesin gürlüğünü etkilemesidir. Bu olmadan enstrüman her vuruşta aynı seviyede ses çıkarır ve müzikten ifade tamamen kaybolur — kreşendo yapamaz, bir melodiyi eşlikten öne çıkaramazsın. Çok kademeli hassasiyet ayarı sunan modellerde tepkiyi kendi dokunuşuna göre ayarlayabilirsin.</p>

      <h2>Polifoni: 64 mü 128 mi?</h2>
      <p>Polifoni, aynı anda çalınabilen maksimum nota sayısıdır. "On parmağım var, 10 yeter" demek yanıltıcı: sustain pedalına bastığında sönmekte olan notalar çalmaya devam eder ve sayaca eklenir. Katmanlı ses (piyano + yaylı gibi) kullanırsan rakam iki katına çıkar.</p>
      <p>Başlangıç için 64 polifoni yeterlidir. Pedal yoğun klasik parçalar çalışacaksan 128 ve üzeri, nota kesilmesi yaşamamanı garanti eder.</p>

      <h2>Mobilyalı mı, standlı mı?</h2>
      <ul>
        <li><strong>Mobilyalı (konsol)</strong> — ahşap gövde, sabit ayak, genellikle üç pedal. Evde sabit bir yere kurulacaksa hem görsel hem sağlamlık açısından üstün.</li>
        <li><strong>Metal standlı</strong> — daha hafif, sökülüp taşınabilir. Öğrenci evi, küçük daire ya da ders/sahne için taşınacak enstrümanlarda pratik.</li>
      </ul>

      <h2>Dijital piyanonun gizli tasarrufu</h2>
      <p>Akustik piyano yılda bir-iki kez akort gerektirir ve bu düzenli bir masraftır. Dijital piyano akort gerektirmez, nem ve sıcaklık değişimlerinden etkilenmez. İlk alım fiyatını karşılaştırırken bu tekrar eden gideri de hesaba katmak gerekir.</p>
      <p><a href="dijital-piyano.html">Dijital piyano modellerimize</a> göz atarak 88 tuş ve çekiç aksiyonlu seçenekleri karşılaştırabilirsin.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <ul>
          <li><strong>88 tuş</strong> — piyano eğitimi düşünüyorsan baştan al, sonra değiştirme.</li>
          <li><strong>Çekiç aksiyonu</strong> fiyatın en büyük kalemi ama doğru tekniğin şartı.</li>
          <li><strong>Polifoni</strong> 64 başlangıç için yeter, 128+ pedal yoğun parçalar için.</li>
          <li>Dijital piyano <strong>akort masrafı yoktur</strong> — uzun vadede fark eder.</li>
        </ul>
      </div>
    `
  },

  {
    slug: 'gitar-teli-kalinligi-secimi',
    title: 'Gitar Teli Kalınlığı Nasıl Seçilir? 09-42 mi, 10-46 mı?',
    category: 'Rehber',
    date: '2026-07-08',
    readMin: 5,
    dek: 'Tel kalınlığı hem çalma kolaylığını hem tonu değiştirir — ve yanlış set gitarın ayarını bozabilir. Rakamların ne anlama geldiğini açıkladık.',
    keywords: 'gitar teli kalınlığı, 09-42 tel, 10-46 tel, gitar teli hangisi, gitar teli seçimi',
    body: `
      <p class="lead">Tel paketinin üzerindeki 09-42 ya da 10-46 gibi rakamlar, setin <strong>en ince telinin ve en kalın telinin inç cinsinden kalınlığını</strong> gösterir. 09-42 demek, en ince telin 0.009 inç olduğu anlamına gelir. Bu küçük rakamlar hem çalma kolaylığını hem tonu, hatta gitarın ayarını etkiler.</p>

      <h2>İnce tel mi, kalın tel mi?</h2>
      <p><strong>İnce teller (09-42):</strong> Basması kolay, bükmesi (bending) rahat. Parmak ucu henüz nasır tutmamış yeni başlayanlar için en affedici seçenek. Karşılığında ton biraz daha ince ve sustain daha kısa olur.</p>
      <p><strong>Kalın teller (10-46 ve üzeri):</strong> Daha dolgun bir ton, daha uzun sustain ve düşük akortlarda tel gevşemesine karşı direnç. Buna karşılık parmak ucuna belirgin şekilde daha çok baskı yapar ve bükmek daha çok güç ister.</p>

      <h2>Hangisiyle başlamalı?</h2>
      <p>Yeni başlıyorsan <strong>09-42</strong>. Bu aşamada en büyük risk, çalmayı zor bulup bırakmak — ince tel bu eşiği düşürür. Parmakların alıştıktan sonra (genellikle birkaç ay) 10-46'ya geçip daha dolu bir ton alabilirsin.</p>
      <p>Akustik gitarda ise teller doğası gereği daha kalındır çünkü gövdeyi sürecek enerjiyi üretmeleri gerekir; başlangıç için <strong>10-47</strong> aralığı en rahatıdır.</p>

      <h2>Kalınlık değiştirirken dikkat: sapa binen gerilim</h2>
      <p>Bu, çoğu kişinin bilmediği ama önemli bir nokta. Tel kalınlığı değiştiğinde <strong>sapa binen toplam gerilim de değişir.</strong> Bir kademelik geçişlerde (09'dan 10'a) çoğu gitar sorunsuz uyum sağlar.</p>
      <p>Ama büyük sıçramalarda (09'dan 11'e) gitarın ayarı bozulabilir: tel yüksekliği değişir, perdeler vızıldamaya başlar, entonasyon kayar. Bu durumda gitarın kurulumunu (setup) yaptırmak gerekir. Sap eğrilmesinden korkma — bu geçici bir ayar meselesidir, kalıcı hasar değildir.</p>

      <h2>En kritik kural: gitar tipine uygun tel al</h2>
      <p>Bu, yeni başlayanların en pahalıya mal olan hatasıdır. Üç tel ailesi birbirinin yerine kullanılamaz:</p>
      <ul>
        <li><strong>Klasik gitar</strong> → naylon tel</li>
        <li><strong>Akustik gitar</strong> → bronz/fosfor bronz çelik tel</li>
        <li><strong>Elektro gitar</strong> → nikel/çelik tel</li>
      </ul>
      <p><strong>Klasik gitara çelik tel takmak</strong> en tehlikeli olanıdır: klasik gitarın sapında çelik telin yarattığı gerilime dayanacak takviye çubuğu (truss rod) çoğunlukla bulunmaz. Sap eğilir, köprü yerinden kalkabilir ve gitar kalıcı hasar görür. Klasik gitar yalnızca naylon tel kullanır — istisnası yoktur.</p>

      <h2>Tel ne zaman değişir?</h2>
      <p>Kopmasını beklemek yaygın ama yanlış bir alışkanlık. Değişim işaretleri:</p>
      <ul>
        <li>Ton matlaştı, ses cansız duyuluyor</li>
        <li>Çaldıkça sürekli akorttan düşüyor</li>
        <li>Sarımlı bas tellerde pas veya kararma var</li>
        <li>Parmağını tel üzerinde kaydırdığında pürüz hissediyorsun</li>
      </ul>
      <p>Kaba zamanlama: her gün çalan için 1-2 ay, haftada birkaç kez çalan için 3-4 ay, ara sıra çalan için 6 aya kadar. Terli el ve nemli ortam bu süreleri kısaltır.</p>

      <h2>Tel ömrünü uzatmanın iki yolu</h2>
      <p>İkisi de bedava: <strong>çalmadan önce ellerini yıka</strong> ve <strong>çaldıktan sonra telleri kuru bezle sil.</strong> Tellerin ana düşmanı elden geçen ter ve yağdır; bunlar sarımın altına girip içeriden korozyona yol açar. Sadece bu iki alışkanlık tel ömrünü belirgin biçimde uzatır.</p>
      <p><a href="gitar-teli.html">Tel setlerimize</a> göz atarak elektro, akustik ve klasik gitar için uygun kalınlıkları karşılaştırabilirsin.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <ul>
          <li>Rakamlar <strong>en ince ve en kalın telin inç kalınlığı.</strong></li>
          <li>Yeni başlayan: elektroda <strong>09-42</strong>, akustikte <strong>10-47</strong>.</li>
          <li>Büyük kalınlık sıçramaları gitarın <strong>ayarını bozar</strong> — bir kademe geç.</li>
          <li><strong>Klasik gitara asla çelik tel takma</strong> — kalıcı hasar verir.</li>
        </ul>
      </div>
    `
  },

  {
    slug: 'klasik-akustik-elektro-tel-farki',
    title: 'Klasik, Akustik ve Elektro Gitar Teli Arasındaki Fark',
    category: 'Rehber',
    date: '2026-07-10',
    readMin: 5,
    dek: 'Üç tel ailesi birbirinin yerine kullanılamaz — ve yanlış tercih gitarını kalıcı olarak bozabilir. Farkları ve nedenlerini anlattık.',
    keywords: 'klasik gitar teli, akustik gitar teli, elektro gitar teli, naylon tel çelik tel farkı',
    body: `
      <p class="lead">Gitar teli alırken "hepsi tel işte" diye düşünmek, müzik mağazalarında en sık görülen ve en pahalıya mal olan yanılgı. Üç tel ailesi birbirinden malzeme, gerilim ve çalışma prensibi olarak ayrılır — ve karıştırıldığında sonuç sadece kötü ton değil, kalıcı hasar olabilir.</p>

      <h2>Klasik gitar teli: naylon</h2>
      <p>Klasik gitar tellerinin ince olanları (mi, si, sol) saf naylondur; kalın olanları (re, la, mi) naylon çekirdek üzerine metal sarımlıdır. Karakteristik özellikleri düşük gerilim ve yumuşak tuşedir.</p>
      <p>Bu düşük gerilim tesadüf değil: klasik gitarın gövdesi ve sapı naylonun yarattığı yükü taşıyacak şekilde tasarlanmıştır. Ses karakteri sıcak, yuvarlak ve daha az parlaktır — klasik repertuvarın ve fingerstyle çalmanın aradığı tını budur.</p>

      <h2>Akustik gitar teli: bronz çelik</h2>
      <p>Akustik gitar telleri çelik çekirdek üzerine bronz ya da fosfor bronz sarımlıdır. Amaçları gövdeyi akustik olarak "sürmek": ahşap kapağı titretecek kadar enerji üretmeleri gerekir. Bu yüzden hem daha kalın hem çok daha yüksek gerilimlidirler.</p>
      <p>Sonuç parlak, gür ve kesici bir ton. Şarkı eşliğinde ve pena ile ritim çalmada bu enerji tam olarak istenen şeydir.</p>
      <p><strong>Bronz ve fosfor bronz farkı:</strong> bronz daha parlak ama daha çabuk oksitlenir; fosfor bronz biraz daha sıcak tonlu ve daha uzun ömürlüdür.</p>

      <h2>Elektro gitar teli: nikel/çelik</h2>
      <p>Elektro gitarda ses gövdeden değil manyetiklerden gelir. Manyetik, telin titreşimini <strong>manyetik alan üzerinden</strong> algılar — bu yüzden telin manyetik özellikli olması gerekir. Elektro gitar telleri nikel kaplı çelik ya da saf nikel sarımlıdır.</p>
      <p>Akustik tellerdeki bronz manyetik değildir; akustik teli elektro gitara takarsan manyetikler telin titreşimini düzgün algılayamaz ve ses cılız, dengesiz çıkar. Ayrıca elektro telleri gövdeyi sürmek zorunda olmadıkları için daha ince ve daha düşük gerilimlidir — bu da bükmeyi (bending) kolaylaştırır.</p>

      <h2>En tehlikeli hata: klasik gitara çelik tel</h2>
      <p>Bunu ayrıca vurgulamak gerekiyor çünkü sonucu geri dönüşsüz olabiliyor.</p>
      <p>Çelik teller naylon tellerin neredeyse iki katı gerilim uygular. Akustik ve elektro gitarların sapında bu gerilimi dengeleyen bir <strong>truss rod</strong> (ayarlanabilir metal takviye çubuğu) bulunur. Klasik gitarların çoğunda bu çubuk <strong>yoktur</strong> — çünkü naylon telin yükü için gerekmez.</p>
      <p>Klasik gitara çelik tel takıldığında olanlar: sap öne doğru eğilir, köprü gövdeden kalkmaya başlar, kapak şişer ve ilerleyen durumda derzler açılır. Bu tamiri gitarın değerini aşabilen bir hasardır.</p>

      <h2>Peki tersi? Akustik gitara naylon tel</h2>
      <p>Bu hasar vermez ama işe de yaramaz. Akustik gitarın köprüsü çelik telin top ucuna göre tasarlanmıştır; naylon tel bağlanamaz ya da zar zor tutunur. Tutunsa bile gövde o düşük enerjiyle sürülemez, ses son derece cılız kalır.</p>

      <h2>Hızlı kontrol tablosu</h2>
      <ul>
        <li><strong>Gitarın köprüsünde tel bağlanan delikler var, tel düğümleniyor</strong> → klasik gitar, naylon tel.</li>
        <li><strong>Köprüde pimler var, tel ucunda metal top</strong> → akustik gitar, bronz çelik tel.</li>
        <li><strong>Gövdede manyetikler ve jak girişi var</strong> → elektro gitar, nikel/çelik tel.</li>
      </ul>

      <h2>Naylon tel bakımı: bir sürpriz</h2>
      <p>Yeni takılan naylon teller birkaç gün boyunca sürekli akorttan düşer. Bu bir arıza değil — naylon, gerilim altında uzamaya devam eder. İlk hafta her çalışma öncesi akort etmen normaldir; sonrasında oturur. Çelik tellerde bu süre çok daha kısadır.</p>
      <p>Uygun tel setleri için <a href="gitar-teli.html">gitar teli sayfamıza</a> göz atabilir, gitar tipine göre seçim yapabilirsin.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <ul>
          <li><strong>Klasik</strong> → naylon, düşük gerilim, sıcak ton.</li>
          <li><strong>Akustik</strong> → bronz çelik, yüksek gerilim, gövdeyi sürer.</li>
          <li><strong>Elektro</strong> → nikel/çelik, manyetik algılanabilir, daha ince.</li>
          <li>Klasik gitarda <strong>truss rod yoktur</strong> — çelik tel kalıcı hasar verir.</li>
        </ul>
      </div>
    `
  },

  {
    slug: 'bateri-takimi-mi-elektronik-davul-mu',
    title: 'Bateri Takımı mı, Elektronik Davul mu? Apartman Rehberi',
    category: 'Rehber',
    date: '2026-07-11',
    readMin: 6,
    dek: 'Akustik bateri 100 desibeli aşar, elektronik davul kulaklıkla sessizdir. Ama karar sadece ses meselesi değil.',
    keywords: 'bateri takımı, elektronik davul, akustik davul mu elektronik mi, apartmanda davul, sessiz davul seti',
    body: `
      <p class="lead">Davula başlamak isteyen herkesin karşılaştığı ilk çatal bu: akustik bateri takımı mı, elektronik davul mu? Türkiye'de çoğunluk apartmanda yaşadığı için cevap genellikle elektroniktir — ama karar sadece ses meselesi değil. İkisini dürüstçe karşılaştıralım.</p>

      <h2>Ses: aradaki fark ne kadar büyük?</h2>
      <p>Akustik bir bateri takımı rahatlıkla 100 desibeli aşar — bu, bir motorlu testereye yakın bir seviyedir ve <strong>hiçbir apartman dairesinde</strong> komşu rahatsız etmeden çalınamaz. Ses yalıtımı yaptırmak mümkündür ama maliyeti setin kendisinden yüksektir.</p>
      <p>Elektronik davulda kulaklık taktığında odaya yayılan tek ses, bagetin pad'e çarpma sesidir; normal konuşma sesinin altında kalır. Bu, "her akşam 15 dakika çalışabilmek" ile "hiç çalışamamak" arasındaki fark demektir.</p>
      <p><strong>Ama tamamen sessiz değil:</strong> kick pedalının zemine ilettiği titreşim alt kata geçebilir. Setin altına kalın bir halı ya da yalıtım paspası sermek bunu belirgin şekilde azaltır.</p>

      <h2>His ve teknik: akustik hâlâ önde</h2>
      <p>Dürüst olmak gerekirse akustik davulun deri hissi, zillerin doğal tınısı ve setin dinamik tepkisi elektronikte tam karşılanmaz. Özellikle zil çalışmasında (ride, crash nüansları) fark hissedilir.</p>
      <p>Bu farkı en aza indiren şey <strong>mesh (file) pad</strong>'lerdir. Gergin file yüzey gerçek deriye çok daha yakın bir geri tepme verir ve birçok modelde gerginliği ayarlanabilir. Kauçuk pad'ler daha sert teper ve vuruş sesi biraz daha yüksektir.</p>

      <h2>Yer ve taşınabilirlik</h2>
      <p>Akustik bir set kurulduğu yerde kalır ve ciddi bir alan kaplar. Elektronik setler daha kompakttır, birçoğu katlanabilir ve taşınması çok daha kolaydır. Öğrenci evi ya da küçük daire için bu tek başına belirleyici olabilir.</p>

      <h2>Maliyet: görünen ve görünmeyen</h2>
      <p>Akustik setin fiyatına ek olarak şunlar gelir: zil takımı (çoğu sette dahil değildir), akort anahtarı, deri değişimi ve — apartmandaysanız — ses yalıtımı. Elektronik sette ise kulaklık ve baget genellikle setle birlikte gelir; ek masraf çok daha azdır.</p>

      <h2>Elektronik seçerken nelere bakmalı?</h2>
      <ul>
        <li><strong>Hi-hat pedalı</strong> — ayrı pedallı modeller gerçek davul tekniğini öğretir. Sadece anahtarla açık/kapalı yapan sistemler bu tekniği çalışmanı sınırlar.</li>
        <li><strong>Pad sayısı</strong> — trampet, üç tom, kick, hi-hat ve iki zil standart bir başlangıç dizilimidir; gerçek setin yerleşimini öğretir.</li>
        <li><strong>Mesh vs kauçuk</strong> — uzun çalışacaksan mesh belirgin konfor farkı yaratır.</li>
        <li><strong>Kulaklık çıkışı ve aux giriş</strong> — şarkıya eşlik ederek çalışmak ritim duygusunu hızlı geliştirir.</li>
      </ul>

      <h2>Üçüncü seçenek: çalışma pedi</h2>
      <p>Henüz set almaya hazır değilsen ya da bütçe kısıtlıysa, davula başlamanın en ucuz yolu bir <a href="davul-calisma-pedi.html">çalışma pedi</a>dir. Vuruş eşitliği, bilek kontrolü ve rudimentlerin tamamı pad üzerinde çalışılır — profesyoneller bile günlük ısınmalarını pad'de yapar. Ayak koordinasyonu için sonunda bir sete geçmen gerekir ama pad, o geçişi çok kolaylaştırır.</p>

      <h2>Karar tablosu</h2>
      <ul>
        <li><strong>Apartmanda yaşıyorsan</strong> → elektronik davul, tartışmasız.</li>
        <li><strong>Müstakil ev / yalıtılmış oda varsa</strong> → akustik his ve zil çalışması için üstün.</li>
        <li><strong>Yer sorunun varsa</strong> → elektronik.</li>
        <li><strong>Bütçe çok kısıtlıysa</strong> → çalışma pedi ile başla.</li>
      </ul>
      <p><a href="elektronik-davul.html">Elektronik davul setlerimize</a> göz atarak hi-hat pedallı ve mesh pad'li seçenekleri karşılaştırabilirsin.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <ul>
          <li>Akustik bateri <strong>100 dB+</strong> — apartmanda gerçekçi değil.</li>
          <li>Elektronik davul kulaklıkla sessizdir; <strong>kick titreşimi</strong> için halı ser.</li>
          <li><strong>Mesh pad</strong> gerçek deri hissine en yakın olanıdır.</li>
          <li><strong>Hi-hat pedalı</strong> olan seti seç — gerçek tekniği o öğretir.</li>
        </ul>
      </div>
    `
  },

  {
    slug: 'klarnet-fiyatlari-sol-klarnet',
    title: 'Klarnet Fiyatları ve Sol Klarnet Seçimi',
    category: 'Rehber',
    date: '2026-07-12',
    readMin: 5,
    dek: 'Türkiye\'de "klarnet" denince akla gelen ses sol klarnettir. Si bemolden farkı, kamış seçimi ve başlangıç rehberi.',
    keywords: 'klarnet fiyatları, sol klarnet, si bemol klarnet, klarnet satın al, başlangıç klarneti',
    body: `
      <p class="lead">Klarnet almaya karar verdiğinde vereceğin en önemli karar marka ya da fiyat değil: <strong>sol klarnet mi, si bemol klarnet mi?</strong> Bu seçim yanlış yapılırsa, çalmak istediğin müziği çalamazsın. Önce onu netleştirelim.</p>

      <h2>Sol klarnet ile si bemol klarnet farkı</h2>
      <p><strong>Sol klarnet</strong> Türk müziğinin klarnetidir. Si bemol klarnetten daha uzundur, daha pes ve yumuşak, "yanık" olarak tanımlanan bir tona sahiptir. Türk halk müziği, roman havası, fasıl ve arabeskte duyduğun o karakteristik ses budur. Türkiye'de "klarnet" denince akla gelen tını sol klarnettir.</p>
      <p><strong>Si bemol (Bb) klarnet</strong> dünya standardıdır. Klasik müzik, orkestra, bando ve caz repertuvarının tamamı bunun için yazılmıştır. Konservatuvar eğitimi bu enstrüman üzerinden yürür.</p>
      <p>İyi haber: <strong>parmak sistemi ikisinde de aynıdır.</strong> Birinde öğrendiğin teknik diğerine büyük ölçüde aktarılır. Ama repertuvar, ton ve birlikte çalacağın müzisyenler tamamen farklıdır.</p>

      <h2>Hangisini almalısın?</h2>
      <ul>
        <li><strong>Türk halk müziği, fasıl, arabesk, roman havası çalacaksan</strong> → sol klarnet.</li>
        <li><strong>Konservatuvar, orkestra, bando ya da caz hedefliyorsan</strong> → si bemol klarnet.</li>
        <li><strong>Bir toplulukla çalacaksan</strong> → o topluluğun kullandığını al; farklı perdedeki iki klarnet birlikte çalmaz.</li>
      </ul>

      <h2>Fiyatı belirleyen nedir?</h2>
      <p><strong>Gövde malzemesi.</strong> Başlangıç klarnetleri genellikle ABS reçine (ebonit benzeri sentetik) gövdelidir. Bu bir eksiklik değil, avantajdır: sentetik gövde nem ve sıcaklık değişimlerinden etkilenmez, çatlamaz. Ahşap (grenadilla) gövdeler daha zengin bir ton verir ama bakım hassasiyeti ve fiyatı çok yüksektir.</p>
      <p><strong>Perde mekanizması.</strong> Perdelerin kaplaması, yayların kalitesi ve pedlerin sızdırmazlığı doğrudan çalınabilirliği etkiler. Sızdıran bir ped, o notanın hiç çıkmaması demektir.</p>
      <p><strong>Ağızlık.</strong> Sesin karakterini en çok etkileyen ve en ucuza değiştirilebilen parçadır. Setle gelen ağızlık başlangıç için yeterlidir; ilerledikçe ağızlık değişimi en yüksek getirili yükseltmedir.</p>

      <h2>Kamış: en çok gözden kaçan detay</h2>
      <p>Klarnetin sesini üreten şey gövde değil, ağızlığa takılan ince kamıştır. Sertlik numarasına göre seçilir:</p>
      <ul>
        <li><strong>1,5 - 2</strong> — yumuşak; yeni başlayanlar için. Az nefes basıncıyla ses verir.</li>
        <li><strong>2,5 - 3</strong> — orta; ağız kasları geliştikçe geçilir, daha dolgun ve kontrollü ton.</li>
        <li><strong>3,5 ve üzeri</strong> — sert; deneyimliler için, güçlü nefes desteği ister.</li>
      </ul>
      <p>Kamış tükenen malzemedir: ıslanıp kuruma döngüsüyle yıpranır, çatlar ve tonu bozulur. Her zaman birkaç yedek bulundurmak gerekir. Yeni başlayan birinin "klarnetim bozuk" dediği durumların çoğu aslında kamış sorunudur.</p>

      <h2>İlk ses neden çıkmıyor?</h2>
      <p>Klarnette ilk zorluk parmaklar değil ağızdır. Doğru embouchure: alt dudak dişlerin üzerine hafifçe kıvrılır, üst dişler ağızlığın üstüne dayanır, ağız kenarları sızdırmayacak şekilde kapanır, çene aşağı düz tutulur.</p>
      <p>İlk günlerde cırtlak ses ya da hiç ses gelmemesi tamamen normaldir. En yaygın sebepler: kamış çok sert, kamış ağızlığa yanlış hizalanmış, ağız kenarlarından hava kaçıyor ya da nefes karından değil göğüsten geliyor. <strong>Nefes desteğinin diyaframdan gelmesi</strong> klarnette tonun temelidir.</p>

      <h2>Bakımda tek kritik alışkanlık</h2>
      <p>Her çalışmadan sonra <strong>gövdenin içini temizlik beziyle kurula.</strong> Nefesle giren nem gövdede birikir; ahşap gövdelerde çatlamaya, tüm modellerde ped çürümesine yol açar. Ped değişimi masraflı bir tamirdir. Ayrıca kamışı her kullanımdan sonra çıkarıp kurut, ağızlığı düzenli olarak ılık (sıcak değil) suyla yıka.</p>
      <p><a href="klarnet.html">Klarnet modellerimize</a> göz atarak sol klarnet seçeneklerini inceleyebilirsin.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <ul>
          <li><strong>Türk müziği</strong> → sol klarnet · <strong>klasik/orkestra</strong> → si bemol.</li>
          <li>Parmak sistemi aynı; repertuvar ve ton farklı.</li>
          <li>Başlangıçta <strong>sentetik gövde</strong> avantajdır — çatlamaz.</li>
          <li>"Klarnetim bozuk" şikayetlerinin çoğu aslında <strong>kamış</strong> sorunudur.</li>
        </ul>
      </div>
    `
  },

  {
    slug: 'saksafon-ogrenmek-zor-mu',
    title: 'Saksafon Öğrenmek Zor mu? Başlangıç Rehberi',
    category: 'Rehber',
    date: '2026-07-13',
    readMin: 5,
    dek: 'Saksafon ilk sesi vermesi en kolay, güzel ses vermesi en zor enstrümanlardan. Gerçekçi bir başlangıç rehberi.',
    keywords: 'saksafon öğrenmek, saksafon zor mu, alto saksafon, saksafon fiyatları, başlangıç saksafon',
    body: `
      <p class="lead">Saksafon hakkında dolaşan iki zıt efsane var: "çok kolay, üfleyince çalar" ve "çok zor, yıllar ister". İkisi de yarı doğru. Saksafondan <em>bir</em> ses çıkarmak gerçekten kolaydır — ilk günde başarırsın. <em>Güzel</em> bir ses çıkarmak ise tamamen ağız kaslarının gelişmesine bağlıdır ve bu zaman ister.</p>

      <h2>Hangi saksafonla başlanır?</h2>
      <p>Genel kabul <strong>alto saksafon</strong>dur ve bunun somut sebepleri var:</p>
      <ul>
        <li><strong>Boyut</strong> — orta boy; taşıması ve boyun askısıyla tutması rahat.</li>
        <li><strong>Nefes</strong> — tenora göre belirgin şekilde daha az hava ister.</li>
        <li><strong>Parmak aralıkları</strong> — küçük ellere ve gençlere uygun.</li>
        <li><strong>Materyal</strong> — öğretim kitaplarının ve etütlerin çoğu alto için yazılmıştır.</li>
      </ul>
      <p><strong>Tenor</strong> daha büyük ve ağırdır, daha kalın ve dolgun bir ton verir; caz ve rock'ta çok sevilir ama daha fazla nefes desteği ve el açıklığı ister. <strong>Soprano</strong> düz gövdeli ve en tiz olanıdır; entonasyonu tutturmak belirgin şekilde zordur ve başlangıç için önerilmez.</p>

      <h2>İlk hafta gerçekte ne olur?</h2>
      <p>Beklentiyi doğru kuralım:</p>
      <ul>
        <li><strong>1-3. gün</strong> — sadece ağızlık ve boyunla ses çıkarmaya çalış. Bu sıkıcı gelir ama en hızlı ilerleten adımdır.</li>
        <li><strong>4-7. gün</strong> — tüm enstrümanla birkaç nota. Sesler cırtlak ve dengesiz olacak, normal.</li>
        <li><strong>2-3. hafta</strong> — ağız kasları oturmaya başlar, ses stabilleşir.</li>
        <li><strong>1-2. ay</strong> — basit bir melodiyi baştan sona çalabilirsin.</li>
      </ul>
      <p>Saksafonun avantajı da burada: birçok üflemeli enstrümana göre <strong>tanınabilir bir melodiye ulaşma süresi kısadır.</strong> Bu motivasyonu korumayı kolaylaştırır.</p>

      <h2>Embouchure: işin tamamı burada</h2>
      <p>Saksafonda ilk hedef parmak değil ağızdır. Doğru embouchure şöyle kurulur: alt dudak dişleri örter, üst dişler ağızlığa dayanır, ağız kenarları sızdırmayacak şekilde kapanır. Çene aşağı doğru düz tutulur — şişirilmez.</p>
      <p>İlk seslerin cırtlak veya kaçık olmasının üç yaygın sebebi var: <strong>kamış çok sert</strong>, <strong>ağız kasları henüz zayıf</strong>, ya da <strong>nefes karından değil göğüsten geliyor.</strong> Üçüncüsü en kritik olanıdır: diyafram desteği olmadan ton hiçbir zaman oturmaz.</p>

      <h2>Kamış seçimi</h2>
      <p>Sesi üreten şey metal gövde değil, ağızlığa takılan kamıştır. Yeni başlayanlar için <strong>1,5-2 numara</strong> yumuşak kamışlar uygundur; daha az nefes basıncı ister ve ses çıkarmak kolaydır. Ağız kasları geliştikçe 2,5-3 aralığına geçilir.</p>
      <p>Kamışlar tükenir — ıslanıp kuruyarak yıpranır ve çatlar. Yedeksiz kalmamak gerekir. Çok sert bir kamışla başlamak, yeni başlayanların pes etme sebeplerinden biridir; ses çıkmaz ve kişi kendini beceriksiz sanır.</p>

      <h2>Apartmanda saksafon çalınır mı?</h2>
      <p>Dürüst cevap: zordur. Saksafon yüksek sesli bir enstrümandır ve elektronik enstrümanlardaki gibi bir "kulaklık modu" yoktur. Susturucu (mute) aksesuarları sesi bir miktar kısar ama tonu da bozar.</p>
      <p>Pratik çözüm çalışma saatlerini komşuların uyanık olduğu makul saatlere sınırlamak ve mümkünse iç odada, halı serili bir ortamda çalışmaktır. Bu, saksafon seçmeden önce gerçekçi olarak düşünülmesi gereken bir kısıttır.</p>

      <h2>Bakımda tek kritik kural</h2>
      <p>Her çalışmadan sonra <strong>gövdenin içini temizlik beziyle (swab) kurula.</strong> Nefesle giren nem gövdede birikir ve pedlerin (delikleri kapatan keçe yastıklar) çürümesine yol açar. Ped değişimi masraflı bir tamirdir ve bu tek alışkanlık onu büyük ölçüde önler.</p>
      <p>Ayrıca: kamışı her kullanımdan sonra çıkarıp kurut, ağızlığı düzenli olarak ılık suyla yıka, enstrümanı kullanmadığında daima kılıfında sakla.</p>
      <p><a href="saksafon.html">Saksafon modellerimize</a> göz atabilirsin.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <ul>
          <li>Başlangıç için <strong>alto saksafon</strong> — boyut, nefes ve materyal avantajı.</li>
          <li>İlk günler sadece <strong>ağızlıkla</strong> çalış; en hızlı ilerleten adım budur.</li>
          <li><strong>1,5-2 numara</strong> yumuşak kamışla başla; sert kamış pes ettirir.</li>
          <li>Apartmanda sessiz çalma imkânı <strong>yoktur</strong> — buna göre planla.</li>
        </ul>
      </div>
    `
  },

  {
    slug: 'keman-olculeri-4-4-3-4',
    title: 'Keman Ölçüleri: 4/4, 3/4, 1/2 Hangisi Size Uygun?',
    category: 'Rehber',
    date: '2026-07-14',
    readMin: 5,
    dek: 'Yanlış boy keman sadece rahatsız etmez; entonasyonu ve duruşu baştan sakatlar. Doğru ölçüyü belirlemenin basit yöntemi.',
    keywords: 'keman ölçüleri, 4/4 keman, 3/4 keman, çocuk keman boyu, keman seti',
    body: `
      <p class="lead">Keman perdesiz bir enstrümandır — parmağını doğru yere basmazsan nota yanlış çıkar. Bu yüzden doğru boy, diğer enstrümanlardakinden çok daha kritiktir. Büyük gelen bir keman sadece rahatsız etmez: kolun açısını bozar, parmak aralıklarını yanlış öğretir ve entonasyonu baştan sakatlar.</p>

      <h2>Ölçü nasıl belirlenir?</h2>
      <p>Yaş tek başına yeterli bir gösterge değil — belirleyici olan <strong>kol uzunluğudur.</strong> Ölçüm yöntemi basit:</p>
      <p>Kişi kolunu yana doğru omuz hizasında düz uzatır. Boyundaki çene bölgesinden avuç içinin ortasına kadar olan mesafe ölçülür. Karşılıkları:</p>
      <ul>
        <li><strong>4/4 (tam boy)</strong> — yaklaşık 58 cm ve üzeri · genellikle 12 yaş ve üstü, yetişkinler</li>
        <li><strong>3/4</strong> — yaklaşık 53-58 cm · genellikle 9-12 yaş</li>
        <li><strong>1/2</strong> — yaklaşık 48-53 cm · genellikle 7-9 yaş</li>
        <li><strong>1/4</strong> — yaklaşık 43-48 cm · genellikle 5-7 yaş</li>
      </ul>

      <h2>Sınırdaysan küçüğü seç</h2>
      <p>Bu, öğretmenlerin en çok tekrarladığı kuraldır. İki ölçü arasında kaldıysan <strong>daima küçük olanı al.</strong></p>
      <p>Sebebi şu: küçük keman zorlanmadan çalınır ve teknik doğru oturur. Büyük keman ise çocuğu omzunu kaldırmaya, vücudunu yana eğmeye ve sol kolunu fazla uzatmaya zorlar. Bu yanlış duruş alışkanlığa dönüşür ve sonradan düzeltmek, baştan doğru öğrenmekten çok daha zordur.</p>
      <p>Basit kontrol: çocuk kemanı normal çalma pozisyonunda tutarken sol kolunu rahatça uzatıp burguların olduğu bölgeye ulaşabiliyorsa boy doğrudur. Omuz yukarı kalkıyor ya da dirsek tam açılıyorsa keman büyüktür.</p>

      <h2>Çocuk büyüdükçe ne olacak?</h2>
      <p>Keman ölçüleri çocuğun büyümesine göre değiştirilir; bu normal bir süreçtir ve genellikle 2-3 yılda bir gerçekleşir. "Büyür de kullanır" diye büyük keman almak yanlıştır — o arada geçen yıllarda yanlış teknik yerleşir.</p>

      <h2>Tam set: neler olmalı?</h2>
      <p>Keman tek başına çalınamaz. Bir başlangıç setinde şunlar bulunmalıdır:</p>
      <ul>
        <li><strong>Yay</strong> — sesi üreten asıl parça.</li>
        <li><strong>Reçine</strong> — yay kıllarına sürtünme kazandırır. <strong>Reçinesiz yay tel üzerinde kayar ve keman neredeyse hiç ses çıkarmaz.</strong></li>
        <li><strong>Omuz yastığı</strong> — kemanı omuz ile çene arasında kavratır. Onsuz enstrümanı tutmak için sol el devreye girer ve parmaklar serbest kalamaz.</li>
        <li><strong>Kılıf</strong> — keman ince ahşaptır, darbeye karşı hassastır.</li>
      </ul>

      <h2>"Kemanım ses vermiyor" — en yaygın sebep</h2>
      <p>Yeni bir yayın kılları fabrika çıkışında hiç reçine görmemiştir. İlk kullanımdan önce reçineyi yay kıllarına <strong>baştan uca, orta baskıyla ve birkaç dakika boyunca</strong> sürtmen gerekir — ilk uygulamada beklediğinden çok daha uzun sürer.</p>
      <p>Sonrasında her birkaç çalışmada bir kısa tazeleme yeterlidir. Aşırı reçine ise cırtlak ve tozlu bir ton yapar; dengeyi kulağınla bulacaksın.</p>

      <h2>İlk haftalarda cırtlak ses normaldir</h2>
      <p>Sebep genellikle üçünden biridir: yay tele fazla ya da az baskı yapıyor, yay telle dik açıyı kaybetmiş, ya da yay köprüye çok yaklaşmış. Yayı <strong>köprü ile klavye arasındaki orta bölgede, tele dik tutarak</strong> çalışmak bu sorunların çoğunu çözer.</p>

      <h2>Her çalışma sonrası iki şey</h2>
      <p><strong>1.</strong> Teller ve gövde üzerindeki reçine tozunu kuru yumuşak bezle sil. <strong>2.</strong> Yayın kıllarını gevşet — gergin bırakılan yay zamanla kavisini kaybeder ve çubuk kalıcı olarak düzleşebilir.</p>
      <p><a href="keman.html">Keman modellerimize</a> göz atarak 4/4 ve 3/4 tam set seçeneklerini inceleyebilirsin.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <ul>
          <li>Ölçüyü <strong>kol uzunluğu</strong> belirler, yaş değil.</li>
          <li>İki ölçü arasında kaldıysan <strong>küçüğünü al.</strong></li>
          <li><strong>Reçinesiz yay ses vermez</strong> — ilk kullanımda uzun uzun sür.</li>
          <li>Her çalışma sonrası <strong>yayı gevşet</strong> ve reçine tozunu sil.</li>
        </ul>
      </div>
    `
  },

  {
    slug: 'cajon-nedir-darbuka-farki',
    title: 'Cajon Nedir? Darbuka ile Farkı ve Hangisini Seçmeli',
    category: 'Rehber',
    date: '2026-07-15',
    readMin: 5,
    dek: 'Üzerine oturup çalınan cajon mu, kucakta çalınan darbuka mı? İkisinin ses karakteri ve kullanım alanı tamamen farklı.',
    keywords: 'cajon nedir, cajon fiyatları, darbuka, cajon mu darbuka mı, perküsyon enstrümanları',
    body: `
      <p class="lead">Koca bir davul seti kurmadan ritim çalmak istiyorsan iki güçlü seçeneğin var: cajon ve darbuka. İkisi de tek parça, taşınabilir ve elle çalınır — ama ses karakterleri ve ait oldukları müzik dünyaları tamamen farklı.</p>

      <h2>Cajon nedir?</h2>
      <p>Cajon, üzerine oturup ön yüzüne elle vurarak çalınan kutu biçiminde bir perküsyon enstrümanıdır. İspanyolca'da "sandık" anlamına gelir ve Peru kökenlidir — köle işçilerin davul çalmalarının yasaklandığı dönemde meyve sandıklarını çalmalarıyla doğduğu anlatılır.</p>
      <p>Bu kadar popüler olmasının sebebi şu: <strong>tek bir kutudan bütün bir davul setinin temel seslerini çıkarabilir.</strong> Ön yüzün ortasına vurduğunda kick davul gibi derin bir bas, üst kenarına vurduğunda trampet benzeri çıtırtılı bir ses alırsın.</p>
      <p>Çoğu cajonun içinde gergin teller ya da bir bahar bulunur; trampetin karakteristik "hışırtılı" tınısını veren şey budur.</p>

      <h2>Darbuka nedir?</h2>
      <p>Darbuka, kadeh biçimli gövdesi ve tek deri yüzeyiyle Orta Doğu ve Anadolu müziğinin temel ritim enstrümanıdır. Kucakta ya da bacak üstünde yatay tutularak çalınır.</p>
      <p>Ses karakteri cajondan belirgin şekilde farklıdır: çok daha keskin, tiz ve parmak vuruşlarına duyarlıdır. Tekniği <strong>"dum"</strong> (merkeze vurulan derin ses) ve <strong>"tek"</strong> (kenara vurulan keskin ses) olmak üzere iki ana vuruş üzerine kuruludur ve bunların üzerine son derece zengin bir ritim geleneği inşa edilmiştir.</p>

      <h2>Hangisini seçmeli?</h2>
      <p>Karar çalacağın müziğe göre verilir:</p>
      <ul>
        <li><strong>Cajon</strong> → pop, akustik gitar eşliği, latin, folk, batı müziği. Davul setine en yakın sesi verir.</li>
        <li><strong>Darbuka</strong> → Türk halk müziği, arabesk, fasıl, oryantal, Orta Doğu ritimleri.</li>
      </ul>
      <p>Bir arkadaş grubunda akustik gitar eşliğinde çalacaksan cajon; düğün, halk müziği ya da oryantal ritim çalacaksan darbuka doğru tercihtir.</p>

      <h2>Cajon çalmaya nasıl başlanır?</h2>
      <ul>
        <li><strong>Oturuş</strong> — cajonun üstüne otur, hafifçe öne eğil, ayaklar yere tam bassın.</li>
        <li><strong>Bas (kick) sesi</strong> — ön yüzün orta bölgesine avuç içinin dolgun kısmıyla vur ve eli hemen çek. Elini yüzeyde bırakırsan ses boğulur.</li>
        <li><strong>Trampet sesi</strong> — üst kenara parmak uçlarıyla vur; içerideki teller devreye girer.</li>
        <li><strong>İlk ritim</strong> — bas–trampet–bas–trampet dizisi neredeyse tüm pop şarkılarının temel kalıbıdır.</li>
      </ul>
      <p>Nota bilgisi gerekmez. Bu iki vuruşu öğrendiğinde çoğu şarkıya eşlik edebilirsin. Metronomla yavaş çalışmak, teknik bilgiden çok daha belirleyicidir.</p>

      <h2>Cajon apartmanda çalınır mı?</h2>
      <p>Davul setine göre çok daha sessizdir ama tamamen sessiz değildir; özellikle bas vuruşları alt kata iletilebilir. Altına kalın bir halı sermek titreşimi belirgin şekilde azaltır. Gece geç saatler dışında çoğu apartmanda sorun yaratmaz.</p>

      <h2>Çocuk için cajon</h2>
      <p>Çocuklar için üretilen küçük gövdeli cajonlar hem oturma yüksekliği hem vuruş yüzeyi açısından ölçeklendirilmiştir. Bu önemli: standart bir cajona oturan çocuk ayaklarını yere basamadığı için doğru pozisyon alamaz ve rahat çalamaz. Ayrıca cajon, çocuklar için düşük giriş bariyeri olan nadir enstrümanlardan — ilk gün ses çıkarabilmek motivasyonu ciddi şekilde besler.</p>

      <h2>Bakım</h2>
      <p>Cajon ahşap bir gövdedir; nemden ve doğrudan güneşten uzak tutulmalıdır. Radyatör yanında ya da rutubetli bir bodrumda bırakılan gövde zamanla çatlayabilir. Ön yüzeyi temizlemek için kuru veya çok hafif nemli yumuşak bez yeterlidir; kimyasal temizleyici kullanma.</p>
      <p>Darbukada alüminyum gövdeli modellerde genelde sentetik deri kullanılır ve bu nem değişimlerine dayanıklıdır; yine de aşırı sıcak ya da soğukta bırakmamak derinin gerginliğini korur.</p>
      <p><a href="cajon-darbuka.html">Cajon ve darbuka modellerimize</a> göz atabilirsin.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <ul>
          <li><strong>Cajon</strong> → pop, akustik, latin · davul setine yakın ses.</li>
          <li><strong>Darbuka</strong> → Türk müziği, fasıl, oryantal · keskin ve parmak duyarlı.</li>
          <li>Cajonda iki vuruş (bas + trampet) çoğu şarkıya eşlik etmeye yeter.</li>
          <li>Çocuk için <strong>ölçeklendirilmiş küçük gövde</strong> şart.</li>
        </ul>
      </div>
    `
  },

  {
    slug: 'mini-amfi-rehberi-ev-kulaklik',
    title: 'Mini Amfi Rehberi: Ev, Prova ve Kulaklıkla Çalışma',
    category: 'Rehber',
    date: '2026-07-16',
    readMin: 5,
    dek: 'Ev için büyük amfiye gerek yok — aksine küçük amfi daha iyi ton verir. Watt, kulaklık çıkışı ve IR desteğini açıkladık.',
    keywords: 'mini amfi, gitar amfisi, kulaklık amfisi, bluetooth amfi, ev tipi gitar amfisi',
    body: `
      <p class="lead">Yeni başlayanların en yaygın yanılgısı: "watt ne kadar yüksekse o kadar iyi." Gerçekte ev kullanımı için <strong>düşük watt daha iyidir</strong> — ve bunun sağlam bir teknik sebebi var. Bu yazıda ev için amfi seçerken gerçekten bakman gereken şeyleri sıraladık.</p>

      <h2>Neden büyük amfi ev için kötü bir fikir?</h2>
      <p>Amfiler karakteristik tonlarını belli bir ses seviyesinde vermeye başlar. Büyük bir amfiyi ev seviyesinde kısık çaldığında iki şey olur: aradığın tonu hiç duyamazsın ve gereksiz yere yer, ağırlık ve para harcamış olursun.</p>
      <p>Küçük amfiler ise düşük seviyede iyi ses verecek şekilde tasarlanmıştır. Ev çalışması, kulaklıkla pratik ve küçük oda kayıtları için kompakt amfiler <strong>fazlasıyla</strong> yeterlidir.</p>

      <h2>Kulaklık çıkışı: apartmanın kurtarıcısı</h2>
      <p>Bu, apartmanda oturuyorsan listenin en üstüne koyman gereken özellik. Kulaklık takıldığında hoparlör devre dışı kalır ve enstrüman dışarıya hiç ses vermez — gecenin herhangi bir saatinde çalışabilirsin.</p>
      <p>Ek bir avantajı daha var: kulaklıkla çalarken hoparlörden duyamayacağın detayları duyarsın. Temiz olmayan geçişler, istemsiz tel sesleri ve zamanlama hataları kulaklıkta çok daha belirgindir — bu da daha hızlı düzeltmeni sağlar.</p>

      <h2>Bluetooth ne işe yarar?</h2>
      <p>Basit görünen ama pratikte çok değerli bir özellik: telefonundan şarkı çalıp üzerine gitar çalabilirsin.</p>
      <p>Parçaya eşlik ederek çalışmak, ritim duygusunu ve akort hassasiyetini metronomla çalışmaktan daha hızlı geliştirir — çünkü gerçek müzikal bağlamda çalıyorsun. Ayrıca amfiyi kullanmadığın zamanlarda küçük bir hoparlör olarak da iş görür.</p>

      <h2>IR desteği nedir, gerekli mi?</h2>
      <p>IR (Impulse Response), gerçek bir hoparlör kabininin ve önüne konmuş mikrofonun akustik parmak izini dijital olarak taklit eden bir teknolojidir.</p>
      <p>Önemi özellikle <strong>kulaklıkla çalışmada ve kayıtta</strong> ortaya çıkar. IR olmadan doğrudan alınan gitar sinyali ince, cırtlak ve "kutu içinden geliyor" gibi duyulur. IR devrede olduğunda ise sanki önünde gerçek bir kabin varmış ve önüne mikrofon konmuş gibi dolgun, doğal bir ses alırsın.</p>
      <p>Sadece hoparlörden çalacaksan çok kritik değil; kulaklık ve kayıt kullanacaksan belirgin fark yaratır.</p>

      <h2>Şarj edilebilir olmak ne kazandırır?</h2>
      <p>Dahili bataryalı amfiler seni prizden bağımsız kılar: balkonda, parkta, kamp ateşi başında ya da elektrik olmayan bir ortamda çalabilirsin. Ayrıca kablo karmaşasını azaltır — küçük bir odada bu fark edilir bir konfordur.</p>

      <h2>Multi efekt pedalı mı, tek pedallar mı?</h2>
      <p>Efekt pedalları gitarın tonunu şekillendirir: distortion, delay, reverb, chorus gibi.</p>
      <p><strong>Yeni başlıyorsan multi efekt çok daha mantıklı.</strong> Onlarca efekti tek kutuda dener, hangisinin ne yaptığını ayrı ayrı satın almadan öğrenirsin. Hangi seslerin hoşuna gittiğini keşfetmenin en ucuz yolu budur. Zevkin netleştikten sonra en çok kullandığın iki-üç efekti tek pedal olarak yükseltebilirsin.</p>

      <h2>Sinyal zinciri ve unutulan kablo</h2>
      <p>Temel dizilim: <strong>gitar → kablo → pedal → kablo → amfi.</strong></p>
      <p>Dikkat: pedal aldıysan <strong>iki kabloya</strong> ihtiyacın var — biri gitardan pedala, diğeri pedaldan amfiye. Bu, sipariş verirken en sık unutulan kalemdir. <a href="gitar-kablosu.html">Kablo seçimi</a> hakkında ayrıntı için ilgili rehberimize bakabilirsin.</p>
      <p>Birden fazla pedal kullanacaksan sıralama tonu belirgin şekilde etkiler. Genel kabul gören dizilim: akort → distortion/overdrive → modülasyon (chorus, flanger) → delay → reverb.</p>
      <p><a href="amfi-pedal.html">Amfi ve pedal modellerimize</a> göz atabilirsin.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <ul>
          <li>Ev için <strong>düşük watt daha iyi</strong> — büyük amfi kısıkken güzel ses vermez.</li>
          <li>Apartmandaysan <strong>kulaklık çıkışı</strong> en kritik özellik.</li>
          <li><strong>IR desteği</strong> kulaklık ve kayıtta dolgun ses sağlar.</li>
          <li>Pedal aldıysan <strong>iki kablo</strong> gerekir — en sık unutulan kalem.</li>
        </ul>
      </div>
    `
  },

  {
    slug: 'davul-bageti-secimi-5a-5b',
    title: 'Davul Bageti Seçimi: 5A mı 5B mi, Hangi Ahşap?',
    category: 'Rehber',
    date: '2026-07-17',
    readMin: 5,
    dek: 'Baget numaraları ters çalışır: rakam küçüldükçe baget kalınlaşır. Kalınlık, harf ve ahşap türünün ne anlama geldiğini açıkladık.',
    keywords: 'davul bageti, 5A baget, 5B baget, baget kalınlığı, akçaağaç baget, bateri bageti',
    body: `
      <p class="lead">Baget, davulcunun enstrümanla tek temas noktası — ve şaşırtıcı biçimde tonu, hızı ve ne kadar çabuk yorulduğunu doğrudan etkiler. Paketin üzerindeki 5A, 7A, 2B gibi kodlar rastgele değil; ne anlama geldiklerini bilirsen doğru bageti ilk seferde alırsın.</p>

      <h2>Rakam ve harf ne anlatıyor?</h2>
      <p>Kod iki bileşenden oluşur:</p>
      <p><strong>Rakam</strong> kabaca çapı belirtir ve <strong>ters çalışır</strong> — rakam küçüldükçe baget kalınlaşır. 7A ince, 5A orta, 2B kalındır. Bu, ilk duyulduğunda kafa karıştırıcı gelen ama akılda kalıcı bir konvansiyondur.</p>
      <p><strong>Harf</strong> kullanım alanını gösterir:</p>
      <ul>
        <li><strong>A</strong> (orchestra) — daha ince ve hafif</li>
        <li><strong>B</strong> (band) — daha kalın ve ağır</li>
        <li><strong>S</strong> (street) — en kalın grup; bando ve marş davulları için</li>
      </ul>

      <h2>Hangi kalınlığı almalısın?</h2>
      <ul>
        <li><strong>5A</strong> — en yaygın ve en güvenli başlangıç. Ağırlık ile kontrol arasında dengeli; pop, rock, funk, jazz dahil neredeyse her tarzda iş görür. <strong>Ne alacağını bilmiyorsan 5A al.</strong></li>
        <li><strong>7A</strong> — daha ince ve hafif. Jazz, akustik setler ve sessiz çalışma için. Küçük eller ve çocuklar için de rahat.</li>
        <li><strong>5B</strong> — 5A'dan kalın. Daha yüksek ses ve daha güçlü vuruş; rock ve sert tarzlar için tercih edilir. Uzun çalışmalarda bileği daha çok yorar.</li>
      </ul>
      <p>Çocuklar ve yeni başlayanlar için <strong>7A veya 5A</strong> idealdir. Kalın baget başlangıçta "daha sağlam" gibi görünse de, bilek tekniği henüz oturmamışken fazladan ağırlık yorulmayı hızlandırır ve hız gelişimini yavaşlatır.</p>

      <h2>Ahşap türü: hız mı, dayanıklılık mı?</h2>
      <ul>
        <li><strong>Akçaağaç (maple)</strong> — en hafif tür. Hızlı pasajlarda ve kontrol gerektiren çalışmalarda avantajlı, bileği en az yoran seçenek. Karşılığında en çabuk aşınandır.</li>
        <li><strong>Ceviz (hickory)</strong> — orta ağırlıkta ve titreşimi iyi emer. Dayanıklılık ile his arasında en dengeli tercih; profesyonellerin en çok kullandığı türdür.</li>
        <li><strong>Meşe (oak)</strong> — en ağır ve en dayanıklı. En uzun ömürlü ama titreşimi daha çok bileğe iletir.</li>
      </ul>
      <p>Bilek ağrısı yaşıyorsan akçaağaca; sık baget kırıyorsan meşeye; ikisi arasında denge arıyorsan cevize yönel.</p>

      <h2>Uç şekli tonu nasıl değiştirir?</h2>
      <p>Bagetin ucu zile ve deriye temas eden yüzeydir ve tınıyı belirgin biçimde etkiler:</p>
      <ul>
        <li><strong>Yuvarlak uç</strong> — zilden odaklanmış, net bir ton.</li>
        <li><strong>Damla / fıçı biçimli uç</strong> — daha geniş ve dolgun ses.</li>
        <li><strong>Naylon uç</strong> — zilde daha parlak ve keskin tını; ahşap uca göre daha uzun ömürlü.</li>
      </ul>

      <h2>Baget ne zaman değiştirilir?</h2>
      <p>Bagetler tükenen malzemedir ve kırılmadan da değiştirilmeleri gerekebilir. İşaretler:</p>
      <ul>
        <li><strong>Gövdede çatlak veya kıymık</strong> — hemen değiştir, çalarken elini kesebilir.</li>
        <li><strong>Uçta belirgin aşınma veya yassılaşma</strong> — ton bozulur, zile temas alanı değişir.</li>
        <li><strong>Eğrilme</strong> — bageti masada yuvarla; zıplayarak dönüyorsa eğrilmiştir.</li>
        <li><strong>Ses farkı</strong> — iki bagetin sesi birbirinden farklı geliyorsa çift olarak değiştir.</li>
      </ul>
      <p>Bagetler daima <strong>çift olarak</strong> değiştirilir; farklı aşınmadaki iki baget dengesiz vuruş yaratır.</p>

      <h2>Işıklı bagetler</h2>
      <p>Hareket duyarlı LED'li bagetler karanlık ortamda görsel etki yaratır. Sahne ve gösteri amaçlıdırlar; ağırlık dengesi standart ahşap bagetlerden farklı olabileceği için ana çalışma bageti olarak değil, ek olarak düşünülmelidir.</p>
      <p>Düzenli çalışan biri için <strong>yedek bir çift bulundurmak neredeyse zorunludur</strong> — baget genelde en olmadık anda kırılır. <a href="davul-bageti.html">Baget modellerimize</a> göz atabilirsin.</p>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <ul>
          <li>Rakam <strong>ters çalışır</strong>: küçük rakam = kalın baget.</li>
          <li>Bilmiyorsan <strong>5A</strong> al; çocuk/yeni başlayan için 7A da uygun.</li>
          <li><strong>Akçaağaç</strong> hız, <strong>meşe</strong> dayanıklılık, <strong>ceviz</strong> denge.</li>
          <li>Bagetler <strong>çift olarak</strong> değiştirilir; yedek bulundur.</li>
        </ul>
      </div>
    `
  },

  {
    slug: 'enstrumanda-taksit-guvenli-odeme',
    title: 'Enstrümanda Taksit ve Güvenli Ödeme Nasıl İşler?',
    category: 'Rehber',
    date: '2026-07-18',
    readMin: 4,
    dek: 'Taksit seçenekleri, kart bilgilerinin nasıl korunduğu, kargo ücreti ve 14 günlük cayma hakkı — alışverişten önce bilmen gerekenler.',
    keywords: 'enstrüman taksit, müzik aleti taksitli, güvenli ödeme, PayTR, cayma hakkı, kargo ücreti',
    body: `
      <p class="lead">Enstrüman, çoğu kişi için tek seferde ödenmesi zor bir kalem. Bu yazıda taksitin nasıl işlediğini, kart bilgilerinin nasıl korunduğunu ve satın aldıktan sonraki haklarını sade bir şekilde anlattık.</p>

      <h2>Ödeme altyapısı: kart bilgin bize gelmiyor</h2>
      <p>Ödemeler <strong>PayTR</strong> altyapısı üzerinden alınır. Buradaki en önemli nokta şu: kart bilgilerini girdiğin ekran PayTR'nin güvenli ödeme sayfasıdır ve bu bilgiler <strong>bizim sunucularımıza hiç uğramaz.</strong> Yani kart numaran, son kullanma tarihin ve CVV kodun bizde saklanmaz — saklanamaz da.</p>
      <p>Bu, sadece bir tercih değil sektör standardıdır; kart verisi işleyen tarafın ayrı bir güvenlik sertifikasyonuna tabi olması gerekir ve bu işi ödeme kuruluşları üstlenir.</p>

      <h2>Taksit seçenekleri</h2>
      <p>Taksit imkânı <strong>kartını veren bankaya ve kart tipine</strong> göre değişir. Bu yüzden sabit bir taksit tablosu vermek yanıltıcı olur.</p>
      <p>Ürün sayfalarında taksit tablosu görüntülenir ve orada kendi kartına uygun seçenekleri görebilirsin. Ödeme adımında kartını girdiğinde de bankanın sunduğu güncel taksit seçenekleri listelenir. Banka kartlarında (debit) taksit yapılamaz — bu bankaların genel kuralıdır.</p>

      <h2>Kargo ücreti nasıl hesaplanır?</h2>
      <ul>
        <li><strong>2.000 TL ve üzeri</strong> siparişlerde kargo <strong>ücretsizdir.</strong></li>
        <li><strong>2.000 TL altındaki</strong> siparişlerde <strong>199 TL</strong> kargo bedeli uygulanır (KDV dahil).</li>
      </ul>
      <p>Hesaplama sepetteki <strong>ara toplam</strong> üzerinden yapılır ve sepet ekranında ödeme öncesinde net olarak gösterilir. Ödeme adımında sürpriz bir tutar çıkmaz.</p>

      <h2>Teslimat süresi</h2>
      <p>Siparişler genellikle 1-2 iş günü içinde hazırlanır, kargo süresi bölgeye göre 1-3 iş günüdür. Gitar, dijital piyano ve davul setleri gibi hacimli ürünler darbeye karşı özel ambalajla gönderilir.</p>

      <h2>14 günlük cayma hakkı</h2>
      <p>Mesafeli satış mevzuatı gereği, ürünü teslim aldığın tarihten itibaren <strong>14 gün içinde</strong> hiçbir gerekçe göstermeden cayma hakkını kullanabilirsin.</p>
      <p>Dikkat edilmesi gerekenler:</p>
      <ul>
        <li>Ürün <strong>kullanılmamış ve yeniden satılabilir</strong> durumda olmalıdır.</li>
        <li>Orijinal ambalajı, aksesuarları ve varsa hediye ürünleri eksiksiz gönderilmelidir.</li>
        <li>Kamış, tel gibi hijyen veya kullanım gereği açıldığında iade edilemeyen ürünlerde istisnalar olabilir.</li>
      </ul>
      <p>Ayrıntılı koşullar için <a href="iade-teslimat.html">İade, Teslimat ve Cayma</a> sayfamıza bakabilirsin.</p>

      <h2>Siparişimi nasıl takip ederim?</h2>
      <p>Sipariş oluştuğunda e-posta ile onay gönderilir; kargoya verildiğinde takip numarası paylaşılır. Üye olmadan alışveriş yaptıysan <a href="siparis-sorgula.html">Sipariş Sorgula</a> sayfasından sipariş numaran ile durumu görebilirsin.</p>

      <h2>Alışverişten önce kontrol listesi</h2>
      <ul>
        <li><strong>Doğru ölçü mü?</strong> Keman ve klasik gitarda boy (4/4, 3/4) kritiktir.</li>
        <li><strong>Eksik parça var mı?</strong> Elektro gitarda amfi ve kablo, kemanda reçine ve omuz yastığı unutulmasın.</li>
        <li><strong>Kargo eşiği</strong> — 2.000 TL'ye yakınsan eksik aksesuarı aynı siparişe eklemek kargo ücretinden tasarruf ettirir.</li>
        <li><strong>Stok durumu</strong> — ürün sayfasında güncel stok bilgisi görüntülenir.</li>
      </ul>

      <div class="post-takeaway">
        <h3>Özetle</h3>
        <ul>
          <li>Kart bilgilerin <strong>PayTR'de</strong> işlenir, bizim sistemimizde saklanmaz.</li>
          <li>Taksit <strong>bankana ve kartına</strong> bağlıdır; ürün sayfasında görüntülenir.</li>
          <li><strong>2.000 TL üzeri kargo ücretsiz</strong>, altında 199 TL.</li>
          <li>Teslimattan itibaren <strong>14 gün cayma hakkı</strong> — ürün kullanılmamış olmalı.</li>
        </ul>
      </div>
    `
  }
];

window.BLOG_POSTS = BLOG_POSTS;
