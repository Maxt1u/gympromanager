import { createClient } from '@/lib/supabase/server';
import { actualizarMiembro, eliminarMiembro } from '../actions';
import { formatCOP, formatFecha } from '@/lib/utils';
import { notFound } from 'next/navigation';

export default async function FichaMiembroPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { error?: string; ok?: string };
}) {
  const supabase = createClient();
  const { data: miembro } = await supabase.from('miembros').select('*').eq('id', params.id).single();
  if (!miembro) notFound();

  const [{ data: tipos }, { data: pagos }, { data: asistencias }] = await Promise.all([
    supabase.from('tipos_membresia').select('id, nombre, precio').eq('estado', 'Activo'),
    supabase
      .from('pagos')
      .select('id, concepto, monto, fecha_pago, metodo_pago')
      .eq('id_miembro', params.id)
      .order('fecha_pago', { ascending: false })
      .limit(10),
    supabase
      .from('asistencias')
      .select('id, fecha_hora_ingreso, fecha_hora_salida')
      .eq('id_miembro', params.id)
      .order('fecha_hora_ingreso', { ascending: false })
      .limit(10)
  ]);

  const actualizar = actualizarMiembro.bind(null, params.id);
  const eliminar = eliminarMiembro.bind(null, params.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {miembro.nombres} {miembro.apellidos}
      </h1>
      {searchParams.error && (
        <p className="rounded bg-red-900/50 p-2 text-sm text-red-200">{searchParams.error}</p>
      )}
      {searchParams.ok && (
        <p className="rounded bg-green-900/50 p-2 text-sm text-green-200">{searchParams.ok}</p>
      )}

      <section className="card">
        <h2 className="mb-3 font-semibold">Editar ficha</h2>
        <form action={actualizar} className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="label">DNI</label>
            <input name="dni" defaultValue={miembro.dni} className="input" />
          </div>
          <div>
            <label className="label">Nombres</label>
            <input name="nombres" defaultValue={miembro.nombres} className="input" />
          </div>
          <div>
            <label className="label">Apellidos</label>
            <input name="apellidos" defaultValue={miembro.apellidos} className="input" />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input name="telefono" defaultValue={miembro.telefono ?? ''} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" defaultValue={miembro.email ?? ''} className="input" />
          </div>
          <div>
            <label className="label">Estado</label>
            <select name="estado" defaultValue={miembro.estado} className="input">
              <option>Activo</option>
              <option>Inactivo</option>
              <option>Suspendido</option>
            </select>
          </div>
          <div>
            <label className="label">Membresía actual</label>
            <select name="id_tipo_membresia" defaultValue={miembro.id_tipo_membresia ?? ''} className="input">
              <option value="">—</option>
              {(tipos ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} — {formatCOP(t.precio)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Inicio membresía</label>
            <input
              type="date"
              name="fecha_inicio_membresia"
              defaultValue={miembro.fecha_inicio_membresia ?? ''}
              className="input"
            />
          </div>
          <div>
            <label className="label">Fin membresía</label>
            <input
              type="date"
              name="fecha_fin_membresia"
              defaultValue={miembro.fecha_fin_membresia ?? ''}
              className="input"
            />
          </div>
          <div className="md:col-span-3">
            <label className="label">Notas</label>
            <textarea name="notas" defaultValue={miembro.notas ?? ''} className="input" rows={2} />
          </div>
          <div className="flex gap-2 md:col-span-3">
            <button className="btn-primary" type="submit">
              Guardar
            </button>
            <button formAction={eliminar} className="btn-secondary" type="submit">
              Eliminar
            </button>
          </div>
        </form>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 font-semibold">Últimos pagos</h2>
          {(pagos ?? []).length === 0 ? (
            <p className="text-sm text-slate-300">Sin pagos.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {(pagos ?? []).map((p) => (
                <li key={p.id} className="flex justify-between border-b border-white/10 pb-1">
                  <span>
                    {p.concepto} · {p.metodo_pago}
                    <br />
                    <span className="text-xs text-slate-400">{formatFecha(p.fecha_pago)}</span>
                  </span>
                  <span className="font-semibold">{formatCOP(p.monto)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2 className="mb-3 font-semibold">Últimas asistencias</h2>
          {(asistencias ?? []).length === 0 ? (
            <p className="text-sm text-slate-300">Sin asistencias.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {(asistencias ?? []).map((a) => (
                <li key={a.id} className="border-b border-white/10 pb-1">
                  Ingreso: {formatFecha(a.fecha_hora_ingreso)}
                  <br />
                  <span className="text-xs text-slate-400">
                    Salida: {a.fecha_hora_salida ? formatFecha(a.fecha_hora_salida) : 'En gimnasio'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
