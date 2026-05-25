-- ============================================================
-- Nota Müzik Market — 0004 ürün yorumları + benzer ürün önerileri
-- Idempotent değil; bir kez çalıştır.
-- ============================================================

-- ---- Yorumlar (puan + metin) ----
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name VARCHAR(255),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, user_id)          -- kullanıcı başına 1 yorum (düzenlenebilir)
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Herkes yorumları okur
DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read" ON reviews FOR SELECT USING (TRUE);

-- Sadece o ürünü TESLİM ALMIŞ (delivered) üye yorum ekleyebilir
DROP POLICY IF EXISTS "reviews_insert_delivered" ON reviews;
CREATE POLICY "reviews_insert_delivered" ON reviews FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.user_id = auth.uid()
        AND o.status = 'delivered'
        AND oi.product_id = reviews.product_id
    )
  );

-- Kendi yorumunu güncelle/sil
DROP POLICY IF EXISTS "reviews_self_update" ON reviews;
CREATE POLICY "reviews_self_update" ON reviews FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "reviews_self_delete" ON reviews;
CREATE POLICY "reviews_self_delete" ON reviews FOR DELETE USING (user_id = auth.uid());

-- Admin tüm yorumları yönetir (moderasyon)
DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
CREATE POLICY "reviews_admin_all" ON reviews FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ---- Benzer ürün önerileri (admin seçer) ----
CREATE TABLE IF NOT EXISTS product_recommendations (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  recommended_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  PRIMARY KEY (product_id, recommended_id),
  CHECK (product_id <> recommended_id)
);
CREATE INDEX IF NOT EXISTS idx_prodrec_product ON product_recommendations(product_id);

ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prodrec_public_read" ON product_recommendations;
CREATE POLICY "prodrec_public_read" ON product_recommendations FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "prodrec_admin_all" ON product_recommendations;
CREATE POLICY "prodrec_admin_all" ON product_recommendations FOR ALL
  USING (is_admin()) WITH CHECK (is_admin());
