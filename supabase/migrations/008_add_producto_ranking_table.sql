-- ============================================================
-- Migration 008: Add producto_ranking table
-- Root cause: Product Ranking was incorrectly writing to the
-- inventario table, which expects UUID primary keys. Ranking
-- also has fields (image_url, purchase_link) that inventory
-- does not, confirming they are separate domain entities.
-- ============================================================

create table if not exists public.producto_ranking (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references public.profiles(id) on delete cascade not null,
  nombre              text not null,
  categoria           text not null,
  costo               numeric default 0 not null,
  precio_alquiler     numeric default 0 not null,
  costo_transporte    numeric default 0 not null,
  -- Qualitative scoring metrics (1-10 scale)
  rotacion            integer default 5 not null,
  almacenamiento      integer default 5 not null,
  facilidad_transporte integer default 5 not null,
  durabilidad         integer default 5 not null,
  -- Reference quantities / historical data
  cantidad            integer default 0 not null,
  veces_alquilado     integer default 0 not null,
  ingresos_historicos numeric default 0 not null,
  -- Ranking-specific metadata (not present in inventory)
  image_url           text,
  purchase_link       text,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

alter table public.producto_ranking enable row level security;

DROP POLICY IF EXISTS "Users manage their own producto_ranking" ON public.producto_ranking;
create policy "Users manage their own producto_ranking"
  on public.producto_ranking for all
  using ( auth.uid() = user_id OR public.get_my_role() = 'admin' );

DROP TRIGGER IF EXISTS on_producto_ranking_updated ON public.producto_ranking;
create trigger on_producto_ranking_updated
  before update on public.producto_ranking
  for each row execute procedure public.handle_updated_at();
