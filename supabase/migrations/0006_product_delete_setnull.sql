-- ============================================================
-- Nota Müzik Market — 0006 ürün silmeyi serbest bırak
-- order_items.product_id FK'si RESTRICT idi → siparişte geçen ürün silinemiyordu.
-- ON DELETE SET NULL yapıyoruz: ürün silinince sipariş kalemindeki bağlantı NULL olur,
-- ama product_name / product_price snapshot olarak saklı olduğu için sipariş geçmişi bozulmaz.
-- Idempotent.
-- ============================================================

DO $$
DECLARE
  v_constraint text;
BEGIN
  SELECT conname INTO v_constraint
  FROM pg_constraint
  WHERE conrelid = 'public.order_items'::regclass
    AND contype = 'f'
    AND conkey = ARRAY[(
      SELECT attnum FROM pg_attribute
      WHERE attrelid = 'public.order_items'::regclass AND attname = 'product_id'
    )];
  IF v_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.order_items DROP CONSTRAINT %I', v_constraint);
  END IF;
END $$;

ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
