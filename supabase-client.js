// ============================================================
// Supabase bağlantısı (anon key — RLS politikaları koruyor)
// ============================================================
const SUPABASE_URL      = 'https://kwjtfqhhctqwrfhxghai.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3anRmcWhoY3Rxd3JmaHhnaGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNDcxOTEsImV4cCI6MjA5NDcyMzE5MX0.B4gLXDpFgUTmyJxvF8PipPyKWPr8tFYsxxYMjM2O7K8';

if (window.supabase && typeof window.supabase.createClient === 'function') {
  window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  console.info('[supabase] client ready →', SUPABASE_URL);
  // Edge Function çağrıları için (checkout → paytr-token)
  window.NM_SUPA = { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
} else {
  console.error('[supabase] SDK yüklenmedi. index.html\'de CDN script sırası yanlış olabilir.');
}

// ============================================================
// NMAuth — auth helper'ları (PR-A)
// ============================================================
(function () {
  if (!window.sb) {
    window.NMAuth = null;
    return;
  }

  const REDIRECT_VERIFIED = location.origin + '/?auth=verified';
  const REDIRECT_RECOVER  = location.origin + '/?auth=recover';

  function translateAuthError(err) {
    if (!err) return '';
    let msg = '';
    if (typeof err === 'string') msg = err;
    else msg = String(err.message || err.msg || err.error_description || err.error || '').trim();
    // Hâlâ boşsa nesneyi stringle — ama boş '{}' asla gösterme
    if (!msg) { try { const s = JSON.stringify(err); msg = (s && s !== '{}') ? s : ''; } catch { msg = ''; } }
    const map = {
      'Invalid login credentials':              'E-posta veya şifre hatalı.',
      'Email not confirmed':                    'E-postanı doğrulamadın. Gelen kutunu kontrol et.',
      'User already registered':                'Bu e-posta zaten kayıtlı. Giriş yapmayı dene.',
      'Password should be at least 6 characters.': 'Şifre en az 6 karakter olmalı.',
      'New password should be different from the old password.': 'Yeni şifre eskisinden farklı olmalı.',
      'Email rate limit exceeded':              'Çok fazla istek. Birkaç dakika sonra tekrar dene.',
      'Signup requires a valid password':       'Geçerli bir şifre gir.',
      'Unable to validate email address: invalid format': 'Geçersiz e-posta formatı.',
    };
    if (map[msg]) return map[msg];
    if (/error sending .*email/i.test(msg) || /sending email/i.test(msg)) {
      return 'Doğrulama e-postası şu an gönderilemedi. Lütfen birkaç dakika sonra tekrar dene.';
    }
    if (/only request this once every (\d+) seconds/i.test(msg)) {
      const s = msg.match(/(\d+) seconds/)[1];
      return `Çok sık istek gönderdin. ${s} saniye sonra tekrar dene.`;
    }
    return msg || 'Bir hata oluştu. Lütfen tekrar dene.';
  }

  async function signUp({ email, password, fullName }) {
    return window.sb.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || null },
        emailRedirectTo: REDIRECT_VERIFIED,
      },
    });
  }

  async function signIn({ email, password }) {
    return window.sb.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    return window.sb.auth.signOut();
  }

  async function getSession() {
    const { data } = await window.sb.auth.getSession();
    return data.session;
  }

  async function getUser() {
    const { data } = await window.sb.auth.getUser();
    return data.user;
  }

  async function resendConfirmation(email) {
    return window.sb.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: REDIRECT_VERIFIED },
    });
  }

  async function resetPassword(email) {
    return window.sb.auth.resetPasswordForEmail(email, {
      redirectTo: REDIRECT_RECOVER,
    });
  }

  async function updatePassword(newPassword) {
    return window.sb.auth.updateUser({ password: newPassword });
  }

  function onAuthStateChange(cb) {
    return window.sb.auth.onAuthStateChange((event, session) => {
      try { cb(session, event); } catch (e) { console.error('[NMAuth] cb err', e); }
    });
  }

  window.NMAuth = {
    signUp,
    signIn,
    signOut,
    getSession,
    getUser,
    resendConfirmation,
    resetPassword,
    updatePassword,
    onAuthStateChange,
    translateAuthError,
  };
})();

// ============================================================
// NMAccount — profil + adres (PR-C), sipariş + favori (PR-D)
// Tüm tablolar RLS ile korunuyor → auth.uid() = kendi verisi
// ============================================================
(function () {
  if (!window.sb) {
    window.NMAccount = null;
    return;
  }

  async function currentUserId() {
    const { data } = await window.sb.auth.getUser();
    return data.user ? data.user.id : null;
  }

  // ---- profil ----
  async function getProfile() {
    const uid = await currentUserId();
    if (!uid) return { data: null, error: { message: 'Oturum bulunamadı.' } };
    const { data, error } = await window.sb
      .from('profiles')
      .select('id, full_name, phone, role, created_at')
      .eq('id', uid)
      .single();
    return { data, error };
  }

  async function updateProfile({ full_name, phone }) {
    const uid = await currentUserId();
    if (!uid) return { data: null, error: { message: 'Oturum bulunamadı.' } };
    const { data, error } = await window.sb
      .from('profiles')
      .update({ full_name, phone })
      .eq('id', uid)
      .select()
      .single();
    return { data, error };
  }

  // ---- adresler ----
  async function listAddresses() {
    const { data, error } = await window.sb
      .from('addresses')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async function addAddress(payload) {
    const uid = await currentUserId();
    if (!uid) return { data: null, error: { message: 'Oturum bulunamadı.' } };
    if (payload.is_default) {
      await window.sb.from('addresses').update({ is_default: false }).eq('user_id', uid);
    }
    const { data, error } = await window.sb
      .from('addresses')
      .insert({ ...payload, user_id: uid })
      .select()
      .single();
    return { data, error };
  }

  async function updateAddress(id, patch) {
    const uid = await currentUserId();
    if (!uid) return { data: null, error: { message: 'Oturum bulunamadı.' } };
    if (patch.is_default) {
      await window.sb.from('addresses').update({ is_default: false }).eq('user_id', uid);
    }
    const { data, error } = await window.sb
      .from('addresses')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  async function deleteAddress(id) {
    const { error } = await window.sb.from('addresses').delete().eq('id', id);
    return { error };
  }

  async function setDefaultAddress(id) {
    const uid = await currentUserId();
    if (!uid) return { error: { message: 'Oturum bulunamadı.' } };
    await window.sb.from('addresses').update({ is_default: false }).eq('user_id', uid);
    const { error } = await window.sb.from('addresses').update({ is_default: true }).eq('id', id);
    return { error };
  }

  // ---- siparişler ----
  async function listOrders() {
    const { data, error } = await window.sb
      .from('orders')
      .select('id, order_number, status, total_amount, created_at')
      .order('created_at', { ascending: false });
    return { data, error };
  }

  async function getOrder(id) {
    const [order, items, history] = await Promise.all([
      window.sb.from('orders').select('*').eq('id', id).single(),
      window.sb.from('order_items').select('*').eq('order_id', id),
      window.sb.from('order_status_history').select('*').eq('order_id', id).order('changed_at', { ascending: true }),
    ]);
    return {
      order: order.data,
      items: items.data || [],
      history: history.data || [],
      error: order.error || items.error || history.error || null,
    };
  }

  // ---- favoriler (wishlist) ----
  async function listWishlist() {
    const { data, error } = await window.sb
      .from('wishlist')
      .select('product_id, added_at, products(id, slug, name, price, stock, product_images(storage_path, is_primary, display_order))')
      .order('added_at', { ascending: false });
    return { data, error };
  }

  async function addToWishlist(productId) {
    const uid = await currentUserId();
    if (!uid) return { error: { message: 'Oturum bulunamadı.' } };
    const { error } = await window.sb
      .from('wishlist')
      .upsert({ user_id: uid, product_id: productId }, { onConflict: 'user_id,product_id', ignoreDuplicates: true });
    return { error };
  }

  async function removeFromWishlist(productId) {
    const uid = await currentUserId();
    if (!uid) return { error: { message: 'Oturum bulunamadı.' } };
    const { error } = await window.sb
      .from('wishlist')
      .delete()
      .eq('user_id', uid)
      .eq('product_id', productId);
    return { error };
  }

  window.NMAccount = {
    getProfile,
    updateProfile,
    listAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    listOrders,
    getOrder,
    listWishlist,
    addToWishlist,
    removeFromWishlist,
  };
})();

// ============================================================
// NMAdmin — admin paneli veri katmanı (AŞAMA 3)
// Yetki RLS'te: is_admin(). Admin değilse sorgular boş/red döner.
// ============================================================
(function () {
  if (!window.sb) { window.NMAdmin = null; return; }

  const LOW_STOCK = 5;
  const BUCKET = 'product-images';

  // ---- dashboard ----
  async function countOrders(status) {
    let q = window.sb.from('orders').select('*', { count: 'exact', head: true });
    if (status) q = q.eq('status', status);
    const { count } = await q;
    return count || 0;
  }
  async function countProducts() {
    const { count } = await window.sb.from('products').select('*', { count: 'exact', head: true });
    return count || 0;
  }
  async function countLowStock() {
    const { count } = await window.sb.from('products').select('*', { count: 'exact', head: true }).lte('stock', LOW_STOCK);
    return count || 0;
  }
  async function getStats() {
    const [total, pending, preparing, shipped, productsTotal, lowStock] = await Promise.all([
      countOrders(), countOrders('pending'), countOrders('preparing'), countOrders('shipped'),
      countProducts(), countLowStock(),
    ]);
    return { total, pending, preparing, shipped, productsTotal, lowStock, lowStockThreshold: LOW_STOCK };
  }

  // ---- satış istatistikleri (takvim bazlı: bugün / bu hafta / bu ay) ----
  // Yalnız 'delivered' siparişler sayılır; tarih sipariş tarihine (created_at) göre.
  async function getSalesStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayIdx = (now.getDay() + 6) % 7;            // Pazartesi = 0
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - dayIdx);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const earliest = new Date(Math.min(startOfToday.getTime(), startOfWeek.getTime(), startOfMonth.getTime()));

    const { data, error } = await window.sb
      .from('orders')
      .select('total_amount, created_at')
      .eq('status', 'delivered')
      .gte('created_at', earliest.toISOString());
    if (error) { console.error('[admin] getSalesStats', error); return { error }; }

    const agg = (since) => {
      let count = 0, revenue = 0;
      (data || []).forEach((o) => {
        if (new Date(o.created_at) >= since) { count++; revenue += Number(o.total_amount) || 0; }
      });
      return { count, revenue };
    };
    return {
      today: agg(startOfToday),
      week:  agg(startOfWeek),
      month: agg(startOfMonth),
    };
  }

  // ---- siparişler ----
  async function listOrders(status) {
    let q = window.sb.from('orders')
      .select('id, order_number, status, total_amount, created_at, guest_email, shipping_address, needs_attention')
      .order('created_at', { ascending: false });
    if (status && status !== 'all') q = q.eq('status', status);
    const { data, error } = await q;
    return { data, error };
  }
  async function getOrder(id) {
    const [order, items, history] = await Promise.all([
      window.sb.from('orders').select('*').eq('id', id).single(),
      window.sb.from('order_items').select('*').eq('order_id', id),
      window.sb.from('order_status_history').select('*').eq('order_id', id).order('changed_at', { ascending: true }),
    ]);
    return { order: order.data, items: items.data || [], history: history.data || [], error: order.error || null };
  }
  async function updateOrderStatus(id, status) {
    const { error } = await window.sb.from('orders').update({ status }).eq('id', id);
    return { error };
  }
  async function setTracking(id, tracking_code, cargo_company) {
    const { error } = await window.sb.from('orders').update({ tracking_code, cargo_company }).eq('id', id);
    return { error };
  }
  async function cancelOrder(id, reason) {
    const { error } = await window.sb.from('orders')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancelled_reason: reason || null })
      .eq('id', id);
    return { error };
  }
  async function deleteOrder(id) {
    // Hard delete — order_items / order_status_history ON DELETE CASCADE ile temizlenir.
    // RLS: orders_admin_all (FOR ALL) admin silmeye izin verir. Ödenmiş sipariş kaydı KALICI silinir.
    const { error } = await window.sb.from('orders').delete().eq('id', id);
    return { error };
  }

  // ---- ürünler ----
  async function listProducts() {
    const { data, error } = await window.sb.from('products')
      .select('id, slug, name, price, discount_price, stock, description, is_active, category_id, categories(slug, name), product_images(storage_path, is_primary, display_order)')
      .order('created_at', { ascending: false });
    return { data, error };
  }
  async function createProduct(p) {
    const { data, error } = await window.sb.from('products').insert(p).select().single();
    return { data, error };
  }
  async function updateProduct(id, patch) {
    const { data, error } = await window.sb.from('products').update(patch).eq('id', id).select().single();
    return { data, error };
  }
  async function setStock(id, stock) {
    const { error } = await window.sb.from('products').update({ stock }).eq('id', id);
    return { error };
  }
  async function toggleActive(id, isActive) {
    const { error } = await window.sb.from('products').update({ is_active: isActive }).eq('id', id);
    return { error };
  }
  async function deleteProduct(id) {
    // order_items FK (RESTRICT) → siparişte kullanılan ürün silinemez; UI pasife al önerir
    const { error } = await window.sb.from('products').delete().eq('id', id);
    return { error };
  }

  // ---- ürün görselleri (Storage) ----
  function publicUrl(path) {
    // tam URL ise (Trendyol hotlink) doğrudan döndür; değilse Storage public URL
    if (path && /^https?:\/\//i.test(path)) return path;
    return window.sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }
  async function listProductImages(productId) {
    const { data, error } = await window.sb.from('product_images')
      .select('id, storage_path, is_primary, display_order')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });
    return { data: (data || []).map(i => ({ ...i, url: publicUrl(i.storage_path) })), error };
  }
  async function uploadProductImage(productId, file, makePrimary) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    // Çoklu yüklemede aynı milisaniyede çakışmasın diye rastgele son ek
    const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const up = await window.sb.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type });
    if (up.error) return { error: up.error };
    // Sıradaki display_order'ı hesapla (önceden hep 0 kalıyordu → sıra rastgeleydi)
    const { data: existing } = await window.sb.from('product_images')
      .select('display_order').eq('product_id', productId);
    const count = (existing || []).length;
    const nextOrder = count ? Math.max(...existing.map(i => i.display_order || 0)) + 1 : 0;
    // ilk görselse primary yap
    if (makePrimary === undefined) makePrimary = count === 0;
    if (makePrimary) {
      await window.sb.from('product_images').update({ is_primary: false }).eq('product_id', productId);
    }
    const { data, error } = await window.sb.from('product_images')
      .insert({ product_id: productId, storage_path: path, is_primary: !!makePrimary, display_order: nextOrder })
      .select().single();
    return { data: data ? { ...data, url: publicUrl(data.storage_path) } : null, error };
  }

  // Görsel sırasını kaydet: orderedIds = yeni sıra. İlk görsel kapak (is_primary) olur.
  async function setImagesOrder(productId, orderedIds) {
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await window.sb.from('product_images')
        .update({ display_order: i, is_primary: i === 0 })
        .eq('id', orderedIds[i])
        .eq('product_id', productId);
      if (error) return { error };
    }
    return { error: null };
  }
  async function deleteProductImage(imgId, storagePath) {
    await window.sb.storage.from(BUCKET).remove([storagePath]);
    const { error } = await window.sb.from('product_images').delete().eq('id', imgId);
    return { error };
  }
  async function setPrimaryImage(productId, imgId) {
    await window.sb.from('product_images').update({ is_primary: false }).eq('product_id', productId);
    const { error } = await window.sb.from('product_images').update({ is_primary: true }).eq('id', imgId);
    return { error };
  }

  // ---- kategoriler ----
  async function listCategories() {
    const { data, error } = await window.sb.from('categories')
      .select('id, slug, name, image_path, parent_id, display_order')
      .order('display_order', { ascending: true });
    return { data, error };
  }
  async function categoryChildCount(categoryId) {
    const { count } = await window.sb.from('categories').select('*', { count: 'exact', head: true }).eq('parent_id', categoryId);
    return count || 0;
  }
  async function createCategory(c) {
    const { data, error } = await window.sb.from('categories').insert(c).select().single();
    return { data, error };
  }
  async function uploadCategoryImage(categoryId, file) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `categories/${categoryId}/${Date.now()}.${ext}`;
    const up = await window.sb.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type });
    if (up.error) return { error: up.error };
    const url = window.sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    const { error } = await window.sb.from('categories').update({ image_path: url }).eq('id', categoryId);
    return { data: { url }, error };
  }
  async function clearCategoryImage(categoryId) {
    const { error } = await window.sb.from('categories').update({ image_path: null }).eq('id', categoryId);
    return { error };
  }
  async function updateCategory(id, patch) {
    const { data, error } = await window.sb.from('categories').update(patch).eq('id', id).select().single();
    return { data, error };
  }
  async function categoryProductCount(categoryId) {
    const { count } = await window.sb.from('products').select('*', { count: 'exact', head: true }).eq('category_id', categoryId);
    return count || 0;
  }
  async function deleteCategory(id) {
    const kids = await categoryChildCount(id);
    if (kids > 0) return { error: { message: `Bu kategorinin ${kids} alt kategorisi var, önce onları sil/taşı.` } };
    const n = await categoryProductCount(id);
    if (n > 0) return { error: { message: `Bu kategoride ${n} ürün var, önce onları taşı/sil.` } };
    const { error } = await window.sb.from('categories').delete().eq('id', id);
    return { error };
  }

  // ---- benzer ürün önerileri ----
  async function getRecommendations(productId) {
    const { data, error } = await window.sb.from('product_recommendations')
      .select('recommended_id, sort_order')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });
    return { data: (data || []).map(r => r.recommended_id), error };
  }
  async function setRecommendations(productId, ids) {
    await window.sb.from('product_recommendations').delete().eq('product_id', productId);
    const clean = (ids || []).filter(id => id && id !== productId);
    if (!clean.length) return { error: null };
    const rows = clean.map((id, i) => ({ product_id: productId, recommended_id: id, sort_order: i }));
    const { error } = await window.sb.from('product_recommendations').insert(rows);
    return { error };
  }

  // ---- İndirimler (RPC'ler is_admin() ile korunur) ----
  // p_ids null/boş → TÜM aktif ürünler
  async function applyDiscountPercent(percent, ids) {
    return window.sb.rpc('apply_discount_percent', {
      p_percent: Number(percent),
      p_ids: (ids && ids.length) ? ids : null,
    });
  }
  async function applyDiscountAmount(amount, ids) {
    return window.sb.rpc('apply_discount_amount', {
      p_amount: Number(amount),
      p_ids: (ids && ids.length) ? ids : null,
    });
  }
  async function clearDiscount(ids) {
    return window.sb.rpc('clear_discount', { p_ids: (ids && ids.length) ? ids : null });
  }
  // Görünmez fiyat değişimi (zam/indirim): price'ı doğrudan değiştirir, indirim rozeti çıkmaz.
  // signed değer: +zam / -indirim. İndirimli üründe discount_price aynı oranda ölçeklenir.
  async function adjustPricePercent(percent, ids) {
    return window.sb.rpc('adjust_price_percent', {
      p_percent: Number(percent),
      p_ids: (ids && ids.length) ? ids : null,
    });
  }
  async function adjustPriceAmount(amount, ids) {
    return window.sb.rpc('adjust_price_amount', {
      p_amount: Number(amount),
      p_ids: (ids && ids.length) ? ids : null,
    });
  }

  window.NMAdmin = {
    applyDiscountPercent, applyDiscountAmount, clearDiscount,
    adjustPricePercent, adjustPriceAmount,
    getStats, getSalesStats,
    listOrders, getOrder, updateOrderStatus, setTracking, cancelOrder, deleteOrder,
    listProducts, createProduct, updateProduct, setStock, toggleActive, deleteProduct,
    listProductImages, uploadProductImage, deleteProductImage, setPrimaryImage, setImagesOrder, publicUrl,
    listCategories, createCategory, updateCategory, deleteCategory, categoryProductCount, categoryChildCount,
    uploadCategoryImage, clearCategoryImage,
    getRecommendations, setRecommendations,
  };
})();

// ============================================================
// NMReviews — ürün yorumları (puan + metin)
// Yazma izni RLS'te: sadece o ürünü 'delivered' siparişle alan üye.
// ============================================================
(function () {
  if (!window.sb) { window.NMReviews = null; return; }

  async function uidOf() {
    const { data } = await window.sb.auth.getUser();
    return data.user ? data.user.id : null;
  }

  async function listReviews(productId) {
    const { data, error } = await window.sb.from('reviews')
      .select('id, user_id, author_name, rating, comment, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  }

  async function canReview(productId) {
    const uid = await uidOf();
    if (!uid) return false;
    const { data } = await window.sb.from('order_items')
      .select('id, orders!inner(status, user_id)')
      .eq('product_id', productId)
      .eq('orders.status', 'delivered')
      .eq('orders.user_id', uid)
      .limit(1);
    return !!(data && data.length);
  }

  async function getMyReview(productId) {
    const uid = await uidOf();
    if (!uid) return null;
    const { data } = await window.sb.from('reviews')
      .select('*').eq('product_id', productId).eq('user_id', uid).maybeSingle();
    return data || null;
  }

  async function addReview(productId, rating, comment, authorName) {
    const uid = await uidOf();
    if (!uid) return { error: { message: 'Giriş gerekli.' } };
    const { error } = await window.sb.from('reviews')
      .upsert({ product_id: productId, user_id: uid, rating, comment, author_name: authorName },
              { onConflict: 'product_id,user_id' });
    return { error };
  }

  async function deleteReview(productId) {
    const uid = await uidOf();
    if (!uid) return { error: { message: 'Giriş gerekli.' } };
    const { error } = await window.sb.from('reviews').delete().eq('product_id', productId).eq('user_id', uid);
    return { error };
  }

  window.NMReviews = { listReviews, canReview, getMyReview, addReview, deleteReview };
})();
