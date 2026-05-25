-- ============================================================
-- Nota Müzik Market — initial schema (AŞAMA 2A)
-- 8 tablo + RLS politikaları + trigger + create_order RPC
-- ============================================================

-- Sequence: NM-YYYY-XXXXXX format için
CREATE SEQUENCE IF NOT EXISTS order_seq START 1;

-- ============================================================
-- Tablolar
-- ============================================================

-- Profiller (auth.users'a 1-1 ek)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adresler (sadece üye)
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(50),
  full_name VARCHAR(255),
  phone VARCHAR(20),
  city VARCHAR(100),
  district VARCHAR(100),
  address_line TEXT,
  zip_code VARCHAR(10),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kategoriler
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  image_path TEXT,
  display_order INT DEFAULT 0
);

-- Ürünler
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id),
  price NUMERIC(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);

-- Ürün görselleri (galeri)
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text VARCHAR(255),
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_product_images_product ON product_images(product_id);

-- Sepet (sadece üye için kalıcı; misafir → localStorage)
CREATE TABLE cart_items (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- Favoriler (sadece üye)
CREATE TABLE wishlist (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- Siparişler (üye veya misafir)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  guest_email VARCHAR(255),
  guest_phone VARCHAR(20),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  paytr_merchant_oid VARCHAR(255) UNIQUE,
  paytr_token VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending',
  tracking_code VARCHAR(100),
  cargo_company VARCHAR(100),
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (user_id IS NOT NULL OR (guest_email IS NOT NULL AND guest_phone IS NOT NULL))
);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Sipariş kalemleri (snapshot — ürün adı/fiyatı çekildiği anki haliyle saklanır)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  product_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10,2) NOT NULL
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Sipariş durum geçmişi (timeline için)
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  note TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);

-- ============================================================
-- Trigger: yeni Supabase Auth kullanıcısı → profiles satırı oluştur
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Trigger: sipariş status değişimini history'ye yaz + updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION log_order_status_change() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO order_status_history (order_id, status) VALUES (NEW.id, NEW.status);
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_status_change
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- ============================================================
-- RPC: create_order — atomik sepet→sipariş + stok düşürme
-- ============================================================
CREATE OR REPLACE FUNCTION create_order(
  p_items JSONB,           -- [{product_id, quantity}, ...]
  p_address JSONB,
  p_guest_email TEXT DEFAULT NULL,
  p_guest_phone TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_order_number VARCHAR(50);
  v_user_id UUID := auth.uid();
  v_total NUMERIC(10,2) := 0;
  v_item JSONB;
  v_product RECORD;
BEGIN
  v_order_number := 'NM-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(NEXTVAL('order_seq')::TEXT, 6, '0');

  INSERT INTO orders (order_number, user_id, guest_email, guest_phone, total_amount, shipping_address)
  VALUES (v_order_number, v_user_id, p_guest_email, p_guest_phone, 0, p_address)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    SELECT * INTO v_product FROM products WHERE id = (v_item->>'product_id')::UUID FOR UPDATE;
    IF v_product.stock < (v_item->>'quantity')::INT THEN
      RAISE EXCEPTION 'Stok yetersiz: %', v_product.name;
    END IF;

    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
    VALUES (
      v_order_id, v_product.id, v_product.name, v_product.price,
      (v_item->>'quantity')::INT,
      v_product.price * (v_item->>'quantity')::INT
    );

    UPDATE products SET stock = stock - (v_item->>'quantity')::INT WHERE id = v_product.id;
    v_total := v_total + v_product.price * (v_item->>'quantity')::INT;
  END LOOP;

  UPDATE orders SET total_amount = v_total WHERE id = v_order_id;

  IF v_user_id IS NOT NULL THEN
    DELETE FROM cart_items WHERE user_id = v_user_id;
  END IF;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_self_read"   ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profile_self_update" ON profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses_self" ON addresses
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- categories (herkes okur)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (TRUE);

-- products (herkes aktif olanları okur)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = TRUE);

-- product_images (herkes okur)
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_images_public_read" ON product_images FOR SELECT USING (TRUE);

-- cart_items (sadece kendi)
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_items_self" ON cart_items
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- wishlist (sadece kendi)
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlist_self" ON wishlist
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- orders: üye sadece kendi siparişlerini görür; INSERT create_order RPC üzerinden (SECURITY DEFINER bypass eder)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_self_read" ON orders FOR SELECT USING (user_id = auth.uid());
-- İptal: pending/paid/preparing durumdaki kendi siparişini cancelled yapabilir
CREATE POLICY "orders_self_cancel" ON orders FOR UPDATE
  USING (user_id = auth.uid() AND status IN ('pending','paid','preparing'))
  WITH CHECK (status = 'cancelled');

-- order_items (sadece kendi siparişinin item'larını oku)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_self_read" ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- order_status_history (sadece kendi siparişinin history'sini oku)
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_status_history_self_read" ON order_status_history FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
