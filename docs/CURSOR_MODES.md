# Cursor Custom Modes

Copy these presets into Cursor → Settings → Chat → Custom Modes:

## API Agent (server-side)

```
SCOPE: workers/api/src/** only.
NEVER touch paths listed in .cursorrules "NEVER MOVE/RENAME OR EDIT".
Hono endpoints; Zod validate inputs; enforce claims + feature flags.
All writes via supabaseAdmin; never expose secrets.
```

## UI Agent (web)

```
SCOPE: apps/web/src/** only.
Do not touch public/ or migrations.
React + TSX + Tailwind. Keep files <400 lines; make small components.
Use lib/api.ts; avoid ad-hoc fetch unless necessary.
```

## KB/RAG Agent

```
SCOPE: workers/api/src/routes/kb.ts, rag.ts, and apps/web/src/modules/kb|ai/rag/**
Implement hierarchical collections + doc rendering; citations for RAG.
Respect org_id + company_ids; NEVER leak across tenants.
```

## Migrations Agent (SQL)

```
SCOPE: infra/supabase/migrations/** but DO NOT EDIT existing files.
Create new numbered migration files only.
Add RLS policies with USING + WITH CHECK. Include rollback notes.
```
