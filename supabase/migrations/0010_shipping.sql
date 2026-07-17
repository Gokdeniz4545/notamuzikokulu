-- ============================================================
-- Nota Müzik Market — 0010 kargo ücreti
-- Ara toplam (indirimli) >= 2000 TL  → kargo ÜCRETSİZ
-- Ara toplam < 2000 TL               → 199 TL kargo
-- create_order gövdesi 0009'dan alındı, yalnız kargo eklendi.
-- total_amount = ürün toplamı + kargo (PayTR bu tutarı tahsil eder).
-- Idempotent.
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
  v_shipping NUMERIC(10,2) := 0;
  v_item JSONB;
  v_qty INT;
  v_product RECORD;
  v_unit NUMERIC(10,2);
  -- kargo eşiği ve ücreti (tek yerde)
  c_free_min CONSTANT NUMERIC(10,2) := 2000;
  c_ship_fee CONSTANT NUMERIC(10,2) := 199;
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

  -- Kargo: ürün toplamı eşiğin altındaysa sabit ücret eklenir
  IF v_total > 0 AND v_total < c_free_min THEN
    v_shipping := c_ship_fee;
  END IF;

  v_total := v_total + v_shipping;

  UPDATE orders SET total_amount = v_total WHERE id = v_order_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'merchant_oid', v_merchant_oid,
    'shipping_amount', v_shipping,
    'total_amount', v_total
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.create_order(jsonb, jsonb, text, text, uuid) FROM anon, authenticated;
