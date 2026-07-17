// ============================================================
// Supabase üzerinde okuma helper'ları — RLS public read policy'leri sağlıyor
// ============================================================
(function () {
  'use strict';

  const IMG_BUCKET = 'product-images';
  // storage_path tam URL ise (Trendyol hotlink) doğrudan kullan; değilse Storage public URL
  const toUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return window.sb ? window.sb.storage.from(IMG_BUCKET).getPublicUrl(path).data.publicUrl : null;
  };
  // product_images dizisini sıralı public URL listesine çevir (kapak ilk)
  function sortedImages(images) {
    if (!images || !images.length) return [];
    return images.slice().sort((a, b) => {
      if (!!b.is_primary - !!a.is_primary) return (!!b.is_primary) - (!!a.is_primary);
      return (a.display_order || 0) - (b.display_order || 0);
    });
  }
  function allImageUrls(images) {
    return sortedImages(images).map((i) => toUrl(i.storage_path)).filter(Boolean);
  }
  // kapak (veya ilk) görselin public URL'i
  function primaryImageUrl(images) {
    return allImageUrls(images)[0] || null;
  }

  // ---- Responsive görsel varyantları ----
  // Supabase image-transform (render/image) bu tenant'ta KAPALI. Onun yerine
  // generate-thumbnails.mjs Storage'a _360/_720/_1200.webp varyantları koyuyor.
  // Burada tam public URL'den varyant URL'i türetiyoruz (DB'de ek alan yok).
  const RESP_WIDTHS = [360, 720, 1200];
  // Kaynak görsel mi? product-images bucket'ında jpg/jpeg/png/webp — ama zaten _<N>.webp varyantı DEĞİL.
  const SRC_IMG_RE = /\/object\/public\/product-images\/.+\.(jpe?g|png|webp)(\?.*)?$/i;
  const IS_VARIANT_RE = /_\d+\.webp(\?.*)?$/i;
  const canVariant = (url) => !!url && SRC_IMG_RE.test(url) && !IS_VARIANT_RE.test(url);
  // Tek varyant URL'i (yalnız kendi Storage'ımızdaki kaynak görsel için; harici/legacy/zaten-varyant → değişmez)
  function thumb(url, w) {
    if (!canVariant(url)) return url;
    return url.replace(/\.(jpe?g|png|webp)(\?.*)?$/i, `_${w}.webp`);
  }
  // srcset: "url_360.webp 360w, url_720.webp 720w, url_1200.webp 1200w"
  function srcset(url, widths = RESP_WIDTHS) {
    if (!canVariant(url)) return '';
    return widths.map((w) => `${thumb(url, w)} ${w}w`).join(', ');
  }
  // Eksik varyant güvencesi: bir _<N>.webp yüklenemezse orijinale (data-full) düş.
  // CSP-uyumlu (inline onerror yok); img error olayları bubble etmez → capture:true.
  function installImgFallback() {
    if (window.__nmImgFb) return; window.__nmImgFb = true;
    document.addEventListener('error', (e) => {
      const img = e.target;
      if (!img || img.tagName !== 'IMG' || img.dataset.fb === '1') return;
      const full = img.getAttribute('data-full');
      if (!full) return;
      const cur = img.currentSrc || img.src || '';
      if (/_\d+\.webp(\?.*)?$/i.test(cur)) {
        img.dataset.fb = '1';
        img.removeAttribute('srcset');
        img.src = full;
      }
    }, true);
  }
  installImgFallback();

  const DEFAULT_SIZES = '(max-width: 768px) 45vw, 240px';
  // DOM'da oluşturulan bir <img>'e responsive varyantları uygular.
  // opts: { sizes, width, height, eager, onLoad, onFail }
  function applyResponsive(img, full, opts = {}) {
    if (!img || !full) return;
    if (opts.width) img.setAttribute('width', opts.width);
    if (opts.height) img.setAttribute('height', opts.height);
    if (opts.eager) { img.loading = 'eager'; img.fetchPriority = 'high'; }
    const ss = srcset(full);
    img.setAttribute('data-full', full);
    if (ss) {
      img.srcset = ss;
      img.sizes = opts.sizes || DEFAULT_SIZES;
      img.src = thumb(full, 360);
    } else {
      img.src = full; // harici/legacy → varyant yok
    }
    if (opts.onLoad) img.addEventListener('load', opts.onLoad, { once: true });
    if (opts.onFail) img.addEventListener('error', () => {
      // Yalnız orijinal de yüklenemezse başarısızlık say (varyant hatasını global fallback devralır)
      if (!/_\d+\.webp(\?.*)?$/i.test(img.currentSrc || img.src || '')) opts.onFail();
    });
  }

  // ---- İndirim / efektif fiyat ----
  // price          → müşterinin ödeyeceği fiyat (indirim varsa indirimli)
  // oldPrice       → indirim varsa üstü çizilecek normal fiyat, yoksa null
  // discountPercent→ rozet için yüzde (indirim yoksa 0)
  // Not: create_order da COALESCE(discount_price, price) kullanır → gösterilen = ödenen.
  function priceFields(p) {
    const base = parseFloat(p.price);
    const dp = (p.discount_price == null) ? null : parseFloat(p.discount_price);
    const on = dp != null && dp > 0 && dp < base;
    return {
      price: on ? dp : base,
      oldPrice: on ? base : null,
      discountPercent: on ? Math.round((1 - dp / base) * 100) : 0,
    };
  }

  async function getCategories() {
    if (!window.sb) return null;
    const { data, error } = await window.sb
      .from('categories')
      .select('id, slug, name, image_path, parent_id, display_order, products(count)')
      .order('display_order', { ascending: true });
    if (error) { console.error('[api] getCategories', error); return null; }
    // UI formatına normalize et (hiyerarşi için id + parentId + ürün sayısı)
    return data.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      image: c.image_path,
      parentId: c.parent_id || null,
      productCount: Array.isArray(c.products) && c.products[0] ? (c.products[0].count || 0) : 0,
    }));
  }

  async function getProductsByCategory(slug) {
    if (!window.sb) return null;
    const { data, error } = await window.sb
      .from('products')
      .select('id, slug, name, price, discount_price, stock, description, is_active, categories!inner(slug, name), product_images(storage_path, is_primary, display_order)')
      .eq('categories.slug', slug)
      .eq('is_active', true);
    if (error) { console.error('[api] getProductsByCategory', error); return null; }
    return data.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.categories?.slug || slug,
      ...priceFields(p),
      stock: p.stock,
      description: p.description,
      image: primaryImageUrl(p.product_images), // kapak (yoksa null → placeholder gradient)
      images: allImageUrls(p.product_images),    // tüm görseller (panel galerisi)
    }));
  }

  async function getProductsByIds(ids) {
    if (!window.sb || !ids || !ids.length) return [];
    const { data, error } = await window.sb
      .from('products')
      .select('id, slug, name, price, discount_price, stock, description, is_active, categories(slug, name), product_images(storage_path, is_primary, display_order)')
      .in('id', ids)
      .eq('is_active', true);
    if (error) { console.error('[api] getProductsByIds', error); return []; }
    return data.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.categories?.slug || null,
      categoryName: p.categories?.name || '',
      ...priceFields(p),
      stock: p.stock,
      description: p.description,
      image: primaryImageUrl(p.product_images),
      images: allImageUrls(p.product_images),
    }));
  }

  async function getAllProducts() {
    if (!window.sb) return null;
    const { data, error } = await window.sb
      .from('products')
      .select('id, slug, name, price, discount_price, stock, description, is_active, category_id, categories(slug, name), product_images(storage_path, is_primary, display_order)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) { console.error('[api] getAllProducts', error); return null; }
    return data.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.categories?.slug || null,
      categoryName: p.categories?.name || '',
      ...priceFields(p),
      stock: p.stock,
      description: p.description,
      image: primaryImageUrl(p.product_images),
      images: allImageUrls(p.product_images),
    }));
  }

  async function getProductById(id) {
    const arr = await getProductsByIds([id]);
    return arr[0] || null;
  }

  // Statik SEO sayfaları (urun-<slug>.html) ürünü slug ile çözer (inline script'e gerek yok → CSP uyumlu)
  async function getProductBySlug(slug) {
    if (!window.sb || !slug) return null;
    const { data, error } = await window.sb
      .from('products')
      .select('id, slug, name, price, discount_price, stock, description, is_active, categories(slug, name), product_images(storage_path, is_primary, display_order)')
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();
    if (error) { console.error('[api] getProductBySlug', error); return null; }
    if (!data) return null;
    const p = data;
    return {
      id: p.id, slug: p.slug, name: p.name,
      category: p.categories?.slug || null,
      categoryName: p.categories?.name || '',
      ...priceFields(p), stock: p.stock, description: p.description,
      image: primaryImageUrl(p.product_images),
      images: allImageUrls(p.product_images),
    };
  }

  // Admin'in seçtiği önerilen ürünler; yoksa aynı kategoriden doldur
  async function getRecommended(productId, categorySlug) {
    if (!window.sb) return [];
    let ids = [];
    try {
      const { data } = await window.sb.from('product_recommendations')
        .select('recommended_id, sort_order')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true });
      ids = (data || []).map(r => r.recommended_id);
    } catch (e) { console.error('[api] getRecommended', e); }

    let items = ids.length ? await getProductsByIds(ids) : [];
    if (ids.length) {
      const order = new Map(ids.map((id, i) => [id, i]));
      items.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
    }
    if (!items.length && categorySlug) {
      const cat = await getProductsByCategory(categorySlug);
      items = (cat || []).filter(p => p.id !== productId).slice(0, 4);
    }
    return items;
  }

  // İndirimli aktif ürünü olan kategori slug'ları (kategori kartına rozet koymak için)
  async function getDiscountedCategorySlugs() {
    if (!window.sb) return new Set();
    const { data, error } = await window.sb
      .from('products')
      .select('categories(slug)')
      .eq('is_active', true)
      .not('discount_price', 'is', null);
    if (error) { console.error('[api] getDiscountedCategorySlugs', error); return new Set(); }
    return new Set((data || []).map((r) => r.categories?.slug).filter(Boolean));
  }

  window.NMApi = {
    getCategories, getProductsByCategory, getProductsByIds, getProductById,
    getProductBySlug, getRecommended, getAllProducts, getDiscountedCategorySlugs,
    thumb, srcset, applyResponsive, RESP_WIDTHS,
  };
})();
