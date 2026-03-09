-- ============================================================
-- Migration 010: Add use_invite_code_on_signup for signup flow
--
-- ROOT CAUSE: When Supabase requires email confirmation, signUp()
-- returns user data but session is null. The client remains
-- anonymous when calling use_invite_code. Inside the RPC,
-- auth.uid() returns NULL, so used_by is never set and codes
-- appear "available" even after being consumed.
--
-- FIX: Add use_invite_code_on_signup(code_str, new_user_id) that
-- accepts the new user's ID explicitly. Callable by anon for
-- post-signup. Verifies the user exists in auth.users and was
-- created recently (5 min) to prevent abuse.
-- ============================================================

CREATE OR REPLACE FUNCTION public.use_invite_code_on_signup(
  code_str text,
  new_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_catalog
AS $$
DECLARE
  user_created_at timestamptz;
BEGIN
  -- Verify user exists and was created recently (prevents passing arbitrary user IDs)
  SELECT created_at INTO user_created_at
  FROM auth.users
  WHERE id = new_user_id;
  IF user_created_at IS NULL THEN
    RAISE EXCEPTION 'invalid user';
  END IF;
  IF user_created_at < now() - interval '5 minutes' THEN
    RAISE EXCEPTION 'user must be newly created to consume invite code';
  END IF;

  UPDATE public.invite_codes
  SET used_by = new_user_id
  WHERE code      = code_str
    AND used_by   IS NULL
    AND expires_at > now();
END;
$$;
