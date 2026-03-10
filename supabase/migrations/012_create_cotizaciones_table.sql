-- ==========================================
-- Quote Versions (Cotizaciones) Table Migration
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
