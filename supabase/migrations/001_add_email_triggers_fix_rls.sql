-- ============================================================
-- Migration 001: Email column, auto-profile trigger, role check
-- function, and fixed RLS policies
-- ============================================================
-- ROOT CAUSE: RLS policies used (auth.jwt() ->> 'role') = 'admin'
-- but Supabase does NOT auto-populate custom role claims in JWT.
-- FIX: Use a SECURITY DEFINER function that directly queries the
-- profiles table, bypassing RLS safely.
-- ============================================================

-- 1. Add email column to profiles for better admin visibility
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- 2. Security-definer function to get the current user's role
--    without RLS recursion (runs as definer, not caller)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- 3. Auto-create profile when a new auth user is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user'::user_role)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Backfill email for any existing profiles that are missing it
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 5. Fix profiles RLS: replace JWT-claim policies with get_my_role()

DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all profiles." ON public.profiles;
CREATE POLICY "Admins can view all profiles."
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'admin' OR id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
CREATE POLICY "Admins can update any profile."
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'admin' OR id = auth.uid());

DROP POLICY IF EXISTS "Admins can insert profiles." ON public.profiles;
CREATE POLICY "Admins can insert profiles."
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin' OR id = auth.uid());

-- 6. Fix invite_codes RLS
DROP POLICY IF EXISTS "Admins can manage invite codes." ON public.invite_codes;
CREATE POLICY "Admins can manage invite codes."
  ON public.invite_codes FOR ALL
  USING (public.get_my_role() = 'admin')
  WITH CHECK (public.get_my_role() = 'admin');

-- 7. Fix all data table RLS policies to use get_my_role()

DROP POLICY IF EXISTS "Users manage their own inventario" ON public.inventario;
CREATE POLICY "Users manage their own inventario"
  ON public.inventario FOR ALL
  USING (auth.uid() = user_id OR public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Users manage their own clientes" ON public.clientes;
CREATE POLICY "Users manage their own clientes"
  ON public.clientes FOR ALL
  USING (auth.uid() = user_id OR public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Users manage their own contactos_cliente" ON public.contactos_cliente;
CREATE POLICY "Users manage their own contactos_cliente"
  ON public.contactos_cliente FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.clientes c
      WHERE c.id = cliente_id
        AND (c.user_id = auth.uid() OR public.get_my_role() = 'admin')
    )
  );

DROP POLICY IF EXISTS "Users manage their own eventos" ON public.eventos;
CREATE POLICY "Users manage their own eventos"
  ON public.eventos FOR ALL
  USING (auth.uid() = user_id OR public.get_my_role() = 'admin');

DROP POLICY IF EXISTS "Users manage their own evento_items" ON public.evento_items;
CREATE POLICY "Users manage their own evento_items"
  ON public.evento_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.eventos e
      WHERE e.id = evento_id
        AND (e.user_id = auth.uid() OR public.get_my_role() = 'admin')
    )
  );

DROP POLICY IF EXISTS "Users manage their own configuraciones" ON public.configuraciones;
CREATE POLICY "Users manage their own configuraciones"
  ON public.configuraciones FOR ALL
  USING (auth.uid() = user_id OR public.get_my_role() = 'admin');

-- 8. Promote the admin user
--    Run AFTER the profile exists (either via trigger or manual insert)
UPDATE public.profiles
SET role = 'admin'::user_role
WHERE email = 'dagudelo88@gmail.com';

-- If the profile row doesn't exist yet (user hasn't logged in since trigger
-- was created), insert it directly:
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'admin'::user_role
FROM auth.users
WHERE email = 'dagudelo88@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin'::user_role, email = EXCLUDED.email;
