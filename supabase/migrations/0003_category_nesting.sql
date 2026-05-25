-- ============================================================
-- Nota Müzik Market — 0003 kategori hiyerarşisi (iç içe kategoriler)
-- categories.parent_id (self-reference) — sınırsız derinlik
-- Idempotent.
-- ============================================================

-- Üst kategori referansı. Silmede RESTRICT: alt kategorisi olan silinemez.
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- Not: RLS değişmez — categories zaten public read + admin (is_admin) tam yetki.
-- Mevcut 5 kategori parent_id = NULL kalır (üst seviye). Yeni alt kategoriler
-- admin panelinden parent_id verilerek eklenir. Ürünler yalnız yaprak
-- (alt kategorisi olmayan) kategorilere atanır — admin ürün formu bunu uygular.
