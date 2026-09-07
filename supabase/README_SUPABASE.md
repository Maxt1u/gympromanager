# Supabase desde cero — GymProManager MVP

> No tienes proyecto aún: sigue estos 5 pasos numerados.

## 1. Crear proyecto en supabase.com

1. Entra a https://supabase.com/dashboard y crea cuenta.
2. `New project` → nombre `gympromanager` → genera DB password (guárdala) → región más cercana (ej. `South America - São Paulo`) → `Create new project`.
3. Espera ~2 min a que el proyecto esté `Active`.

## 2. Obtener claves y linkear CLI

En el Dashboard ve a `Project Settings > API` y copia:

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `Project ID` (en `General`) → `SUPABASE_PROJECT_ID`

Local:

```powershell
npm i -g supabase
npx supabase login
npx supabase link --project-ref TU_PROJECT_ID
Copy-Item .env.example .env.local
# edita .env.local con URL + ANON_KEY + PROJECT_ID
```

## 3. Aplicar migraciones (`db push`)

```powershell
npx supabase db push
# aplica supabase/migrations/0001_schema.sql + 0002_rls.sql
```

Verifica en `Table Editor`: debes ver `profiles`, `tipos_membresia`, `miembros`, `pagos`, `asistencias`.

Carga el seed:

```powershell
# Opción A: SQL Editor del dashboard, pega supabase/seed.sql y Run
# Opción B: psql con la connection string (Database > Connection string)
```

## 4. Bucket `fotos-miembros` (lectura pública)

Ya lo crea `0002_rls.sql` (insert en `storage.buckets`). Verifica en `Storage`:

- Bucket `fotos-miembros` existe y es `Public`.
- Si lo creas manual: `New bucket` → ID `fotos-miembros` → `Public bucket = ON` → `Create`.

## 5. Variables `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_PROJECT_ID=tu-project-id
```

Luego:

```powershell
npm install
npm run dev
```

### Crear tu primer Admin

1. Registra un usuario desde `/login` (o `Authentication > Add user` en dashboard).
2. En `Table Editor > profiles`, cambia su `rol` a `Admin` y `activo` a `true`.
3. A partir de ahí ese usuario ve todo y puede activar al resto.

### Alternativa sin CLI (todo pegado)

Si no quieres CLI: en `SQL Editor > New query` pega en orden:
1. `supabase/migrations/0001_schema.sql` → Run
2. `supabase/migrations/0002_rls.sql` → Run
3. `supabase/seed.sql` → Run

### Generar tipos TS

```powershell
$env:SUPABASE_PROJECT_ID="tu-project-id"
npm run db:types
```
