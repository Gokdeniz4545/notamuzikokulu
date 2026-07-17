/* ============================================================
   Nota Müzik Market — AŞAMA 1
   3D stack scroll + product panel + sepet state + filtre
   ============================================================ */
(() => {
  'use strict';

  const { CATEGORIES, PRODUCTS } = window.NM;

  // --------- helpers ----------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const smoothstep = (t) => {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  };
  const fmtPrice = (n) => new Intl.NumberFormat('tr-TR').format(n) + ' TL';

  // --------- scroll lock (iOS Safari body bounce'u tamamen engeller) ----------
  // documentElement overflow:hidden iOS Safari'de bazen yetersiz; body fixed pattern garanti
  let savedScrollY = 0;
  let scrollLocked = false;
  function lockBodyScroll() {
    if (scrollLocked) return;            // çift kilit alma — scrollY iki kez kaydedilmesin
    savedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = -savedScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    scrollLocked = true;
  }
  function unlockBodyScroll() {
    if (!scrollLocked) return;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflow = '';
    window.scrollTo(0, savedScrollY);
    scrollLocked = false;
  }

  // --------- elements ----------
  const body         = document.body;
  const header       = $('#siteHeader');
  const scene        = $('#scene');
  const stackSection = $('.stack-section');
  const counterEl    = $('#stackCounter');
  const cartBtn      = $('#cartBtn');
  const cartBadge    = $('#cartBadge');
  const stackCatName = $('#stackCatName');
  const backBtn      = $('#backBtn');
  const hamburger          = $('#hamburger');
  const mobileMenu         = $('#mobileMenu');
  const mobileMenuBackdrop = $('#mobileMenuBackdrop');
  const mobileMenuClose    = $('#mobileMenuClose');

  const authSlots = $$('.auth-slot, .mobile-menu-auth');

  const panel        = $('#productPanel');
  const backdrop     = $('#panelBackdrop');
  const panelClose   = $('#panelClose');
  const panelCat     = $('#panelCat');
  const panelTitle   = $('#panelTitle');
  const panelPrice   = $('#panelPrice');
  const panelStock   = $('#panelStock');
  const panelDesc    = $('#panelDesc');
  const panelMedia   = $('#panelMedia');
  const qtyValue     = $('#qtyValue');
  const qtyMinus     = $('#qtyMinus');
  const qtyPlus      = $('#qtyPlus');
  const addToCart    = $('#addToCart');
  const addToFav     = $('#addToFav');
  const flyLayer     = $('#flyLayer');

  const categoryByCat = new Map(CATEGORIES.map(c => [c.slug, c]));
  const accentByCat = new Map([
    ['guitars', { c1: '#1d1d1d', c2: '#e63946' }],
    ['keys',    { c1: '#1c2541', c2: '#5b8def' }],
    ['drums',   { c1: '#2b1d10', c2: '#f97316' }],
    ['strings', { c1: '#2a1a3a', c2: '#a06cd5' }],
    ['access',  { c1: '#0e2f2b', c2: '#2a9d8f' }],
  ]);

  // --------- mode ----------
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
  // 3D scroll mobilde de aktif — sadece prefers-reduced-motion'da grid'e düşer
  let gridMode = reduced;

  // --------- state ----------
  // scene içeriği iki state arasında geçiş yapar: 'cats' veya 'products'
  const cardEls = [];           // şu anki scene'in kart DOM referansları
  let visibleCards = [];        // = cardEls.slice() (filter mantığı bu state'te kullanılmıyor)
  let state = 'cats';
  let activeCat = null;

  // Responsive görsel yardımcıları (NMApi thumb/srcset — varyant yoksa orijinali döndürür)
  const sThumb = (u, w) => { const a = window.NMApi; return a && a.thumb ? a.thumb(u, w) : u; };
  const sSrcset = (u) => { const a = window.NMApi; return a && a.srcset ? a.srcset(u) : ''; };

  // Ortak kart iskeletinin parçalarını üretir
  function buildBaseCard({ topTag, glyph, name, footRight, tone, imageSrc, imageAlt, classes }) {
    const art = document.createElement('article');
    art.className = 'card' + (classes ? ' ' + classes : '');
    art.style.setProperty('--c-1', tone.c1);
    art.style.setProperty('--c-2', tone.c2);
    art.innerHTML = `
      <div class="card-inner">
        <div class="card-media">
          <span class="card-tag">${topTag}</span>
          <img alt="${imageAlt}" loading="lazy" decoding="async" />
          <span class="placeholder-glyph" aria-hidden="true">${glyph}</span>
        </div>
        <div class="card-meta">
          <h3 class="card-name">${name}</h3>
          <span class="card-price">${footRight}</span>
        </div>
      </div>
    `;
    const img = $('img', art);
    const placeholder = $('.placeholder-glyph', art);
    if (imageSrc) {
      const applyR = window.NMApi && window.NMApi.applyResponsive;
      if (applyR) {
        applyR(img, imageSrc, {
          sizes: '(max-width: 768px) 45vw, 240px',
          width: 600, height: 800,
          onLoad: () => placeholder.style.display = 'none',
          onFail: () => img.remove(),
        });
      } else {
        img.src = imageSrc;
        img.addEventListener('load',  () => placeholder.style.display = 'none', { once: true });
        img.addEventListener('error', () => img.remove(), { once: true });
      }
    } else {
      img.remove();
    }
    return art;
  }

  function buildProductCard(p) {
    const cat = categoryByCat.get(p.category);
    const tone = accentByCat.get(p.category) || { c1: '#333', c2: '#666' };
    // İndirim varsa: yeni fiyat + üstü çizili eski fiyat
    const footRight = p.discountPercent > 0
      ? `<span class="price-old">${fmtPrice(p.oldPrice)}</span> ${fmtPrice(p.price)}`
      : fmtPrice(p.price);
    const art = buildBaseCard({
      topTag:    cat?.name ?? '',
      glyph:     (cat?.name || '?').charAt(0),
      name:      p.name,
      footRight,
      tone,
      imageSrc:  p.image,
      imageAlt:  p.name,
    });
    // Sol üst köşe indirim rozeti
    if (p.discountPercent > 0) art.appendChild(discountBadge(p.discountPercent));
    art.dataset.id = p.id;
    art.dataset.cat = p.category;
    art.addEventListener('click', () => window.open(p.slug ? 'urun-' + p.slug + '.html' : 'product.html?id=' + encodeURIComponent(p.id), '_blank', 'noopener'));
    return art;
  }

  // --------- kategori hiyerarşisi (iç içe) ----------
  let catNodes = [];   // tüm kategori düğümleri {id, slug, name, image, parentId, productCount}
  let navPath = [];    // drill-down yolu (kök → ... → mevcut düğüm)
  const childrenOf = (pid) => catNodes.filter(c => (c.parentId || null) === (pid || null));
  const isLeaf = (node) => childrenOf(node.id).length === 0;

  // İndirimli ürünü olan kategori slug'ları (kategori kartı rozeti için)
  let discountedCatSlugs = new Set();

  async function loadCategoryData() {
    let cats = window.NMApi ? await window.NMApi.getCategories() : null;
    if (!cats || !cats.length) {
      // fallback: data.js düz kategoriler → hepsi üst seviye yaprak
      cats = CATEGORIES.filter(c => c.slug !== 'all').map(c => ({
        id: c.slug, slug: c.slug, name: c.name, image: c.image || null, parentId: null,
        productCount: PRODUCTS.filter(p => p.category === c.slug).length,
      }));
    }
    catNodes = cats;
    // ürün kartı / panel için isim eşlemesini zenginleştir (yeni kategoriler dahil)
    catNodes.forEach(c => { if (!categoryByCat.has(c.slug)) categoryByCat.set(c.slug, { slug: c.slug, name: c.name }); });

    try {
      discountedCatSlugs = window.NMApi ? await window.NMApi.getDiscountedCategorySlugs() : new Set();
    } catch (_) { discountedCatSlugs = new Set(); }
  }

  // Sol üst köşe indirim rozeti
  function discountBadge(pct) {
    const b = document.createElement('span');
    b.className = 'disc-badge';
    b.setAttribute('aria-label', `%${pct} indirim`);
    b.textContent = `%${pct}`;
    return b;
  }

  // Bu kategoride (ya da alt kategorilerinde) indirimli ürün var mı?
  function catHasDiscount(node) {
    if (discountedCatSlugs.has(node.slug)) return true;
    const stack = [node.id];
    while (stack.length) {
      const pid = stack.pop();
      for (const c of catNodes) {
        if ((c.parentId || null) !== pid) continue;
        if (discountedCatSlugs.has(c.slug)) return true;
        stack.push(c.id);
      }
    }
    return false;
  }

  function buildCategoryCard(node) {
    const leaf = isLeaf(node);
    const countLabel = leaf
      ? `${node.productCount || 0} ürün`
      : `${childrenOf(node.id).length} kategori`;
    const art = document.createElement('article');
    art.className = 'card is-cat';
    art.dataset.cat = node.slug;
    art.setAttribute('aria-label', `${node.name} — ${countLabel}`);
    art.innerHTML = `
      <div class="card-inner">
        <div class="card-media">
          ${node.image ? `<img src="${sThumb(node.image, 720)}" srcset="${sSrcset(node.image)}" sizes="(max-width: 768px) 80vw, 460px" data-full="${node.image}" alt="${node.name}" width="600" height="800" decoding="async" />` : ''}
        </div>
        <div class="card-overlay">
          <span class="card-overlay-name">${node.name}</span>
          <span class="card-overlay-count">${countLabel} <span aria-hidden="true">→</span></span>
        </div>
      </div>
    `;
    // Kategoride indirimli ürün varsa sol üstte rozet
    if (catHasDiscount(node)) {
      const b = document.createElement('span');
      b.className = 'disc-badge is-cat-badge';
      b.setAttribute('aria-label', 'İndirimli ürünler var');
      b.textContent = 'İNDİRİM';
      art.appendChild(b);
    }
    art.addEventListener('click', () => enterCategory(node));
    return art;
  }

  function fadeScene(loader) {
    scene.classList.add('is-fading');
    setTimeout(async () => {
      await loader();                                          // loader artık async olabilir
      // Mobil silindir rotation'ı başa sar (kategori↔ürün geçişinde)
      cylRotOverride = 0;
      scrollToStackTop();
      requestAnimationFrame(() => {
        scene.classList.remove('is-fading');
        if (!gridMode) update();
      });
    }, 280);
  }

  function scrollToStackTop() {
    const target = stackSection.getBoundingClientRect().top + window.scrollY;
    if (lenis) lenis.scrollTo(target, { duration: 0.6, immediate: false });
    else window.scrollTo({ top: target, behavior: 'smooth' });
  }

  function fillCats(nodes, parentNode) {
    scene.innerHTML = '';
    cardEls.length = 0;
    nodes.forEach((n) => {
      const el = buildCategoryCard(n);
      scene.appendChild(el);
      cardEls.push(el);
    });
    visibleCards = cardEls.slice();
    state = 'cats';
    activeCat = null;
    // Ana seviyede etiket yok; alt kategoriye girilince o kategorinin adı görünür
    stackCatName.textContent = parentNode ? parentNode.name : '';
    backBtn.hidden = navPath.length === 0;
    updateRunway();
  }

  async function fillProducts(node) {
    scene.innerHTML = '';
    cardEls.length = 0;

    let items = window.NMApi ? await window.NMApi.getProductsByCategory(node.slug) : null;
    if (!items) items = PRODUCTS.filter(p => p.category === node.slug);

    items.forEach((p) => {
      const el = buildProductCard(p);
      scene.appendChild(el);
      cardEls.push(el);
    });
    visibleCards = cardEls.slice();
    state = 'products';
    activeCat = node.slug;
    stackCatName.textContent = node.name || '';
    backBtn.hidden = false;
    updateRunway();
  }

  // navPath'e göre mevcut seviyeyi doldur: yaprak → ürünler, değilse alt kategoriler
  async function renderLevel() {
    const parent = navPath[navPath.length - 1] || null;
    if (parent && isLeaf(parent)) {
      await fillProducts(parent);
    } else {
      fillCats(childrenOf(parent ? parent.id : null), parent);
    }
  }

  function enterCategory(node) {
    navPath.push(node);
    fadeScene(renderLevel);
  }
  function goBack() {
    if (navPath.length === 0) return;
    navPath.pop();
    fadeScene(renderLevel);
  }

  function updateRunway() {
    const n = Math.max(visibleCards.length, 1);
    // Silindir TURNS kez dönecek kadar scroll runway'i; her tur ~n*45vh
    const vh = Math.round(n * 45 * TURNS) + 100;
    stackSection.style.setProperty('--runway', vh + 'vh');
  }

  // --------- snap to nearest card (mıknatıs) ----------
  let snapTimer = 0;
  let isSnapping = false;

  function snapToNearestCard() {
    if (isSnapping || gridMode) return;
    if (useRotOverride) return;                                // mobil için snapMobileCylinder kullanılır
    if (!visibleCards.length) return;
    if (stackSection.hidden) return;
    const rect = stackSection.getBoundingClientRect();
    const totalScrollable = stackSection.offsetHeight - window.innerHeight;
    if (totalScrollable <= 0) return;
    // Stack section ekran içinde mi? Değilse snap'leme.
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const progress = clamp(-rect.top / totalScrollable, 0, 1);
    const cylRotDeg = progress * TURNS * 360;
    const n = visibleCards.length;
    const angleStep = 360 / n;
    const cur = ((cylRotDeg % 360) + 360) % 360;

    // En yakın kartın hedef açısına olan signed delta (-180..+180)
    let bestDelta = Infinity;
    let bestAbs = Infinity;
    for (let i = 0; i < n; i++) {
      let delta = i * angleStep - cur;
      delta = ((delta + 180) % 360 + 360) % 360 - 180;
      if (Math.abs(delta) < bestAbs) {
        bestAbs = Math.abs(delta);
        bestDelta = delta;
      }
    }
    if (Math.abs(bestDelta) < 0.5) return;

    const deltaProgress = bestDelta / (TURNS * 360);
    const deltaY = deltaProgress * totalScrollable;
    const targetY = Math.max(0, window.scrollY + deltaY);

    isSnapping = true;
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(targetY, {
        duration: 0.45,
        easing: (t) => 1 - Math.pow(1 - t, 3),
      });
      setTimeout(() => { isSnapping = false; }, 500);
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      setTimeout(() => { isSnapping = false; }, 520);
    }
  }

  function queueSnap() {
    if (isSnapping) return;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(snapToNearestCard, 240);
  }

  window.addEventListener('wheel',       queueSnap, { passive: true });
  window.addEventListener('touchend',    queueSnap, { passive: true });
  window.addEventListener('touchcancel', queueSnap, { passive: true });

  // --------- mobil yatay swipe → silindir gezinme ----------
  // Mobil: cylRotOverride'ı doğrudan değiştirir, sayfa scroll'una dokunmaz (takılma yok)
  // dx > 0 (sağa swipe) → cylRotOverride azalır → silindir bir önceki karta döner
  // dx < 0 (sola swipe) → cylRotOverride artar → silindir bir sonraki karta döner
  let tStartX = 0, tStartY = 0, tStartRot = 0;
  let tSwipeDir = null;   // null | 'h' | 'v'

  stackSection.addEventListener('touchstart', (e) => {
    if (gridMode) return;
    tStartX = e.touches[0].clientX;
    tStartY = e.touches[0].clientY;
    tStartRot = cylRotOverride;
    tSwipeDir = null;
  }, { passive: true });

  stackSection.addEventListener('touchmove', (e) => {
    if (gridMode || isSnapping || !useRotOverride) return;     // sadece mobilde
    const dx = e.touches[0].clientX - tStartX;
    const dy = e.touches[0].clientY - tStartY;
    if (tSwipeDir === null) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;      // 10 px eşik
      tSwipeDir = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
    }
    if (tSwipeDir === 'h') {
      e.preventDefault();                                       // dikey scroll'u kilitle, sayfa kaymasın
      // 1 px swipe ≈ 0.4° dönüş — 5 kart için 72°/0.4 = 180 px swipe = bir kart
      cylRotOverride = tStartRot - dx * 0.4;
      needsUpdate = true;
    }
  }, { passive: false });   // preventDefault için passive:false ŞART

  stackSection.addEventListener('touchend', () => {
    if (tSwipeDir === 'h' && useRotOverride) snapMobileCylinder();
    tSwipeDir = null;
  }, { passive: true });
  stackSection.addEventListener('touchcancel', () => { tSwipeDir = null; }, { passive: true });

  // Mobil silindir snap — cylRotOverride'ı en yakın kart açısına easeOutCubic ile animate eder
  function snapMobileCylinder() {
    if (!useRotOverride) return;
    const n = visibleCards.length;
    if (n === 0) return;
    const angleStep = 360 / n;
    const cur = ((cylRotOverride % 360) + 360) % 360;
    let bestDelta = Infinity, bestAbs = Infinity;
    for (let i = 0; i < n; i++) {
      let delta = i * angleStep - cur;
      delta = ((delta + 180) % 360 + 360) % 360 - 180;
      if (Math.abs(delta) < bestAbs) { bestAbs = Math.abs(delta); bestDelta = delta; }
    }
    if (Math.abs(bestDelta) < 0.5) return;

    const start = cylRotOverride;
    const target = start + bestDelta;
    const startTime = performance.now();
    const duration = 380;
    isSnapping = true;
    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);                    // easeOutCubic
      cylRotOverride = start + (target - start) * eased;
      needsUpdate = true;
      if (t < 1) requestAnimationFrame(tick);
      else { cylRotOverride = target; isSnapping = false; }
    }
    requestAnimationFrame(tick);
  }

  // --------- 3D silindir engine ----------
  // Kartlar bir silindir etrafında dizilir, scroll ile silindir döner.
  // TURNS: scroll boyunca silindir kaç tam tur döner (sonsuz hissi için yüksek).
  const TURNS = 2;   // 2 tam tur (720°) — scroll runway'i buna göre ~2x uzar; footer/yasal linkler hâlâ ulaşılabilir
  let rafId = 0;
  let needsUpdate = true;
  // Mobilde silindir scroll'dan bağımsız döner: cylRotOverride state'i swipe ile güncellenir
  let useRotOverride = isMobile();
  let cylRotOverride = 0;

  function getCylRotDeg() {
    if (useRotOverride) return cylRotOverride;
    const rect = stackSection.getBoundingClientRect();
    const totalScrollable = stackSection.offsetHeight - window.innerHeight;
    if (totalScrollable <= 0) return 0;
    const progress = clamp(-rect.top / totalScrollable, 0, 1);
    return progress * TURNS * 360;
  }

  function update() {
    if (gridMode) return;
    needsUpdate = false;

    const n = visibleCards.length;
    if (n === 0) return;

    // Silindir parametreleri
    const angleStep = 360 / n;                              // her kart sabit açı offset (5 kart → 72°)
    const cylRotDeg = getCylRotDeg();                       // toplam dönüş açısı (mobilde override, desktop scroll-based)
    // Yarıçap viewport'a göre: 5 kart yan yana sığacak şekilde
    const vw = window.innerWidth;
    const radius = isMobile()
      ? clamp(vw * 0.42, 150, 320)
      : clamp(vw * 0.5, 200, 380);

    let frontIdx = 0;
    let minAbsN = Infinity;

    for (let i = 0; i < n; i++) {
      const el = visibleCards[i];
      // Bu kartın sahnedeki anlık açısı (silindir döndükçe değişir)
      const eff = i * angleStep - cylRotDeg;
      const rad = eff * Math.PI / 180;

      // Silindir üzerinde X ve Z konumu (merkez kamera yönüne göre)
      const x = Math.sin(rad) * radius;
      const z = -radius + Math.cos(rad) * radius;  // 0 (önde) .. -2r (en arkada)

      // Normalize açı -180..180 (önde 0, arkada ±180)
      const norm = ((eff % 360) + 540) % 360 - 180;
      const absN = Math.abs(norm);

      // Görsel ayarlar
      const blur    = absN > 30 ? Math.min(10, (absN - 30) * 0.12) : 0;
      const opacity = absN < 100 ? 1 : Math.max(0, 1 - (absN - 100) / 70);
      const zIdx    = Math.round(1000 - absN * 5);
      el.style.setProperty('--tx',      x.toFixed(1) + 'px');
      el.style.setProperty('--ty',      '0px');
      el.style.setProperty('--z',       z.toFixed(1) + 'px');
      el.style.setProperty('--scale',   '1');
      el.style.setProperty('--blur',    blur.toFixed(2) + 'px');
      el.style.setProperty('--opacity', opacity.toFixed(3));
      el.style.zIndex = zIdx;
      // Görünür herhangi bir kart tıklanabilir (snap zaten ortaya yapıştırır,
      // ama kullanıcı snap'i beklemeden de tıklayabilsin diye eşik geniş tutuldu)
      el.style.pointerEvents = (absN < 130 && opacity > 0.2) ? 'auto' : 'none';

      if (absN < minAbsN) { minAbsN = absN; frontIdx = i; }
    }

    // Sadece önde olan karta is-front class — overlay (kategori adı + ürün sayısı) sadece bu kartta görünür
    for (let i = 0; i < n; i++) {
      visibleCards[i].classList.toggle('is-front', i === frontIdx);
    }

    // sayaç — en önde olan kartı seç
    if (counterEl) {
      const idx = frontIdx + 1;
      counterEl.textContent =
        String(idx).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
    }
  }

  function loop() {
    update();
    rafId = requestAnimationFrame(loop);
  }

  function startLoop() {
    if (rafId) return;
    rafId = requestAnimationFrame(loop);
  }
  function stopLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  // --------- header scroll shadow ----------
  function onScroll() {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }

  // --------- mode switching ----------
  function applyMode() {
    const next = reduced;
    if (next === gridMode && document.body.classList.contains('is-grid') === next) return;
    gridMode = next;
    body.classList.toggle('is-grid', gridMode);
    if (gridMode) {
      stopLoop();
      // 3D inline stilleri temizle
      cardEls.forEach((el) => {
        el.style.removeProperty('--z');
        el.style.removeProperty('--scale');
        el.style.removeProperty('--blur');
        el.style.removeProperty('--opacity');
        el.style.zIndex = '';
        el.style.pointerEvents = '';
      });
      lenisStop();
    } else {
      lenisStart();
      startLoop();
    }
    updateRunway();
  }

  // --------- panel (product detail) ----------
  let currentProduct = null;
  let currentQty = 1;

  // --------- wishlist (favoriler — DB destekli) ----------
  const wishlistCache = new Set(); // ürün UUID'leri (login kullanıcı)
  async function loadWishlistCache() {
    wishlistCache.clear();
    if (!window.NMAuth || !window.NMAccount) return;
    const session = await window.NMAuth.getSession();
    if (!session) return;
    const { data } = await window.NMAccount.listWishlist();
    (data || []).forEach(w => wishlistCache.add(w.product_id));
    if (currentProduct) {
      addToFav.setAttribute('aria-pressed', wishlistCache.has(currentProduct.id) ? 'true' : 'false');
    }
  }

  function openPanel(p, sourceEl) {
    currentProduct = p;
    currentQty = 1;
    qtyValue.textContent = '1';

    const cat = categoryByCat.get(p.category);
    panelCat.textContent  = cat?.name || '';
    panelTitle.textContent = p.name;
    panelPrice.textContent = fmtPrice(p.price);
    panelDesc.textContent  = p.description || '';

    if (p.stock > 0) {
      panelStock.classList.remove('is-out');
      panelStock.innerHTML = `<span class="dot" aria-hidden="true"></span>Stokta — ${p.stock} adet`;
      addToCart.disabled = false;
      addToCart.textContent = 'Sepete Ekle';
    } else {
      panelStock.classList.add('is-out');
      panelStock.innerHTML = `<span class="dot" aria-hidden="true"></span>Tükendi`;
      addToCart.disabled = true;
      addToCart.textContent = 'Tükendi';
    }

    // media
    const tone = accentByCat.get(p.category) || { c1: '#ddd', c2: '#888' };
    panelMedia.style.setProperty('--c-1', tone.c1);
    panelMedia.style.setProperty('--c-2', tone.c2);
    const initial = (cat?.name || '?').charAt(0);
    panelMedia.innerHTML = '';
    const phSpan = document.createElement('span');
    phSpan.className = 'placeholder-glyph';
    phSpan.setAttribute('aria-hidden', 'true');
    phSpan.textContent = initial;
    panelMedia.appendChild(phSpan);

    const gallery = (p.images && p.images.length) ? p.images.slice() : (p.image ? [p.image] : []);
    if (gallery.length) {
      let idx = 0;
      const mainImg = document.createElement('img');
      mainImg.className = 'panel-media-main';
      mainImg.alt = p.name;
      mainImg.decoding = 'async';
      const T = window.NMApi;
      const setPanelImg = (url) => {
        mainImg.setAttribute('data-full', url);
        const ss = T && T.srcset ? T.srcset(url) : '';
        if (ss) {
          mainImg.sizes = '(max-width: 768px) 90vw, 460px';
          mainImg.srcset = ss;
          mainImg.src = T.thumb(url, 720);
        } else {
          mainImg.removeAttribute('srcset');
          mainImg.src = url;
        }
      };
      mainImg.addEventListener('load', () => phSpan.style.display = 'none', { once: true });
      mainImg.addEventListener('error', () => { if (!/_\d+\.webp(\?.*)?$/i.test(mainImg.currentSrc || mainImg.src || '')) mainImg.remove(); });
      setPanelImg(gallery[0]);
      panelMedia.appendChild(mainImg);

      if (gallery.length > 1) {
        const dots = document.createElement('div');
        dots.className = 'panel-dots';
        const show = (i) => {
          idx = (i + gallery.length) % gallery.length;
          setPanelImg(gallery[idx]);
          phSpan.style.display = 'none';
          $$('.panel-dot', dots).forEach((d, di) => d.classList.toggle('is-active', di === idx));
        };
        gallery.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'panel-dot' + (i === 0 ? ' is-active' : '');
          dot.setAttribute('aria-label', `Görsel ${i + 1}`);
          dot.addEventListener('click', () => show(i));
          dots.appendChild(dot);
        });

        const mkNav = (cls, label, delta) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'panel-nav ' + cls;
          b.setAttribute('aria-label', label);
          b.innerHTML = cls === 'prev'
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
          b.addEventListener('click', () => show(idx + delta));
          return b;
        };
        panelMedia.appendChild(mkNav('prev', 'Önceki görsel', -1));
        panelMedia.appendChild(mkNav('next', 'Sonraki görsel', 1));
        panelMedia.appendChild(dots);

        // mobil swipe
        let sx = 0;
        panelMedia.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
        panelMedia.addEventListener('touchend', (e) => {
          const dx = e.changedTouches[0].clientX - sx;
          if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
        }, { passive: true });
      }
    }

    // favori durumu
    addToFav.setAttribute('aria-pressed', wishlistCache.has(p.id) ? 'true' : 'false');

    // göster
    panel.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      panel.classList.add('is-open');
      backdrop.classList.add('is-open');
    });
    lockBodyScroll();
    lenisStop();
    sourceEl?.classList.add('is-active');
    panel.focus?.();
  }

  function closePanel() {
    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    setTimeout(() => {
      panel.hidden = true;
      backdrop.hidden = true;
    }, 520);
    // Mobil menü hâlâ açık değilse scroll lock'u kaldır
    if (mobileMenu.hidden) unlockBodyScroll();
    cardEls.forEach(c => c.classList.remove('is-active'));
    if (!gridMode) lenisStart();
  }

  panelClose.addEventListener('click', closePanel);
  backdrop.addEventListener('click', closePanel);

  // --------- mobil menü ----------
  function openMobileMenu() {
    mobileMenu.hidden = false;
    mobileMenuBackdrop.hidden = false;
    requestAnimationFrame(() => {
      mobileMenu.classList.add('is-open');
      mobileMenuBackdrop.classList.add('is-open');
    });
    hamburger.setAttribute('aria-expanded', 'true');
    lockBodyScroll();
  }
  function closeMobileMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenuBackdrop.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      mobileMenu.hidden = true;
      mobileMenuBackdrop.hidden = true;
    }, 520);
    // panel açık değilse scroll lock'u kaldır
    if (panel.hidden) unlockBodyScroll();
  }
  hamburger.addEventListener('click', () => {
    if (hamburger.getAttribute('aria-expanded') === 'true') closeMobileMenu();
    else openMobileMenu();
  });
  mobileMenuClose.addEventListener('click', closeMobileMenu);
  mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
  $$('a', mobileMenu).forEach(a => a.addEventListener('click', closeMobileMenu));

  // --------- mobil menü: "Ürünler" akordeonu (kategoriler aşağı açılır) ----------
  // Akordeon başlıklarını bağla (Ürünler + Yasal Bilgiler)
  function wireAccordion(toggleSel, panelSel) {
    const t = $(toggleSel), p = $(panelSel);
    if (!t || !p) return;
    t.addEventListener('click', () => {
      const open = t.getAttribute('aria-expanded') === 'true';
      t.setAttribute('aria-expanded', open ? 'false' : 'true');
      p.classList.toggle('is-open', !open);
    });
  }
  wireAccordion('#mmProductsToggle', '#mmCats');
  wireAccordion('#mmLegalToggle', '#mmLegal');   // yasal sayfalar üst menüden de erişilebilir

  const mmCats = $('#mmCats');

  // Kategorileri mobil menüye doldur (üst seviye) — DB'den gelen catNodes ile
  function fillMobileCats() {
    if (!mmCats) return;
    const inner = document.createElement('div');
    inner.className = 'mm-sub-inner';

    const all = document.createElement('a');
    all.href = 'products.html';
    all.className = 'mm-all';
    all.textContent = 'Tüm Ürünler';
    inner.appendChild(all);

    catNodes.filter(c => !c.parentId).forEach((c) => {
      const a = document.createElement('a');
      a.href = 'products.html?cat=' + encodeURIComponent(c.slug);
      a.textContent = c.name;
      a.addEventListener('click', closeMobileMenu);
      inner.appendChild(a);
    });

    mmCats.innerHTML = '';
    mmCats.appendChild(inner);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!panel.hidden) closePanel();
    else if (!mobileMenu.hidden) closeMobileMenu();
  });

  qtyMinus.addEventListener('click', () => {
    if (!currentProduct) return;
    currentQty = Math.max(1, currentQty - 1);
    qtyValue.textContent = String(currentQty);
  });
  qtyPlus.addEventListener('click', () => {
    if (!currentProduct) return;
    const max = currentProduct.stock > 0 ? currentProduct.stock : 1;
    currentQty = Math.min(max, currentQty + 1);
    qtyValue.textContent = String(currentQty);
  });

  addToFav.addEventListener('click', async () => {
    if (!currentProduct) return;
    const session = window.NMAuth ? await window.NMAuth.getSession() : null;
    if (!session) {
      nmToast('Favorilere eklemek için giriş yap');
      if (typeof window.openAuthModal === 'function') window.openAuthModal('login');
      return;
    }
    const id = currentProduct.id;
    const wasFav = wishlistCache.has(id);
    // optimistic toggle
    if (wasFav) { wishlistCache.delete(id); addToFav.setAttribute('aria-pressed', 'false'); }
    else        { wishlistCache.add(id);    addToFav.setAttribute('aria-pressed', 'true'); }

    const { error } = wasFav
      ? await window.NMAccount.removeFromWishlist(id)
      : await window.NMAccount.addToWishlist(id);

    if (error) {
      // geri al
      if (wasFav) wishlistCache.add(id); else wishlistCache.delete(id);
      addToFav.setAttribute('aria-pressed', wishlistCache.has(id) ? 'true' : 'false');
      nmToast('İşlem başarısız');
      return;
    }
    nmToast(wasFav ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi');
  });

  // --------- sepet ----------
  // Sepet durumu cart-store.js'te (window.NMCart) — localStorage + DB sync.
  function cartCount() {
    return window.NMCart ? window.NMCart.count() : 0;
  }
  function updateCartBadge(bump = false) {
    if (window.NMCart) window.NMCart.updateBadges();
    else cartBadge.textContent = '0';
    const n = cartCount();
    cartBtn.classList.toggle('has-items', n > 0);
    if (bump) {
      cartBtn.classList.remove('bump');
      void cartBtn.offsetWidth; // reflow restart
      cartBtn.classList.add('bump');
    }
  }

  addToCart.addEventListener('click', () => {
    if (!currentProduct || addToCart.disabled) return;
    const id = currentProduct.id;
    if (window.NMCart) window.NMCart.add(id, currentQty, currentProduct.stock);

    // fly animasyonu için kaynak: panel-media
    flyToCart(panelMedia.getBoundingClientRect());

    updateCartBadge(true);

    // küçük tatmin: butonu kısa süre etiketle
    const oldLabel = addToCart.textContent;
    addToCart.textContent = 'Sepete Eklendi ✓';
    addToCart.disabled = true;
    setTimeout(() => {
      addToCart.textContent = oldLabel;
      addToCart.disabled = currentProduct.stock <= 0;
    }, 900);
  });

  function flyToCart(fromRect) {
    if (reduced) return;
    const toRect = cartBtn.getBoundingClientRect();

    const startW = Math.min(fromRect.width, 220);
    const startH = startW * (fromRect.height / fromRect.width || 0.75);
    const startX = fromRect.left + (fromRect.width - startW) / 2;
    const startY = fromRect.top  + (fromRect.height - startH) / 2;

    const endX = toRect.left + toRect.width / 2;
    const endY = toRect.top  + toRect.height / 2;

    const node = document.createElement('div');
    node.className = 'fly-item';
    node.style.width  = startW + 'px';
    node.style.height = startH + 'px';
    node.style.left   = startX + 'px';
    node.style.top    = startY + 'px';
    node.style.background = window.getComputedStyle(panelMedia).background;
    flyLayer.appendChild(node);

    requestAnimationFrame(() => {
      const dx = endX - (startX + startW / 2);
      const dy = endY - (startY + startH / 2);
      node.style.transform = `translate(${dx}px, ${dy}px) scale(0.08)`;
      node.style.opacity = '0';
    });

    setTimeout(() => node.remove(), 800);
  }

  cartBtn.addEventListener('click', () => {
    window.location.href = 'cart.html';
  });

  // --------- Lenis smooth scroll ----------
  let lenis = null;
  function lenisStart() {
    if (reduced) return;
    if (lenis || typeof window.Lenis === 'undefined') return;
    lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
      smoothWheel: true,
      smoothTouch: false,
    });
    const raf = (time) => {
      lenis && lenis.raf(time);
      lenis && (lenis._rafId = requestAnimationFrame(raf));
    };
    lenis._rafId = requestAnimationFrame(raf);
  }
  function lenisStop() {
    if (!lenis) return;
    if (lenis._rafId) cancelAnimationFrame(lenis._rafId);
    lenis.destroy();
    lenis = null;
  }

  // --------- toast (mini bildirim) ----------
  let toastEl = null;
  let toastTimer = null;
  function nmToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'nm-toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    // reflow → animasyon yeniden tetiklensin
    void toastEl.offsetWidth;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2400);
  }
  window.nmToast = nmToast;

  // --------- auth UI (header session state) ----------
  function renderAuthUI(session) {
    const state = session ? 'in' : 'out';
    authSlots.forEach(slot => {
      slot.dataset.state = state;
      $$('[data-when]', slot).forEach(el => {
        el.hidden = (el.dataset.when !== state);
      });
    });
  }

  function initAuthUI() {
    if (!window.NMAuth) {
      // Supabase yoksa misafir gibi göster (fallback)
      renderAuthUI(null);
      return;
    }

    // Modal aç (Giriş / Kayıt) — mobilde önce menüyü kapat
    $$('[data-tab]').forEach(btn => {
      // Sadece auth slot içindeki tab butonları (modal'ınkiler auth-modal.js'te)
      if (!btn.closest('.auth-slot, .mobile-menu-auth')) return;
      btn.addEventListener('click', () => {
        if (!mobileMenu.hidden) closeMobileMenu();
        if (typeof window.openAuthModal === 'function') window.openAuthModal(btn.dataset.tab);
      });
    });

    // Çıkış (desktop #logoutBtn + mobil [data-logout])
    $$('#logoutBtn, [data-logout]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!mobileMenu.hidden) closeMobileMenu();
        await window.NMAuth.signOut();
        nmToast('Çıkış yapıldı');
      });
    });

    // İlk render + reactive
    window.NMAuth.getSession().then(renderAuthUI).catch(() => renderAuthUI(null));
    window.NMAuth.onAuthStateChange((session) => {
      renderAuthUI(session);
      if (session) loadWishlistCache();
      else wishlistCache.clear();
    });
    loadWishlistCache();
  }

  // --------- boot ----------
  function init() {
    initAuthUI();
    updateCartBadge(); // localStorage'dan restore edilen sepet sayısı
    body.classList.toggle('is-grid', gridMode);
    loadCategoryData().then(() => { renderLevel(); fillMobileCats(); onScroll(); if (!gridMode) update(); });
    onScroll();

    backBtn.addEventListener('click', goBack);

    window.addEventListener('scroll', () => {
      onScroll();
    }, { passive: true });

    window.addEventListener('resize', () => {
      applyMode();
      updateRunway();
      // Mobil/desktop arası geçişte silindir rotation modunu güncelle
      const wasMobile = useRotOverride;
      useRotOverride = isMobile();
      if (wasMobile !== useRotOverride) {
        cylRotOverride = 0;
        needsUpdate = true;
      }
      if (!isMobile() && !mobileMenu.hidden) closeMobileMenu();
    });

    if (!gridMode) {
      lenisStart();
      startLoop();
    }

    // Pil/CPU tasarrufu: sürekli çalışan 3D güncelleme döngüsünü yalnız sekme görünür
    // VE 3D sahne ekrandayken çalıştır (arka planda/footer'da boşa dönmesin).
    let sceneInView = true;
    const syncLoop = () => {
      if (!gridMode && !document.hidden && sceneInView) startLoop();
      else stopLoop();
    };
    document.addEventListener('visibilitychange', syncLoop);
    const stackSection = document.querySelector('.stack-section');
    if (stackSection && 'IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        sceneInView = entries[0].isIntersecting;
        syncLoop();
      }, { rootMargin: '150px' }).observe(stackSection);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
