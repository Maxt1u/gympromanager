import { login, signup } from './actions';

export default function LoginPage({
  searchParams
}: {
  searchParams: { error?: string; ok?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <p className="text-center text-lg font-bold">Salud & Fuerza</p>
        <p className="mb-6 text-center text-xs uppercase tracking-widest text-[#FF7043]">
          GymProManager
        </p>

        {searchParams.error && (
          <p className="mb-3 rounded bg-red-900/50 p-2 text-sm text-red-200">{searchParams.error}</p>
        )}
        {searchParams.ok && (
          <p className="mb-3 rounded bg-green-900/50 p-2 text-sm text-green-200">{searchParams.ok}</p>
        )}

        <form className="space-y-3">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Contraseña
            </label>
            <input id="password" name="password" type="password" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="nombre_completo">
              Nombre completo (solo registro)
            </label>
            <input id="nombre_completo" name="nombre_completo" type="text" className="input" />
          </div>
          <div className="flex gap-2 pt-2">
            <button formAction={login} className="btn-primary flex-1">
              Ingresar
            </button>
            <button formAction={signup} className="btn-secondary flex-1">
              Registrarse
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">
          Roles: Admin / Empleado / Instructor. El registro nace inactivo.
        </p>
      </div>
    </div>
  );
}
