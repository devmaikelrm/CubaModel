-- =========================================================
-- Backend schema for CubaModel (Supabase)
-- Source: provided by project owner
-- =========================================================
-- 0) Extensiones
-- =========================================================
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- =========================================================
-- 1) Tabla de admins (lista blanca por email) + RLS
-- =========================================================
create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Por defecto: nadie autenticado puede leer/escribir
drop policy if exists admins_noop on public.admins;
create policy admins_noop
  on public.admins
  for all
  to authenticated
  using (false)
  with check (false);

-- (Opcional) quienes ya son admin pueden LEER la lista
drop policy if exists admins_selfview on public.admins;
create policy admins_selfview
  on public.admins
  for select
  to authenticated
  using (
    exists (
      select 1 from public.admins a
      where a.email = (auth.jwt() ->> 'email')
    )
  );

-- (Opcional) permitir que un admin agregue otro admin
drop policy if exists admins_manage_by_admin on public.admins;
create policy admins_manage_by_admin
  on public.admins
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admins a
      where a.email = (auth.jwt() ->> 'email')
    )
  );

-- Normaliza email a minúsculas
create or replace function public.normalize_admin_email()
returns trigger language plpgsql as $$
begin
  if new.email is not null then
    new.email := lower(new.email);
  end if;
  return new;
end$$;

drop trigger if exists trg_admins_lower on public.admins;
create trigger trg_admins_lower
before insert or update on public.admins
for each row execute function public.normalize_admin_email();

-- =========================================================
-- 2) Tabla principal: modelos_cuba (con 'search' normal + trigger)
-- =========================================================
create table if not exists public.modelos_cuba (
  id           bigserial primary key,
  modelo       text        not null check (length(btrim(modelo)) > 0),
  operador     text        not null default 'ETECSA',
  provincia    text        not null,
  bandas       text[]      not null default '{}',  -- {'2G','3G','4G','5G'}
  revisado     boolean     not null default false,
  created_at   timestamptz not null default now(),
  created_by   uuid        not null default auth.uid(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid,
  -- 'search' como columna normal (no GENERATED); la mantiene un trigger
  search       tsvector
);

-- Índices útiles
create index if not exists modelos_cuba_bandas_gin      on public.modelos_cuba using gin (bandas);
create index if not exists modelos_cuba_prov_idx        on public.modelos_cuba (provincia);
create index if not exists modelos_cuba_revisado_idx    on public.modelos_cuba (revisado);
create index if not exists modelos_cuba_created_by_idx  on public.modelos_cuba (created_by);
create index if not exists modelos_cuba_modelo_trgm     on public.modelos_cuba using gin (modelo gin_trgm_ops);

-- =========================================================
-- 2.1) Validaciones (sin subqueries en CHECK)
-- =========================================================

-- Función IMMUTABLE para detectar duplicados en text[]
create or replace function public.array_text_has_dupes(arr text[])
returns boolean
language sql
immutable
as $$
  -- true si hay duplicados; false si no
  select exists (
    select 1
    from unnest(coalesce(arr, '{}')) as t(v)
    group by v
    having count(*) > 1
  );
$$;

-- Bandas válidas y sin duplicados
alter table public.modelos_cuba
  drop constraint if exists chk_bandas_validas;

alter table public.modelos_cuba
  add constraint chk_bandas_validas
  check (
    bandas <@ array['2G','3G','4G','5G']::text[]
    and not public.array_text_has_dupes(bandas)
  );

-- Provincias válidas (ajústalas si necesitas)
alter table public.modelos_cuba
  drop constraint if exists chk_provincia_valida;

alter table public.modelos_cuba
  add constraint chk_provincia_valida
  check ( provincia in (
    'La Habana','Santiago de Cuba','Camagüey','Holguín','Villa Clara','Matanzas',
    'Cienfuegos','Pinar del Río','Sancti Spíritus','Ciego de Ávila','Las Tunas',
    'Granma','Guantánamo','Artemisa','Mayabeque','Isla de la Juventud'
  ));

-- =========================================================
-- 2.2) Triggers de mantenimiento
-- =========================================================

-- updated_at / updated_by
create or replace function public.set_updated_cols()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  begin
    new.updated_by := auth.uid();
  exception when others then
    new.updated_by := null;
  end;
  return new;
end$$;

drop trigger if exists trg_modelos_cuba_updated on public.modelos_cuba;
create trigger trg_modelos_cuba_updated
before update on public.modelos_cuba
for each row execute function public.set_updated_cols();

-- Normalización de 'modelo'
create or replace function public.normalize_modelo()
returns trigger language plpgsql as $$
begin
  if new.modelo is not null then
    new.modelo := btrim(new.modelo);
  end if;
  return new;
end$$;

drop trigger if exists trg_modelos_cuba_normalize on public.modelos_cuba;
create trigger trg_modelos_cuba_normalize
before insert or update on public.modelos_cuba
for each row execute function public.normalize_modelo();

-- 'search' mantenido por trigger (usa unaccent; no es GENERATED)
create or replace function public.set_search_tsv()
returns trigger
language plpgsql
as $$
begin
  new.search := to_tsvector('simple', unaccent(coalesce(new.modelo,'')));
  return new;
end;
$$;

drop trigger if exists trg_modelos_cuba_search on public.modelos_cuba;
create trigger trg_modelos_cuba_search
before insert or update of modelo
on public.modelos_cuba
for each row
execute function public.set_search_tsv();

-- Inicializa 'search' para filas ya existentes
update public.modelos_cuba
set search = to_tsvector('simple', unaccent(coalesce(modelo,'')))
where search is null;

-- Índice GIN sobre 'search'
create index if not exists modelos_cuba_search_idx
  on public.modelos_cuba using gin (search);

-- =========================================================
-- 3) RLS en modelos_cuba
-- =========================================================
alter table public.modelos_cuba enable row level security;

-- SELECT: cualquier autenticado
drop policy if exists modelos_cuba_select on public.modelos_cuba;
create policy modelos_cuba_select
  on public.modelos_cuba
  for select
  to authenticated
  using (true);

-- INSERT: autenticados; dueño = auth.uid()
drop policy if exists modelos_cuba_insert on public.modelos_cuba;
create policy modelos_cuba_insert
  on public.modelos_cuba
  for insert
  to authenticated
  with check (created_by = auth.uid());

-- UPDATE propio
drop policy if exists modelos_cuba_update_own on public.modelos_cuba;
create policy modelos_cuba_update_own
  on public.modelos_cuba
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- UPDATE admin (email en tabla admins)
drop policy if exists modelos_cuba_update_admin on public.modelos_cuba;
create policy modelos_cuba_update_admin
  on public.modelos_cuba
  for update
  to authenticated
  using (
    exists (
      select 1 from public.admins a
      where a.email = (auth.jwt() ->> 'email')
    )
  )
  with check (true);

-- DELETE solo admin
drop policy if exists modelos_cuba_delete_admin on public.modelos_cuba;
create policy modelos_cuba_delete_admin
  on public.modelos_cuba
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.admins a
      where a.email = (auth.jwt() ->> 'email')
    )
  );

-- =========================================================
-- 4) Vistas (KPIs) + Grants
-- =========================================================
create or replace view public.v_modelos_cuba_total as
select count(*)::bigint as total from public.modelos_cuba;

create or replace view public.v_modelos_cuba_revisados as
select count(*)::bigint as revisados from public.modelos_cuba where revisado = true;

create or replace view public.v_modelos_cuba_provincias as
select count(distinct provincia)::bigint as provincias from public.modelos_cuba;

grant select on public.v_modelos_cuba_total, public.v_modelos_cuba_revisados, public.v_modelos_cuba_provincias
  to authenticated;

-- =========================================================
-- 5) Permisos mínimos (además de RLS)
-- =========================================================
grant select, insert, update, delete on public.modelos_cuba to authenticated;
revoke all on public.modelos_cuba from anon;

-- No conceder permisos sobre 'admins' a anon ni authenticated
revoke all on public.admins from authenticated, anon;

-- =========================================================
-- 6) Función helper de búsqueda full-text
-- =========================================================
create or replace function public.buscar_modelos(q text)
returns setof public.modelos_cuba
language sql
stable
as $$
  select *
  from public.modelos_cuba
  where search @@ websearch_to_tsquery('simple', unaccent(coalesce(q,'')))
  order by ts_rank(search, websearch_to_tsquery('simple', unaccent(coalesce(q,'')))) desc, id desc
  limit 100
$$;

grant execute on function public.buscar_modelos(text) to authenticated;

-- =========================================================
-- 7) Semilla: agregar admin inicial (ajusta tu correo)
-- =========================================================
insert into public.admins (email)
values ('maikelreyesmorales95@gmail.com')
on conflict (email) do nothing;

-- =========================================================
-- 8) (Opcional) Datos de ejemplo
-- =========================================================
-- insert into public.modelos_cuba (modelo, operador, provincia, bandas, revisado)
-- values
--   ('Galaxy S21','ETECSA','La Habana',    array['2G','3G','4G','5G'], true),
--   ('Poco X6',   'ETECSA','Camagüey',     array['2G','3G','4G','5G'], false),
--   ('Redmi 13C', 'ETECSA','Holguín',      array['2G','3G','4G'],      true),
--   ('iPhone 12', 'ETECSA','Santiago de Cuba', array['3G','4G','5G'],  false);

