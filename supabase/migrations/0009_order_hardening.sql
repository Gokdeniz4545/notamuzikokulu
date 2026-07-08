-- ============================================================
-- Nota Müzik Market — 0009 Sipariş sertleştirme
-- 1) orders: needs_attention / e-posta durum kolonları
-- 2) CHECK kısıtları (fiyat/stok/statü/iade tutarı)
-- 3) Eksik indexler (RLS + sık sorgu kolonları)
-- 4) confirm_order_payment yeniden yazımı:
--    - ürün satırları kilitlenir (FOR UPDATE, deterministik sıra)
--    - stok yetersizse sipariş needs_attention ile bayraklanır
--      (ödeme ZATEN alınmış — reddedilemez; admin karar verir)
--    - onay e-postası tek-atımlık: confirmation_email_sent_at atomik set
-- 5) Sipariş durum makinesi trigger'ı (yasal geçişler; 'refunded'
--    yalnız refund_order üzerinden — transaction-yerel GUC ile)
-- 6) lookup_guest_order: misafir sipariş sorgulama RPC (anon erişir)
-- ============================================================

-- ---- 1) Kolonlar ----
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS needs_attention BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS attention_note TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_status TEXT NOT NULL DEFAULT 'pending';

-- ---- 2) CHECK kısıtları ----
-- (prod verisi 2026-07-09'da doğrulandı: mevcut satırların tümü uyumlu)
ALTER TABLE products ADD CONSTRAINT products_price_chk CHECK (price >= 0);
ALTER TABLE products ADD CONSTRAINT products_stock_chk CHECK (stock >= 0);
ALTER TABLE orders ADD CONSTRAINT orders_status_chk CHECK (status IN
  ('pending','paid','preparing','shipped','delivered','cancelled','refunded','expired'));
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_chk CHECK (payment_status IN
  ('pending','paid','failed','refunded','partial_refund'));
ALTER TABLE orders ADD CONSTRAINT orders_refund_chk
  CHECK (refunded_amount >= 0 AND refunded_amount <= total_amount);
ALTER TABLE orders ADD CONSTRAINT orders_email_status_chk
  CHECK (email_status IN ('pending','sent','failed'));

-- ---- 3) Indexler ----
CREATE INDEX IF NOT EXISTS idx_orders_guest_email  ON orders(guest_email);
CREATE INDEX IF NOT EXISTS idx_orders_created      ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user      ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user        ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_prodrec_recommended ON product_recommendations(recommended_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product  ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product    ON wishlist(product_id);

-- ---- 4) confirm_order_payment: oversell tespiti + tek-atımlık e-posta ----
-- Dönüş sözleşmesi (paytr-callback bunu okur):
--   { ok, already_paid, send_email, stock_shortage } | { ok:false, reason }
DROP FUNCTION IF EXISTS public.confirm_order_payment(text);
CREATE FUNCTION public.confirm_order_payment(p_merchant_oid TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_stock INT;
  v_short TEXT[] := '{}';
  v_send_email BOOLEAN;
BEGIN
  SELECT * INTO v_order FROM orders WHERE paytr_merchant_oid = p_merchant_oid FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;
  IF v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object('ok', true, 'already_paid', true, 'send_email', false);
  END IF;
  -- İptal edilmiş vb. siparişe ödeme geldi → statüye dokunma, bayrakla (kalıcı durum; retry çözmez)
  IF v_order.status NOT IN ('pending', 'expired') THEN
    UPDATE orders SET needs_attention = TRUE,
      attention_note = 'Ödeme onayı geldi ama sipariş durumu: ' || v_order.status
      WHERE id = v_order.id;
    RETURN jsonb_build_object('ok', false, 'reason', 'invalid_state:' || v_order.status);
  END IF;

  -- Stok düşümü: ürün satırlarını deterministik sırada kilitle (deadlock önleme),
  -- yetersizse ürün adını topla. Ödeme alındı — düşür ve bayrakla, reddetme.
  FOR v_item IN
    SELECT oi.product_id, oi.quantity, oi.product_name FROM order_items oi
    WHERE oi.order_id = v_order.id AND oi.product_id IS NOT NULL
    ORDER BY oi.product_id
  LOOP
    SELECT stock INTO v_stock FROM products WHERE id = v_item.product_id FOR UPDATE;
    IF v_stock < v_item.quantity THEN
      v_short := v_short || v_item.product_name;
    END IF;
    UPDATE products SET stock = GREATEST(stock - v_item.quantity, 0)
      WHERE id = v_item.product_id;
  END LOOP;

  -- Tek-atımlık e-posta bayrağı: yalnız İLK onayda true
  v_send_email := (v_order.confirmation_email_sent_at IS NULL);

  UPDATE orders SET
    status = 'paid',
    payment_status = 'paid',
    needs_attention = (COALESCE(array_length(v_short, 1), 0) > 0),
    attention_note = CASE WHEN COALESCE(array_length(v_short, 1), 0) > 0
      THEN 'Stok yetersiz kaldı (oversell): ' || array_to_string(v_short, ', ') END,
    confirmation_email_sent_at = COALESCE(confirmation_email_sent_at, NOW())
  WHERE id = v_order.id;

  -- Üye sepetini temizle
  IF v_order.user_id IS NOT NULL THEN
    DELETE FROM cart_items WHERE user_id = v_order.user_id;
  END IF;

  RETURN jsonb_build_object(
    'ok', true, 'already_paid', false, 'send_email', v_send_email,
    'stock_shortage', COALESCE(array_length(v_short, 1), 0) > 0
  );
END $$;
REVOKE EXECUTE ON FUNCTION public.confirm_order_payment(text) FROM PUBLIC, anon, authenticated;

-- ---- 5) Durum makinesi ----
CREATE OR REPLACE FUNCTION public.enforce_order_status_transition()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;

  -- 'refunded' yalnız refund_order RPC'den (transaction-yerel bayrak)
  IF NEW.status = 'refunded' THEN
    IF current_setting('nm.allow_refund', true) IS DISTINCT FROM '1' THEN
      RAISE EXCEPTION 'refunded durumu yalnız iade işlemiyle (İade Et) atanabilir';
    END IF;
    IF OLD.status NOT IN ('paid', 'preparing', 'shipped', 'delivered') THEN
      RAISE EXCEPTION 'Geçersiz durum geçişi: % → refunded', OLD.status;
    END IF;
    RETURN NEW;
  END IF;

  IF NOT ( (OLD.status = 'pending'   AND NEW.status IN ('paid', 'cancelled', 'expired'))
        OR (OLD.status = 'expired'   AND NEW.status IN ('paid'))  -- geç webhook: para alındı
        OR (OLD.status = 'paid'      AND NEW.status IN ('preparing', 'shipped', 'delivered'))
        OR (OLD.status = 'preparing' AND NEW.status IN ('shipped', 'delivered'))
        OR (OLD.status = 'shipped'   AND NEW.status IN ('delivered')) ) THEN
    RAISE EXCEPTION 'Geçersiz durum geçişi: % → %', OLD.status, NEW.status;
  END IF;

  IF NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN
    NEW.cancelled_at := NOW();
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_order_status_transition ON orders;
CREATE TRIGGER trg_order_status_transition
  BEFORE UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION enforce_order_status_transition();

-- refund_order: gövde 0008 ile aynı; yalnız durum makinesi bayrağı eklendi
CREATE OR REPLACE FUNCTION public.refund_order(
  p_merchant_oid TEXT,
  p_amount NUMERIC,
  p_restore_stock BOOLEAN DEFAULT TRUE
) RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_new_refunded NUMERIC(10,2);
BEGIN
  PERFORM set_config('nm.allow_refund', '1', true);  -- durum makinesine izin (tx-yerel)

  SELECT * INTO v_order FROM orders WHERE paytr_merchant_oid = p_merchant_oid FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Sipariş bulunamadı');
  END IF;

  v_new_refunded := COALESCE(v_order.refunded_amount, 0) + p_amount;

  IF v_new_refunded >= v_order.total_amount THEN
    IF p_restore_stock THEN
      FOR v_item IN
        SELECT product_id, quantity FROM order_items
        WHERE order_id = v_order.id AND product_id IS NOT NULL
      LOOP
        UPDATE products SET stock = stock + v_item.quantity WHERE id = v_item.product_id;
      END LOOP;
    END IF;
    UPDATE orders
      SET refunded_amount = v_new_refunded, status = 'refunded', payment_status = 'refunded'
      WHERE id = v_order.id;
  ELSE
    UPDATE orders
      SET refunded_amount = v_new_refunded, payment_status = 'partial_refund'
      WHERE id = v_order.id;
  END IF;

  RETURN jsonb_build_object('ok', true, 'refunded_total', v_new_refunded);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.refund_order(text, numeric, boolean) FROM PUBLIC, anon, authenticated;

-- ---- 6) Misafir sipariş sorgulama ----
-- İki sır birden gerekir (sipariş no + e-posta); eşleşmezse NULL (enumeration sinyali yok).
-- Adres/telefon DÖNDÜRMEZ.
CREATE OR REPLACE FUNCTION public.lookup_guest_order(p_order_number TEXT, p_email TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
STABLE AS $$
DECLARE
  v_order RECORD;
  v_items JSONB;
BEGIN
  SELECT id, order_number, status, payment_status, created_at, total_amount,
         refunded_amount, tracking_code, cargo_company
    INTO v_order
    FROM orders
   WHERE order_number = TRIM(p_order_number)
     AND user_id IS NULL
     AND LOWER(guest_email) = LOWER(TRIM(p_email));
  IF NOT FOUND THEN RETURN NULL; END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'product_name', oi.product_name, 'quantity', oi.quantity,
           'product_price', oi.product_price, 'subtotal', oi.subtotal)
           ORDER BY oi.product_name), '[]'::jsonb)
    INTO v_items
    FROM order_items oi WHERE oi.order_id = v_order.id;

  RETURN jsonb_build_object(
    'order_number', v_order.order_number,
    'status', v_order.status,
    'payment_status', v_order.payment_status,
    'created_at', v_order.created_at,
    'total_amount', v_order.total_amount,
    'refunded_amount', v_order.refunded_amount,
    'tracking_code', v_order.tracking_code,
    'cargo_company', v_order.cargo_company,
    'items', v_items
  );
END $$;
GRANT EXECUTE ON FUNCTION public.lookup_guest_order(text, text) TO anon, authenticated;
