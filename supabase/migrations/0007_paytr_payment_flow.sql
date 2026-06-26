-- ============================================================
-- Nota Müzik Market — 0007 PayTR ödeme akışı
-- create_order artık PENDING sipariş oluşturur (stok düşürmez, sepet temizlemez).
-- Stok düşürme + 'paid' işaretleme ödeme onayında (confirm_order_payment) yapılır.
-- Böylece O3 (ödemesiz stok tüketimi) sorunu da çözülür.
-- Her iki RPC yalnız service_role (Edge Function) tarafından çağrılabilir.
-- Idempotent.
-- ============================================================

-- ---- create_order: PENDING sipariş + merchant_oid (stok/sepet dokunmaz) ----
DROP FUNCTION IF EXISTS public.create_order(jsonb, jsonb, text, text);
DROP FUNCTION IF EXISTS public.create_order(jsonb, jsonb, text, text, uuid);

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

    -- Fiyat DB'den alınır (client enjekte edemez). Stok burada DÜŞMEZ.
    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
    VALUES (v_order_id, v_product.id, v_product.name, v_product.price, v_qty, v_product.price * v_qty);

    v_total := v_total + v_product.price * v_qty;
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

-- ---- confirm_order_payment: ödeme onaylandı → stok düş + paid (idempotent) ----
CREATE OR REPLACE FUNCTION public.confirm_order_payment(p_merchant_oid TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
BEGIN
  SELECT * INTO v_order FROM orders WHERE paytr_merchant_oid = p_merchant_oid FOR UPDATE;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  IF v_order.payment_status = 'paid' THEN
    RETURN TRUE;   -- tekrar bildirim → idempotent
  END IF;

  -- Stok şimdi düşülür (ödeme onaylandı)
  FOR v_item IN
    SELECT product_id, quantity FROM order_items
    WHERE order_id = v_order.id AND product_id IS NOT NULL
  LOOP
    UPDATE products SET stock = GREATEST(stock - v_item.quantity, 0)
    WHERE id = v_item.product_id;
  END LOOP;

  UPDATE orders SET status = 'paid', payment_status = 'paid' WHERE id = v_order.id;

  -- Üye sepetini temizle
  IF v_order.user_id IS NOT NULL THEN
    DELETE FROM cart_items WHERE user_id = v_order.user_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.confirm_order_payment(text) FROM anon, authenticated;

-- ---- ödeme başarısız → siparişi işaretle (opsiyonel, idempotent) ----
CREATE OR REPLACE FUNCTION public.fail_order_payment(p_merchant_oid TEXT, p_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order FROM orders WHERE paytr_merchant_oid = p_merchant_oid FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF v_order.payment_status = 'paid' THEN RETURN TRUE; END IF;  -- zaten ödenmiş, dokunma
  UPDATE orders SET payment_status = 'failed' WHERE id = v_order.id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.fail_order_payment(text, text) FROM anon, authenticated;
