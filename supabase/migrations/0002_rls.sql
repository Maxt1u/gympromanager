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
