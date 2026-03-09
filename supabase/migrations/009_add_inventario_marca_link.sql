-- Add marca (brand) and link_compra (purchase link) columns to inventario.
-- imagen_url was added in migration 002.
ALTER TABLE public.inventario
  ADD COLUMN IF NOT EXISTS marca text,
  ADD COLUMN IF NOT EXISTS link_compra text;
