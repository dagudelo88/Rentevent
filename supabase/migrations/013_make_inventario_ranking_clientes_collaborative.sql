-- ============================================================
-- Migration 013: Make inventario, producto_ranking, clientes
-- collaborative (shared across all users)
--
-- ROOT CAUSE: The app was designed for per-user isolation, but
-- the business model requires all users to work on the same
-- inventory, ranking, and clients.
-- ============================================================

-- -----------------------------------------------------------------
-- 1. INVENTARIO
-- -----------------------------------------------------------------

DROP POLICY IF EXISTS "Users manage their own inventario" ON public.inventario;
DROP POLICY IF EXISTS "Public can read inventario catalog" ON public.inventario;

ALTER TABLE public.inventario DROP COLUMN IF EXISTS user_id;

CREATE POLICY "Authenticated users manage inventario"
  ON public.inventario FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public catalog read (anonymous visitors)
CREATE POLICY "Public can read inventario catalog"
  ON public.inventario FOR SELECT
  TO anon
  USING (true);

-- -----------------------------------------------------------------
-- 2. PRODUCTO_RANKING
-- -----------------------------------------------------------------

DROP POLICY IF EXISTS "Users manage their own producto_ranking" ON public.producto_ranking;

ALTER TABLE public.producto_ranking DROP COLUMN IF EXISTS user_id;

CREATE POLICY "Authenticated users manage producto_ranking"
  ON public.producto_ranking FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------
-- 3. CLIENTES
-- -----------------------------------------------------------------

-- Must drop contactos_cliente policy first: it references clientes.user_id
DROP POLICY IF EXISTS "Users manage their own contactos_cliente" ON public.contactos_cliente;

DROP POLICY IF EXISTS "Users manage their own clientes" ON public.clientes;

ALTER TABLE public.clientes DROP COLUMN IF EXISTS user_id;

CREATE POLICY "Authenticated users manage clientes"
  ON public.clientes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------
-- 4. CONTACTOS_CLIENTE (depends on shared clientes)
-- -----------------------------------------------------------------

CREATE POLICY "Authenticated users manage contactos_cliente"
  ON public.contactos_cliente FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
