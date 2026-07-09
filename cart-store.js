// ============================================================
// cart-store.js — paylaşılan sepet durumu (tüm sayfalarda)
// Misafir: localStorage. Üye: cart_items DB + localStorage ayna.
// Login'de local ↔ DB merge (miktarlar toplanır).
// İhtiyaç: window.sb, window.NMAuth (supabase-client.js)
// ============================================================
(function () {
  'use strict';

  const CART_KEY  = 'nm:cart:v1';
  const OWNER_KEY = 'nm:cart:owner'; // sepetin ait olduğu kullanıcı uid'i (varsa)
  let items = load();        // Map: productId -> qty
  let synced = false;        // bu oturumda DB merge yapıldı mı
  const listeners = new Set();

  function load() {
    try {
      const arr = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      if (!Array.isArray(arr)) return new Map();
      // Bozuk/geçersiz girdileri süz (id string + qty pozitif sonlu sayı)
      return new Map(arr.filter((e) =>
        Array.isArray(e) && typeof e[0] === 'string' && Number.isFinite(e[1]) && e[1] > 0));
    } catch { return new Map(); }
  }
  function persist() {
    try { localStorage.setItem(CART_KEY, JSON.stringify([...items.entries()])); }
    catch { /* Safari private / quota → yut */ }
  }
  function getOwner() { try { return localStorage.getItem(OWNER_KEY); } catch { return null; } }
  function setOwner(uid) { try { uid ? localStorage.setItem(OWNER_KEY, uid) : localStorage.removeItem(OWNER_KEY); } catch {} }
  function clearLocal() { items.clear(); persist(); emit(); }

  function count() { let n = 0; for (const q of items.values()) n += q; return n; }
  function entries() { return [...items.entries()]; }   // [[id, qty], ...]
  function getQty(id) { return items.get(id) || 0; }
  function isEmpty() { return items.size === 0; }

  async function uidOf() {
    if (!window.sb) return null;
    const { data } = await window.sb.auth.getUser();
    return data.user ? data.user.id : null;
  }

  // ---- mutasyonlar (optimistic: local önce, DB arkadan) ----
  // max verilirse (ör. stok) tavan uygulanır. Dönüş: true = tam eklendi, false = stok tavanına takıldı.
  async function add(id, qty = 1, max) {
    const cur = items.get(id) || 0;
    const want = cur + qty;
    const next = (typeof max === 'number' && max >= 0) ? Math.min(want, max) : want;
    if (next !== cur) {
      items.set(id, next);
      persist(); emit();
      const uid = await uidOf();
      if (uid) await dbUpsert(uid, id, next);
    }
    return next >= want;
  }
  async function setQty(id, qty, max) {
    qty = Math.floor(Number(qty));
    if (!Number.isFinite(qty) || qty <= 0) return remove(id);
    if (typeof max === 'number' && max >= 0) qty = Math.min(qty, max);
    items.set(id, qty);
    persist(); emit();
    const uid = await uidOf();
    if (uid) await dbUpsert(uid, id, qty);
  }
  async function remove(id) {
    items.delete(id);
    persist(); emit();
    const uid = await uidOf();
    if (uid) await dbDelete(uid, id);
  }
  async function clear() {
    items.clear();
    persist(); emit();
    const uid = await uidOf();
    if (uid) await dbClear(uid);
  }

  // ---- DB yardımcıları ----
  async function dbUpsert(uid, id, qty) {
    try { await window.sb.from('cart_items').upsert({ user_id: uid, product_id: id, quantity: qty }, { onConflict: 'user_id,product_id' }); }
    catch (e) { console.error('[cart] upsert', e); }
  }
  async function dbDelete(uid, id) {
    try { await window.sb.from('cart_items').delete().eq('user_id', uid).eq('product_id', id); }
    catch (e) { console.error('[cart] delete', e); }
  }
  async function dbClear(uid) {
    try { await window.sb.from('cart_items').delete().eq('user_id', uid); }
    catch (e) { console.error('[cart] clear', e); }
  }

  async function readDbCart(uid) {
    try {
      const { data } = await window.sb.from('cart_items').select('product_id, quantity').eq('user_id', uid);
      return new Map((data || []).map(r => [r.product_id, r.quantity]));
    } catch (e) { console.error('[cart] sync read', e); return new Map(); }
  }

  // ---- login senkronu ----
  // - owner yok (misafir sepeti): local + DB BİR KEZ birleştirilir (toplama), owner kondu
  // - owner var (aynı ya da farklı kullanıcı): DB kaynak alınır, TOPLAMA YOK (katlanmayı önler)
  async function syncOnLogin() {
    const uid = await uidOf();
    if (!uid) return;
    const owner = getOwner();
    const dbMap = await readDbCart(uid);

    if (!owner) {
      // misafir → üye: yerel sepeti DB'ye bir kez ekle
      const hadLocal = items.size > 0;
      for (const [id, qty] of items) dbMap.set(id, (dbMap.get(id) || 0) + qty);
      items = dbMap;
      persist(); setOwner(uid); emit(); synced = true;
      if (hadLocal) for (const [id, qty] of items) await dbUpsert(uid, id, qty);
    } else {
      // sepet zaten bir kullanıcıya ait → DB'yi olduğu gibi yükle (merge yok)
      items = dbMap;
      persist(); setOwner(uid); emit(); synced = true;
    }
  }

  // ---- abonelik + badge ----
  function emit() {
    updateBadges();
    listeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
  }
  function updateBadges() {
    const n = count();
    document.querySelectorAll('#cartBadge, [data-cart-badge]').forEach(b => {
      b.textContent = String(n);
      const btn = b.closest('.cart-btn');
      if (btn) btn.classList.toggle('has-items', n > 0);
    });
  }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  // ---- auth reaktif ----
  // owner etiketi sayesinde hangi sayfada olursak olalım (account.html dahil)
  // tutarlı davranır: oturum yok + sepet bir kullanıcıya aitse → temizlenir.
  if (window.NMAuth) {
    window.NMAuth.onAuthStateChange((session, event) => {
      const uid = session && session.user ? session.user.id : null;
      const owner = getOwner();

      if (uid) {
        // syncOnLogin owner durumuna göre doğru davranır (misafir→merge, aksi→DB yükle)
        if (!synced) syncOnLogin();
      } else {
        // Oturum yok. Sepet daha önce bir kullanıcıya aitse → çıkış olmuş, temizle.
        // (DB'deki kullanıcı sepeti korunur; tekrar girişte syncOnLogin geri yükler.)
        synced = false;
        if (owner) { setOwner(null); clearLocal(); }
        // owner yoksa = saf misafir sepeti → dokunma (localStorage'da kalır)
      }
    });
  }

  // ---- sekmeler arası senkron ----
  // Başka bir sekme sepeti değiştirince (localStorage 'storage' olayı) bu sekmede de yansıt.
  window.addEventListener('storage', (e) => {
    if (e.key === CART_KEY || (e.key === OWNER_KEY && e.newValue === null)) {
      items = load(); emit();
    }
  });

  window.NMCart = { entries, getQty, count, isEmpty, add, setQty, remove, clear, subscribe, updateBadges, syncOnLogin };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateBadges, { once: true });
  } else {
    updateBadges();
  }
})();
