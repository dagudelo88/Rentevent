-- ============================================================
-- Migration 002: Public product catalog
--
-- ROOT CAUSE: The homepage needs to display inventory items to
-- anonymous visitors (potential clients) without requiring login.
-- The inventario table previously had no public read policy and
-- no image URL column.
--
-- CHANGES:
--   1. Add imagen_url column to inventario for catalog photos.
--   2. Add a public (anon) SELECT-only RLS policy so the catalog
--      is visible to unauthenticated visitors.
-- ============================================================

-- 1. Add optional image URL for catalog display
ALTER TABLE public.inventario
  ADD COLUMN IF NOT EXISTS imagen_url text;

-- 2. Allow anonymous (public) visitors to read inventory for the catalog.
--    Write operations (INSERT / UPDATE / DELETE) remain restricted
--    to the authenticated owner and admins via the existing policy.
DROP POLICY IF EXISTS "Public can read inventario catalog" ON public.inventario;
CREATE POLICY "Public can read inventario catalog"
  ON public.inventario
  FOR SELECT
  TO anon
  USING (true);
