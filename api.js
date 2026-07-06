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
      .select('id, slug, name, price, stock, description, is_active, categories!inner(slug, name), product_images(storage_path, is_primary, display_order)')
      .eq('categories.slug', slug)
      .eq('is_active', true);
    if (error) { console.error('[api] getProductsByCategory', error); return null; }
    return data.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.categories?.slug || slug,
      price: parseFloat(p.price),
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
      .select('id, slug, name, price, stock, description, is_active, categories(slug, name), product_images(storage_path, is_primary, display_order)')
      .in('id', ids)
      .eq('is_active', true);
    if (error) { console.error('[api] getProductsByIds', error); return []; }
    return data.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.categories?.slug || null,
      categoryName: p.categories?.name || '',
      price: parseFloat(p.price),
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
      .select('id, slug, name, price, stock, description, is_active, category_id, categories(slug, name), product_images(storage_path, is_primary, display_order)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) { console.error('[api] getAllProducts', error); return null; }
    return data.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.categories?.slug || null,
      categoryName: p.categories?.name || '',
      price: parseFloat(p.price),
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

  window.NMApi = { getCategories, getProductsByCategory, getProductsByIds, getProductById, getRecommended, getAllProducts };
})();
