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
