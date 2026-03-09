-- ============================================================
-- Migration 004: Fix "Database error saving new user"
--
-- ROOT CAUSE: In newer Supabase versions (post-2023), SECURITY
-- DEFINER functions without an explicit SET search_path can
-- fail to resolve schema objects when called from the auth
-- service's internal context, because the search_path at call
-- time is different from what the function expects.
--
-- Additionally, the supabase_auth_admin role (used internally
-- by the Supabase Auth service to run trigger functions) was
-- never granted explicit EXECUTE or table-level permissions,
-- which causes the trigger to raise an unhandled exception that
-- Supabase surfaces as "Database error saving new user".
--
-- CHANGES:
--   1. Re-create handle_new_user with SET search_path = public
--   2. Re-create get_my_role with SET search_path = public
--   3. Grant supabase_auth_admin schema usage, table access,
--      and function execution rights
-- ============================================================

-- 1. Fix handle_new_user — pin search_path so public.profiles
--    is always resolved correctly regardless of caller context.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user'::user_role)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Recreate the trigger so it picks up the updated function.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Grant supabase_auth_admin the access it needs to run the
--    trigger and insert the profile row successfully.
GRANT USAGE  ON SCHEMA public                    TO supabase_auth_admin;
GRANT ALL    ON TABLE  public.profiles           TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- 4. Fix get_my_role with the same search_path discipline to
--    prevent future RLS policy failures for the same reason.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;
