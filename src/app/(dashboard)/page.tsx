import { createClient } from '@/lib/supabase/server';
import { formatCOP } from '@/lib/utils';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = createClient();

  const hoy = new Date().toISOString().slice(0, 10);
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const en7dias = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const [{ count: activos }, { count: asistHoy }, { data: pagosMes }, { data: vencen }] =
    await Promise.all([
      supabase.from('miembros').select('*', { count: 'exact', head: true }).eq('estado', 'Activo'),
      supabase
        .from('asistencias')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_hora_ingreso', `${hoy}T00:00:00`),
      supabase.from('pagos').select('monto').gte('fecha_pago', inicioMes),
      supabase
        .from('miembros')
        .select('id, nombres, apellidos, dni, fecha_fin_membresia')
        .eq('estado', 'Activo')
        .lte('fecha_fin_membresia', en7dias)
        .order('fecha_fin_membresia', { ascending: true })
        .limit(10)
    ]);

  const totalMes = (pagosMes ?? []).reduce((acc, p) => acc + Number(p.monto ?? 0), 0);

  const cards = [
    { titulo: 'Miembros activos', valor: String(activos ?? 0), href: '/miembros' },
    { titulo: 'Recaudo del mes', valor: formatCOP(totalMes), href: '/pagos' },
    { titulo: 'Asistencias hoy', valor: String(asistHoy ?? 0), href: '/asistencias' },
    { titulo: 'Por vencer (7 días)', valor: String(vencen?.length ?? 0), href: '/miembros' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel principal</h1>
        <p className="text-sm text-slate-300">Resumen diario del gimnasio.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.titulo} href={c.href} className="card hover:border-[#FF7043]">
            <p className="text-xs uppercase tracking-wide text-slate-300">{c.titulo}</p>
            <p className="mt-2 text-2xl font-bold">{c.valor}</p>
          </Link>
        ))}
      </div>

      <section className="card">
        <h2 className="mb-3 font-semibold">Membresías próximas a vencer</h2>
        {!vencen || vencen.length === 0 ? (
          <p className="text-sm text-slate-300">Sin vencimientos en los próximos 7 días.</p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Miembro</th>
                  <th>DNI</th>
                  <th>Vence</th>
                </tr>
              </thead>
              <tbody>
                {vencen.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <Link href={`/miembros/${m.id}`} className="text-[#FF7043] hover:underline">
                        {m.nombres} {m.apellidos}
                      </Link>
                    </td>
                    <td>{m.dni}</td>
                    <td>{m.fecha_fin_membresia ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
