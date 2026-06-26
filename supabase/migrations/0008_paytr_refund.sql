-- ============================================================
-- Nota Müzik Market — 0008 PayTR iade (refund)
-- orders.refunded_amount + refund_order RPC (tam/kısmi iade).
-- Yalnız service_role (paytr-refund Edge Function) çağırabilir.
-- Idempotent.
-- ============================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC(10,2) NOT NULL DEFAULT 0;

-- İadeyi DB'ye işle: tam iade → stok geri + status 'refunded'; kısmi → payment_status 'partial_refund'
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
  SELECT * INTO v_order FROM orders WHERE paytr_merchant_oid = p_merchant_oid FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Sipariş bulunamadı');
  END IF;

  v_new_refunded := COALESCE(v_order.refunded_amount, 0) + p_amount;

  IF v_new_refunded >= v_order.total_amount THEN
    -- TAM iade: stoğu geri ekle + iptal/iade durumu
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
    -- KISMİ iade: sadece tutarı işaretle (stok geri eklenmez)
    UPDATE orders
      SET refunded_amount = v_new_refunded, payment_status = 'partial_refund'
      WHERE id = v_order.id;
  END IF;

  RETURN jsonb_build_object('ok', true, 'refunded_total', v_new_refunded);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.refund_order(text, numeric, boolean) FROM anon, authenticated;
