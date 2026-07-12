-- ============================================================
-- Nota Müzik Market — 0009 indirim sistemi
-- products.discount_price: NULL = indirim yok. Doluysa EFEKTİF satış fiyatıdır.
-- create_order artık indirimli fiyattan tahsil eder (müşteri gördüğünü öder).
-- Toplu/seçili indirim RPC'leri (yüzde veya tutar) — yalnız admin.
-- Idempotent.
-- ============================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_price NUMERIC(10,2);

-- İndirimli fiyat pozitif ve normal fiyattan küçük olmalı
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_discount_valid;
ALTER TABLE products ADD CONSTRAINT products_discount_valid
  CHECK (discount_price IS NULL OR (discount_price > 0 AND discount_price < price));

CREATE INDEX IF NOT EXISTS idx_products_discount ON products(discount_price) WHERE discount_price IS NOT NULL;

-- ============================================================
-- İndirim RPC'leri — p_ids NULL ise TÜM aktif ürünlere uygulanır
-- ============================================================
CREATE OR REPLACE FUNCTION public.apply_discount_percent(p_percent NUMERIC, p_ids UUID[] DEFAULT NULL)
RETURNS INT AS $$
DECLARE n INT;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Yetkisiz işlem'; END IF;
  IF p_percent IS NULL OR p_percent <= 0 OR p_percent >= 100 THEN
    RAISE EXCEPTION 'Yüzde 1-99 arasında olmalı';
  END IF;
  UPDATE products
    SET discount_price = ROUND(price * (1 - p_percent / 100.0), 2)
    WHERE is_active = TRUE
      AND (p_ids IS NULL OR id = ANY(p_ids))
      AND ROUND(price * (1 - p_percent / 100.0), 2) > 0;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.apply_discount_amount(p_amount NUMERIC, p_ids UUID[] DEFAULT NULL)
RETURNS INT AS $$
DECLARE n INT;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Yetkisiz işlem'; END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'Tutar pozitif olmalı'; END IF;
  UPDATE products
    SET discount_price = ROUND(price - p_amount, 2)
    WHERE is_active = TRUE
      AND (p_ids IS NULL OR id = ANY(p_ids))
      AND price - p_amount > 0;   -- fiyatı sıfırın altına düşürecek ürünler atlanır
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.clear_discount(p_ids UUID[] DEFAULT NULL)
RETURNS INT AS $$
DECLARE n INT;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Yetkisiz işlem'; END IF;
  UPDATE products SET discount_price = NULL
    WHERE discount_price IS NOT NULL AND (p_ids IS NULL OR id = ANY(p_ids));
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- create_order: indirimli fiyattan tahsil et (0007'nin gövdesi + indirim)
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_order(
  p_items JSONB,
  p_address JSONB,
  p_guest_email TEXT DEFAULT NULL,
  p_guest_phone TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_order_number VARCHAR(50);
  v_merchant_oid VARCHAR(64);
  v_total NUMERIC(10,2) := 0;
  v_item JSONB;
  v_qty INT;
  v_product RECORD;
  v_unit NUMERIC(10,2);
BEGIN
  v_order_number := 'NM-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(NEXTVAL('order_seq')::TEXT, 6, '0');
  v_merchant_oid := REPLACE(v_order_number, '-', '');

  INSERT INTO orders (order_number, user_id, guest_email, guest_phone, total_amount,
                      shipping_address, status, payment_status, paytr_merchant_oid)
  VALUES (v_order_number, p_user_id, p_guest_email, p_guest_phone, 0,
          p_address, 'pending', 'pending', v_merchant_oid)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::INT;
    IF v_qty IS NULL OR v_qty < 1 THEN
      RAISE EXCEPTION 'Geçersiz adet';
    END IF;

    SELECT * INTO v_product
      FROM products
      WHERE id = (v_item->>'product_id')::UUID AND is_active = TRUE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Ürün bulunamadı veya satışta değil';
    END IF;
    IF v_product.stock < v_qty THEN
      RAISE EXCEPTION 'Stok yetersiz: %', v_product.name;
    END IF;

    -- EFEKTİF fiyat: indirim varsa indirimli, yoksa normal (fiyat DB'den, client enjekte edemez)
    v_unit := COALESCE(v_product.discount_price, v_product.price);

    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
    VALUES (v_order_id, v_product.id, v_product.name, v_unit, v_qty, v_unit * v_qty);

    v_total := v_total + v_unit * v_qty;
  END LOOP;

  UPDATE orders SET total_amount = v_total WHERE id = v_order_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'merchant_oid', v_merchant_oid,
    'total_amount', v_total
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.create_order(jsonb, jsonb, text, text, uuid) FROM anon, authenticated;
