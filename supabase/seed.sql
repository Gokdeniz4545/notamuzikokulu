-- ============================================================
-- Nota Müzik Market — seed
-- 5 kategori + 18 ürün (placeholder fiyatlar — gerçek liste gelince UPDATE)
-- ============================================================

-- ----- Kategoriler -----
INSERT INTO categories (slug, name, image_path, display_order) VALUES
  ('guitars',  'Gitarlar',            'images/cat-guitars.webp', 1),
  ('keys',     'Klavye & Piyano',     'images/cat-keys.webp',    2),
  ('drums',    'Davul & Perküsyon',   'images/cat-drums.webp',   3),
  ('strings',  'Yaylılar',            'images/cat-strings.webp', 4),
  ('access',   'Aksesuarlar',         'images/cat-access.webp',  5);

-- ----- Ürünler -----
-- VALUES tablosu: (slug, name, cat_slug, price, stock, description)
INSERT INTO products (slug, name, category_id, price, stock, description, is_active)
SELECT v.slug, v.name, c.id, v.price, v.stock, v.description, TRUE
FROM (VALUES
  ('auster-elektro-gitar-beyaz',     'Auster Elektro Gitar (Beyaz)',     'guitars', 8499::NUMERIC,  5, 'Tek vuruşta tonu seni sürükleyen, sahne aydınlığı için tasarlanmış beyaz elektro gitar.'),
  ('aeroband-elektronik-davul',      'AeroBand Elektronik Davul Seti',   'drums',  12990::NUMERIC,  3, 'Kablosuz, taşınabilir, gerçek davul hissi veren elektronik set. Pratik için ideal.'),
  ('auster-keyboard-go-s61',         'Auster Keyboard GO S61',           'keys',    6499::NUMERIC,  8, '61 tuşlu, başlangıç ve orta seviye için ideal portatif klavye. Yüzlerce ses, ritm.'),
  ('klasik-gitar-mavi',              'Klasik Gitar (Mavi)',              'guitars', 2899::NUMERIC, 12, 'Yumuşak naylon tellerle parmaklarına nazik, parlak mavi gövdeli klasik gitar.'),
  ('dijital-piyano-siyah',           'Dijital Piyano (Siyah)',           'keys',   18750::NUMERIC,  2, '88 tuş, ağırlıklı klavye. Konser piyanosu hissini evine taşıyan profesyonel model.'),
  ('auster-aes0942-elektro-tel',     'Auster AES0942 Elektro Tel',       'access',   199::NUMERIC, 50, 'Elektro gitarın için kalın-ince dengesi mükemmel 09-42 tel seti. Uzun ömürlü.'),
  ('auster-dijital-piyano-beyaz',    'Auster Dijital Piyano (Beyaz)',    'keys',   19990::NUMERIC,  1, 'Beyaz şıklığında 88 tuşlu dijital piyano. Bluetooth bağlantı, kayıt ve metronom.'),
  ('auster-avs44-keman-teli',        'Auster AVS44 Keman Teli',          'access',   349::NUMERIC, 30, 'Sıcak ve berrak ton sunan 4/4 keman tel seti. Eğitim ve sahne kullanımına uygun.'),
  ('elektro-gitar-siyah-strat',      'Elektro Gitar (Siyah Strat)',      'guitars', 7299::NUMERIC,  4, 'Klasik Strat formu, üç single-coil manyetik. Blues''tan rock''a her şey elinin altında.'),
  ('keman-kutulu',                   'Keman (Kutulu)',                   'strings', 4499::NUMERIC,  6, 'Sert kutusu, yayı ve reçinesiyle gelen başlangıç için ideal 4/4 keman seti.'),
  ('mini-amfi-seti',                 'Mini Amfi Seti',                   'access',  1290::NUMERIC, 10, 'Cebine sığan, pratik mini amfi. Antrenmanlarına gücünden ödün vermeden eşlik eder.'),
  ('elektronik-davul-yesil',         'Elektronik Davul (Yeşil)',         'drums',   9890::NUMERIC,  5, 'Sessiz pratik için pedlı set. Kulaklıkla çevreni rahatsız etmeden çalışabilirsin.'),
  ('kirlin-lightgear-6m-kablo',      'Kirlin LightGear 6M Kablo',        'access',   449::NUMERIC, 40, 'Düşük gürültü, dayanıklı koruma, 6 metre uzunluk. Sahne ve stüdyo için güvenilir.'),
  ('m-vave-mini-amfi',               'M-VAVE Mini Amfi',                 'access',  1890::NUMERIC,  8, 'Şarjlı, Bluetooth destekli mini amfi. Pratiği eğlenceye dönüştüren akıllı tasarım.'),
  ('nitro-elektronik-davul-kirmizi', 'Nitro Elektronik Davul (Kırmızı)', 'drums',  14990::NUMERIC,  0, 'Profesyonel hisli pedler, geniş ses kütüphanesi. Sahnede de evde de iddialı.'),
  ('nitro-renkli-davul',             'Nitro Renkli Davul',               'drums',  13290::NUMERIC,  2, 'Görselliği kadar tınısı da etkileyici elektronik davul seti. Yaratıcılığa davet.'),
  ('stagg-maple-5b-baget',           'Stagg Maple 5B Baget',             'access',   149::NUMERIC, 60, 'Akçaağaç gövde, dengeli ağırlık. Hızlı geçişlerde elini yormayan klasik 5B baget.'),
  ('keman-dogal-renk',               'Keman (Doğal Renk)',               'strings', 4290::NUMERIC,  7, 'Doğal vernikli ahşap gövde, sıcak ton. Başlangıç ve orta seviye için ideal keman.')
) AS v(slug, name, cat_slug, price, stock, description)
JOIN categories c ON c.slug = v.cat_slug;
