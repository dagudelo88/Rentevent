-- Enable uuid-ossp extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Profiles & Roles
-- ==========================================

create type user_role as enum ('admin', 'user');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role user_role default 'user'::user_role not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile."
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Admins can view all profiles."
  on public.profiles for select
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Admins can update any profile."
  on public.profiles for update
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create policy "Admins can insert profiles."
  on public.profiles for insert
  with check ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

-- Trigger to handle updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 2. Invite Codes (Admin Flow)
-- ==========================================

create table public.invite_codes (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  created_by uuid references public.profiles(id) on delete set null,
  used_by uuid references public.profiles(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz default now() not null
);

alter table public.invite_codes enable row level security;

create policy "Admins can manage invite codes."
  on public.invite_codes for all
  using ( exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

-- ==========================================
-- 3. Inventory (Unificando wedding_inventory_v8 y wedding_real_inventory_v2)
-- ==========================================

create table public.inventario (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
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

create policy "Users manage their own inventario"
  on public.inventario for all
  using ( auth.uid() = user_id OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create trigger on_inventario_updated
  before update on public.inventario
  for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 4. Clients
-- ==========================================

create table public.clientes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  nombre text not null,
  tipo text not null,
  documento text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.clientes enable row level security;

create policy "Users manage their own clientes"
  on public.clientes for all
  using ( auth.uid() = user_id OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create trigger on_clientes_updated
  before update on public.clientes
  for each row execute procedure public.handle_updated_at();

create table public.contactos_cliente (
  id uuid default uuid_generate_v4() primary key,
  cliente_id uuid references public.clientes(id) on delete cascade not null,
  nombre text not null,
  telefono text,
  email text,
  es_principal boolean default false not null
);

alter table public.contactos_cliente enable row level security;

create policy "Users manage their own contactos_cliente"
  on public.contactos_cliente for all
  using (
    exists (
      select 1 from public.clientes c 
      where c.id = cliente_id and (c.user_id = auth.uid() OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
    )
  );

-- ==========================================
-- 5. Events
-- ==========================================

create table public.eventos (
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

create policy "Users manage their own eventos"
  on public.eventos for all
  using ( auth.uid() = user_id OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create trigger on_eventos_updated
  before update on public.eventos
  for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 6. Event Items
-- ==========================================

create table public.evento_items (
  id uuid default uuid_generate_v4() primary key,
  evento_id uuid references public.eventos(id) on delete cascade not null,
  item_id uuid references public.inventario(id) on delete restrict not null,
  cantidad integer not null default 1,
  precio_unitario numeric not null default 0
);

alter table public.evento_items enable row level security;

create policy "Users manage their own evento_items"
  on public.evento_items for all
  using (
    exists (
      select 1 from public.eventos e 
      where e.id = evento_id and (e.user_id = auth.uid() OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
    )
  );

-- ==========================================
-- 7. App Configurations
-- ==========================================

create table public.configuraciones (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  pesos jsonb,
  event_settings jsonb,
  app_settings jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.configuraciones enable row level security;

create policy "Users manage their own configuraciones"
  on public.configuraciones for all
  using ( auth.uid() = user_id OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create trigger on_configuraciones_updated
  before update on public.configuraciones
  for each row execute procedure public.handle_updated_at();

-- ==========================================
-- 8. Functions
-- ==========================================

-- Function to validate invite code without needing full read access to invite_codes table
create or replace function public.validate_invite_code(code_str text)
returns boolean
language plpgsql security definer
as $$
declare
  is_valid boolean;
begin
  select exists (
    select 1 
    from public.invite_codes 
    where code = code_str 
      and used_by is null 
      and expires_at > now()
  ) into is_valid;
  return is_valid;
end;
$$;

-- Function to consume invite code by the authenticated user
create or replace function public.use_invite_code(code_str text)
returns void
language plpgsql security definer
as $$
begin
  update public.invite_codes
  set used_by = auth.uid()
  where code = code_str 
    and used_by is null 
    and expires_at > now();
end;
$$;
