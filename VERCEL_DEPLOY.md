# Deploy en Vercel — GymProManager MVP

1. Sube `gympromanager-web/` a GitHub (repo privado o público).
2. En https://vercel.com → `Add New > Project` → importa el repo.
   - Framework: `Next.js` (autodetectado)
   - Root Directory: `gympromanager-web` (si el repo contiene también el backup Java)
   - Build: `npm run build` (default)
3. Environment Variables (las mismas de `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. `Deploy`. Obtendrás `https://tu-app.vercel.app`.
5. En Supabase Dashboard → `Authentication > URL Configuration`:
   - `Site URL` = tu URL de Vercel
   - `Redirect URLs` += `https://tu-app.vercel.app/**`
6. Prueba: `/login` → crea usuario → promuévelo a Admin en `profiles` → usa la app.

Notas:
- No necesitas `SUPABASE_SERVICE_ROLE_KEY` en frontend (solo anon key).
- Fotos: bucket `fotos-miembros` público, las URL `foto_url` ya son servibles.
- Límites gratis Supabase/Vercel bastan para el MVP.
