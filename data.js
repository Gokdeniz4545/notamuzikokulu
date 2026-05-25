// Nota Müzik Market — ürün verisi
// Fiyatlar placeholder; gerçek fiyat listesi gelince güncellenir.
// Görseller henüz yok; image alanı varsa kullanılır, yoksa kategoriye göre gradient placeholder çizilir.

const CATEGORIES = [
  { slug: 'all',      name: 'Tümü',       color: '#1a1a1a' },
  { slug: 'guitars',  name: 'Gitarlar',   color: '#e63946', image: 'images/cat-guitars.webp' },
  { slug: 'keys',     name: 'Klavye',     color: '#5b8def', image: 'images/cat-keys.webp' },
  { slug: 'drums',    name: 'Davul',      color: '#f97316', image: 'images/cat-drums.webp' },
  { slug: 'strings',  name: 'Yaylılar',   color: '#a06cd5', image: 'images/cat-strings.webp' },
  { slug: 'access',   name: 'Aksesuarlar',color: '#2a9d8f', image: 'images/cat-access.webp' },
];

const PRODUCTS = [
  { id: 1,  name: 'Auster Elektro Gitar (Beyaz)',     category: 'guitars', price: 8499,  stock: 5, image: 'images/guitar-white.jpg',
    description: 'Tek vuruşta tonu seni sürükleyen, sahne aydınlığı için tasarlanmış beyaz elektro gitar.' },
  { id: 2,  name: 'AeroBand Elektronik Davul Seti',   category: 'drums',   price: 12990, stock: 3, image: 'images/aeroband-drums.jpg',
    description: 'Kablosuz, taşınabilir, gerçek davul hissi veren elektronik set. Pratik için ideal.' },
  { id: 3,  name: 'Auster Keyboard GO S61',           category: 'keys',    price: 6499,  stock: 8, image: 'images/keyboard-s61.jpg',
    description: '61 tuşlu, başlangıç ve orta seviye için ideal portatif klavye. Yüzlerce ses, ritm.' },
  { id: 4,  name: 'Klasik Gitar (Mavi)',              category: 'guitars', price: 2899,  stock: 12,image: 'images/guitar-blue.jpg',
    description: 'Yumuşak naylon tellerle parmaklarına nazik, parlak mavi gövdeli klasik gitar.' },
  { id: 5,  name: 'Dijital Piyano (Siyah)',           category: 'keys',    price: 18750, stock: 2, image: 'images/digital-piano-black.jpg',
    description: '88 tuş, ağırlıklı klavye. Konser piyanosu hissini evine taşıyan profesyonel model.' },
  { id: 6,  name: 'Auster AES0942 Elektro Tel',       category: 'access',  price: 199,   stock: 50,image: 'images/strings-electric.jpg',
    description: 'Elektro gitarın için kalın-ince dengesi mükemmel 09-42 tel seti. Uzun ömürlü.' },
  { id: 7,  name: 'Auster Dijital Piyano (Beyaz)',    category: 'keys',    price: 19990, stock: 1, image: 'images/piano-white.jpg',
    description: 'Beyaz şıklığında 88 tuşlu dijital piyano. Bluetooth bağlantı, kayıt ve metronom.' },
  { id: 8,  name: 'Auster AVS44 Keman Teli',          category: 'access',  price: 349,   stock: 30,image: 'images/strings-violin.jpg',
    description: 'Sıcak ve berrak ton sunan 4/4 keman tel seti. Eğitim ve sahne kullanımına uygun.' },
  { id: 9,  name: 'Elektro Gitar (Siyah Strat)',      category: 'guitars', price: 7299,  stock: 4, image: 'images/guitar-black-strat.jpg',
    description: 'Klasik Strat formu, üç single-coil manyetik. Blues’tan rock’a her şey elinin altında.' },
  { id: 10, name: 'Keman (Kutulu)',                   category: 'strings', price: 4499,  stock: 6, image: 'images/violin-case.jpg',
    description: 'Sert kutusu, yayı ve reçinesiyle gelen başlangıç için ideal 4/4 keman seti.' },
  { id: 11, name: 'Mini Amfi Seti',                   category: 'access',  price: 1290,  stock: 10,image: 'images/mini-amps.jpg',
    description: 'Cebine sığan, pratik mini amfi. Antrenmanlarına gücünden ödün vermeden eşlik eder.' },
  { id: 12, name: 'Elektronik Davul (Yeşil)',         category: 'drums',   price: 9890,  stock: 5, image: 'images/edrums-green.jpg',
    description: 'Sessiz pratik için pedlı set. Kulaklıkla çevreni rahatsız etmeden çalışabilirsin.' },
  { id: 13, name: 'Kirlin LightGear 6M Kablo',        category: 'access',  price: 449,   stock: 40,image: 'images/cable-kirlin.jpg',
    description: 'Düşük gürültü, dayanıklı koruma, 6 metre uzunluk. Sahne ve stüdyo için güvenilir.' },
  { id: 14, name: 'M-VAVE Mini Amfi',                 category: 'access',  price: 1890,  stock: 8, image: 'images/amp-mvave.jpg',
    description: 'Şarjlı, Bluetooth destekli mini amfi. Pratiği eğlenceye dönüştüren akıllı tasarım.' },
  { id: 15, name: 'Nitro Elektronik Davul (Kırmızı)', category: 'drums',   price: 14990, stock: 0, image: 'images/edrums-nitro.jpg',
    description: 'Profesyonel hisli pedler, geniş ses kütüphanesi. Sahnede de evde de iddialı.' },
  { id: 16, name: 'Nitro Renkli Davul',               category: 'drums',   price: 13290, stock: 2, image: 'images/edrums-color.jpg',
    description: 'Görselliği kadar tınısı da etkileyici elektronik davul seti. Yaratıcılığa davet.' },
  { id: 17, name: 'Stagg Maple 5B Baget',             category: 'access',  price: 149,   stock: 60,image: 'images/drumsticks-maple.jpg',
    description: 'Akçaağaç gövde, dengeli ağırlık. Hızlı geçişlerde elini yormayan klasik 5B baget.' },
  { id: 18, name: 'Keman (Doğal Renk)',               category: 'strings', price: 4290,  stock: 7, image: 'images/violin-brown.jpg',
    description: 'Doğal vernikli ahşap gövde, sıcak ton. Başlangıç ve orta seviye için ideal keman.' },
];

window.NM = { CATEGORIES, PRODUCTS };
