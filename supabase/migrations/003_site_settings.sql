-- ============================================================
-- Migration 003: Site-wide settings table
--
-- PURPOSE: Allow the admin to manage public-facing site info
-- (contact details, etc.) from the admin panel instead of
-- relying on environment variables or hardcoded values.
--
-- DESIGN:
--   - Simple key/value table with jsonb values.
--   - Public (anon + authenticated) can SELECT for the homepage.
--   - Only admins can INSERT / UPDATE / DELETE.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  key        text        PRIMARY KEY,
  value      jsonb       NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Trigger to keep updated_at current
DROP TRIGGER IF EXISTS on_site_settings_updated ON public.site_settings;
CREATE TRIGGER on_site_settings_updated
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Anyone (including anonymous visitors) can read
DROP POLICY IF EXISTS "Public can read site_settings" ON public.site_settings;
CREATE POLICY "Public can read site_settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Only admins can write
DROP POLICY IF EXISTS "Admins can manage site_settings" ON public.site_settings;
CREATE POLICY "Admins can manage site_settings"
  ON public.site_settings
  FOR ALL
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- Seed default contact info (safe to re-run; does NOT overwrite existing data)
INSERT INTO public.site_settings (key, value)
VALUES (
  'contact',
  '{
    "phone":     "+57 300 000 0000",
    "whatsapp":  "573000000000",
    "email":     "info@rentevent.co",
    "address":   "Bogotá, Colombia",
    "instagram": "@rentevent"
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
