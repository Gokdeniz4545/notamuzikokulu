-- ============================================================
-- Nota Müzik Market — 0002 admin (AŞAMA 3)
-- profiles.role + is_admin() + admin RLS + product-images Storage
-- Idempotent: tekrar çalıştırılabilir.
-- ============================================================

-- 1) Rol kolonu
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';

-- 2) is_admin() — SECURITY DEFINER (profiles RLS'i bypass eder → recursion yok)
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- 3) Admin RLS politikaları (mevcut self-access politikalarıyla OR'lanır)
-- ============================================================

-- profiles: admin tüm profilleri okur
DROP POLICY IF EXISTS "profiles_admin_read" ON profiles;
CREATE POLICY "profiles_admin_read" ON profiles
  FOR SELECT USING (is_admin());

-- orders: admin tüm siparişleri okur + günceller (statü/kargo)
DROP POLICY IF EXISTS "orders_admin_all" ON orders;
CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- order_items: admin okur
DROP POLICY IF EXISTS "order_items_admin_read" ON order_items;
CREATE POLICY "order_items_admin_read" ON order_items
  FOR SELECT USING (is_admin());

-- order_status_history: admin okur + manuel not ekleyebilir
DROP POLICY IF EXISTS "order_status_history_admin_read" ON order_status_history;
CREATE POLICY "order_status_history_admin_read" ON order_status_history
  FOR SELECT USING (is_admin());
DROP POLICY IF EXISTS "order_status_history_admin_insert" ON order_status_history;
CREATE POLICY "order_status_history_admin_insert" ON order_status_history
  FOR INSERT WITH CHECK (is_admin());

-- products: admin tam CRUD (pasif ürünleri de görür)
DROP POLICY IF EXISTS "products_admin_all" ON products;
CREATE POLICY "products_admin_all" ON products
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- categories: admin tam CRUD
DROP POLICY IF EXISTS "categories_admin_all" ON categories;
CREATE POLICY "categories_admin_all" ON categories
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- product_images: admin tam CRUD
DROP POLICY IF EXISTS "product_images_admin_all" ON product_images;
CREATE POLICY "product_images_admin_all" ON product_images
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- 4) Storage — product-images bucket (public read, admin write)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "product_images_storage_public_read" ON storage.objects;
CREATE POLICY "product_images_storage_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product_images_storage_admin_insert" ON storage.objects;
CREATE POLICY "product_images_storage_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "product_images_storage_admin_update" ON storage.objects;
CREATE POLICY "product_images_storage_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "product_images_storage_admin_delete" ON storage.objects;
CREATE POLICY "product_images_storage_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND is_admin());

-- ============================================================
-- 5) KENDİ HESABINI ADMIN YAP (email'ini yaz, ayrıca çalıştır)
-- ============================================================
-- UPDATE profiles SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'BURAYA_EMAILIN');
