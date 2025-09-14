---
title: QiEOS Development Bible (Unified)
version: 0.3-merged
status: ACTIVE
updated: 2025-09-13
owner: QiAlly LLC (Q)
repo_root: QiEOS/
tags:
  - qieos
  - dev
  - goddoc
---

# Introduction

QiEOS is a Cloudflare-first, Supabase-backed platform unifying client portals, admin cockpit, APIs, billing, and per-client public sites. This Bible is the single source of truth for architecture, schema, workflows, and conventions.

## Purpose

- Govern architecture and directory structure across the monorepo
- Freeze DB schema principles (RLS-first) and Worker boundaries
- Document required workflows and deployment paths
- Provide onboarding and operational guardrails

## Goals

- Ship a stable MVP (auth, tasks, files, KB, profile, marketing site)
- Maintain a predictable, append-only migrations history
- Keep secrets server-side; enforce multi-tenant RLS end-to-end
- Ensure every milestone updates this file (law of the land)

## Vision

Cloud-native, multi-tenant operations where the Worker is the service-role brain, the web portal is the client face, and Electron Cockpit is the secure admin control plane. The repo remains stable and curated, enabling confident iteration without drift.

---

## Table of Contents

- [[#Master Index (Obsidian)|Master Index]]
- [[#Canonical Monorepo Structure|Canonical Monorepo Structure]]
- [[#QiAlly Marketing Site|QiAlly Marketing Site]]
- [[#Integration Ledger|Integration Ledger]]
- [[#Changelog|Changelog]]
- [[#Included Files (order)|Merged KB Files]]

## Master Index (Obsidian)

- [[README.md]]
- [[DEV_LOG.md]]
- [[docs/devops/QIEOS.md]] (this file)
- [[docs/devops/QiEOS_BIBLE.md]]
- [[docs/kb/QiEOS • Official Development Specification.md]]
- [[docs/kb/QiEOS • Official Development Specification (Amendment I).md]]
- [[docs/kb/QiEOS • Official Development Specification Session 20250910-0001.md]]
- [[docs/kb/SETUP.md]]
- [[docs/kb/QiSuite_Dev_Bible.md]]
- [[docs/backend/API_KEYS.md]]
- [[docs/backend/cursor/EDITOR.md]]
- [[docs/backend/cursor/CURSOR_MODES.md]]
- [[workers/api/README.md]]
- [[apps/web/README.md]]
- [[scripts/merge-kb.mjs]]
- [[scripts/setup-dev.mjs]]

### Frontend (apps/web)

- [[apps/web/index.html]]
- [[apps/web/vite.config.ts]] · [[apps/web/tsconfig.json]]
- [[apps/web/src/main.tsx]] · [[apps/web/src/App.tsx]]
- [[apps/web/src/context/AuthContext.tsx]]
- [[apps/web/src/routes/]]
  - [[apps/web/src/routes/auth/Login.tsx]]
  - [[apps/web/src/routes/admin/]] · [[apps/web/src/routes/admin/routes/]]
  - [[apps/web/src/routes/public/]] · [[apps/web/src/routes/client/]]
- [[apps/web/src/components/]]
  - [[apps/web/src/components/admin/layout/MainLayout.tsx]]
  - [[apps/web/src/components/admin/layout/header.tsx]]
  - [[apps/web/src/components/admin/ui/button.tsx]] · [[apps/web/src/components/admin/ui/card.tsx]]
  - [[apps/web/src/components/admin/lib/utils.ts]]
- [[apps/web/public/kb/]] (public KB)

### Backend (workers/api)

- [[workers/api/wrangler.toml]]
- [[workers/api/src/index.ts]] (Hono app)
- [[workers/api/src/middleware/auth.ts]]
- [[workers/api/src/lib/supabaseAdmin.ts]]
- [[workers/api/src/types/hono-augmentation.d.ts]]
- [[workers/api/src/routes/auth.ts]] · [[workers/api/src/routes/tasks.ts]]
- [[workers/api/src/routes/files.ts]] · [[workers/api/src/routes/kb.ts]]
- [[workers/api/src/routes/profile.ts]]

### Admin Cockpit (Electron)

- [[apps/admin-electron/README.md]]
- [[apps/admin-electron/src/renderer/App.tsx]]

### Shared Packages

- [[packages/ui/src/index.ts]] · [[packages/ui/src/button.tsx]] · [[packages/ui/src/card.tsx]]
- [[packages/types/src/index.ts]] · [[packages/types/src/types.ts]]
- [[packages/utils/index.ts]]

### Infra & Scripts

- [[infra/cloudflare/wrangler.toml]] · [[infra/cloudflare/env.example]]
- [[infra/supabase/migrations/]] · [[infra/supabase/seeds/]]
- [[scripts/create-migrations.sql]] · [[scripts/setup-dev.mjs]]

### Folders

- [[apps/]] · [[apps/web/]] · [[apps/admin-electron/]]
- [[workers/]] · [[workers/api/]]
- [[packages/]] · [[packages/ui/]] · [[packages/types/]] · [[packages/utils/]]
- [[infra/]] · [[infra/cloudflare/]] · [[infra/supabase/]]
- [[sites/]] · [[templates/]] · [[blueprints/]] · [[drops/]] · [[docs/]]

Generated: 2025-09-13T10:51:04.458Z

Note: The merged source dump below is now archived. Follow the unified sections here as the single source of truth.

## Canonical Monorepo Structure

```
QiEOS/
├─ apps/
│  ├─ web/                # Client portal + marketing site (React + Vite)
│  └─ admin-electron/     # Desktop cockpit for admins
├─ workers/
│  └─ api/                # Cloudflare Worker (Hono)
├─ infra/
│  ├─ cloudflare/         # wrangler.toml, env.example
│  └─ supabase/           # migrations, seeds, RLS policies
├─ blueprints/
├─ docs/
├─ drops/
├─ packages/
├─ scripts/
├─ sites/
├─ templates/
└─ .trash/                # safe-delete area
```

## Architecture & Principles

- Cloudflare-first: Pages + Workers + R2 (+ KV/Queues when needed)
- Supabase: Auth + Postgres + RLS; migrations are append-only and never edited
- Electron Cockpit: thin main, fat renderer; all privileged ops via Worker API
- Structure law: one domain = one Worker route + one web module folder
- Stability over convenience; new top-level folders require RFC in `docs/`
- Every milestone updates this file (law of the land)

## Amendment I (Schema + Cloudflare Setup)

- Migrations (in `infra/supabase/migrations/`):
  000_init_orgs_companies_contacts.sql · 010_projects_tasks_tickets.sql ·
  015_time_entries.sql · 020_kb_hierarchy_docs_vectors.sql · 025_sites_registry.sql ·
  026_drops_meta.sql · 030_billing_ledger_invoices.sql · 040_feature_flags.sql ·
  900_rls_policies.sql
- Worker config: `workers/api/wrangler.toml` (secrets via `wrangler secret`)
- R2 buckets: `qieos-files` (prod), `qieos-files-dev` (preview)

## MVP Scope & Validation Checklist

- Auth + RBAC: `POST /auth/session` returns enriched claims
- Tasks: `GET/POST/PATCH /tasks` with RLS
- Files: `POST /files/sign-upload` → client uploads to R2 → metadata row
- KB: `GET /kb/public`, `GET /kb/private`
- Profile: `PATCH /me/profile`
- Health: `GET /health` via `pnpm -C workers/api dev`
- Web: `apps/web` builds and deploys via Pages/CI

## Setup Summary

- Follow [[docs/SETUP.md]] end-to-end (Supabase → R2 → Wrangler → `pnpm dev`)
- Configure `infra/cloudflare/.env.example` and Worker secrets; never commit secrets
- Web `.env` contains only public vars (e.g., VITE\_\*)

## Development Workflow & Guardrails

- Small PRs; conventional commits; reversible edits; move removals to `.trash/DATE/`
- Locked paths (do not edit without RFC):
  - `infra/supabase/migrations/**`, `blueprints/**`, `templates/**`, `apps/web/public/**`
  - `workers/api/wrangler.toml`, `workers/api/src/middleware/**`, `workers/api/src/lib/supabaseAdmin.ts`
  - `workers/api/src/integrations/{stripe,openai,r2,elevenlabs}.ts`
- Keep `.cursorrules`, `.cursorignore`, `.vscode/settings.json` aligned with this doc

## QiAlly Marketing Site

- Pages & Components (apps/web):
  - Layout: `src/components/MarketingLayout.tsx`
  - Home `/`, About `/about`, Services `/services`, Contact `/contact`
  - Flows `/flows` (LetterWizard), Terms `/terms`, Privacy `/privacy`
- Routing: `src/App.tsx`
- Worker Endpoints:
  - `POST /api/contact` → `workers/api/src/routes/contact.ts`
  - `POST /api/waitlist` → `workers/api/src/routes/waitlist.ts`
- Env (infra/cloudflare/env.example): `CONTACT_WEBHOOK_URL`, `WAITLIST_KV_NAMESPACE`, `VITE_WIZARD_ENABLED`

## Integration Ledger

- QiEOS Official Dev Spec (v4) — merged
- Amendment I (Schema + Cloudflare) — merged
- Setup Guide — merged
- Session 20250910 — merged
- QiSuite Dev Bible — merged
- Marketing Site Spec — merged
- Code extraction — pending

## Changelog

- 2025-09-13 v0.3: Added Marketing Site section; reiterated “always update QiEOS.md”
- 2025-09-13 v0.2: Corrected repo root to `QiEOS/`; incorporated prior docs
- 2025-09-13 v0.1: Initial unified scaffold

## Session Log (selected)

### 2025‑09‑13 — QiEOS Alignment Session — General Review

- Current state captured (Cloudflare-first, Supabase/RLS, MVP features)
- Gaps noted (migrations apply, guardrails files, endpoint smoke tests, Electron check)
- Next actions: run migrations; boot Worker + smoke `/health` `/auth/session` `/tasks`; verify CI secrets

## Included Files (order)

1. QiEOS • Official Development Specification (Amendment I).md
2. QiEOS • Official Development Specification Session 20250910-0001.md
3. SETUP.md
4. QiEOS • Official Development Specification.md
5. QiSuite_Dev_Bible.md

---

---

# Source: QiEOS • Official Development Specification (Amendment I).md

perfect — I pulled your **current God Doc** from the repo PDF. now let’s lock in the **DB schema + Cloudflare setup** we drafted as the next constitutional amendment.

---

# QiEOS • Official Development Specification (Amendment I)

```yaml
amendment: I
title: Supabase Schema + Cloudflare Setup
status: ratified
date: 2025-09-10
```

## 14) Supabase Schema (frozen baseline)

All SQL migrations live under `/infra/supabase/migrations/`. The following files are now canonical:

- **000_init_orgs_companies_contacts.sql** → orgs, departments, companies, contacts
- **010_projects_tasks_tickets.sql** → projects, tasks (nullable project_id), tickets
- **015_time_entries.sql** → polymorphic time entries
- **020_kb_hierarchy_docs_vectors.sql** → hierarchical collections, docs, vectors (pgvector)
- **025_sites_registry.sql** → client site registry (Pages project + domain)
- **026_drops_meta.sql** → metadata for R2 public drops
- **030_billing_ledger_invoices.sql** → invoices + ledger
- **040_feature_flags.sql** → feature keys, org_features, module_access
- **900_rls_policies.sql** → RLS templates using `qieos_org()`, `qieos_role()`, `qieos_company_ids()`

**Principles:**

- Every user-facing table has `org_id` and **RLS enabled**.
- JWT claims (`org_id`, `role`, `company_ids`, `features`) control visibility.
- Service-role (Worker) bypasses RLS for privileged operations.

---

## 15) Cloudflare Setup (frozen baseline)

Cloudflare is the platform of record. All config lives in `/infra/cloudflare/`.

### 15.1 Worker (`workers/api/wrangler.toml`)

```toml
name = "qieos-api"
main = "src/index.ts"
compatibility_date = "2025-09-10"

[vars]
SUPABASE_URL = ""
SUPABASE_SERVICE_ROLE_KEY = ""
OPENAI_API_KEY = ""
STRIPE_SECRET_KEY = ""
JWT_ISSUER = "qieos"
EMBEDDING_DIM = "1536"

[[r2_buckets]]
binding = "R2"
bucket_name = "qieos-files"
preview_bucket_name = "qieos-files-dev"
```

Secrets are stored via `wrangler secret put`.

### 15.2 R2

- Buckets: `qieos-files`, `qieos-files-dev`.
- Worker endpoints handle signed uploads and metadata (`drops_meta`).

### 15.3 Pages

- `apps/web` builds to `dist/`.
- Deployed as Cloudflare Pages project `qieos-web`.
- `.github/workflows/web-pages-deploy.yml` builds with PNPM and deploys artifact.

### 15.4 Worker CI

- `.github/workflows/worker-deploy.yml` builds `workers/api` and deploys via Wrangler.

---

## 16) Validation Checklist

- [ ] `pnpm -C infra/supabase migrate` applies schema to Supabase.
- [ ] Worker boots with `pnpm -C workers/api dev` and responds on `/health`.
- [ ] `/auth/session` returns enriched claims.
- [ ] `/tasks` CRUD works with RLS.
- [ ] `/files/sign-upload` issues signed URL → file lands in R2 → metadata row written.
- [ ] `/kb/public` and `/kb/private` return articles.
- [ ] `/me/profile` updates successfully.
- [ ] Root website serves from Pages.

---

✅ what changed:

- Added **Amendment I** to the God Doc covering Supabase schema and Cloudflare setup.
- Keeps all prior structure intact; this extends, not rewrites.

👉 next step: I can generate the **actual SQL files** under `/infra/supabase/migrations/` and the **starter wrangler.toml + GitHub workflows** so they’re physically in your repo. want me to?

---

# Source: QiEOS • Official Development Specification Session 20250910-0001.md

---

title: QI‑EOS Dev Workflow & Session Log
author: Q (QiAlly)
project: QI‑EOS (primary) + QI‑LA (secondary)
repo: (primary) QI‑EOS • (secondary) QI‑LA
status: active
last_reviewed: 2025-09-10
labels: [DEV_LOG, cursor, agents]

---

# 🔁 Daily Quick-Start (Open Cursor)

1. **Sync context**
   - Read the latest _Session Log_ entry below.
   - Run `git status` and skim open PRs/issues.
2. **Kickoff prompt in Cursor (paste block):**
   ```text
   You are my repo concierge. Read the repo, summarize current state in 5 bullets, list top 3 next actions aligned to the Dev Plan below, and generate a safe task list. Never delete; if needed, move files to .trash/ with timestamp. Ask before running commands that change files.
   ```
3. **Pick the highest-impact task** from the _Today Focus_ list and move it to **In‑Progress**.
4. **Timebox**: 25–50 min block. Update the _Session Log_ as you go.
5. **Commit** with conventional commits; link to task id from _Task Board_.
6. **PR + Note**: open a small PR, paste the _Change Summary_ template.

---

# 🧭 Dev Plan (MVP Anchor)

- **Codebases**: QI‑EOS (primary), QI‑LA (secondary/companion).
- **Follow the repo README** for stack specifics; keep the workflow generic and reversible.
- **Principles**: smallest PRs, safe changes (no deletes; use `.trash/`), working software over grand refactors.
- **Sprint goal**: verify skeleton builds, wire agent prompts, and keep Session Log current.

---

# ✅ Definition of Done (per task)

- Unit/Smoke tested locally.
- Build passes; deploy preview OK.
- Docs updated in this file.
- Reversible (no destructive ops; .trash/ if needed).

---

# 🔐 Safety Rules for Agents

- **Never delete**, only move to `.trash/YYYY‑MM‑DD/`.
- Require confirmation before running commands that change files or infra.
- Log all actions under _Session Log > Steps_.

---

# 🧩 Working Agreements

- **Small PRs**, one thing per PR.
- **Conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`, `ci:`.
- **Branch naming**: `feat/<module>-<slug>` e.g. `feat/auth-otp-flow`.

---

# 🗂️ Repo Map (keep updated)

```
/ (root)
  /src
    /components
    /pages
    /modules
      /auth
      /dashboard
      /chat
      /tickets
      /tasks
  /public
  /scripts
  /docs
  .trash/
```

---

# 📋 Today Focus

- [ ] Point this DEV_LOG at **QI‑EOS** & add `/docs/agents.md` to that repo.
- [ ] Run **Auditor** against QI‑EOS; fix the top finding only; open a tiny PR.
- [ ] Confirm envs per QI‑EOS README (document in `/docs/env.md`).

---

# 🧠 Agent Prompts (save to /docs/agents.md)

## Repo Concierge (Cursor)

```
ROLE: Repo Concierge
PRINCIPLES: Truth > speed; reversible changes; smallest diff; ask before mutating.
SAFETY: Never delete; stage to .trash/TIMESTAMP; print diff before apply.
TASK: On start, summarize repo, list top 3 next actions from this Dev Plan, propose a 30‑min plan.
OUTPUT: Markdown summary + checklists fit for this DEV_LOG.
```

## Auditor

```
ROLE: Auditor
TASK: Scan repo, flag risky patterns, missing envs, miswired routes, dead code, secrets, and outdated deps.
OUTPUT: Findings table (severity, file, line, fix), then minimal diff to fix top 3.
```

---

# 🧾 Session Log

> Use one entry per focused block (25–50 min). Keep it terse but useful.

## 2025‑09‑10 — Restart after break

- **Context**: Returning from break; need workflow and confirmation of agent setup.
- **Goal**: Re‑establish Cursor quickstart, add DEV_LOG, verify agent prompts present.
- **Steps**:
  1. Created this DEV_LOG; added Quick‑Start and Agent Prompts.
  2. Plan: add `/docs/agents.md` to repo; wire Cursor startup prompt.
- **Decisions**: Keep Supabase OTP for now; Cloudflare swap later if desired.
- **Next**: See _Next Actions_ below.

## 2025‑09‑10 — Repo correction to QI‑EOS

- **Context**: Previous doc referenced QiPortals; user clarified: focus repos are **QI‑EOS** and **QI‑LA**.
- **Goal**: Retarget DEV_LOG + tasks to QI‑EOS.
- **Steps**: Updated header (title/project/repo), Dev Plan, Today Focus.
- **Next**: Create `/docs/agents.md` in QI‑EOS; run Auditor; open PR with Change Summary template.

## 2025‑09‑13 — QiEOS Alignment Session — General Review

### 1. Current State (from God Doc + Audit)

- **Architecture frozen**: Cloudflare-first stack (Pages + Workers + R2) with Supabase (Postgres + RLS) as the DB.
- **Schema baseline**: Migrations for orgs, companies, tasks, tickets, KB hierarchy, billing, sites, drops, feature flags, and RLS templates are already defined.
- **Monorepo law**: Canonical tree is locked; any new folders require an RFC. Cursor guardrails + `.cursorrules` enforce this.
- **Electron scope**: Desktop cockpit is explicitly “thin main / fat renderer” with all privileged ops via Worker API.
- **MVP anchor**: Auth + RBAC, tasks, file uploads to R2, KB (public + private), profile updates, and website serving are the “tonight features”.
- **Amendment I**: Supabase schema + Cloudflare setup ratified 2025-09-10; `wrangler.toml` + CI/CD workflows must reflect this.
- **Setup guide**: Full step-through exists (Supabase → Cloudflare R2 → Wrangler secrets → `pnpm dev`).

### 2. Alignment Gaps

- **Physical migrations**: SQL files listed in Amendment I exist in tree, but need to confirm they’re actually populated + applied (`pnpm -C infra/supabase migrate`).
- **Cursor scaffolding**: `.cursorrules`, `.cursorignore`, `.vscode/settings.json`, and `docs/CURSOR_MODES.md` must be present and match locked content.
- **Agents.md**: Repo Concierge + Auditor prompts are defined in the DEV_LOG but may not be physically saved under `docs/agents.md` yet.
- **Validation checklist**: Worker `/health`, `/auth/session`, `/tasks`, `/files/sign-upload`, `/kb/public`, `/kb/private`, and `/me/profile` endpoints still need live smoke tests.
- **Electron**: `apps/admin-electron` folder tree is defined, but unclear if a renderer stub exists beyond `App.tsx`.

### 3. Next Actions (Tiny Steps)

#### Schema Apply

- Run: `pnpm -C infra/supabase migrate` → confirm tables + RLS applied.
- Verify Supabase dashboard shows orgs, projects, tasks, kb, billing, sites, drops.

#### Worker Health

- `pnpm -C workers/api dev` → hit `/health` locally.
- Add smoke checks for `/auth/session` + `/tasks`.

#### Guardrails Check

- Ensure `.cursorrules` and `.cursorignore` at repo root match QiEOS.md §12.
- Create `docs/agents.md` and `docs/CURSOR_MODES.md` if missing.

#### Electron Skeleton

- Verify `apps/admin-electron/src/renderer/App.tsx` builds.
- Ensure it points ONLY to Worker endpoints (no direct Supabase).

#### CI/CD Sync

- Check `.github/workflows/web-pages-deploy.yml` and `worker-deploy.yml` exist.
- Validate Cloudflare API token + account ID secrets set in GitHub.

### 4. Alignment Decisions

- **Repo of Record**: QiEOS (primary), QiLA (secondary support).
- **No deletions**: Anything outdated → move to `.trash/DATE/`.
- **RFC gate**: Any top-level folder changes or schema additions → must be proposed via RFC note in `/docs`.

### 5. Open Questions (for you to decide)

- Do you want me to generate the actual SQL stubs + `wrangler.toml` + GitHub workflow files so they’re in repo (not just documented)?
- Should the Electron cockpit get a barebones renderer now (auth screen + task list) for smoke, or stay skeletal until API endpoints stabilize?
- Do you want me to prep a Cursor follow-up prompt that enforces Git + Windows read-only locks on sacred paths (so no accidental edits)?

⚖️ This alignment session sets the repo at a stable constitutional point. Next milestone is applying schema + validating Worker endpoints. From there, we can layer the admin cockpit + client portal UI.

---

# 🧱 Decisions Log

- **2025‑09‑10**: Primary repo set to **QI‑EOS**; **QI‑LA** tracked as secondary.

---

# 🧰 Environment Checklist

- [ ] Cloudflare Pages connected to GitHub repo; preview deploys enabled.
- [ ] Pages env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.
- [ ] Worker KV/DB bounds (if used) documented in `/docs/env.md`.
- [ ] Supabase: tables created (clients, tickets, updates), RLS policies noted.

---

# 🗺️ Next Actions (tiny steps)

1. Add `/docs/agents.md` with Repo Concierge + Auditor prompts (copy from above).
2. Commit & push; paste PR link here; run Auditor and fix top 1 issue.

---

# 📦 Change Summary Template (paste in PR)

**What changed**: _one‑liner_.
**Why**: aligns to Dev Plan (goal).
**How to test**: steps.
**Rollback**: revert commit; restore from `.trash/` if files moved.

---

# 📝 Notes

- Keep this file open while coding; update _Session Log_ as the source of truth.

---

# Source: SETUP.md

# QiEOS Setup Guide

This guide will help you set up the QiEOS development environment and deploy to production.

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **pnpm** - `npm install -g pnpm`
- **Git** - [Download](https://git-scm.com/)
- **Wrangler CLI** - `npm install -g wrangler`
- **Supabase Account** - [Sign up](https://supabase.com/)
- **Cloudflare Account** - [Sign up](https://cloudflare.com/)

## Quick Start

1. **Clone and setup**

   ```bash
   git clone <repository-url>
   cd qieos
   pnpm setup
   ```

2. **Set up Supabase**

   - Create a new Supabase project
   - Run `scripts/create-migrations.sql` in the SQL editor
   - Get your project URL and API keys

3. **Configure Cloudflare**

   - Create R2 buckets: `qieos-files` and `qieos-files-dev`
   - Get your Cloudflare API token
   - Set up wrangler secrets

4. **Start development**
   ```bash
   pnpm dev
   ```

## Detailed Setup

### 1. Database Setup (Supabase)

1. **Create Supabase Project**

   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose organization and enter project details
   - Wait for project to be ready

2. **Run Database Migrations**

   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `scripts/create-migrations.sql`
   - Click "Run" to execute the migration
   - Verify tables were created in the Table Editor

3. **Get API Keys**
   - Go to Settings > API
   - Copy your Project URL and API keys
   - You'll need: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### 2. Cloudflare Setup

1. **Create R2 Buckets**

   ```bash
   # Login to Cloudflare
   wrangler login

   # Create buckets
   wrangler r2 bucket create qieos-files
   wrangler r2 bucket create qieos-files-dev
   ```

2. **Set up Worker Secrets**

   ```bash
   cd workers/api

   # Set secrets
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   wrangler secret put OPENAI_API_KEY
   wrangler secret put STRIPE_SECRET_KEY
   ```

3. **Deploy Worker**
   ```bash
   pnpm --filter qieos-api deploy
   ```

### 3. Environment Configuration

1. **Copy Environment Templates**

   ```bash
   cp infra/cloudflare/env.example infra/cloudflare/.env
   cp apps/web/.env.example apps/web/.env
   cp workers/api/.env.example workers/api/.env
   ```

2. **Fill in Environment Variables**
   - Update `.env` files with your actual values
   - Never commit `.env` files to git

### 4. Development

1. **Start Development Servers**

   ```bash
   # Start all services
   pnpm dev

   # Or start individually
   pnpm --filter qieos-web dev    # Web app on :5173
   pnpm --filter qieos-api dev    # Worker on :8787
   ```

2. **Build and Test**

   ```bash
   # Build all packages
   pnpm build

   # Build web app
   pnpm --filter qieos-web build

   # Type check worker
   pnpm --filter qieos-api type-check
   ```

## Deployment

### Web App (Cloudflare Pages)

1. **Manual Deployment**

   ```bash
   pnpm deploy:web
   ```

2. **GitHub Actions** (Recommended)
   - Push to `main` branch
   - GitHub Actions will automatically deploy
   - Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets

### Worker (Cloudflare Workers)

1. **Manual Deployment**

   ```bash
   pnpm deploy:worker
   ```

2. **GitHub Actions** (Recommended)
   - Push to `main` branch
   - GitHub Actions will automatically deploy

### Client Sites (Cloudflare Pages)

1. **Deploy All Sites**

   ```bash
   pnpm deploy:sites
   ```

2. **Deploy Specific Site**
   ```bash
   cd sites/clients/your-site
   wrangler pages deploy . --project-name=qieos-your-site
   ```

## Validation Checklist

After setup, verify these endpoints work:

- [ ] `GET /health` - Worker health check
- [ ] `POST /auth/session` - Authentication endpoint
- [ ] `GET /tasks` - Tasks CRUD with RLS
- [ ] `POST /files/sign-upload` - File upload to R2
- [ ] `GET /kb/public` - Public knowledge base
- [ ] `GET /kb/private` - Private knowledge base
- [ ] `PATCH /me/profile` - Profile updates
- [ ] Root website serves from Pages

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Check Node.js version: `node --version` (should be 18+)
   - Clear node_modules: `rm -rf node_modules && pnpm install`
   - Check TypeScript errors: `pnpm --filter qieos-web type-check`

2. **Database Connection Issues**

   - Verify Supabase URL and keys
   - Check RLS policies are applied
   - Ensure user has proper permissions

3. **Cloudflare Deployment Issues**

   - Verify API token has correct permissions
   - Check wrangler.toml configuration
   - Ensure secrets are set: `wrangler secret list`

4. **Authentication Issues**
   - Verify Supabase Auth is configured
   - Check JWT claims enrichment in Worker
   - Ensure RLS policies allow user access

### Getting Help

- Check the [God Doc](README.md) for architecture details
- Review [Amendment I](<docs/dev_specs/QiEOS%20•%20Official%20Development%20Specification%20(Amendment%20I).md>) for schema details
- Look at the [Development Log](DEV_LOG.md) for recent changes

## Next Steps

Once setup is complete:

1. **Test MVP Features**

   - Authentication flow
   - Task management
   - File uploads
   - Knowledge base access

2. **Customize for Your Use Case**

   - Update feature flags
   - Customize UI components
   - Add your branding

3. **Deploy to Production**
   - Set up custom domains
   - Configure production environment
   - Set up monitoring and alerts

---

**Need help?** Check the troubleshooting section or review the project documentation.

---

# Source: QiEOS • Official Development Specification.md

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
|\_qieos*docs
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
│ │ │ ├─ auth/ # '/auth/*'
│ │ │ ├─ client/ # '/client/:companySlug/_'
│ │ │ ├─ internal/ # '/internal/_'
│ │ │ └─ admin/ # '/admin/\_' (web fallback)
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
ops/QiSuite/
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

# ================================================== 2) ADD CURSOR / EDITOR GUARDRAILS

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

# ================================================== 3) DEFINE CURSOR CUSTOM MODES (as instructions text)

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

# ================================================== 4) DO NOT WRITE APPLICATION CODE

- Do NOT create React components, Worker handlers, or TS implementation files.
- Only create the folder tree, placeholder READMEs, .gitkeep, and the files listed in sections 2–3.

# ================================================== 5) ACCEPTANCE CHECKLIST (verify before committing)

- [ ] All directories exist as listed, each with `.gitkeep` and a short `README.md` if otherwise empty.
- [ ] `apps/web/public/kb/index.json` and `getting-started.md` exist with starter content.
- [ ] `.cursorrules`, `.cursorignore`, optional `.cursorindexingignore`, and `.vscode/settings.json` exist at repo root.
- [ ] `docs/EDITOR.md` and `docs/CURSOR_MODES.md` created.
- [ ] No app logic files were generated.
- [ ] Commit created: "chore(scaffold): QiEOS structure + cursor agents/rules".

Proceed to apply the file/folder changes now.

Want me to also give you a tiny follow-up prompt that sets Windows read-only flags and Git skip-worktree on the “do-not-touch” paths right after Cursor finishes writing these files?

---

# Source: QiSuite_Dev_Bible.md

# QiSuite Dev Bible

## 📌 Project Overview

**QiSuite** is a modular second brain framework with:

- A desktop app (Electron + React + Tailwind)
- A hosted chatbot (Cloudflare Worker API)
- Core assistant ("Qinnie") that runs both locally and in the cloud

Main goal: create a modular and extensible foundation for AI-first business tools like:

- QiFileFlow (duplicate file cleaner + OCR)
- QiNote (semantic note builder)
- QiLifeFeed (daily logs, time tracking, automations)
- QiMind (vector memory / contextual Qinnie)

---

## 🔧 Stack Overview

### Desktop (Electron + React + Tailwind)

- Runs on `Electron` using Vite as the dev server.
- Hot-reloads React UI with Tailwind CSS.
- Has local storage-based settings management (for API keys, etc.).
- Loads Qinnie dock on all screens.

### Web API (Cloudflare Worker)

- POST endpoint: `/chat`
- Accepts `{ message }` JSON and returns `{ reply }`
- Will eventually support:
  - OpenAI + Ollama fallback
  - Per-client memory (KV store)
  - Branded deployment URLs

---

## ⚙️ Features (Current)

### ✅ Electron Shell

- Main window loads Vite app.
- Preload.js supports secure IPC for key storage.

### ✅ UI (React + Tailwind)

- Homepage with `Hero`, `Pitch`, `Pricing`, `Footer`
- Persistent `QinnieDock` open by default
- Responsive layout

### ✅ QinnieDock

- Floating assistant dock in lower right
- Open by default (can collapse)
- Settings panel (gear icon):
  - OpenAI Key
  - Worker URL
- Messages persist per session (local only)
- Replies fetched from Worker (if configured), else fallback

### ✅ Branding

- Core brand: **QiSuite**
- Powered by: **BuiltByRays™**
- All client-specific assets abstracted to `shared/theme.js`

### ✅ Worker API

- Cloudflare Worker endpoint: `/chat`
- Basic echo-style reply stub
- Ready for KV + OpenAI integrations

---

## 🔐 Settings Management

Uses localStorage for now:

- `OPENAI_API_KEY`
- `WORKER_API_URL`

Settings panel available inside Qinnie dock.

---

## 🧱 Folder Structure

```
QiSuite_Full_Build/
├── electron/
│   ├── main/              ← Electron startup logic
│   ├── renderer/
│   │   ├── pages/App.jsx
│   │   ├── components/    ← Modular UI: Hero, Pitch, Pricing, Dock, etc.
│   └── package.json
│
├── shared/
│   └── theme.js           ← Branding config
│
├── workers/
│   ├── src/index.js       ← Cloudflare Worker logic
│   └── wrangler.toml
└── README.md              ← Full setup & deployment guide
```

---

## 🌐 Cloudflare Deployment

### Setup

```bash
npm install -g wrangler
wrangler login
cd workers
wrangler publish
```

### URL

```http
POST https://your-app-name.workers.dev/chat
Content-Type: application/json
Body: { "message": "Hello Qinnie" }
```

### KV / Secrets (coming)

```bash
wrangler kv:namespace create QINNIE_KV
wrangler secret put OPENAI_API_KEY
```

---

## 🔮 Next Sprints

### Sprint 1: QiFileFlow

- Duplicate file detection (hashing)
- OCR and semantic labeling
- File quarantine + tagging UI

### Sprint 2: QiMind

- Local vector database (Chroma, Weaviate, or Ollama embed)
- RAG + search for enhanced memory in Qinnie

### Sprint 3: Client Portal Mode

- Convert UI into mobile-friendly PWA
- Tailwind theme overrides per client repo

---

## 🧠 Notes

- All branding should come from `theme.js`
- Clients can fork or clone this repo and deploy their own version
- Shared modules will live in `modules/` soon

---

## ✍️ Maintainer

**Q / Cody Rice Velasquez**
`qially.me` · `qiSuite.app` · `BuiltByRays™`

---

> “Go big or go home.” – The mission is modular sovereignty. This is just the beginning.
> Session’s reset, so I rebuilt your **entire Zoho AI Blog Pipeline Blueprint** (Solid-but-Big) with OpenAI handling content + cover images. Here’s the **end-to-end package**:

---

# **Zoho AI Blog Pipeline – Full Blueprint**

## **1. System Overview**

- **Workflow:** AI generates → Draft → Approval → Publish → Social Share → Archive

- **Core Tools:**

  - **Zoho Flow** (automation backbone)

  - **Zoho Projects/Tasks** (content pipeline board)

  - **Zoho Forms** (approval gateway)

  - **Zoho WorkDrive** (draft storage)

  - **Zoho Sites** (blog CMS)

  - **Zoho Social** (distribution)

  - **OpenAI (GPT-4 + DALL·E)** (content + images)

---

## **2. Folder & Task Structure**

### **WorkDrive Structure**

```
/Blog
  /Topics
  /Drafts
  /Approved
  /Published
```

### **Projects Board Columns**

- Topics → Draft → Pending Approval → Approved → Published

---

## **3. Flow Architecture**

### **Flow 1: Topic Generation**

- **Trigger:** Monthly schedule (1st day)

- **Action:**

  - OpenAI → generate 4–8 SEO blog topics

  - Create Zoho Tasks with titles, keywords, dates

### **Flow 2: Draft Creation**

- **Trigger:** New task enters “Draft”

- **Action:**

  - OpenAI → write full blog draft

  - DALL·E → create cover image

  - Save files to WorkDrive/Drafts

  - Update Task with WorkDrive links

### **Flow 3: Approval Workflow**

- **Trigger:** Draft ready

- **Action:**

  - Zoho Form auto-filled with article preview + approve/reject buttons

  - Submission updates task:

    - Approve → move to “Approved”

    - Reject → send back to “Draft” with comments

### **Flow 4: Publish**

- **Trigger:** Task moves to “Approved”

- **Action:**

  - Push article + image via Zoho Sites API

  - Mark task as “Published”

### **Flow 5: Social Share**

- **Trigger:** New blog published

- **Action:**

  - AI generates captions (long/short/hashtag variants)

  - Post via Zoho Social to LinkedIn, IG, Facebook, X

### **Flow 6: Archive**

- Move final draft + image to “Published” folder

- Log analytics in Zoho Analytics or Sheet

---

## **4. AI Prompt Templates**

### **Topic Generation**

```
Generate {X} blog post ideas for [brand/audience].
Focus on trending topics for next {month}.
Output: Title + 3 keywords + 1-sentence hook.
```

### **Blog Draft**

```
Write a {1,200}-word blog post for [brand/audience].
Tone: conversational, professional.
Include H2 sections, SEO keywords, and call-to-action.
Format: Markdown (Zoho compatible).
```

### **Cover Image**

```
Create a modern, vibrant cover image for a blog about [topic].
Style: minimal, brand colors (#hex).
Format: 1200x630px, no text.
```

---

## **5. Zoho Form (Approval Mockup)**

**Fields:**

- Article Title (auto-filled)

- Preview (link to WorkDrive)

- Approve (Yes/No radio)

- Feedback (multi-line)

- Submit button → triggers Flow update

---

## **6. Zoho Sites API (Publish)**

**Endpoint:**
`POST https://sites.zoho.com/api/v1/blogs/{siteId}/posts`

**Payload:**

```json
{
  "title": "Blog Title",
  "content": "<p>HTML of blog</p>",
  "image": "https://workdrive.link/image.jpg",
  "meta_title": "SEO Title",
  "meta_description": "SEO Description",
  "status": "published"
}
```

---

## **7. Social Share (Zoho Social API)**

**Caption Generator Example:**

```
Create 3 caption variants:
1. Conversational (LinkedIn)
2. Short + emoji (Twitter/X)
3. Visual hook (Instagram/Facebook)
Include CTA: "Read full post → [link]"
```

---

## **8. Mockup Overview**

- **Kanban Board:** Visual pipeline from topic → publish

- **Form Preview:** Simple approve/reject flow

- **Automation Map:** Arrows showing Flow steps & triggers

- **Branding:** OpenAI images, QiLife style guide colors

---

## **Next Steps**

1. Configure WorkDrive & Projects structure.

2. Build Flows (start with Topic Gen + Draft Creation).

3. Create Approval Form → link to Flow.

4. Configure Zoho Sites API → test publish.

5. Set up Zoho Social → test captions.

---

Totally hear you—Tauri’s toolchain and Tailwind setup can feel like a hurdle when all you want is a simple GUI shell. Let’s pause on Tailwind and get you a crisp-looking app with plain CSS so you can move on to wiring up the Python bits, then we can layer in fancier styling later.

---

## A. Strip out Tailwind for now

1. **Remove** the Tailwind imports and configs:

   - Delete or ignore `tailwind.config.*` and `postcss.config.*`.

   - In your **`src/index.css`**, wipe it clean (or delete and recreate) with:

     ```css
     /* src/index.css */
     body,
     html,
     #root {
       margin: 0;
       padding: 0;
       height: 100%;
       font-family: sans-serif;
       background: #f5f5f5;
     }
     .app-header {
       background: white;
       box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
       padding: 16px;
       font-size: 1.5rem;
       font-weight: 500;
     }
     .split-view {
       display: flex;
       height: calc(100% - 64px); /* header is 64px tall */
     }
     .sidebar {
       width: 240px;
       background: white;
       border-right: 1px solid #ddd;
       overflow-y: auto;
     }
     .sidebar button {
       display: block;
       width: 100%;
       padding: 12px 16px;
       border: none;
       background: none;
       text-align: left;
       font-size: 1rem;
       cursor: pointer;
     }
     .sidebar button:hover {
       background: #eee;
     }
     .sidebar .active {
       background: #007acc;
       color: white;
     }
     .content {
       flex: 1;
       padding: 24px;
       overflow-y: auto;
     }
     .card {
       background: white;
       padding: 24px;
       max-width: 600px;
       margin: 0 auto;
       box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
       border-radius: 8px;
     }
     .card h2 {
       margin-top: 0;
       margin-bottom: 12px;
       font-size: 1.25rem;
     }
     ```

2. **Update your React components** to use these class names:

   ```tsx
   // src/App.tsx
   import React, { useState } from "react";
   import Sidebar from "./components/Sidebar";
   import DuplicateCleaner from "./components/DuplicateCleaner";
   import FileFlow from "./components/FileFlow";
   import QuickReceipt from "./components/QuickReceipt";
   import "./index.css";

   const modules = {
     "duplicate-cleaner": <DuplicateCleaner />,
     "file-flow":        <FileFlow />,
     "quick-receipt":    <QuickReceipt />
   };

   export default function App() {
     const [active, setActive] = useState<keyof typeof modules>("duplicate-cleaner");
     return (
       <div className="app-header">QILife One 2.0</div>
       <div className="split-view">
         <Sidebar active={active} onSelect={setActive} />
         <div className="content">
           {modules[active]}
         </div>
       </div>
     );
   }
   ```

   ```tsx
   // src/components/Sidebar.tsx
   import React from "react";
   type Props = { active: string; onSelect: (k: string) => void };
   const items = [
     ["duplicate-cleaner", "Duplicate Cleaner"],
     ["file-flow", "File Flow"],
     ["quick-receipt", "Quick Receipt"],
   ] as const;

   export default function Sidebar({ active, onSelect }: Props) {
     return (
       <div className="sidebar">
         {items.map(([key, label]) => (
           <button
             key={key}
             className={active === key ? "active" : ""}
             onClick={() => onSelect(key)}
           >
             {label}
           </button>
         ))}
       </div>
     );
   }
   ```

   ```tsx
   // src/components/DuplicateCleaner.tsx
   import React from "react";
   export default function DuplicateCleaner() {
     return (
       <div className="card">
         <h2>Duplicate Cleaner</h2>
         <p>Placeholder UI for Duplicate Cleaner module</p>
       </div>
     );
   }
   ```

   And similarly wrap `FileFlow` and `QuickReceipt` in `.card`.

3. **Run** as before:

   ```bash
   npm install
   npm run tauri dev
   ```

You’ll immediately get a respectable white‐and‐gray UI with a header, sidebar buttons that highlight, and centered cards—no Tailwind or PostCSS headaches.

---

## B. Next steps

Once you’re comfortable with the shell, we can:

- Wire up the Tauri commands to each module.

- Introduce a lightweight component library (e.g. **Chakra UI** or **Material-UI**) if you want richer styling without custom PostCSS.

- Circle back to Tailwind (or another utility lib) once the core features are working.

Does this plain-CSS approach feel like a better springboard? Let me know and I’ll help with any tweaks or next wiring steps.

Q, step away from the Big Red “Delete Index” button. Some of those index files are _holding the whole wig on_. Let’s do this clean so you stop chasing phantom errors.

# What “index.\*” actually does (quick and real)

- **Barrel/auto‑resolve**: `import x from './foo'` actually loads `./foo/index.(js|ts|tsx)`. Delete that index and every import like that breaks until you change it to `./foo/actualFile`.

- **Entry points**: `renderer/src/index.tsx` (React entry), `app/main/main.js` (Electron main), and the root `index.html` (Vite) are non‑negotiable. Kill those and the app just… won’t.

- **Static folders**: Random `index.html` files sprinkled in content folders (meant to hide directory listing on web servers) are fine to delete in an Electron app—they’re noise.

# What you can delete safely (now)

- Any **index.html** sitting inside vault/docs/marketing/etc. that’s not the **root** app page.

- Any **index.js/ts** that’s just a dead barrel file (it only re‑exports from another file) **IF** you also fix the imports that point at the folder.

# What you must NOT delete

- `qilife-one/app/renderer/src/index.tsx` (or your renderer’s main index file)

- `qilife-one/app/main/main.js` (Electron main process entry)

- Root `index.html` used by Vite/Electron to load the renderer

- Any `preload.js` that your `BrowserWindow` is configured to use

# Fast safety check before you go snip‑snip

**Do this in the project root.**

## 1) Find all imports that rely on folder auto‑index

- **PowerShell (Windows)**:

```powershell
# shows imports that end at a folder (no file extension) – likely relying on index files
(Get-ChildItem -Recurse -Include *.js,*.ts,*.tsx |
  Select-String -Pattern "from\s+['""](\.\/|\.\.\/)[^'""]+['""]" ) |
  Where-Object { $_.Line -notmatch "\.(js|ts|tsx|jsx|mjs|cjs)['""]$" } |
  Select-Object Path, LineNumber, Line
```

- **ripgrep (if you have it):**

```bash
rg -n "from ['\"](\.\/|\.\.\/)[^'\"\.]+['\"]" --glob '!**/dist/**' --glob '!**/node_modules/**'
```

These hits are the **imports you’ll break** if you delete the corresponding `index.*`. Plan to rewrite them to point at actual files (e.g., `./foo/index.ts` → `./foo/fooService.ts`).

## 2) Dry‑run delete without chaos

Rename suspected index files first:

```powershell
Get-ChildItem -Recurse -Include index.js,index.ts,index.tsx,index.html `
| Where-Object { $_.FullName -notmatch "renderer\\src\\index\.tsx|app\\main\\main\.js$|\\index\.html$" } `
| Rename-Item -NewName { $_.Name + ".bak" }
```

Then run:

```bash
npm run typecheck  # if you have tsc configured
npm run build      # see what actually fails
```

If it builds clean, delete the `.bak` files. If not, fix the imports the errors complain about.

## 3) Convert barrels to explicit files (when you _do_ remove them)

Example:

```diff
- import { clean } from './fileflow';
+ import { clean } from './fileflow/clean.js';
```

Do a quick project‑wide replace once you decide on file names.

# Recommendation for your repo right now

## Fast & Dirty (10–15 min)

1. **Keep**:

   - `app/main/main.js`

   - `app/renderer/src/index.tsx`

   - root `index.html`

   - any `preload.js` referenced in `main.js`

2. **Rename** every other `index.*` to `.bak` (command above).

3. Run `npm run build`. Fix only the imports that explode. Delete the rest.

## Solid & Safe (1–2 hrs)

- Replace folder‑level imports with file‑specific imports across the repo (search/replace).

- Delete dead barrel `index.*` files.

- Add **eslint-plugin-import** rules so unresolved imports scream early:

```json
// .eslintrc
{
  "plugins": ["import"],
  "rules": {
    "import/no-unresolved": "error",
    "import/extensions": [
      "error",
      "ignorePackages",
      { "js": "never", "ts": "never", "tsx": "never" }
    ]
  },
  "settings": {
    "import/resolver": { "node": { "extensions": [".js", ".ts", ".tsx"] } }
  }
}
```

## Big Energy (future‑proof)

- **Disallow folder imports** entirely with a lint rule:

```json
"no-restricted-syntax": ["error", {
  "selector": "ImportDeclaration[source.value=/^(\\.\\.?\\/)(?!.*\\.(js|ts|tsx)$).*/]",
  "message": "Import a file, not a folder. Explicit > implicit."
}]
```

- Add a **path alias** system so you never deal with `../../..` nonsense again. In `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@main/*": ["app/main/*"],
      "@renderer/*": ["app/renderer/*"],
      "@backend/*": ["backend/*"]
    }
  }
}
```

And wire webpack/vite to respect those aliases.

# About deleting the _main_ index

You **can** test it: rename the main index (renderer entry) and see if your bundler pukes. Spoiler: it will. Keep the main app entry + Electron main. Those are entry points, not directory‑listing stubs.

---

Say the word and I’ll drop the **zip** with:

- Clean **Electron + Python** split

- No dumb index barrels

- Aliases configured

- Lint rules that block folder‑imports

- Example import patterns (explicit files only)

- Post‑install script to spawn the Python backend

You want **Fast & Dirty** minimal skeleton or **Big Energy** fully commented build‑ready package?

Short answer: it’ll work when we stop tripping over our own shoelaces. Long answer: here’s the game plan to get Cockpit actually launching your backend, showing live status, and not pretending files live in folders that don’t exist. I read the files you dropped in, and a few issues are elbowing each other for “most annoying.” I’m fixing them all in one pass below.

# What’s broken (and why I’m sighing)

1. Renderer vs Electron bridge mismatch

   - `preload.js` exports `electronAPI.launchBackend()`, but `ConnectionManager.jsx` calls `window.require('electron')` and tries `ipcRenderer.invoke(...)`. That won’t fly with `contextIsolation: true`. Use the exposed API instead.

2. Backend launcher command is… not a command

   - In `main.js` your ternary is built on a truthy string, so it always picks the Windows branch, and the command string is malformed. Also, activating the venv and starting Uvicorn needs platform‑specific spawn args, not wishful thinking.

3. Vite/Tailwind paths and folder layout

   - `index.html` imports `/src/main.jsx`, but your `main.jsx`, `App.jsx`, and components are at the project root. Tailwind is looking under `./src/**/*` too. We either move files into `src/` or change all the tooling. Moving is cleaner.

4. Frontend health check expectations

   - UI is hitting `http://localhost:7130/api/run/` on connect. If the backend isn’t up yet, we should trigger the launcher and poll a simple `/health` before loading apps. Right now it just shrugs.

# The fix — step by step

Do these in order, then you can run `npm run electron-dev` like a functional adult.

## 1) Reshuffle the frontend into a proper `src/` layout

Create these folders and move files:

`/src   /components     Dashboard.jsx     Header.jsx     ConnectionManager.jsx     LogViewer.jsx     MiniAppCard.jsx   App.jsx   main.jsx   index.css index.html`

Update imports inside `App.jsx` after moving:

`- import Dashboard from './components/Dashboard' - import Header from './components/Header' - import ConnectionManager from './components/ConnectionManager' + import Dashboard from './components/Dashboard' + import Header from './components/Header' + import ConnectionManager from './components/ConnectionManager'`

Yes, paths stay the same after the move because they’re now relative to `/src`.

`index.html` already points to `/src/main.jsx`, so once the files live there, builds stop sulking.

## 2) Tailwind config: make sure it actually sees your files

`tailwind.config.js`

`export default {    content: [ -    "./index.html", -    "./src/**/*.{js,ts,jsx,tsx}", +    "./index.html", +    "./src/**/*.{js,jsx,ts,tsx}",    ],    theme: { /* unchanged */ }  }`

## 3) Fix the secure Renderer ↔ Main bridge usage

`preload.js` is fine. Use it.

`ConnectionManager.jsx` — replace the raw `ipcRenderer` usage and add a real health check with basic polling:

`-import React, { useState } from 'react'; -import axios from 'axios'; +import React, { useState } from 'react'; +import axios from 'axios';   export default function ConnectionManager({ onConnect }) {    const [status, setStatus] = useState("Disconnected");  -  const checkBackend = async () => { +  const checkBackend = async () => {      try { -      await axios.get("http://localhost:7130/api/run/"); -      setStatus("Connected"); -      onConnect(); +      await axios.get("http://localhost:7130/health"); +      setStatus("Connected"); +      onConnect();      } catch (e) {        console.warn("Backend not running. Attempting to launch..."); -      launchBackend(); +      await launchBackend(); +      await waitForHealth();      }    };  -  const launchBackend = async () => { -    const { ipcRenderer } = window.require('electron'); -    ipcRenderer.invoke("launch-backend") -      .then(() => { -        setStatus("Connected"); -        onConnect(); -      }) -      .catch(() => { -        setStatus("Failed to start"); -      }); -  }; +  const launchBackend = async () => { +    if (!window.electronAPI?.launchBackend) { +      setStatus("No bridge"); +      throw new Error("electronAPI not available"); +    } +    await window.electronAPI.launchBackend(); +  }; + +  const waitForHealth = async (timeoutMs = 15000) => { +    const start = Date.now(); +    while (Date.now() - start < timeoutMs) { +      try { +        await axios.get("http://localhost:7130/health", { timeout: 1000 }); +        setStatus("Connected"); +        onConnect(); +        return; +      } catch { +        await new Promise(r => setTimeout(r, 500)); +      } +    } +    setStatus("Failed to start"); +    throw new Error("Backend failed to become healthy in time"); +  };     return (      <div className="absolute top-4 right-6">        <button          onClick={checkBackend}          className="bg-electric text-white px-4 py-2 rounded shadow hover:bg-blue-600"        >          {status === "Connected" ? "Connected" : "Connect"}        </button>      </div>    );  }`

Also update `App.jsx` so Connect follows the same logic and doesn’t hammer `/api/run/` blindly:

`-  const fetchApps = async () => { +  const fetchApps = async () => {      setIsLoading(true)      try { -      const response = await axios.get('http://localhost:7130/api/run/') +      const response = await axios.get('http://localhost:7130/api/apps')        setApps(response.data)      } catch (err) {        console.error('Failed to fetch miniapps:', err)        setApps([])      } finally {        setIsLoading(false)      }    }     const handleConnect = async () => {      if (!isConnected) { -      // Try to connect and fetch apps        try { -        await fetchApps() +        // Ask ConnectionManager’s button or call the bridge directly if needed. +        if (window.electronAPI?.launchBackend) { +          await window.electronAPI.launchBackend() +        } +        // wait for health quickly +        await axios.get('http://localhost:7130/health', { timeout: 5000 }) +        await fetchApps()          setIsConnected(true)        } catch (err) {          console.error('Failed to connect:', err)          setIsConnected(false)        }      } else {        setIsConnected(false)        setApps([])      }    }`

If your backend doesn’t have `/health` and `/api/apps` yet, you can point these to whatever you actually have. I’m standardizing the endpoints because future-you will thank me.

## 4) Make the backend launcher actually run on Windows, macOS, and Linux

Replace your `ipcMain.handle('launch-backend', ...)` in `main.js` with a sane, cross‑platform spawn. This version:

- Detects platform

- Activates the venv if present

- Uses `uvicorn main:app --host 127.0.0.1 --port 7130`

- Leaves `--reload` for dev only

- Logs output so you can see what exploded

`` // main.js  const { app, BrowserWindow, ipcMain } = require('electron')  const path = require('path')  const isDev = !app.isPackaged  const { spawn } = require('child_process')   let mainWindow   function createWindow() { /* unchanged */ }   app.whenReady().then(() => {    createWindow()     // Handle backend launch from frontend request -  ipcMain.handle('launch-backend', () => { -    const backendPath = path.join(__dirname, '..', 'QiLifeCore-BackendAPI') -    const venvActivate = process.platform === 'win32' -      ? path.join(backendPath, 'venv', 'Scripts', 'activate.bat') -      : path.join(backendPath, 'venv', 'bin', 'activate') - -    const command = 'cmd.exe /c "${venvActivate} && ${backendPath} && python -m uvicorn main:app --reload --port 7130"' -      ? `cmd.exe /c "${venvActivate} && uvicorn main:app --reload"` -      : `bash -c "source ${venvActivate} && uvicorn main:app --reload"` - -    console.log('Launching backend from:', backendPath) -    spawn(command, { cwd: backendPath, shell: true }) -  }) +  ipcMain.handle('launch-backend', async () => { +    const backendPath = path.join(__dirname, '..', 'QiLifeCore-BackendAPI') +    const isWin = process.platform === 'win32' +    const venvPython = isWin +      ? path.join(backendPath, 'venv', 'Scripts', 'python.exe') +      : path.join(backendPath, 'venv', 'bin', 'python') + +    // Prefer venv python if it exists, otherwise fall back to system python +    const pythonCmd = require('fs').existsSync(venvPython) +      ? venvPython +      : (isWin ? 'python' : 'python3') + +    const uvicornArgs = [ +      '-m', 'uvicorn', 'main:app', +      '--host', '127.0.0.1', +      '--port', '7130', +      ...(isDev ? ['--reload'] : []) +    ] + +    console.log('Launching backend:', pythonCmd, uvicornArgs.join(' ')) +    const child = spawn(pythonCmd, uvicornArgs, { cwd: backendPath, shell: false }) + +    child.stdout.on('data', d => console.log('[backend]', d.toString().trim())) +    child.stderr.on('data', d => console.error('[backend]', d.toString().trim())) +    child.on('close', code => console.log('Backend exited with code', code)) + +    return true +  })  })   app.on('window-all-closed', () => {    if (process.platform !== 'darwin') app.quit()  }) ``

## 5) Dev workflow that doesn’t make you cry

- Install deps:

  `npm install`

- Start vite + electron together:

  `npm run electron-dev`

- Click “Connect” in the UI. It will:

  1. Try `/health`

  2. If down, call the bridge to launch backend

  3. Poll `/health` for up to ~15s

  4. Load `/api/apps` and render

If you don’t have `/health` in the FastAPI backend yet, add the world’s most boring endpoint:

`# in QiLifeCore-BackendAPI/main.py from fastapi import FastAPI  app = FastAPI()  @app.get("/health") def health():     return {"ok": True}  @app.get("/api/apps") def apps():     # TODO: wire to your real mini-app registry     return ["FileFlow Duplicate Cleaner", "Cockpit Test App"]`

## 6) Optional polish so it feels alive

- `Header.jsx` connect button is a bit confused: if you’re connected, show Disconnect, but don’t route that through the same `onConnect`. You already handle this in `App.jsx`, so it’s fine. Consider disabling while polling so humans don’t click like caffeinated woodpeckers.

- `Dashboard.jsx` metrics are faked. Later, read real system stats from backend via a `/metrics` endpoint. For now, keep the vibe.

# TL;DR build order

1. Move files into `/src` as above

2. Patch `ConnectionManager.jsx`, `App.jsx`, `main.js` exactly as shown

3. Ensure backend has `/health` and `/api/apps`

4. `npm run electron-dev`

5. Click Connect. It should launch the backend and populate apps, like a responsible adult app would.

# What you’ll get after this pass

- Connect button that actually starts the backend and waits for it to be ready

- No forbidden `ipcRenderer` shenanigans in the Renderer

- Vite and Tailwind no longer blindfolded

- A clean path to packaging with `npm run dist`

If you want me to also wire the live logs (`LogViewer.jsx`) against a FastAPI `websocket` endpoint, that’s the next chunk: add `/ws/{log}` in the backend using `WebSocket` and stream `uvicorn` or per‑mini‑app logs. For today, let’s make the ignition key turn the engine instead of the wipers.

Here you go—clean, receipt-ready, Obsidian-friendly. Two files: **Dev Docs** and **SOP**. Paste straight into your vault.

---

# `DEV_DOCS_qially-support.md`

````md
---
title: "QiAlly Support KB — Dev Docs"
project: "access.qially.com/support"
owner: "QiAlly (Q)"
status: "active"
stack: ["Astro", "Starlight", "Cloudflare Pages/Workers", "Markdown/MDX"]
tags:
  [
    "docs",
    "kb",
    "astro",
    "starlight",
    "cloudflare",
    "elevenlabs",
    "zoho-bookings",
  ]
updated: "2025-09-13"
---

# QiAlly Support KB — Developer Documentation

## 0) Purpose

A lightweight, public-facing knowledge base at **https://access.qially.com/support** with search, ToC, clean sidebar, optional ElevenLabs voice bubble, and booking button/embed.

---

## 1) Architecture Overview

- **Framework**: Astro + Starlight (static site generator; MD/MDX content, built-in Pagefind search).
- **Hosting**: Cloudflare Pages **or** Worker Assets. We mount under **`/support`** using Astro `base: '/support'`.
- **Path Ownership**:
  - If the rest of `access.qially.com` is separate, a **Worker** routes `access.qially.com/support*` to this build.
  - If this repo _is_ the access site, just add the `/support` docs app inside and keep `base: '/support'`.

---

## 2) Local Dev

### Prereqs

- Node 20+
- pnpm or npm
- Cloudflare Wrangler (`npm i -D wrangler`) if using Worker Assets

### Commands

```bash
# Scaffold (first time)
npm create astro@latest -- --template starlight
# Dev
npm i
npm run dev
# Build (respecting base=/support)
npm run build
# Serve via Worker (if using Worker Assets)
npx wrangler deploy
```
````

---

## 3) Config

### `astro.config.mjs` (key bits)

```ts
import { defineConfig, envField } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://access.qially.com",
  base: "/support",
  integrations: [
    starlight({
      title: "QiAlly — Support",
      description: "How we work, expectations, billing, boundaries, and help.",
      lastUpdated: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      sidebar: [
        { label: "Start", items: ["index"] },
        {
          label: "Working Together",
          items: [
            "how-we-work",
            "communication",
            "agreements-expectations",
            "revisions-and-change-requests",
          ],
        },
        {
          label: "Ops & Safety",
          items: [
            "billing-and-payments",
            "security-and-access",
            "support-hours",
          ],
        },
        { label: "Get Help", items: ["book-time"] },
      ],
      head: [
        {
          tag: "script",
          attrs: {
            src: "https://unpkg.com/@elevenlabs/convai-widget-embed",
            async: true,
            type: "text/javascript",
          },
        },
      ],
    }),
  ],
  env: {
    schema: {
      PUBLIC_ELEVENLABS_AGENT_ID: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      PUBLIC_BOOKING_URL: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },
});
```

### Env

Create `.env` or Pages env vars:

```
PUBLIC_BOOKING_URL=https://bookings.zoho.com/your-page
PUBLIC_ELEVENLABS_AGENT_ID=XXXXXXXX
```

> Only **PUBLIC\_\*** envs appear client-side. Do not store secrets here.

---

## 4) Content Structure

```
src/
  content/
    docs/
      index.md
      how-we-work.md
      communication.md
      agreements-expectations.md
      revisions-and-change-requests.md
      billing-and-payments.md
      security-and-access.md
      support-hours.md
      book-time.mdx
  components/
    BookingEmbed.astro
    ConvaiWidget.astro (optional)
```

### Sample Content Frontmatter

```md
---
title: How I Work
description: Process, deliverables, and collaboration rhythm.
updated: 2025-09-13
---
```

### Booking Embed

`src/components/BookingEmbed.astro`

```astro
---
const url = import.meta.env.PUBLIC_BOOKING_URL ?? 'https://bookings.zoho.com/your-page';
---
<div style="width:100%;height:min(1200px,100vh);">
  <iframe src={url} style="width:100%;height:100%;border:0;" loading="lazy" />
</div>
```

`src/content/docs/book-time.mdx`

```mdx
---
title: Book Time
description: Meet with Q for direct help.
updated: 2025-09-13
---

<a
  class="sl-button"
  href={import.meta.env.PUBLIC_BOOKING_URL}
  target="_blank"
  rel="noopener"
>
  Open Booking Page
</a>

<details>
  <summary>Prefer inline booking?</summary>
  <BookingEmbed />
</details>

export const components = {
  BookingEmbed: (await import("../../components/BookingEmbed.astro")).default,
};

;
```

### ElevenLabs Bubble (optional)

`src/components/ConvaiWidget.astro`

```astro
---
const agentId = import.meta.env.PUBLIC_ELEVENLABS_AGENT_ID;
---
{agentId && <elevenlabs-convai agent-id={agentId}></elevenlabs-convai>}
```

Mount it in a page or layout when ready.

---

## 5) Deployment Options

### A) Cloudflare Pages (simple)

- Build command: `npm run build`

- Output dir: `dist`

- Custom domain: `access.qially.com`

- Because `base='/support'`, the docs live under `/support` correctly.

### B) Worker Assets (subpath isolation)

`wrangler.toml`

```toml
name = "qially-support"
main = "src/worker.ts"
compatibility_date = "2025-09-13"

routes = [
  { pattern = "access.qially.com/support*", zone_name = "qially.com" }
]

[assets]
directory = "./dist"
not_found_handling = "single-page-application"
```

`src/worker.ts`

```ts
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
} as ExportedHandler;
```

---

## 6) Theming & UX

- Starlight handles dark mode and ToC out of the box.

- Keep headings H2/H3 for ToC clarity.

- Add small “Last updated” badge via frontmatter.

- Optional JSON-LD `FAQPage` if you add an FAQ doc.

---

## 7) QA Checklist

- `/support` loads on hard refresh (no 404).

- Search finds words in body titles and content.

- Booking link opens; embed shows on `/book-time`.

- If `PUBLIC_ELEVENLABS_AGENT_ID` present, widget appears and loads once.

- Lighthouse a11y ≥ 95.

---

## 8) Maintenance

- Content authors edit `src/content/docs/*`.

- PR requires preview build passing, markdown lint clean, and link check.

- Version bump in `CHANGELOG.md` on user-visible content changes.

---

````

---

# `SOP_qially-support.md`
```md
---
title: "QiAlly Support KB — SOP"
project: "access.qially.com/support"
owner: "QiAlly (Q)"
status: "active"
tags: ["sop", "ops", "docs", "kb", "workflow", "compliance"]
updated: "2025-09-13"
---

# Standard Operating Procedure — QiAlly Support KB

## 1) Scope
Covers content changes, releases, rollbacks, and routine hygiene for the public Support KB at `/support`.

---

## 2) Roles
- **Owner (Q):** approves policy language, signs off on releases.
- **Editor:** writes/updates docs, follows content checklist.
- **Maintainer:** runs builds, deploys, and handles incidents.

---

## 3) Branching & Releases
- `main`: production (immutable except via PR).
- `feat/<topic>`: content/features.
- **Release cadence:** as needed; prefer small, atomic changes.
- **PR requirements:**
  - Checklist completed (below).
  - Preview build green.
  - One reviewer sign-off (Owner or Maintainer).

---

## 4) Content Update Workflow
1. **Draft** in `feat/<topic>`: edit or add `src/content/docs/*.md(x)`.
2. **Lint & Links**:
   - Headings logical (H2/H3).
   - Short descriptions present.
   - Run link check (internal + external).
3. **Tone & Clarity**:
   - Plain language, no legalese unless needed.
   - Actionable bullets; “what to do,” not just “what is.”
4. **Metadata**:
   - Update frontmatter `updated: YYYY-MM-DD`.
   - Keep titles ≤ 60 chars, descriptions ≤ 160 chars.
5. **Preview**:
   - `npm run dev` locally, spot-check ToC, search, booking, and widget (if enabled).
6. **PR** → review → **merge**.
7. **Deploy**:
   - Pages: merge triggers build to `dist`.
   - Worker Assets: `npm run build && npx wrangler deploy`.
8. **Post-Deploy** smoke test:
   - `/support`, `/support/how-we-work`, `/support/book-time`.
   - Search returns recent changes.
   - Hard refresh works (SPA fallback ok).

---

## 5) Incident Response
- **Severity S1 (Critical):** Broken page load, widespread 404s, booking down.
  - Action: Rollback to last known good build.
    - Pages: redeploy previous successful build in dashboard.
    - Worker: `wrangler versions list` (if using), then redeploy prior bundle; or `git revert` and redeploy.
  - Notify stakeholders; note incident in `INCIDENTS.md`.
- **Severity S2 (Major):** Widget or search degraded, content error in legal/billing page.
  - Action: hotfix branch → targeted change → fast deploy.
- **Severity S3 (Minor):** Typos, small layout issues.
  - Action: batch into next routine release.

---

## 6) Governance — Policies & Sensitive Sections
- **Agreements & Expectations**, **Billing**, **Security** = **Owner approval required** before publish.
- Use versioned diffs in PR description. Keep **`CHANGELOG.md`** updated.

---

## 7) Accessibility & QA Checklist (run every PR)
- Headings sequential; ToC shows H2/H3 only.
- Alt text for any images (rare in this KB).
- Links: descriptive, not “click here”.
- Contrast and focus visible (Starlight default OK).
- Keyboard nav reaches booking button and any expandable content.

---

## 8) SEO Hygiene
- Frontmatter description present (≤160 chars).
- Unique titles per page.
- If an FAQ doc exists, consider a simple JSON-LD `FAQPage`.
- Canonical is the page URL under `/support`.

---

## 9) Integrations

### Booking
- **Env:** `PUBLIC_BOOKING_URL` must be a public, embeddable URL.
- Test both: button (new tab) and embed (loads in < 3s, responsive).

### ElevenLabs (optional)
- **Env:** `PUBLIC_ELEVENLABS_AGENT_ID` must be set for bubble to render.
- Domain allowlist must include `access.qially.com`.
- If issues: comment out `ConvaiWidget` include; keep script for later.

---

## 10) Backups & Export
- The repo is the source of truth.
- Weekly: tag `content-YYYY.MM.DD` after notable additions.
- Quarterly: export static HTML (`dist/`) and archive to S3/Drive.

---

## 11) Deletion Safety (AI/Editor Guardrails)
- Never hard-delete files.
- If removal needed, **move** to `.trash/` preserving path.
- Note deletions in PR description and request explicit approval.

---

## 12) Change Log Format (`CHANGELOG.md`)
````

## 2025-09-13

- Added: initial KB scaffold; pages (How I Work, Communication, Agreements, Revisions, Billing, Security, Hours, Book Time).

- Config: base=/support; Pagefind search default.

- Deploy: Worker Assets route access.qially.com/support\*.

```

---

## 13) Cursor Kickoff Prompt (for repeatability)
```

Role: Implement and maintain the QiAlly Support KB at access.qially.com/support using Astro + Starlight.
Objectives:

- Configure astro.config.mjs with site=[https://access.qially.com](https://access.qially.com/) and base=/support.

- Create the docs listed in Dev Docs.

- Implement BookingEmbed.astro and optional ConvaiWidget.astro.

- Ensure Pagefind search, ToC, dark mode, and SPA fallback work on subpath.

- Respect Deletion Safety: never delete; move to .trash/ preserving paths and report moves.

- Produce a PR with checklist, link check pass, and a CHANGELOG entry.

Deliverables:

- Working build in dist/; deploy via Pages or Worker Assets.

- README updates and Dev Docs refresh if paths/config change.

```

---

## 14) Review Cadence
- Monthly: review “Agreements & Expectations,” “Billing,” and “Security” for drift.
- Quarterly: run Lighthouse and accessibility review; track scores.

---

## 15) Exit Criteria
- Content complete and accurate.
- Search returns expected results.
- Booking flow (button and embed) verified.
- Optional voice widget verified or safely disabled.
```

—

Need me to prefill those docs with your exact policy language and booking URL next? I’ll wire it clean and keep your brand voice tight.
