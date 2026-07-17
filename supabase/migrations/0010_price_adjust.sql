-- ============================================================
-- 0010_price_adjust.sql — GÖRÜNMEZ fiyat değişimi (zam / indirim)
--
-- İndirim RPC'lerinden (0009) farkı: bunlar products.price'ı DOĞRUDAN
-- değiştirir → müşteri tarafında indirim rozeti/üstü-çizili fiyat ÇIKMAZ.
--
-- discount_price dolu olan ürünlerde (görünen indirimli), discount_price
-- price ile AYNI ORANDA ölçeklenir → görünen indirim yüzdesi sabit kalır,
-- yani zam/indirim tamamen "görünmez" olur (0 < discount_price < price korunur).
--
-- İşaret konvansiyonu (client signed değer gönderir):
--   p_percent = +10 → %10 zam,   -10 → %10 indirim
--   p_amount  = +50 → 50 TL zam,  -50 → 50 TL indirim
-- p_ids NULL ise TÜM aktif ürünlere uygulanır (indirim RPC'leriyle aynı kapsam).
-- ============================================================

CREATE OR REPLACE FUNCTION public.adjust_price_percent(p_percent NUMERIC, p_ids UUID[] DEFAULT NULL)
RETURNS INT AS $$
DECLARE n INT;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Yetkisiz işlem'; END IF;
  IF p_percent IS NULL OR p_percent = 0 OR p_percent <= -100 THEN
    RAISE EXCEPTION 'Yüzde 0 olamaz ve -100''den büyük olmalı';
  END IF;
  -- faktör = 1 + p/100  (zam>1, indirim<1); price ve discount_price aynı faktörle çarpılır
  UPDATE products
    SET price = ROUND(price * (1 + p_percent / 100.0), 2),
        discount_price = CASE WHEN discount_price IS NULL THEN NULL
                              ELSE ROUND(discount_price * (1 + p_percent / 100.0), 2) END
    WHERE is_active = TRUE
      AND (p_ids IS NULL OR id = ANY(p_ids))
      AND ROUND(price * (1 + p_percent / 100.0), 2) > 0
      -- indirimli üründe yuvarlama sonrası 0 < discount_price < price kuralı bozulmasın (bozulursa satır atlanır)
      AND (discount_price IS NULL OR (
            ROUND(discount_price * (1 + p_percent / 100.0), 2) > 0
        AND ROUND(discount_price * (1 + p_percent / 100.0), 2) < ROUND(price * (1 + p_percent / 100.0), 2)));
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.adjust_price_amount(p_amount NUMERIC, p_ids UUID[] DEFAULT NULL)
RETURNS INT AS $$
DECLARE n INT;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Yetkisiz işlem'; END IF;
  IF p_amount IS NULL OR p_amount = 0 THEN RAISE EXCEPTION 'Tutar 0 olamaz'; END IF;
  -- discount_price, price ile aynı ORANDA ((price+amount)/price) ölçeklenir → görünen % sabit
  UPDATE products
    SET price = ROUND(price + p_amount, 2),
        discount_price = CASE WHEN discount_price IS NULL THEN NULL
                              ELSE ROUND(discount_price * ((price + p_amount) / price), 2) END
    WHERE is_active = TRUE
      AND (p_ids IS NULL OR id = ANY(p_ids))
      AND price + p_amount > 0
      AND (discount_price IS NULL OR (
            ROUND(discount_price * ((price + p_amount) / price), 2) > 0
        AND ROUND(discount_price * ((price + p_amount) / price), 2) < ROUND(price + p_amount, 2)));
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
-- Koruma: fonksiyon içi is_admin() kontrolü (0009 indirim RPC'leriyle aynı model).
