# GymProManager Web — MVP (Next.js 14 + Supabase)

Réplica web del desktop JavaFX **Salud & Fuerza Gimnasio Club**.
MVP: Auth+roles, Miembros, Tipos membresía + Pagos, Asistencias, Dashboard.

## Árbol de archivos

```
gympromanager-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx + globals.css
│   │   ├── (auth)/login/page.tsx + actions.ts
│   │   ├── (dashboard)/layout.tsx (sidebar #263238 / acento #E53935)
│   │   ├── (dashboard)/page.tsx (dashboard)
│   │   ├── (dashboard)/miembros/page.tsx + [id]/page.tsx + actions.ts
│   │   ├── (dashboard)/pagos/page.tsx + actions.ts
│   │   ├── (dashboard)/asistencias/page.tsx + actions.ts
│   │   └── auth/signout/route.ts
│   ├── lib/
│   │   ├── supabase/{client,server,middleware}.ts
│   │   ├── database.types.ts + validations.ts (zod) + utils.ts
│   └── middleware.ts
├── supabase/
│   ├── migrations/0001_schema.sql + 0002_rls.sql
│   ├── seed.sql + README_SUPABASE.md + ALL_IN_ONE.sql
├── package.json / tsconfig.json / tailwind.config.ts / next.config.mjs
└── README.md / VERCEL_DEPLOY.md / .env.example
```

## Inicio rápido

1. Sigue `supabase/README_SUPABASE.md` (crear proyecto, `db push`, seed, bucket).
2. `Copy-Item .env.example .env.local` y completa.
3. `npm install; npm run dev` → http://localhost:3000

## Extender (fuera del MVP)

`src/` ya deja hueco para: `rutinas/`, `ejercicios/`, `mediciones/`, `productos/`, `reportes/`, `configuracion/`
— replica el patrón Server Component + `actions.ts` + `validations.ts` de `miembros/`.
Tablas futuras: ver DDL original en `../gympromanager1bckp/src/main/java/com/gympromanager/util/ConectorBaseDatos.java`.
