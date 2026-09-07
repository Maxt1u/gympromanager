import { createClient } from '@/lib/supabase/server';
import { registrarIngreso, registrarSalida } from './actions';
import { formatFecha } from '@/lib/utils';

export default async function AsistenciasPage({
  searchParams
}: {
  searchParams: { error?: string; ok?: string };
}) {
  const supabase = createClient();
  const hoy = new Date().toISOString().slice(0, 10);

  const [{ data: hoyLista }, { data: miembros }] = await Promise.all([
    supabase
      .from('asistencias')
      .select('id, fecha_hora_ingreso, fecha_hora_salida, tipo_visita, miembros!inner(nombres, apellidos, dni)')
      .gte('fecha_hora_ingreso', `${hoy}T00:00:00`)
      .order('fecha_hora_ingreso', { ascending: false })
      .limit(200),
    supabase.from('miembros').select('id, nombres, apellidos, dni').eq('estado', 'Activo').limit(200)
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Asistencias de hoy</h1>
      {searchParams.error && (
        <p className="rounded bg-red-900/50 p-2 text-sm text-red-200">{searchParams.error}</p>
      )}
      {searchParams.ok && (
        <p className="rounded bg-green-900/50 p-2 text-sm text-green-200">{searchParams.ok}</p>
      )}

      <section className="card">
        <h2 className="mb-3 font-semibold">Registrar ingreso</h2>
        <form action={registrarIngreso} className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="label">Miembro *</label>
            <select name="id_miembro" required className="input">
              <option value="">—</option>
              {(miembros ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombres} {m.apellidos} ({m.dni})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Tipo visita</label>
            <input name="tipo_visita" defaultValue="Regular" className="input" />
          </div>
          <button className="btn-primary" type="submit">
            Ingreso
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">En gimnasio / historial hoy ({hoyLista?.length ?? 0})</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Miembro</th>
                <th>Ingreso</th>
                <th>Salida</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {(hoyLista ?? []).map((a) => (
                <tr key={a.id}>
                  <td>
                    {(a as unknown as { miembros?: { nombres?: string; apellidos?: string; dni?: string } }).miembros?.nombres}{' '}
                    {(a as unknown as { miembros?: { nombres?: string; apellidos?: string; dni?: string } }).miembros?.apellidos}{' '}
                    <span className="text-xs text-slate-400">
                      ({(a as unknown as { miembros?: { dni?: string } }).miembros?.dni})
                    </span>
                  </td>
                  <td>{formatFecha(a.fecha_hora_ingreso)}</td>
                  <td>{a.fecha_hora_salida ? formatFecha(a.fecha_hora_salida) : 'En gimnasio'}</td>
                  <td>
                    {!a.fecha_hora_salida && (
                      <form action={registrarSalida.bind(null, a.id)}>
                        <button className="btn-secondary" type="submit">
                          Salida
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
