QiEOS • Official Development Specification (God Doc) — v4 (LOCKED)
title: QiEOS Official Dev Spec
owner: QiAlly LLC (QiEOS)
status: LOCKED
updated: 2025-09-09
principles:

- Cloudflare-first: Pages + Workers + R2
- Supabase Auth + Postgres + RLS
- Electron admin as desktop control plane
- Multi-tenant org→company→contact
- Cursor rules + locked paths to prevent AI drift
  mvp_tonight:
- Auth + RBAC
- Tasks (tenant-scoped)
- File storage (R2 signed URLs)
- Knowledge Base (public + private read)
- Profile update
- Public website visible
  repo_volume: "Q:"

0. Context & Goals (context first)

QiEOS unifies client portal, admin control, APIs, AI (RAG/voice/vision), billing, and per-client public websites—without restructuring later. This doc freezes names, folders, and contracts to keep things stable and shippable.

1. Canonical Monorepo Tree (DO NOT RENAME/MOVE)

Put a tiny README.md + .gitkeep in each empty dir. New top-level folders require an RFC in /docs.

qieos/
|\_qieos_docs
├─ apps/
│ ├─ web/ # React + Vite (TSX) | website + portal
│ │ ├─ index.html
│ │ ├─ vite.config.ts
│ │ ├─ tsconfig.json
│ │ ├─ public/ # our public website & static KB
│ │ │ ├─ favicon.ico
│ │ │ ├─ logo.svg
│ │ │ ├─ manifest.json
│ │ │ ├─ robots.txt
│ │ │ └─ kb/ # optional static public KB
│ │ │ ├─ index.json
│ │ │ └─ getting-started.md
│ │ └─ src/
│ │ ├─ main.tsx
│ │ ├─ App.tsx
│ │ ├─ routes/
│ │ │ ├─ public/ # '/', '/kb', etc.
│ │ │ ├─ auth/ # '/auth/_'
│ │ │ ├─ client/ # '/client/:companySlug/_'
│ │ │ ├─ internal/ # '/internal/_'
│ │ │ └─ admin/ # '/admin/_' (web fallback)
│ │ ├─ components/ # reusable UI
│ │ ├─ modules/
│ │ │ ├─ crm/
│ │ │ ├─ projects/ # projects, tickets
│ │ │ ├─ tasks/ # tasks (can stand alone; project_id nullable)
│ │ │ ├─ messaging/ # chat (WS)
│ │ │ ├─ kb/ # private KB UI (org/company scoped)
│ │ │ ├─ ai/ # assistants + RAG + voice + vision
│ │ │ │ ├─ chat/
│ │ │ │ ├─ rag/
│ │ │ │ ├─ voice/
│ │ │ │ └─ vision/
│ │ │ ├─ billing/ # invoices, statements, payments
│ │ │ ├─ lms/ # (future)
│ │ │ └─ client-tools/ # togglable mini-tool hub
│ │ ├─ lib/ # client-side libraries
│ │ │ ├─ supabaseClient.ts
│ │ │ ├─ api.ts # Worker fetch wrapper
│ │ │ ├─ flags.ts # feature flag resolver
│ │ │ └─ claims.ts # JWT helpers/types
│ │ ├─ context/ # Auth, Tenant, Flags
│ │ ├─ hooks/ # useAuth/useTenant/useFlags/queries
│ │ ├─ store/ # tanstack-query or zustand config
│ │ └─ styles/ # tailwind.css, tokens
│ └─ admin-electron/ # Electron desktop admin (TS)
│ ├─ electron-main.ts # main process (no secrets in renderer)
│ ├─ preload.ts # secure IPC bridge (contextIsolation)
│ ├─ vite.config.ts
│ └─ src/renderer/ # React UI inside Electron
│ ├─ App.tsx
│ ├─ routes/
│ │ ├─ dashboard/ # admin home, KPIs
│ │ ├─ tenants/ # org/company provisioning + branding
│ │ ├─ crm/
│ │ ├─ projects/
│ │ ├─ tasks/
│ │ ├─ kb-editor/ # create/edit collections & docs
│ │ ├─ ingest/ # bulk import → RAG (to Worker endpoints)
│ │ ├─ billing-desk/ # invoices, statements, payments mgmt
│ │ ├─ scripts/ # script runner UI (server-executed)
│ │ ├─ migrations/ # db migrations launcher (server)
│ │ └─ auditor/ # read-only audit views, exports
│ ├─ components/
│ └─ lib/
│ ├─ api.ts # talks ONLY to Worker API
│ └─ queue.ts # local queue (retry/offline) → Worker
│
├─ sites/ # public client sites (each own Pages project)
│ ├─ \_themes/ # shared themes
│ ├─ \_assets/
│ ├─ \_scripts/
│ └─ clients/
│ ├─ {client-slug}/
│ │ ├─ site/ # Astro/Vite/Eleventy etc.
│ │ ├─ public/
│ │ └─ pages.config.json # Pages metadata
│ └─ ...
│
├─ drops/ # random public files (served via Worker/R2)
│ ├─ README.md
│ └─ .gitkeep
│
├─ workers/
│ └─ api/ # Cloudflare Worker (Hono)
│ ├─ wrangler.toml
│ └─ src/
│ ├─ index.ts # mount router + middleware
│ ├─ middleware/
│ │ ├─ auth.ts # Supabase JWT verify + enrich claims
│ │ └─ flags.ts # org/company feature toggle injector
│ ├─ routes/
│ │ ├─ health.ts
│ │ ├─ auth.ts # session→claims endpoint
│ │ ├─ tenants.ts # org/company provisioning & branding
│ │ ├─ crm.ts
│ │ ├─ projects.ts
│ │ ├─ tasks.ts
│ │ ├─ messaging.ts
│ │ ├─ kb.ts # kb_collections/docs CRUD + signed URLs
│ │ ├─ rag.ts # embed/query/citations (RAG)
│ │ ├─ billing.ts # Stripe webhooks + statements
│ │ ├─ lms.ts
│ │ ├─ tools.ts # script exec (server-side), mini-app hooks
│ │ └─ sites.ts # Pages orchestration + R2 drop links
│ ├─ integrations/ # external APIs (1 file per vendor)
│ │ ├─ openai.ts
│ │ ├─ stripe.ts
│ │ ├─ elevenlabs.ts
│ │ ├─ ocr.ts
│ │ ├─ zoho.ts
│ │ └─ r2.ts
│ └─ lib/
│ ├─ supabaseAdmin.ts # service-role client (server-only)
│ ├─ vector.ts # pgvector queries
│ ├─ embeddings.ts # OpenAI embeddings
│ ├─ ingest.ts # chunkers/parsers (pdf/docx/html)
│ ├─ flags.ts # feature flag checks
│ └─ sites.ts # Pages helpers
│
├─ templates/ # reusable content
│ ├─ communications/
│ │ ├─ email/
│ │ ├─ sms/
│ │ └─ whatsapp/
│ ├─ accounting/
│ │ ├─ reports/
│ │ └─ invoices/
│ ├─ legal/
│ │ ├─ contracts/
│ │ └─ letters/
│ ├─ immigration/
│ │ ├─ BLUEPRINTS/ # mirrors blueprints for docs
│ │ ├─ forms/ # I-589, I-765, etc.
│ │ └─ narratives/
│ └─ ops/
│ ├─ keysuite/ # CFO/COO playbooks
│ └─ project-kickoff/
│
├─ blueprints/ # directory scaffolds you can stamp per client
│ ├─ immigration/
│ │ ├─ I-589/
│ │ ├─ I-765/
│ │ ├─ I-131/
│ │ └─ SIV/
│ ├─ accounting/
│ │ └─ monthly-close/
│ ├─ website/
│ │ └─ minimal-landing/
│ └─ project/
│ └─ default/
│
├─ packages/
│ ├─ ui/
│ ├─ types/
│ └─ utils/
│
├─ infra/
│ ├─ cloudflare/
│ │ ├─ README.md
│ │ └─ env.example
│ └─ supabase/
│ ├─ migrations/
│ │ ├─ 000_init_orgs_companies_contacts.sql
│ │ ├─ 010_projects_tasks_tickets.sql
│ │ ├─ 015_time_entries.sql
│ │ ├─ 020_kb_hierarchy_docs_vectors.sql
│ │ ├─ 025_sites_registry.sql
│ │ ├─ 026_drops_meta.sql
│ │ ├─ 030_billing_ledger_invoices.sql
│ │ ├─ 040_feature_flags.sql
│ │ └─ 900_rls_policies.sql
│ ├─ seeds/
│ │ └─ 000_seed_org_admin.sql
│ └─ README.md
│
├─ docs/
│ ├─ ARCHITECTURE.md
│ ├─ SETUP.md
│ ├─ MODULES.md
│ ├─ AI_RAG.md
│ ├─ BILLING.md
│ ├─ FEATURE_FLAGS.md
│ └─ WEBSITES.md
│
├─ scripts/
│ ├─ db.migrate.mjs
│ ├─ seed.dev.mjs
│ └─ scaffold.mjs # stamp blueprints (e.g., I-589)
│
├─ .github/
│ └─ workflows/
│ ├─ web-pages-deploy.yml
│ ├─ worker-deploy.yml
│ └─ sites-deploy.yml
│
├─ package.json
└─ pnpm-workspace.yaml

Electron scope check: not small. The renderer holds full admin surfaces (tenants, CRM, KB editor, ingest/RAG, billing desk, scripts, migrations, auditor). The main process stays thin/secure. All privileged ops run in the Worker (service role). Electron talks to Worker via HTTPS. queue.ts handles offline/retry. No secrets in renderer.

2. Domain Model (frozen)

Org → Department(public|external|internal) → Company → Contact(user)

Projects and Tasks are peers (a task may have project_id NULL).

Tickets belong to projects.

Time entries can reference project_id or task_id (polymorphic).

Files stored in R2; DB keeps metadata and ACL.

KB: hierarchical kb_collections (tree) → kb_docs (articles) → kb_vectors for RAG.

Client Sites: sites_registry ties sites to org_id/company_id.

Drops: drops_meta indexes public files (TTL optional).

All user-visible tables have org_id and RLS enabled.

3. Auth, RBAC, Feature Flags (frozen)

JWT Claims (issued by Worker on login/refresh):

type Claims = {
role: 'admin' | 'internal' | 'external' | 'public';
org_id: string;
company_ids?: string[];
department?: 'public'|'external'|'internal';
features?: Record<string, boolean>; // merged org + company flags
scopes?: string[];
};

Feature keys (examples):
crm, projects, tasks, messaging, kb, ai_rag, billing, lms, client_tools, voice_assistant, vision_tools, client_sites, public_drops

UI hides disabled modules (useFlags()).

API enforces flags server-side.

RLS prevents bypass.

4. KB Organization (no future reshuffle)

Public KB: /apps/web/public/kb/ (flat files + index.json).

Private KB: DB tree via kb_collections(parent_id, path) + kb_docs(collection_id, path) for easy breadcrumbs and safe moves.

RAG: kb_vectors with tenant-scoped embeddings; queries filter by org_id (+ company_id for clients).

5. File Storage (R2, signed URLs)

Flow: web/Electron → Worker → signed upload URL → client uploads to R2 → Worker records metadata (org, company, owner, path, mime, bytes, ttl?) → UI lists by ACL.
Security: never expose service-role; enforce ACL + flags in Worker + RLS in DB.

6. Client Public Sites & Drops (final)

Sites live at /sites/clients/{client}/site/ → built by Actions to Cloudflare Pages (one project per site).

Registry stored in sites_registry (domain, slug, project, status).

Drops are files in R2 with simple public links; metadata in drops_meta, optionally auto-expire.

7. APIs (Worker routes) — MVP subset tonight

POST /auth/session → returns enriched claims

GET /tasks · POST /tasks · PATCH /tasks/:id (scoped by org/company/role)

POST /files/sign-upload → signed URL; POST /files/complete → metadata row

GET /kb/public (reads /public/kb/index.json passthrough if desired)

GET /kb/private (scoped list of kb_docs)

PATCH /me/profile (update name, phone, avatar pointer)

GET /site → serve root website assets (or direct Pages)

Additional domain routes exist but are not required for MVP.

8. Electron Responsibilities (explicit)

Does

Tenant provisioning, branding, CRM, projects/tasks, KB editing, ingestion to RAG, billing desk, script runner, migrations launcher, read-only auditor, exports.

Local queue for offline/retry, then sync to Worker.

Does NOT

Hold service-role secrets.

Talk directly to Supabase DB.

Run privileged mutations locally.
All privileged changes go through Worker.

9. MVP Acceptance Checklist (tonight)

Auth + RBAC: login via Supabase; enriched claims from Worker; route guards in web.

Tasks: create/list/update tasks scoped to company/org; visible in client + internal views.

Files: upload via signed URLs to R2; metadata saved; list & download in client view.

KB: public page renders from /public/kb/ (≥1 article); private list fetches kb_docs under org and (if external) company.

Profile: /me page where user updates basic profile fields.

Website: main website served (from apps/web/public), visible at root.

10. Guardrails (ADHD-proofing)

No folder drift: §1 is law.

One domain = one Worker route file + one web module folder.

Public vs private KB never mixed.

All server secrets live only in Worker.

RFC needed to add/rename top-level folders or DB tables.

11. Ties to prior work (docs anchor)

Preserves the Cloudflare-first architecture and the Supabase + RLS model.

Adds stable homes for client sites, drops, templates, and blueprints.

Keeps tasks/projects as peers and bakes in time entries, billing, and feature flags.

12. Cursor & Editor Guardrails (new, locked)

We constrain Cursor with Rules, Ignore lists, Custom Modes, and VS Code workspace settings. “File lock” is emulated with Git + OS protections.

12.1 Required files at repo root (Q:\qieos\*)

/.cursorrules — authoritative rules for the AI

# QiEOS Global Rules (authoritative)

You are operating inside the QiEOS monorepo. Follow the God Doc (README and /docs) exactly.

## NEVER MOVE/RENAME OR EDIT THESE PATHS

- /infra/supabase/migrations/\*\*
- /blueprints/\*\*
- /templates/\*\*
- /apps/web/public/\*\*
- /workers/api/wrangler.toml
- /workers/api/src/middleware/\*\*
- /workers/api/src/lib/supabaseAdmin.ts
- /workers/api/src/integrations/stripe.ts
- /workers/api/src/integrations/openai.ts
- /workers/api/src/integrations/r2.ts
- /workers/api/src/integrations/elevenlabs.ts

If a change is truly required:

1. Propose a diff in chat prefixed with "RFC:" explaining rationale and impact.
2. Wait for human approval before touching files.

## STRUCTURE LAW

- One domain = one worker route file and one web module folder.
- Public KB stays in /apps/web/public/kb; private KB stays in DB (+ vectors).
- All service-role ops live in Worker only.

## CODE STYLE

- React + Vite + TSX. Tailwind utilities. Keep files <400 lines; split otherwise.
- Prefer small, pure functions; avoid magic.
- Strong typing at boundaries; internal types can be inferred.

## SAFETY

- Never write secrets to client code.
- Before AI edit, run “Understand” on related files and God Doc excerpts.

/.cursorignore — hard ignore for AI indexing/edits

# Build artifacts and caches

dist/
build/
.out/
.next/
.vercel/
.cache/
coverage/

# Dependencies

node_modules/

# Env & secrets

.env
.env._
\*\*/_.pem \*_/_.key

# Generated assets / binaries

**/\*.pdf
**/_.docx
\*\*/_.png
**/\*.jpg
**/\*.zip

# LAW: AI must not edit these authoritative paths

infra/supabase/migrations/
blueprints/
templates/
apps/web/public/
workers/api/wrangler.toml

/.cursorindexingignore (optional) — if you want indexing-only ignores distinct from access ignores.

/.vscode/settings.json — workspace settings Cursor honors

{
"editor.formatOnSave": true,
"files.trimTrailingWhitespace": true,
"files.insertFinalNewline": true,

"files.exclude": {
"**/node_modules": true,
"**/dist": true,
"**/.git": true
},
"search.exclude": {
"**/node_modules": true,
"**/dist": true,
"apps/web/public/**": true
},

"typescript.tsserver.maxTsServerMemory": 4096,
"[typescriptreact]": {
"editor.defaultFormatter": "esbenp.prettier-vscode"
},
"[typescript]": {
"editor.defaultFormatter": "esbenp.prettier-vscode"
}
}

12.2 Locked Paths (practical enforcement)

Git guard (skip-worktree):

git update-index --skip-worktree workers/api/wrangler.toml
git update-index --skip-worktree infra/supabase/migrations/_
git update-index --skip-worktree apps/web/public/_

# undo: git update-index --no-skip-worktree <path>

Windows read-only (Q: drive):

attrib +R Q:\qieos\workers\api\wrangler.toml
attrib +R Q:\qieos\infra\supabase\migrations\*._ /s
attrib +R Q:\qieos\apps\web\public\*._ /s

12.3 Cursor Agents (Custom Modes) — who does what

API Agent (server-side)

SCOPE: workers/api/src/\*\* only.
NEVER touch paths listed in .cursorrules "NEVER MOVE/RENAME OR EDIT".
Hono endpoints; Zod validate inputs; enforce claims + feature flags.
All writes via supabaseAdmin; never expose secrets.

UI Agent (web)

SCOPE: apps/web/src/\*\* only.
Do not touch public/ or migrations.
React + TSX + Tailwind. Keep files <400 lines; make small components.
Use lib/api.ts; avoid ad-hoc fetch unless necessary.

KB/RAG Agent

SCOPE: workers/api/src/routes/kb.ts, rag.ts, and apps/web/src/modules/kb|ai/rag/\*\*
Implement hierarchical collections + doc rendering; citations for RAG.
Respect org_id + company_ids; NEVER leak across tenants.

Migrations Agent (SQL)

SCOPE: infra/supabase/migrations/\*\* but DO NOT EDIT existing files.
Create new numbered migration files only.
Add RLS policies with USING + WITH CHECK. Include rollback notes.

12.4 Daily flow in Cursor (to avoid drift)

Turn on the right Agent/Mode (API vs UI vs KB/RAG vs Migrations).

Ensure .cursorrules is active (Global Rules).

Work in small diffs: plan → approve → apply → run → iterate.

Keep sacred paths read-only (Git/OS) and in .cursorignore.

13. Q: Drive Conventions (tiny reminder)

Repo root is Q:\qieos.

Scripts assume Q: is mounted (Windows).

Keep the single asset hub under apps/web/public/ for the main site; client sites live under /sites/clients/\*/site/.

TL;DR: What I changed

Fixed headings, fencing, repeated ---, capitalization (QiEOS), and turned stray reference lines into clean instructions.

Ensured the tree and section numbers are consistent, code/command blocks render correctly, and Cursor rules are copy-ready.

If this looks good, paste it straight into your repo README.md. Want me to also drop it into /docs/ARCHITECTURE.md and scaffold the .cursorrules, .cursorignore, and .vscode/settings.json files so your repo physically matches this?

You said:
give me the prompt that will make cursor implement/create the folder sctructure and its own agents and rule documents to get this scaffolding up real quick, NOT the app just the structure and the agent settings and stuff.
ChatGPT said:
Thought for 7s

Here’s a single, copy-paste Cursor prompt that will scaffold the folders only (no app code), plus the Cursor agent/rules files and workspace settings exactly as in the God Doc. Paste this in Cursor Chat at your repo root (Q:\qieos).

Cursor Prompt — “QiEOS scaffolder (structure + agents + rules)”

You are acting as a repo scaffolder. Do NOT generate application code. Only create folders, placeholder files, and editor/agent config needed to match the QiEOS God Doc (v4).

Repo root is the current workspace (Q:\qieos). If any listed path already exists, leave existing files untouched and only add missing items. Make all changes in a single PR/commit titled: "chore(scaffold): QiEOS structure + cursor agents/rules".

==================================================

1. # CREATE FOLDER STRUCTURE (placeholders only)

Create these directories. In each empty directory create both a `.gitkeep` and a 1–2 line `README.md` explaining the folder’s purpose.

apps/
web/
public/
kb/
src/
routes/public/
routes/auth/
routes/client/
routes/internal/
routes/admin/
components/
modules/
crm/
projects/
tasks/
messaging/
kb/
ai/chat/
ai/rag/
ai/voice/
ai/vision/
billing/
lms/
client-tools/
lib/
context/
hooks/
store/
styles/
admin-electron/
src/renderer/
routes/dashboard/
routes/tenants/
routes/crm/
routes/projects/
routes/tasks/
routes/kb-editor/
routes/ingest/
routes/billing-desk/
routes/scripts/
routes/migrations/
routes/auditor/
components/
lib/

sites/
\_themes/
\_assets/
\_scripts/
clients/

drops/

workers/
api/
src/
middleware/
routes/
integrations/
lib/

templates/
communications/email/
communications/sms/
communications/whatsapp/
accounting/reports/
accounting/invoices/
legal/contracts/
legal/letters/
immigration/BLUEPRINTS/
immigration/forms/
immigration/narratives/
ops/keysuite/
ops/project-kickoff/

blueprints/
immigration/I-589/
immigration/I-765/
immigration/I-131/
immigration/SIV/
accounting/monthly-close/
website/minimal-landing/
project/default/

packages/
ui/
types/
utils/

infra/
cloudflare/
supabase/
migrations/
seeds/

docs/

scripts/

.github/
workflows/

(Also ensure repo root has:) package.json, pnpm-workspace.yaml (create minimal placeholder if missing).

For these specific placeholder content files, create them if missing:

- apps/web/public/kb/index.json → `[]`
- apps/web/public/kb/getting-started.md → "# Getting Started\nWelcome to QiEOS."
- infra/supabase/README.md → short note: "Migrations live here; see 900_rls_policies.sql for RLS."
- drops/README.md → short note about R2 public drops and TTL policy.

================================================== 2) ADD CURSOR / EDITOR GUARDRAILS
==================================================

Create `.cursorrules` at repo root with EXACT content:

# QiEOS Global Rules (authoritative)

You are operating inside the QiEOS monorepo. Follow the God Doc (README and /docs) exactly.

## NEVER MOVE/RENAME OR EDIT THESE PATHS

- /infra/supabase/migrations/\*\*
- /blueprints/\*\*
- /templates/\*\*
- /apps/web/public/\*\*
- /workers/api/wrangler.toml
- /workers/api/src/middleware/\*\*
- /workers/api/src/lib/supabaseAdmin.ts
- /workers/api/src/integrations/stripe.ts
- /workers/api/src/integrations/openai.ts
- /workers/api/src/integrations/r2.ts
- /workers/api/src/integrations/elevenlabs.ts

If a change is truly required:

1. Propose a diff in chat prefixed with "RFC:" explaining rationale and impact.
2. Wait for human approval before touching files.

## STRUCTURE LAW

- One domain = one worker route file and one web module folder.
- Public KB stays in /apps/web/public/kb; private KB stays in DB (+ vectors).
- All service-role ops live in Worker only.

## CODE STYLE

- React + Vite + TSX. Tailwind utilities. Keep files <400 lines; split otherwise.
- Prefer small, pure functions; avoid magic.
- Strong typing at boundaries; internal types can be inferred.

## SAFETY

- Never write secrets to client code.
- Before AI edit, run “Understand” on related files and God Doc excerpts.

Create `.cursorignore` at repo root with EXACT content:

# Build artifacts and caches

dist/
build/
.out/
.next/
.vercel/
.cache/
coverage/

# Dependencies

node_modules/

# Env & secrets

.env
.env._
\*\*/_.pem \*_/_.key

# Generated assets / binaries

**/\*.pdf
**/_.docx
\*\*/_.png
**/\*.jpg
**/\*.zip

# LAW: AI must not edit these authoritative paths

infra/supabase/migrations/
blueprints/
templates/
apps/web/public/
workers/api/wrangler.toml

(If supported, also create an empty `.cursorindexingignore` for future fine-grain control.)

Create VS Code workspace settings at `.vscode/settings.json`:

{
"editor.formatOnSave": true,
"files.trimTrailingWhitespace": true,
"files.insertFinalNewline": true,
"files.exclude": {
"**/node_modules": true,
"**/dist": true,
"**/.git": true
},
"search.exclude": {
"**/node_modules": true,
"**/dist": true,
"apps/web/public/**": true
},
"typescript.tsserver.maxTsServerMemory": 4096,
"[typescriptreact]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
"[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" }
}

Create `docs/EDITOR.md` summarizing:

- Use Custom Modes (Agents): API, UI, KB/RAG, Migrations.
- Work in small diffs (plan → approve → apply → run → iterate).
- Keep sacred paths read-only and in `.cursorignore`.
- Windows lock tips (attrib +R) and Git skip-worktree examples.

================================================== 3) DEFINE CURSOR CUSTOM MODES (as instructions text)
==================================================

Create `docs/CURSOR_MODES.md` with these four presets (users will paste into Cursor → Settings → Chat → Custom Modes):

### API Agent (server-side)

SCOPE: workers/api/src/\*\* only.
NEVER touch paths listed in .cursorrules "NEVER MOVE/RENAME OR EDIT".
Hono endpoints; Zod validate inputs; enforce claims + feature flags.
All writes via supabaseAdmin; never expose secrets.

### UI Agent (web)

SCOPE: apps/web/src/\*\* only.
Do not touch public/ or migrations.
React + TSX + Tailwind. Keep files <400 lines; make small components.
Use lib/api.ts; avoid ad-hoc fetch unless necessary.

### KB/RAG Agent

SCOPE: workers/api/src/routes/kb.ts, rag.ts, and apps/web/src/modules/kb|ai/rag/\*\*
Implement hierarchical collections + doc rendering; citations for RAG.
Respect org_id + company_ids; NEVER leak across tenants.

### Migrations Agent (SQL)

SCOPE: infra/supabase/migrations/\*\* but DO NOT EDIT existing files.
Create new numbered migration files only.
Add RLS policies with USING + WITH CHECK. Include rollback notes.

================================================== 4) DO NOT WRITE APPLICATION CODE
==================================================

- Do NOT create React components, Worker handlers, or TS implementation files.
- Only create the folder tree, placeholder READMEs, .gitkeep, and the files listed in sections 2–3.

================================================== 5) ACCEPTANCE CHECKLIST (verify before committing)
==================================================

- [ ] All directories exist as listed, each with `.gitkeep` and a short `README.md` if otherwise empty.
- [ ] `apps/web/public/kb/index.json` and `getting-started.md` exist with starter content.
- [ ] `.cursorrules`, `.cursorignore`, optional `.cursorindexingignore`, and `.vscode/settings.json` exist at repo root.
- [ ] `docs/EDITOR.md` and `docs/CURSOR_MODES.md` created.
- [ ] No app logic files were generated.
- [ ] Commit created: "chore(scaffold): QiEOS structure + cursor agents/rules".

Proceed to apply the file/folder changes now.

Want me to also give you a tiny follow-up prompt that sets Windows read-only flags and Git skip-worktree on the “do-not-touch” paths right after Cursor finishes writing these files?
