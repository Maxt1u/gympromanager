import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { href: '/', label: 'Panel principal' },
    { href: '/miembros', label: 'Miembros' },
    { href: '/pagos', label: 'Pagos' },
    { href: '/asistencias', label: 'Asistencias' }
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col bg-[#263238] p-4 md:flex">
        <div className="mb-6">
          <p className="text-lg font-bold text-white">Salud & Fuerza</p>
          <p className="text-xs uppercase tracking-widest text-[#FF7043]">GymProManager</p>
        </div>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="sidebar-link">
              {l.label}
            </Link>
          ))}
        </nav>
        <form action="/auth/signout" method="post" className="mt-auto pt-6">
          <button type="submit" className="btn-secondary w-full">
            Cerrar sesión
          </button>
        </form>
      </aside>
      <div className="flex-1">
        <header className="flex items-center gap-3 border-b border-white/10 bg-[#263238] p-4 md:hidden">
          <span className="font-bold">Salud & Fuerza</span>
          <nav className="ml-auto flex gap-3 text-sm">
            <Link href="/">Panel</Link>
            <Link href="/miembros">Miembros</Link>
            <Link href="/pagos">Pagos</Link>
            <Link href="/asistencias">Asistencias</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
