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
