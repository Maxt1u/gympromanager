-- GymProManager MVP — 0001_schema.sql
-- Réplica Postgres de ConectorBaseDatos.inicializarEsquema() (SQLite) — solo tablas MVP
-- Ejecutar con: supabase db push  o pegar en SQL Editor

-- Extensiones
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: reemplaza usuarios_sistema (el password lo gestiona auth.users)
-- Rol: 'Admin' | 'Empleado' | 'Instructor' (mismo vocabulario que Java)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  nombre_completo text,
  rol text not null default 'Empleado' check (rol in ('Admin', 'Empleado', 'Instructor')),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- tipos_membresia (desde tipos_membresia SQLite)
-- ---------------------------------------------------------------------------
create table if not exists public.tipos_membresia (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  descripcion text,
  precio numeric(12, 2) not null check (precio >= 0),
  duracion_dias integer not null check (duracion_dias > 0),
  estado text not null default 'Activo' check (estado in ('Activo', 'Inactivo')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- miembros (desde miembros SQLite, INTEGER PK -> uuid)
-- ---------------------------------------------------------------------------
create table if not exists public.miembros (
  id uuid primary key default gen_random_uuid(),
  dni text not null unique,
  nombres text not null,
  apellidos text not null,
  fecha_nacimiento date,
  genero text check (genero is null or genero in ('M', 'F', 'Otro')),
  telefono text,
  email text unique,
  direccion text,
  fecha_registro date not null default current_date,
  peso_inicial_kg numeric(6, 2),
  estatura_cm numeric(6, 2),
  foto_url text,
  enfermedades text,
  seguro text,
  contacto_emergencia_nombre text,
  contacto_emergencia_telefono text,
  estado text not null default 'Activo' check (estado in ('Activo', 'Inactivo', 'Suspendido')),
  id_tipo_membresia uuid references public.tipos_membresia (id) on delete set null,
  fecha_inicio_membresia date,
  fecha_fin_membresia date,
  notas text,
  created_at timestamptz not null default now(),
  constraint chk_fechas_membresia check (
    fecha_fin_membresia is null or fecha_inicio_membresia is null
    or fecha_fin_membresia >= fecha_inicio_membresia
  )
);

-- ---------------------------------------------------------------------------
-- pagos (desde pagos SQLite)
-- concepto = concepto TEXT NOT NULL en Java; fecha_vencimiento calculada en app
-- ---------------------------------------------------------------------------
create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  id_miembro uuid not null references public.miembros (id) on delete restrict,
  id_tipo_membresia uuid references public.tipos_membresia (id) on delete set null,
  concepto text not null,
  monto numeric(12, 2) not null check (monto > 0),
  fecha_pago timestamptz not null default now(),
  fecha_vencimiento date,
  metodo_pago text not null default 'Efectivo'
    check (metodo_pago in ('Efectivo', 'Tarjeta', 'Transferencia', 'Otro')),
  referencia text,
  notas text,
  registrado_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- asistencias (desde asistencias SQLite)
-- ---------------------------------------------------------------------------
create table if not exists public.asistencias (
  id uuid primary key default gen_random_uuid(),
  id_miembro uuid not null references public.miembros (id) on delete restrict,
  fecha_hora_ingreso timestamptz not null default now(),
  fecha_hora_salida timestamptz,
  tipo_visita text not null default 'Regular',
  created_at timestamptz not null default now(),
  constraint chk_salida_posterior check (
    fecha_hora_salida is null or fecha_hora_salida >= fecha_hora_ingreso
  )
);

-- Índices (los pedidos en el prompt + búsquedas de la app)
create index if not exists idx_miembros_dni on public.miembros (dni);
create index if not exists idx_miembros_nombre on public.miembros (nombres, apellidos);
create index if not exists idx_miembros_estado on public.miembros (estado);
create index if not exists idx_miembros_fin_membresia on public.miembros (fecha_fin_membresia);
create index if not exists idx_pagos_miembro on public.pagos (id_miembro);
create index if not exists idx_pagos_fecha on public.pagos (fecha_pago);
create index if not exists idx_asistencias_miembro on public.asistencias (id_miembro);
create index if not exists idx_asistencias_ingreso on public.asistencias (fecha_hora_ingreso);

-- Trigger: auto-crear profile al registrarse un usuario (rol Inactivo hasta que Admin lo active)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, nombre_completo, rol, activo)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'nombre_completo', new.email), 'Instructor', false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
-- GymProManager MVP — 0002_rls.sql
-- Roles: Admin full | Empleado CRUD miembros/pagos/asistencias/tipos (sin borrar profiles) | Instructor lectura
-- Requiere 0001_schema.sql aplicado.

-- Activar RLS
alter table public.profiles enable row level security;
alter table public.tipos_membresia enable row level security;
alter table public.miembros enable row level security;
alter table public.pagos enable row level security;
alter table public.asistencias enable row level security;

-- Helper: rol del usuario actual (bypass RLS con security definer para evitar recursión)
create or replace function public.mi_rol()
returns text
language sql
stable
security definer set search_path = public
as $$
  select rol from public.profiles where id = auth.uid();
$$;

-- ============================ profiles ============================
-- Cada usuario ve su propio profile; Admin gestiona todos.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.mi_rol() = 'Admin');

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.mi_rol() = 'Admin')
  with check (id = auth.uid() or public.mi_rol() = 'Admin');

-- Solo Admin crea/borra profiles (el insert por registro lo hace el trigger con definer)
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all to authenticated
  using (public.mi_rol() = 'Admin')
  with check (public.mi_rol() = 'Admin');

-- ============================ tipos_membresia ============================
drop policy if exists "tipos_read_all" on public.tipos_membresia;
create policy "tipos_read_all" on public.tipos_membresia
  for select to authenticated using (true);

drop policy if exists "tipos_write_admin_empleado" on public.tipos_membresia;
create policy "tipos_write_admin_empleado" on public.tipos_membresia
  for all to authenticated
  using (public.mi_rol() in ('Admin', 'Empleado'))
  with check (public.mi_rol() in ('Admin', 'Empleado'));

-- ============================ miembros ============================
drop policy if exists "miembros_read_all" on public.miembros;
create policy "miembros_read_all" on public.miembros
  for select to authenticated using (true);

drop policy if exists "miembros_insert_staff" on public.miembros;
create policy "miembros_insert_staff" on public.miembros
  for insert to authenticated
  with check (public.mi_rol() in ('Admin', 'Empleado'));

drop policy if exists "miembros_update_staff" on public.miembros;
create policy "miembros_update_staff" on public.miembros
  for update to authenticated
  using (public.mi_rol() in ('Admin', 'Empleado'))
  with check (public.mi_rol() in ('Admin', 'Empleado'));

drop policy if exists "miembros_delete_admin" on public.miembros;
create policy "miembros_delete_admin" on public.miembros
  for delete to authenticated
  using (public.mi_rol() = 'Admin');

-- ============================ pagos ============================
drop policy if exists "pagos_read_staff" on public.pagos;
create policy "pagos_read_staff" on public.pagos
  for select to authenticated
  using (public.mi_rol() in ('Admin', 'Empleado', 'Instructor'));

drop policy if exists "pagos_insert_staff" on public.pagos;
create policy "pagos_insert_staff" on public.pagos
  for insert to authenticated
  with check (public.mi_rol() in ('Admin', 'Empleado'));

drop policy if exists "pagos_update_staff" on public.pagos;
create policy "pagos_update_staff" on public.pagos
  for update to authenticated
  using (public.mi_rol() in ('Admin', 'Empleado'))
  with check (public.mi_rol() in ('Admin', 'Empleado'));

drop policy if exists "pagos_delete_admin" on public.pagos;
create policy "pagos_delete_admin" on public.pagos
  for delete to authenticated
  using (public.mi_rol() = 'Admin');

-- ============================ asistencias ============================
drop policy if exists "asistencias_read_all" on public.asistencias;
create policy "asistencias_read_all" on public.asistencias
  for select to authenticated using (true);

drop policy if exists "asistencias_insert_staff" on public.asistencias;
create policy "asistencias_insert_staff" on public.asistencias
  for insert to authenticated
  with check (public.mi_rol() in ('Admin', 'Empleado'));

drop policy if exists "asistencias_update_staff" on public.asistencias;
create policy "asistencias_update_staff" on public.asistencias
  for update to authenticated
  using (public.mi_rol() in ('Admin', 'Empleado'))
  with check (public.mi_rol() in ('Admin', 'Empleado'));

drop policy if exists "asistencias_delete_admin" on public.asistencias;
create policy "asistencias_delete_admin" on public.asistencias
  for delete to authenticated
  using (public.mi_rol() = 'Admin');

-- ============================ Storage: bucket fotos-miembros ============================
-- Crear con: insert into storage.buckets (id, name, public) values ('fotos-miembros','fotos-miembros', true)
-- on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
values ('fotos-miembros', 'fotos-miembros', true)
on conflict (id) do update set public = true;

drop policy if exists "fotos_read_public" on storage.objects;
create policy "fotos_read_public" on storage.objects
  for select using (bucket_id = 'fotos-miembros');

drop policy if exists "fotos_write_staff" on storage.objects;
create policy "fotos_write_staff" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos-miembros');

drop policy if exists "fotos_update_staff" on storage.objects;
create policy "fotos_update_staff" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos-miembros');

drop policy if exists "fotos_delete_admin" on storage.objects;
create policy "fotos_delete_admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos-miembros' and public.mi_rol() = 'Admin');
-- GymProManager MVP — seed.sql
-- Mismos precios que ConectorBaseDatos.java (SQLite): 80000 / 220000 / 750000 / 10000

insert into public.tipos_membresia (nombre, descripcion, precio, duracion_dias, estado)
values
  ('Mensual Regular', 'Acceso completo por 30 días.', 80000.00, 30, 'Activo'),
  ('Trimestral Gold', 'Acceso completo por 90 días con descuento.', 220000.00, 90, 'Activo'),
  ('Anual Premium', 'Acceso completo por 365 días, máximo ahorro.', 750000.00, 365, 'Activo'),
  ('Visita Diaria', 'Acceso por un solo día.', 10000.00, 1, 'Activo')
on conflict (nombre) do update set
  descripcion = excluded.descripcion,
  precio = excluded.precio,
  duracion_dias = excluded.duracion_dias,
  estado = excluded.estado;
