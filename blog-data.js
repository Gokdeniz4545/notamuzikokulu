// ============================================================
//  blog-data.js — Nota Müzik Market Günlük (blog)
//  10 yazı. SEO/GEO için: net giriş, H2 başlıklar, listeler,
//  sonda "Özetle" kutusu. Gövde HTML olarak saklanır; blog.js
//  hem kartları hem okuma modunu buradan üretir.
//  Ürün bağlantıları products.html?q=... ile aramaya düşer.
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
      <p>İlgi odağı olmaktan keyif alıyor, hızlı sonuç istiyorsan elektro gitar seni mutlu eder. Birkaç akorla tanıdık şarkıları çalmaya başlarsın; gürültü ve karakter onun doğasında var. <a href="products.html?q=Strat">Siyah Strat formundaki elektro gitarımız</a> blues'tan rock'a geniş bir alan açar.</p>

      <h2>Sakin, içe dönük, derinlik arayan: Klasik gitar veya piyano</h2>
      <p>Tek başına, kulaklık takmadan, kendi temponda ilerlemeyi seviyorsan yumuşak naylon telli <a href="products.html?q=Klasik+Gitar">klasik gitar</a> ya da bir <a href="products.html?q=Dijital+Piyano">dijital piyano</a> ideal. İkisi de "kendinle baş başa" çalmaya en uygun çalgılar.</p>

      <h2>Enerjik, hareketli, ritim tutan: Davul</h2>
      <p>Ayağın sürekli tempo tutuyorsa cevabın davul. Fiziksel, boşaltıcı ve son derece tatmin edici. Apartmanda yaşıyorsan kulaklıkla çalışabileceğin bir <a href="products.html?q=Elektronik+Davul">elektronik davul</a> bu enerjiyi komşunla sorun yaşamadan açığa çıkarır.</p>

      <h2>Detaycı, sabırlı, mükemmeliyetçi: Keman</h2>
      <p>Küçük ilerlemelerden tatmin oluyor, "doğru ses" için çalışmaya razıysan keman tam sana göre. Perdesiz oluşu disiplin ister ama karşılığında derin bir tatmin verir.</p>

      <h2>Meraklı, çok yönlü, denemeyi seven: Keyboard</h2>
      <p>Tek bir tını sana yetmiyorsa, yüzlerce ses ve hazır ritim sunan bir <a href="products.html?q=Keyboard">keyboard</a> oyun alanın olur. Bir gün piyano, ertesi gün org veya yaylı taklidi — keşfetmeyi seven kişilikler için biçilmiş kaftan.</p>

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
      <p>Naylon telleri parmağına naziktir, sesi yumuşaktır, gece bile çalabilirsin. Tek başına şarkı söyleyip kendine eşlik etmenin en güzel yollarından biri. <a href="products.html?q=Klasik+Gitar">Mavi klasik gitarımız</a> başlangıç için ideal.</p>

      <h2>2. Dijital piyano</h2>
      <p>Kulaklık girişi sayesinde gecenin üçünde bile kimseyi rahatsız etmeden çalışırsın. <a href="products.html?q=Dijital+Piyano">88 tuşlu dijital piyano</a>, akustik bir piyanonun mahremiyetini sana özel bir dünyada sunar.</p>

      <h2>3. Elektronik davul (kulaklıkla)</h2>
      <p>Davul gürültülü zorunda değil. <a href="products.html?q=Elektronik+Davul">Pedli elektronik bir set</a>, kulaklıkla çalışıldığında dışarıya neredeyse hiç ses sızdırmaz. İçe dönük ama enerjisini boşaltmak isteyenler için ideal ikili.</p>

      <h2>4. Keman</h2>
      <p>Keman, sadece sen ve telin arasında geçen sabırlı bir diyalogdur. Sessiz bir odada saatlerce kendini kaybetmek isteyenler için derin bir çalgı.</p>

      <h2>5. Keyboard (kulaklıkla)</h2>
      <p>Yüzlerce sesi keşfetmek, kendi başına minik besteler yapmak için ideal. <a href="products.html?q=Keyboard">Portatif bir keyboard</a> hem küçük yer kaplar hem de kulaklıkla tamamen sessiz çalışır.</p>

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
      <p>Yoğun bir günün sonunda davula oturmak, en iyi rahatlama yöntemlerinden biridir. Gürültü sorun olur diye düşünme: <a href="products.html?q=AeroBand">AeroBand elektronik davul seti</a> ya da <a href="products.html?q=Nitro">Nitro elektronik davul</a> gibi setlerle kulaklık takıp tüm enerjini sessizce boşaltabilirsin.</p>

      <h2>Başlarken neye dikkat etmeli?</h2>
      <ul>
        <li><strong>Mekân:</strong> Apartmandaysan akustik değil, elektronik set seç.</li>
        <li><strong>Baget:</strong> Dengeli bir <a href="products.html?q=Baget">5B baget</a> el yormaz, hızlı geçişlerde kontrolü artırır.</li>
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
      <p>Tek telli basit rifflerle tanıdık melodileri çalmaya başlarsın. Bu noktada bir <a href="products.html?q=Mini+Amfi">mini amfi</a> işini eğlenceye çevirir; gerçek "elektro" sesi duymak motivasyonu uçurur.</p>

      <h2>3. Hafta — Akor geçişleri</h2>
      <p>İki-üç power chord arasında geçiş yapmayı çalışırsın. Yavaş ama temiz çal; hız sonra gelir. Bu hafta sonunda basit bir şarkının nakaratına eşlik edebilirsin.</p>

      <h2>4. Hafta — İlk şarkı</h2>
      <p>30. günün sonunda tanıdık bir parçanın ana riffini baştan sona çalabilir hâle gelirsin. Bu, devam etmen için gereken o "ben yapabiliyorum" anıdır.</p>

      <h2>Hangi gitarla başlamalı?</h2>
      <p>Başlangıç için çok ağır ve çok pahalı bir model şart değil. <a href="products.html?q=Strat">Klasik Strat formundaki bir elektro gitar</a> rahat çalınır, her tarza uyar. Yanına bir <a href="products.html?q=Kablo">kaliteli kablo</a> ve küçük bir amfi ekleyince setin tamamlanır.</p>

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
      <p class="lead">"Davul çalmak isterdim ama apartmanda imkânsız" cümlesini çok duyuyoruz. Oysa <strong>elektronik davul setleri tam da bu sorun için var.</strong> <a href="products.html?q=AeroBand">AeroBand elektronik davul seti</a>, kablosuz ve taşınabilir yapısıyla bu işi bir adım öteye taşıyor.</p>

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
      <p>Kapalı bir kulaklık ve dengeli bir <a href="products.html?q=Baget">akçaağaç 5B baget</a> seti deneyimini tamamlar. Baget, davulun "lastiği" gibidir — doğru olanı eli yormaz.</p>

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
      <p>Bir <a href="products.html?q=Dijital+Piyano">dijital piyano</a>, akustik piyano gibi <strong>ağırlıklı tuşlara</strong> sahiptir; parmak gücün gelişir, ileride akustiğe geçmen kolay olur. <a href="products.html?q=Keyboard">Keyboard</a> ise daha hafif tuşludur, parmakla bastırması kolaydır ama "piyano hissi" vermez.</p>

      <h2>Tuş sayısı</h2>
      <ul>
        <li><strong>Dijital piyano:</strong> Genelde 88 tuş — tam piyano repertuvarını çalabilirsin.</li>
        <li><strong>Keyboard:</strong> 61 tuş yaygındır — başlangıç ve pop/şarkı eşliği için fazlasıyla yeterli.</li>
      </ul>

      <h2>Ses ve ritim</h2>
      <p>Keyboard'un asıl gücü çok yönlülüğü: yüzlerce farklı ses (org, yaylı, synth) ve hazır ritimler sunar. <a href="products.html?q=Keyboard+GO+S61">Keyboard GO S61</a> tam da bu keşif duygusu için tasarlanmış. Dijital piyano ise az sayıda ama çok kaliteli piyano tınısına odaklanır.</p>

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
      <p>Yeni başlayan için en pratik seçenek, her şeyiyle gelen bir set. <a href="products.html?q=Keman+Kutulu">Sert kutusu, yayı ve reçinesiyle gelen 4/4 keman setimiz</a> ilk gün çalmaya başlamana yetecek her şeyi içerir. Daha sıcak, doğal bir tını istersen <a href="products.html?q=Keman+Doğal">doğal vernikli ahşap gövdeli keman</a> da güzel bir seçenek.</p>

      <h2>İhmal edilen ama kritik parça: tel</h2>
      <p>Kemanın sesinin yarısı telinden gelir. Eğitim sürecinde yıpranan teller sesi köreltir; <a href="products.html?q=Keman+Teli">berrak ve sıcak ton veren bir keman tel seti</a> ile değiştirmek, yeni bir keman almak kadar fark yaratır.</p>

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
      <p><a href="products.html?q=Mini+Amfi+Seti">Mini Amfi Seti</a>, cebine sığan, antrenmanlarına gücünden ödün vermeden eşlik eden sade bir çözüm. Daha fazlasını isteyenler için <a href="products.html?q=M-VAVE">M-VAVE Mini Amfi</a> şarjlı ve Bluetooth destekli; telefonundan şarkı açıp üzerine çalabilir, kablosuz pratik yapabilirsin.</p>

      <h2>Sesi büyüten ipuçları</h2>
      <ul>
        <li>Amfiyi yere değil, sert bir yüzeye (masa) koy — bas frekanslar belirginleşir.</li>
        <li>Köşeye yakın yerleştir; duvar sesi doğal olarak güçlendirir.</li>
        <li>Kaliteli bir <a href="products.html?q=Kablo">enstrüman kablosu</a> kullan; ucuz kablo cızırtı ve sinyal kaybı yapar.</li>
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
      <p>Sık çalıyorsan <strong>1–2 ayda bir</strong> değiştirmek mantıklı. Elektro gitar için dengeli bir <a href="products.html?q=Elektro+Tel">09-42 tel seti</a>, keman için <a href="products.html?q=Keman+Teli">berrak tonlu bir keman tel seti</a> çalgıyı yenilenmiş gibi hissettirir.</p>

      <h2>Kablo — sessiz katil</h2>
      <p>Cızırtının, ses kesilmelerinin ve sinyal kaybının çoğu kablodandır, çalgıdan değil. İyi bir kablonun özellikleri:</p>
      <ul>
        <li>Düşük gürültü için sağlam ekranlama</li>
        <li>Dayanıklı, kolay kopmayan lehim noktaları</li>
        <li>İhtiyacına uygun uzunluk (evde 3–6 m yeterli)</li>
      </ul>
      <p><a href="products.html?q=Kirlin+Kablo">Kirlin LightGear 6M kablo</a> gibi düşük gürültülü ve korumalı bir kablo, hem sahnede hem stüdyoda güvenilirdir.</p>

      <h2>Baget — davulcunun lastiği</h2>
      <p>Bagetler çatlar, soyulur ve dengesini kaybeder. Çatlak bir baget hem sesi bozar hem bileğini yorar. <a href="products.html?q=Baget">Akçaağaç 5B baget</a> dengeli ağırlığıyla hızlı geçişlerde eli yormaz; çatlama gördüğünde hemen değiştir.</p>

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
        <li><strong>4–6 yaş:</strong> Ritim ve kulak gelişimi dönemi. Basit perküsyon, küçük bir <a href="products.html?q=Keyboard">keyboard</a> ile renkli, oyunlaştırılmış başlangıç.</li>
        <li><strong>7–9 yaş:</strong> El-göz koordinasyonu oturur. Keyboard/piyano veya küçük boy keman (1/2, 3/4) uygundur.</li>
        <li><strong>10+ yaş:</strong> Fiziksel olarak gitar ve davula hazır. Tercih artık çocuğun kendi merakına bırakılabilir.</li>
      </ul>

      <h2>Mizaca göre yönlendirme</h2>
      <ul>
        <li><strong>Hareketli, enerjik çocuk:</strong> Davul enerjisini kanalize eder. Gürültü endişesi için <a href="products.html?q=Elektronik+Davul">elektronik davul</a> + kulaklık.</li>
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
  }
];

window.BLOG_POSTS = BLOG_POSTS;
