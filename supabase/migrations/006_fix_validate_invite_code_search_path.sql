-- ============================================================
-- Migration 006: Fix "Function Search Path Mutable" for
--                public.validate_invite_code
--
-- ROOT CAUSE: validate_invite_code is declared SECURITY DEFINER
-- but has no explicit SET search_path.  Without a pinned path,
-- PostgreSQL resolves unqualified identifiers using the calling
-- role's session search_path, which creates two risks:
--   1. Security — a malicious role can inject a schema earlier
--      in the path that shadows public.invite_codes or built-in
--      functions (search_path hijacking / privilege escalation).
--   2. Stability — function behaviour varies by caller context,
--      making bugs intermittent and hard to reproduce.
--
-- FIX: Pin search_path = public, pg_catalog.
--   • public     — resolves public.invite_codes.
--   • pg_catalog — ensures system built-ins (now(), exists(),
--                  operators) always resolve to core objects,
--                  listed last per PostgreSQL best-practice.
--
-- All object references inside the body already use fully-
-- qualified names (public.invite_codes, now()), satisfying the
-- "qualify all names" defence-in-depth recommendation on top
-- of the fixed search_path.
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_invite_code(code_str text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  is_valid boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.invite_codes
    WHERE code      = code_str
      AND used_by   IS NULL
      AND expires_at > now()
  ) INTO is_valid;

  RETURN is_valid;
END;
$$;
