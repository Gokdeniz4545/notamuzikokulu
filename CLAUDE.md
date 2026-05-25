# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proje

**Nota Müzik Market** — müzik enstrümanları satan firma için e-ticaret sitesi.
Şu an: revizyon mockup'ı. Sonraki aşamalar (kapsam dışı): ödeme, kayıt, admin paneli.

## Vizyon: 3D Stacked Card Scroll

Referans: **unveil.fr "OVERVIEW" modu** — ürünler 3D perspektifte istiflenmiş kartlar gibi gösterilir, scroll ile arkadan öne / önden arkaya akarlar.

```
                          [card 8] (en arkada — küçük, blur, opaque)
                       [card 7]
                    [card 6]
                 [card 5]
              [card 4]
           [card 3]
        [card 2]
     [card 1]
  [card 0] (en önde — büyük, net, çıkmaya yakın)
```

### Etkileşimler
- **Scroll:** kartlar Z ekseninde akar (smooth scroll: Lenis)
- **Hover:** kart `translateY(-12px) scale(1.02)`, gölge büyür, 250ms `cubic-bezier(0.22, 1, 0.36, 1)`
- **Click:** sağdan slide-in panel — büyük görsel + ad + fiyat + açıklama + adet + "Sepete Ekle" + "Favorilere Ekle"
- **Sepet:** header'da ikon + badge, ekleme animasyonu (kart küçülerek ikona uçar)

## Teknoloji

- Pure HTML/CSS/JS, build tool yok
- Lenis (CDN) — yumuşak scroll için tek bağımlılık
- Tarayıcıda `index.html` direkt açılır

## Dosya Yapısı

```
nmshop/
├── index.html        ← yapı + içerik
├── styles.css        ← stiller, 3D transforms
├── script.js         ← scroll engine, modal, sepet
├── data.js           ← ürün dizisi
├── images/           ← ürün görselleri (henüz boş)
└── CLAUDE.md
```

## Mobil Uyumluluk (KRITIK — tüm aşamalarda)

Son kullanıcılar çoğunlukla mobilden giriş yapacak. Mobile-first geliştirme zorunlu.

- **CSS:** mobile-first media query — 360px → 768px → 1024px
- **Touch:** min 44x44 px hedef, hover'a güvenme
- **3D stack mobilde:** ≤768px'te dikey grid'e bozulur (animasyon ağır olmasın)
- **Bottom sheet** modal yerine, **sticky bottom CTA** "Sepete Ekle" için
- **Hamburger menü** mobilde
- **Form:** `inputmode`, `autocomplete`, `type="tel"` ile doğru klavye
- **Performans:** JS ≤80KB, WebP/AVIF görsel, `srcset`, lazy load
- **Test cihazları:** iPhone SE, 14 Pro, Galaxy S22, iPad Mini, Desktop
- **Lighthouse mobil:** Performance > 85, Accessibility > 95

## Performans / Optimizasyon Standartları

| Teknik | Neden |
|---|---|
| `transform` + `opacity` only | Layout/paint tetiklemez |
| `will-change: transform` | GPU compositing |
| `requestAnimationFrame` | rAF içinde scroll güncelle |
| `loading="lazy"` + `decoding="async"` | Görsel non-blocking |
| `<picture>` + WebP/AVIF | Modern format + fallback |
| `IntersectionObserver` | Görünmeyen kartlar için will-change kaldır |
| `content-visibility: auto` | Modal off-screen iken render etme |
| `prefers-reduced-motion` | Animasyon kapatma desteği |

Hedef: Lighthouse Performance > 90.

## Tasarım Dili

- **Arka plan:** `#fafafa`
- **Tipografi:** "Inter", system-ui — hero 96px+, gövde 14-16px
- **Aksan:** `#e63946` (kırmızı) veya `#f97316` (turuncu)
- **Kart:** köşe 4px, beyaz bg, görsel %80 / metin %20
- **Gölge:** `0 24px 64px rgba(0,0,0,0.12)` → hover `0 32px 80px rgba(0,0,0,0.18)`
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (premium hissi)

## Sayfa Bölümleri

1. **Header** — fixed, şeffaf → scroll'da blur. Logo + nav + sepet ikonu
2. **Hero** — büyük başlık, tagline, scroll oku
3. **3D Stack Sahnesi** — `position: sticky`, ~500vh runway, scroll progress'e göre kartlar interpole edilir
4. **Kategori filtresi** — sağ alt köşede chip'ler (Tümü · Gitarlar · Klavye · Davul · Yaylılar · Aksesuarlar)
5. **Footer** — logo, sosyal medya placeholder

## Ürün Listesi (18 ürün)

Sohbette paylaşılan görsellerden çıkarıldı. Fiyatlar placeholder, gerçek fiyat listesi gelince güncellenecek.

| Görsel | Ürün | Kategori |
|---|---|---|
| guitar-white.jpg | Auster Elektro Gitar (Beyaz) | Gitarlar |
| aeroband-drums.jpg | AeroBand Elektronik Davul Seti | Davul & Perküsyon |
| keyboard-s61.jpg | Auster Keyboard GO S61 | Klavye & Piyano |
| guitar-blue.jpg | Klasik Gitar (Mavi) | Gitarlar |
| digital-piano-black.jpg | Dijital Piyano (Siyah) | Klavye & Piyano |
| strings-electric.jpg | Auster AES0942 Elektro Tel | Aksesuarlar |
| piano-white.jpg | Auster Dijital Piyano (Beyaz) | Klavye & Piyano |
| strings-violin.jpg | Auster AVS44 Keman Teli | Aksesuarlar |
| guitar-black-strat.jpg | Elektro Gitar (Siyah Strat) | Gitarlar |
| violin-case.jpg | Keman (Kutulu) | Yaylılar |
| mini-amps.jpg | Mini Amfi Seti | Aksesuarlar |
| edrums-green.jpg | Elektronik Davul (Yeşil) | Davul & Perküsyon |
| cable-kirlin.jpg | Kirlin LightGear 6M Kablo | Aksesuarlar |
| amp-mvave.jpg | M-VAVE Mini Amfi | Aksesuarlar |
| edrums-nitro.jpg | Nitro Elektronik Davul (Kırmızı) | Davul & Perküsyon |
| edrums-color.jpg | Nitro Renkli Davul | Davul & Perküsyon |
| drumsticks-maple.jpg | Stagg Maple 5B Baget | Aksesuarlar |
| violin-brown.jpg | Keman (Doğal Renk) | Yaylılar |

Görsel olmadığında CSS gradient placeholder kullanılır (her kategori farklı renk).

## Aşamalar

### AŞAMA 1 — 3D Stacked Card Landing Page Mockup
Tetikleyici: **"AŞAMA 1 BAŞLAT"**
Tüm yukarıdaki tasarım/etkileşim/optimizasyon detayları bu aşamadadır.

### AŞAMA 2 — Production E-Ticaret Sistemi
Tetikleyici: **"AŞAMA 2 BAŞLAT"**
Artık mockup değil, gerçek satış yapacak site.

**Eklenenler:**
- Backend: Node.js + Express
- DB: PostgreSQL (prod), SQLite (dev)
- Auth: JWT (access 15dk + refresh 7gün), bcrypt
- Ödeme: PayTR iframe API
- Müşteri üyelik, sipariş takip (status timeline + kargo kodu)
- Favoriler (wishlist)
- Adres yönetimi
- Email (Nodemailer): sipariş onay + şifre sıfırlama

**Yeni sayfalar:** login, account, cart, checkout, order-success, orders, order-detail, wishlist

**Klasör yapısı yeniden düzenlenir:** `client/` (frontend) + `server/` (backend)

**Detaylı plan:** `C:\Users\Doğa Keleş\.claude\plans\niye-b-yle-bir-hata-breezy-quail.md`

### AŞAMA 3 (potansiyel)
Admin panel (sipariş yönetimi, ürün ekleme, stok takibi) — kullanıcı isterse.

## Çalışma Kuralı

Kullanıcı aşama tetikleme komutunu vermeden kod yazma. Sadece plan üzerinde konuş.
