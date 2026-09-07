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
