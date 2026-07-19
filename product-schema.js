/* ============================================================
   product-schema.js — Product JSON-LD için TEK kaynak

   NEDEN VAR: build-products.js sayfaya bir Product şeması basıyor,
   sonra product.js sayfa açılınca #ldProduct'ın içeriğini KOMPLE
   değiştiriyordu. İki şema birbirinden habersizdi ve build tarafında
   eklenen alanlar (itemCondition, priceValidUntil) hydration'da
   sessizce siliniyordu — Google JS render ettiği için canlıda o
   alanlar hiç görünmüyordu.

   Artık iki taraf da bu dosyadaki buildProductSchema()'yı çağırıyor.
   Şemaya alan eklemek isteyen SADECE burayı değiştirir.

   Hem Node'dan (require) hem tarayıcıdan (<script src>) yüklenir.
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NMProductSchema = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---- kargo kuralı ----
  // DİKKAT: bu iki değer cart.js:150 ve checkout.js:37 ile AYNI olmalı.
  // Üçü ayrışırsa şemadaki kargo bilgisi sepetteki tutarla çelişir ve
  // Google "fiyat uyuşmazlığı" olarak işaretler.
  var FREE_SHIP_MIN = 2000;
  var SHIP_FEE = 199;

  // İade süresi — iade-teslimat.html'deki cayma hakkı ile aynı (14 gün).
  var RETURN_DAYS = 14;

  /* ---- marka türetme ----
     Supabase products tablosunda brand kolonu YOK. Kolon eklemek
     migration + admin UI + 97 satır veri girişi demek; bunun yerine
     ürün adından türetiyoruz. Eşleşme yoksa mağaza adına düşer
     (eski davranış — regresyon olmaz).
     Sıra ÖNEMLİ: uzun/özel adlar önce gelmeli ("Cuba Percs" < "Cuba").
     Supabase'e brand kolonu eklenirse: p.brand || deriveBrand(p.name) */
  var STORE = 'Nota Müzik Market';

  // Marka adı → kanonik ad. Anahtarlar normalize edilmiş (bkz. normName).
  // 'uster' kataloğdaki bir yazım hatası ("uster Art Edition ADP100").
  var BRAND_ALIASES = [
    ['cuba percs', 'Cuba Percs'], ['royal sound', 'Royal Sound'],
    ['gawharet el fan', 'Gawharet El Fan'], ['gawharet', 'Gawharet El Fan'],
    ['m-vave', 'M-VAVE'], ['m-vawe', 'M-VAVE'], ['aeroband', 'AeroBand'],
    ['hampback', 'Hampback'], ['novacord', 'Novacord'], ['segoiva', 'Segoiva'],
    ['kaysen', 'Kaysen'], ['kirlin', 'Kirlin'], ['stagg', 'Stagg'],
    ['neiro', 'Neiro'], ['auster', 'Auster'], ['uster', 'Auster'], ['rizo', 'Rizo'],
    // "uster Art Edition ADP100" kaydı bu serinin Auster olduğunu doğruluyor
    ['art edition', 'Auster'],
  ];

  /* Model kodu → marka. Kataloğdaki markalı ürünlerden doğrulandı:
     "Auster AB100RW", "Auster AES0942", "Auster GV101-3", "HAMPBACK ACE-530".
     Bu kodlar marka adı yazılmadan da geçiyor (ör. "ADP140 Dijital Piyano"). */
  var MODEL_PREFIXES = [
    [/^(a[bcfgst]|adp|aes|avs|asr|agcl|gv)\s?-?\d/, 'Auster'],
    [/^ace\s?-?\d/, 'Hampback'],
    // "M-Vawe Sp100 Amfi" paket adından doğrulandı
    [/^sp\s?-?\d/, 'M-VAVE'],
  ];

  // Aynı kodlar adın ortasında da geçebiliyor ("Custom Shop AS200 ...")
  var MODEL_ANYWHERE = [
    [/(^|[^a-z0-9])(a[bcfgst]|adp|aes|avs|asr|agcl)\s?-?\d/, 'Auster'],
  ];

  /* Türkçe normalize: 'İ' JS'te 'i' değil 'i̇' (birleşik nokta) oluyor,
     bu yüzden /i bayrağı "NEİRO" ile "Neiro"yu eşleştiremiyor. */
  function normName(s) {
    return String(s || '').replace(/İ/g, 'I').replace(/ı/g, 'i').toLowerCase();
  }

  /* Renk varyantı öneki: "Mavi — AS100PRO ..." → "AS100PRO ..."
     Bu ürünler renk bazında ayrı kayıt; marka adı önekten SONRA geliyor. */
  function stripColorPrefix(s) {
    return String(s || '').replace(/^[^—-]{1,20}\s+—\s+/, '');
  }

  function deriveBrand(name) {
    var n = normName(stripColorPrefix(name));
    var i;

    /* 1) Ad BAŞINDA marka — paket içeriğindeki marka adlarına takılmamak için.
       Ör. "AS100 California Series Elektro Gitar Sahne Seti (... M-Vave SP100
       Amfi)" bir Auster gitarıdır; adın içinde M-Vave geçse de M-VAVE değildir. */
    for (i = 0; i < BRAND_ALIASES.length; i++) {
      if (n.indexOf(BRAND_ALIASES[i][0]) === 0) return BRAND_ALIASES[i][1];
    }

    // 2) Ad başında model kodu (marka adı hiç yazılmamış ürünler)
    for (i = 0; i < MODEL_PREFIXES.length; i++) {
      if (MODEL_PREFIXES[i][0].test(n)) return MODEL_PREFIXES[i][1];
    }

    // 3) Ad ortasında model kodu (ör. "Custom Shop AS200 ...")
    for (i = 0; i < MODEL_ANYWHERE.length; i++) {
      if (MODEL_ANYWHERE[i][0].test(n)) return MODEL_ANYWHERE[i][1];
    }

    // 4) Ad içinde geçen tek bir marka varsa onu kullan; birden fazlaysa
    //    hangisinin ürünün markası olduğu belirsiz → mağaza adına düş.
    var hits = [];
    for (i = 0; i < BRAND_ALIASES.length; i++) {
      var re = new RegExp('(^|[^a-z0-9])' + BRAND_ALIASES[i][0].replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&') + '($|[^a-z0-9])');
      if (re.test(n) && hits.indexOf(BRAND_ALIASES[i][1]) < 0) hits.push(BRAND_ALIASES[i][1]);
    }
    return hits.length === 1 ? hits[0] : STORE;
  }

  function excerpt(s, n) {
    var t = String(s || '').replace(/\s+/g, ' ').trim();
    return t.length > n ? t.slice(0, n - 1).replace(/\s+$/, '') + '…' : t;
  }

  /* Kargo detayı — Google'ın 2024'ten beri istediği alan.
     İki senaryo: eşiğin altı ücretli, üstü ücretsiz. */
  function shippingDetails() {
    function detail(rate, threshold) {
      var spec = {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: rate, currency: 'TRY' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'TR' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
        },
      };
      if (threshold != null) {
        spec.shippingRate.freeShippingThreshold = {
          '@type': 'DeliveryChargeSpecification',
          eligibleTransactionVolume: {
            '@type': 'PriceSpecification', price: threshold, priceCurrency: 'TRY',
          },
        };
      }
      return spec;
    }
    return [detail(SHIP_FEE, FREE_SHIP_MIN), detail(0, FREE_SHIP_MIN)];
  }

  function returnPolicy() {
    return {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'TR',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: RETURN_DAYS,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/FreeReturn',
    };
  }

  /**
   * Product JSON-LD üretir.
   * p: { name, id, price, stock, description, images[], categoryName, url }
   * rating (opsiyonel): { avg, count, reviews[] } — yorum varsa AggregateRating eklenir
   */
  function buildProductSchema(p, rating) {
    var imgs = (p.images || []).filter(Boolean);
    var inStock = Number(p.stock) > 0;

    var schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: excerpt(p.description, 300) || p.name,
      sku: p.id,
      brand: { '@type': 'Brand', name: deriveBrand(p.name) },
      offers: {
        '@type': 'Offer',
        price: Number(p.price),
        priceCurrency: 'TRY',
        itemCondition: 'https://schema.org/NewCondition',
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        priceValidUntil: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
        url: p.url,
        seller: { '@type': 'Organization', name: STORE },
        shippingDetails: shippingDetails(),
        hasMerchantReturnPolicy: returnPolicy(),
      },
    };

    if (imgs.length) schema.image = imgs;
    if (p.categoryName) schema.category = p.categoryName;

    if (rating && rating.count > 0) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: Number(rating.avg.toFixed(1)),
        reviewCount: rating.count,
        bestRating: 5,
        worstRating: 1,
      };
      schema.review = (rating.reviews || []).slice(0, 5).map(function (r) {
        return {
          '@type': 'Review',
          author: { '@type': 'Person', name: r.author_name || 'Müşteri' },
          reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
          reviewBody: r.comment || undefined,
          datePublished: r.created_at ? r.created_at.slice(0, 10) : undefined,
        };
      });
    }

    return schema;
  }

  return {
    buildProductSchema: buildProductSchema,
    deriveBrand: deriveBrand,
    FREE_SHIP_MIN: FREE_SHIP_MIN,
    SHIP_FEE: SHIP_FEE,
  };
}));
