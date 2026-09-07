import { createClient } from '@/lib/supabase/server';
import { crearMiembro } from './actions';
import Link from 'next/link';

export default async function MiembrosPage({
  searchParams
}: {
  searchParams: { q?: string; error?: string; ok?: string };
}) {
  const supabase = createClient();
  const q = (searchParams.q ?? '').trim();

  let query = supabase
    .from('miembros')
    .select('id, dni, nombres, apellidos, telefono, estado, fecha_fin_membresia')
    .order('apellidos', { ascending: true })
    .limit(100);

  if (q) {
    query = query.or(`dni.ilike.%${q}%,nombres.ilike.%${q}%,apellidos.ilike.%${q}%`);
  }

  const [{ data: miembros }, { data: tipos }] = await Promise.all([
    query,
    supabase.from('tipos_membresia').select('id, nombre').eq('estado', 'Activo')
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Miembros</h1>
        <p className="text-sm text-slate-300">Réplica de VistaGestionMiembros + VistaFichaMiembro.</p>
      </div>

      {searchParams.error && (
        <p className="rounded bg-red-900/50 p-2 text-sm text-red-200">{searchParams.error}</p>
      )}
      {searchParams.ok && (
        <p className="rounded bg-green-900/50 p-2 text-sm text-green-200">{searchParams.ok}</p>
      )}

      <form method="get" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por DNI o nombre…"
          className="input max-w-sm"
        />
        <button className="btn-secondary" type="submit">
          Buscar
        </button>
      </form>

      <section className="card">
        <h2 className="mb-3 font-semibold">Listado ({miembros?.length ?? 0})</h2>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Vence</th>
              </tr>
            </thead>
            <tbody>
              {(miembros ?? []).map((m) => (
                <tr key={m.id}>
                  <td>{m.dni}</td>
                  <td>
                    <Link href={`/miembros/${m.id}`} className="text-[#FF7043] hover:underline">
                      {m.nombres} {m.apellidos}
                    </Link>
                  </td>
                  <td>{m.telefono ?? '—'}</td>
                  <td>{m.estado}</td>
                  <td>{m.fecha_fin_membresia ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">Nuevo miembro</h2>
        <form action={crearMiembro} className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="label">DNI *</label>
            <input name="dni" required className="input" />
          </div>
          <div>
            <label className="label">Nombres *</label>
            <input name="nombres" required className="input" />
          </div>
          <div>
            <label className="label">Apellidos *</label>
            <input name="apellidos" required className="input" />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input name="telefono" className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" className="input" />
          </div>
          <div>
            <label className="label">Género</label>
            <select name="genero" className="input">
              <option value="">—</option>
              <option value="M">M</option>
              <option value="F">F</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="label">Membresía</label>
            <select name="id_tipo_membresia" className="input">
              <option value="">—</option>
              {(tipos ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Estado</label>
            <select name="estado" className="input" defaultValue="Activo">
              <option>Activo</option>
              <option>Inactivo</option>
              <option>Suspendido</option>
            </select>
          </div>
          <div>
            <label className="label">Dirección</label>
            <input name="direccion" className="input" />
          </div>
          <div className="md:col-span-3">
            <button className="btn-primary" type="submit">
              Crear miembro
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
