-- ============================================================
-- Migration 005: Fix "Function Search Path Mutable" for
--                public.use_invite_code
--
-- ROOT CAUSE: use_invite_code is declared SECURITY DEFINER
-- but has no explicit SET search_path.  PostgreSQL therefore
-- resolves unqualified names using whatever search_path the
-- calling role has set, which creates two risks:
--   1. Security — a malicious role can redirect object
--      references to attacker-controlled schema objects
--      (search_path hijacking / privilege escalation).
--   2. Stability — behaviour differs depending on caller
--      context, making bugs hard to reproduce.
--
-- FIX: Pin search_path = public, extensions, pg_catalog so
-- that:
--   • public.*  tables (invite_codes) always resolve correctly.
--   • auth.uid() is called via its fully-qualified schema
--     prefix, which is already in the body — no extra schema
--     entry needed for that.
--   • pg_catalog is last so system objects are always found.
--
-- All object references inside the function already use fully-
-- qualified names (public.invite_codes, auth.uid()), which
-- satisfies the "qualify all names" best-practice on top of
-- the fixed search_path.
-- ============================================================

CREATE OR REPLACE FUNCTION public.use_invite_code(code_str text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.invite_codes
  SET used_by = auth.uid()
  WHERE code    = code_str
    AND used_by IS NULL
    AND expires_at > now();
END;
$$;
