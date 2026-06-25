-- ============================================================
-- Nota Müzik Market — 0005 güvenlik sertleştirme
-- K1: rol yükseltme açığı, O1: sipariş iptal/log, O2: create_order doğrulama
-- Idempotent: tekrar çalıştırılabilir.
-- ============================================================

-- ============================================================
-- K1 (KRİTİK) — Yetki yükseltme açığını kapat
-- profile_self_update politikası 'role' kolonunu da kapsıyordu →
-- her üye kendini admin yapabiliyordu. Trigger + kolon REVOKE ile engelle.
-- ============================================================
CREATE OR REPLACE FUNCTION public.guard_profile_role() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Admin olmayan biri kendi (veya herhangi bir) profilin role'ünü değiştiremez
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Yetkisiz işlem: rol değiştirilemez';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_guard_profile_role ON public.profiles;
CREATE TRIGGER trg_guard_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

-- Defense-in-depth: role kolonunun UPDATE iznini app rollerinden tamamen al.
-- (Admin atama yalnız SQL/service_role ile yapılır — 0002'deki manuel UPDATE gibi.)
REVOKE UPDATE (role) ON public.profiles FROM anon, authenticated;

-- ============================================================
-- O1 — Aşırı geniş self-cancel politikasını kaldır
-- WITH CHECK yalnız status='cancelled' istiyordu → kullanıcı aynı UPDATE'te
-- total_amount/shipping_address/tracking_code gibi alanları da değiştirebiliyordu.
-- UI'da müşteri iptal butonu yok; politika tamamen kaldırılıyor.
-- (İleride müşteri iptali istenirse SECURITY DEFINER bir cancel_my_order RPC eklenir.)
-- ============================================================
DROP POLICY IF EXISTS "orders_self_cancel" ON public.orders;

-- Status geçmişi loglaması RLS'e takılmasın (trigger SECURITY DEFINER yapılır).
-- Eski hali invoker yetkisiyle çalışıyordu → müşteri kaynaklı status değişiminde
-- order_status_history INSERT'i RLS'e takılıp hata verebiliyordu.
CREATE OR REPLACE FUNCTION public.log_order_status_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO order_status_history (order_id, status) VALUES (NEW.id, NEW.status);
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END $$;

-- ============================================================
-- O2 — create_order: pasif/var olmayan ürünü reddet + net hata
-- Gövde 0001 ile aynı; tek fark: ürün SELECT'ine is_active = TRUE +
-- ürün bulunamazsa açık hata. Fiyat yine DB'den alınır (client enjekte edemez).
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_order(
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
  v_qty INT;
  v_product RECORD;
BEGIN
  v_order_number := 'NM-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(NEXTVAL('order_seq')::TEXT, 6, '0');

  INSERT INTO orders (order_number, user_id, guest_email, guest_phone, total_amount, shipping_address)
  VALUES (v_order_number, v_user_id, p_guest_email, p_guest_phone, 0, p_address)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::INT;
    IF v_qty IS NULL OR v_qty < 1 THEN
      RAISE EXCEPTION 'Geçersiz adet';
    END IF;

    -- Yalnız aktif (satışta) ürün; satır kilidiyle yarış koşulunu önle
    SELECT * INTO v_product
      FROM products
      WHERE id = (v_item->>'product_id')::UUID AND is_active = TRUE
      FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Ürün bulunamadı veya satışta değil';
    END IF;

    IF v_product.stock < v_qty THEN
      RAISE EXCEPTION 'Stok yetersiz: %', v_product.name;
    END IF;

    INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
    VALUES (
      v_order_id, v_product.id, v_product.name, v_product.price,
      v_qty, v_product.price * v_qty
    );

    UPDATE products SET stock = stock - v_qty WHERE id = v_product.id;
    v_total := v_total + v_product.price * v_qty;
  END LOOP;

  UPDATE orders SET total_amount = v_total WHERE id = v_order_id;

  IF v_user_id IS NOT NULL THEN
    DELETE FROM cart_items WHERE user_id = v_user_id;
  END IF;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- O3 (NOT — kod değişikliği yok) — Ödeme entegrasyonu (PayTR) gelince,
-- stok düşürmeyi sipariş anından alıp 'paid' webhook'una taşımak önerilir.
-- Şu an stok sipariş anında düşüyor; ödemesiz sahte siparişle stok tüketilebilir.
-- ============================================================
