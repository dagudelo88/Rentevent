-- ============================================================
-- Migration 007: Fix "Function Search Path Mutable" for
--                public.handle_updated_at
--
-- ROOT CAUSE: handle_updated_at is a trigger function that was
-- created without an explicit SET search_path.  Even though it
-- is not SECURITY DEFINER, a mutable search_path still creates
-- two risks:
--   1. Correctness/stability — if a session changes its
--      search_path before the trigger fires, unqualified
--      references inside the function (now(), NEW) could
--      theoretically resolve differently.
--   2. Defence-in-depth — PostgreSQL best-practice is to pin
--      search_path on every function so behavior is fully
--      deterministic regardless of caller context.
--
-- FIX: Add SET search_path = public, pg_catalog.
--   • public     — schema of any tables the trigger touches.
--   • pg_catalog — ensures the built-in now() and all
--                  operators always resolve to core objects;
--                  listed last per PostgreSQL convention.
--
-- The function body already uses only built-in identifiers
-- (now(), NEW, RETURN), so no additional schema qualification
-- is required inside the body.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
