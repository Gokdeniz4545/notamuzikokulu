-- ============================================================
-- Nota Müzik Market — 0010 Bekleyen sipariş temizliği (pg_cron)
-- 24 saatten eski, ödenmemiş 'pending' siparişleri 'expired' yapar.
-- SİLMEZ — denetim izi ve order_items anlık görüntüsü korunur.
-- Not: pg_cron açılamazsa Dashboard → Database → Extensions'tan
-- etkinleştirip bu dosyayı yeniden çalıştır.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.expire_stale_orders()
RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH upd AS (
    UPDATE orders SET status = 'expired'
     WHERE status = 'pending'
       AND payment_status IN ('pending', 'failed')
       AND created_at < NOW() - INTERVAL '24 hours'
    RETURNING 1
  )
  SELECT COUNT(*)::integer FROM upd;
$$;
REVOKE EXECUTE ON FUNCTION public.expire_stale_orders() FROM PUBLIC, anon, authenticated;

-- Saatte bir çalıştır (idempotent: cron.schedule aynı isimle upsert eder)
SELECT cron.schedule('nm-expire-orders', '23 * * * *', 'SELECT public.expire_stale_orders()');
