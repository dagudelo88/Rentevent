-- Enable uuid-ossp extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Profiles & Roles
-- ==========================================

DO $$ BEGIN
    create type user_role as enum ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role user_role default 'user'::user_role not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
create policy "Users can view their own profile."
  on public.profiles for select
  using ( auth.uid() = id );

DROP POLICY IF EXISTS "Admins can view all profiles." ON public.profiles;
create policy "Admins can view all profiles."
  on public.profiles for select
  using ( public.get_my_role() = 'admin' OR id = auth.uid() );

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );

DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
create policy "Admins can update any profile."
  on public.profiles for update
  using ( public.get_my_role() = 'admin' OR id = auth.uid() );

DROP POLICY IF EXISTS "Admins can insert profiles." ON public.profiles;
create policy "Admins can insert profiles."
  on public.profiles for insert
  with check ( public.get_my_role() = 'admin' OR id = auth.uid() );

-- Trigger to handle updated_at
-- search_path is pinned for deterministic name resolution (defence-in-depth).
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 2. Invite Codes (Admin Flow)
-- ==========================================

create table if not exists public.invite_codes (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  created_by uuid references public.profiles(id) on delete set null,
  used_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz default now() not null
);

alter table public.invite_codes enable row level security;

DROP POLICY IF EXISTS "Admins can manage invite codes." ON public.invite_codes;
create policy "Admins can manage invite codes."
  on public.invite_codes for all
  using ( public.get_my_role() = 'admin' )
  with check ( public.get_my_role() = 'admin' );

-- ==========================================
-- 3. Inventory (Unificando wedding_inventory_v8 y wedding_real_inventory_v2)
-- ==========================================

-- Collaborative: all users share the same inventory
create table if not exists public.inventario (
  id uuid default uuid_generate_v4() primary key,
  nombre text not null,
  categoria text not null,
  cantidad integer default 0 not null,
  costo numeric default 0 not null,
  precio_alquiler numeric default 0 not null,
  costo_transporte numeric default 0 not null,
  -- Qualitative metrics (Meta-Score)
  rotacion integer default 5 not null,
  almacenamiento integer default 5 not null,
  facilidad_transporte integer default 5 not null,
  durabilidad integer default 5 not null,
  -- Historical
  veces_alquilado integer default 0 not null,
  ingresos_historicos numeric default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.inventario enable row level security;

DROP POLICY IF EXISTS "Users manage their own inventario" ON public.inventario;
DROP POLICY IF EXISTS "Authenticated users manage inventario" ON public.inventario;
DROP POLICY IF EXISTS "Public can read inventario catalog" ON public.inventario;
create policy "Authenticated users manage inventario"
  on public.inventario for all to authenticated
  using (true) with check (true);
create policy "Public can read inventario catalog"
  on public.inventario for select to anon using (true);

DROP TRIGGER IF EXISTS on_inventario_updated ON public.inventario;
create trigger on_inventario_updated
  before update on public.inventario
  for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 4. Clients
-- ==========================================

-- Collaborative: all users share the same clients
create table if not exists public.clientes (
  id uuid default uuid_generate_v4() primary key,
  nombre text not null,
  tipo text not null,
  documento text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.clientes enable row level security;

DROP POLICY IF EXISTS "Users manage their own clientes" ON public.clientes;
create policy "Authenticated users manage clientes"
  on public.clientes for all to authenticated
  using (true) with check (true);

DROP TRIGGER IF EXISTS on_clientes_updated ON public.clientes;
create trigger on_clientes_updated
  before update on public.clientes
  for each row execute procedure public.handle_updated_at();

create table if not exists public.contactos_cliente (
  id uuid default uuid_generate_v4() primary key,
  cliente_id uuid references public.clientes(id) on delete cascade not null,
  nombre text not null,
  telefono text,
  email text,
  es_principal boolean default false not null
);

alter table public.contactos_cliente enable row level security;

DROP POLICY IF EXISTS "Users manage their own contactos_cliente" ON public.contactos_cliente;
create policy "Authenticated users manage contactos_cliente"
  on public.contactos_cliente for all to authenticated
  using (true) with check (true);

-- ==========================================
-- 5. Events
-- ==========================================

create table if not exists public.eventos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  nombre_evento text not null,
  cliente_id uuid references public.clientes(id) on delete set null,
  organizador_id uuid references public.clientes(id) on delete set null,
  fecha text, -- keeping text to map to format "YYYY-MM-DD" used in JS without timezone issues
  lugar text,
  direccion text,
  estado text default 'Cotizado' not null,
  costo_transporte numeric default 0 not null,
  deposito_seguridad numeric default 0 not null,
  total_alquiler numeric default 0 not null,
  total_general numeric default 0 not null,
  notas text,
  fecha_cotizacion text,
  fecha_validez text,
  hora_entrega text,
  fecha_recogida text,
  hora_recogida text,
  fecha_pago text,
  comprobante_pago text,
  cotizacion_enviada boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.eventos enable row level security;

DROP POLICY IF EXISTS "Users manage their own eventos" ON public.eventos;
create policy "Users manage their own eventos"
  on public.eventos for all
  using ( auth.uid() = user_id OR public.get_my_role() = 'admin' );

DROP TRIGGER IF EXISTS on_eventos_updated ON public.eventos;
create trigger on_eventos_updated
  before update on public.eventos
  for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 6. Event Items
-- ==========================================

create table if not exists public.evento_items (
  id uuid default uuid_generate_v4() primary key,
  evento_id uuid references public.eventos(id) on delete cascade not null,
  item_id uuid references public.inventario(id) on delete restrict not null,
  cantidad integer not null default 1,
  precio_unitario numeric not null default 0
);

alter table public.evento_items enable row level security;

DROP POLICY IF EXISTS "Users manage their own evento_items" ON public.evento_items;
create policy "Users manage their own evento_items"
  on public.evento_items for all
  using (
    exists (
      select 1 from public.eventos e
      where e.id = evento_id and (e.user_id = auth.uid() OR public.get_my_role() = 'admin')
    )
  );

-- ==========================================
-- 6.5 Quote Versions (Cotizaciones)
-- ==========================================

create table if not exists public.cotizaciones (
  id uuid default uuid_generate_v4() primary key,
  evento_id uuid references public.eventos(id) on delete cascade not null,
  version integer not null default 1,
  items_snapshot jsonb not null default '[]'::jsonb,
  total numeric not null default 0,
  estado text not null default 'Pendiente', -- 'Pendiente', 'Aceptada', 'Rechazada'
  notas_version text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.cotizaciones enable row level security;

DROP POLICY IF EXISTS "Users manage their own cotizaciones" ON public.cotizaciones;
create policy "Users manage their own cotizaciones"
  on public.cotizaciones for all
  using (
    exists (
      select 1 from public.eventos e
      where e.id = evento_id and (e.user_id = auth.uid() OR public.get_my_role() = 'admin')
    )
  );

DROP TRIGGER IF EXISTS on_cotizaciones_updated ON public.cotizaciones;
create trigger on_cotizaciones_updated
  before update on public.cotizaciones
  for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 7. Product Ranking
-- Separate from inventory: used to evaluate and categorize
-- items to buy. Has ranking-specific fields (image_url,
-- purchase_link) and qualitative scoring metrics.
-- ==========================================

-- Collaborative: all users share the same product ranking
create table if not exists public.producto_ranking (
  id                   uuid default uuid_generate_v4() primary key,
  nombre               text not null,
  categoria            text not null,
  costo                numeric default 0 not null,
  precio_alquiler      numeric default 0 not null,
  costo_transporte     numeric default 0 not null,
  -- Qualitative scoring metrics (1-10 scale)
  rotacion             integer default 5 not null,
  almacenamiento       integer default 5 not null,
  facilidad_transporte integer default 5 not null,
  durabilidad          integer default 5 not null,
  -- Reference quantities / historical data
  cantidad             integer default 0 not null,
  veces_alquilado      integer default 0 not null,
  ingresos_historicos  numeric default 0 not null,
  -- Ranking-specific metadata (not present in inventory)
  image_url            text,
  purchase_link        text,
  created_at           timestamptz default now() not null,
  updated_at           timestamptz default now() not null
);

alter table public.producto_ranking enable row level security;

DROP POLICY IF EXISTS "Users manage their own producto_ranking" ON public.producto_ranking;
create policy "Authenticated users manage producto_ranking"
  on public.producto_ranking for all to authenticated
  using (true) with check (true);

DROP TRIGGER IF EXISTS on_producto_ranking_updated ON public.producto_ranking;
create trigger on_producto_ranking_updated
  before update on public.producto_ranking
  for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 8. App Configurations
-- ==========================================

create table if not exists public.configuraciones (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  pesos jsonb,
  event_settings jsonb,
  app_settings jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.configuraciones enable row level security;

DROP POLICY IF EXISTS "Users manage their own configuraciones" ON public.configuraciones;
create policy "Users manage their own configuraciones"
  on public.configuraciones for all
  using ( auth.uid() = user_id OR public.get_my_role() = 'admin' );

DROP TRIGGER IF EXISTS on_configuraciones_updated ON public.configuraciones;
create trigger on_configuraciones_updated
  before update on public.configuraciones
  for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 8. Functions
-- ==========================================

-- Security-definer helper: returns the calling user's role without RLS recursion.
-- Used in RLS policies instead of auth.jwt() ->> 'role' (which requires a custom
-- JWT claim hook that is not enabled by default).
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public, pg_catalog
as $$
  select role::text from public.profiles where id = auth.uid();
$$;

-- Auto-create a profile row when a new auth user is inserted
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user'::user_role)
  on conflict (id) do nothing;
  return new;
end;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to validate invite code without needing full read access to invite_codes table
-- search_path is pinned to prevent search_path hijacking (SECURITY DEFINER safety).
create or replace function public.validate_invite_code(code_str text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  is_valid boolean;
begin
  select exists (
    select 1
    from public.invite_codes
    where code      = code_str
      and used_by   is null
      and expires_at > now()
  ) into is_valid;
  return is_valid;
end;
$$;

-- Function to consume invite code by the authenticated user
-- search_path is pinned to prevent search_path hijacking (SECURITY DEFINER safety).
create or replace function public.use_invite_code(code_str text)
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  update public.invite_codes
  set used_by = auth.uid()
  where code    = code_str
    and used_by is null
    and expires_at > now();
end;
$$;

-- For signup flow when session may be null (email confirmation required).
-- Accepts new_user_id explicitly; verifies user was created within last 5 minutes.
create or replace function public.use_invite_code_on_signup(
  code_str text,
  new_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_catalog
as $$
declare
  user_created_at timestamptz;
begin
  select created_at into user_created_at
  from auth.users where id = new_user_id;
  if user_created_at is null then
    raise exception 'invalid user';
  end if;
  if user_created_at < now() - interval '5 minutes' then
    raise exception 'user must be newly created to consume invite code';
  end if;

  update public.invite_codes
  set used_by = new_user_id
  where code      = code_str
    and used_by   is null
    and expires_at > now();
end;
$$;
