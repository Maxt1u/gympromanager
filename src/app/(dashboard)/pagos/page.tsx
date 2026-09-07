import { createClient } from '@/lib/supabase/server';
import { crearPago } from './actions';
import { formatCOP, formatFecha } from '@/lib/utils';

export default async function PagosPage({
  searchParams
}: {
  searchParams: { error?: string; ok?: string; desde?: string; hasta?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from('pagos')
    .select('id, concepto, monto, fecha_pago, fecha_vencimiento, metodo_pago, miembros!inner(nombres, apellidos, dni)')
    .order('fecha_pago', { ascending: false })
    .limit(100);

  if (searchParams.desde) query = query.gte('fecha_pago', searchParams.desde);
  if (searchParams.hasta) query = query.lte('fecha_pago', searchParams.hasta);

  const [{ data: pagos }, { data: miembros }, { data: tipos }] = await Promise.all([
    query,
    supabase.from('miembros').select('id, nombres, apellidos, dni').eq('estado', 'Activo').limit(200),
    supabase.from('tipos_membresia').select('id, nombre, precio').eq('estado', 'Activo')
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pagos</h1>
      {searchParams.error && (
        <p className="rounded bg-red-900/50 p-2 text-sm text-red-200">{searchParams.error}</p>
      )}
      {searchParams.ok && (
        <p className="rounded bg-green-900/50 p-2 text-sm text-green-200">{searchParams.ok}</p>
      )}

      <section className="card">
        <h2 className="mb-3 font-semibold">Registrar pago</h2>
        <form action={crearPago} className="grid gap-3 md:grid-cols-3">
          <div>
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
            <label className="label">Membresía</label>
            <select name="id_tipo_membresia" className="input">
              <option value="">—</option>
              {(tipos ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} — {formatCOP(t.precio)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Concepto *</label>
            <input name="concepto" required placeholder="Mensualidad…" className="input" />
          </div>
          <div>
            <label className="label">Monto *</label>
            <input name="monto" type="number" min="1" step="0.01" required className="input" />
          </div>
          <div>
            <label className="label">Método</label>
            <select name="metodo_pago" className="input" defaultValue="Efectivo">
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
              <option>Otro</option>
            </select>
          </div>
          <div>
            <label className="label">Vencimiento (auto si eliges membresía)</label>
            <input type="date" name="fecha_vencimiento" className="input" />
          </div>
          <div className="md:col-span-3">
            <button className="btn-primary" type="submit">
              Registrar
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">Historial</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Miembro</th>
                <th>Concepto</th>
                <th>Método</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {(pagos ?? []).map((p) => (
                <tr key={p.id}>
                  <td>{formatFecha(p.fecha_pago)}</td>
                  <td>
                    {(p as unknown as { miembros?: { nombres?: string; apellidos?: string } }).miembros?.nombres}{' '}
                    {(p as unknown as { miembros?: { nombres?: string; apellidos?: string } }).miembros?.apellidos}
                  </td>
                  <td>{p.concepto}</td>
                  <td>{p.metodo_pago}</td>
                  <td className="font-semibold">{formatCOP(p.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
