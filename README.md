# QiEOS

**Unified Client Portal, Admin Control, APIs, AI, Billing & Public Websites**

QiEOS is a comprehensive platform that unifies client portals, admin control, APIs, AI (RAG/voice/vision), billing, and per-client public websites—all without requiring restructuring later. Built with Cloudflare-first architecture and Supabase backend.

## 🏗️ Architecture

- **Frontend**: React + Vite + TypeScript (TSX) with Tailwind CSS
- **Backend**: Cloudflare Workers (Hono) + Supabase (Postgres + Auth + RLS)
- **Storage**: Cloudflare R2 for files, Supabase for metadata
- **Admin**: Electron desktop application for privileged operations
- **Deployment**: Cloudflare Pages + Workers

## 🎯 Core Features

### Multi-Tenant Organization

- **Org → Department → Company → Contact** hierarchy
- Role-based access control (admin, internal, external, public)
- Feature flags for module access control

### Client Portal

- Task management (tenant-scoped)
- File storage with signed URLs
- Knowledge base (public + private)
- AI assistants with RAG, voice, and vision
- Billing and invoicing
- Project and ticket management

### Admin Control

- Tenant provisioning and branding
- CRM management
- Knowledge base editing
- Bulk data ingestion for RAG
- Billing desk operations
- Script execution and migrations

### Public Websites

- Per-client public sites (Cloudflare Pages)
- Static knowledge base articles
- File drops with TTL policies

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- Cloudflare account

### Development Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd qieos
   pnpm install
   ```

2. **Configure environment**

   - Set up a new Supabase project.
   - In `infra/cloudflare/wrangler.toml`, fill in your Supabase project URL and service role key. You will also need to add API keys for OpenAI and Stripe if you use those features.
   - Create a file `workers/api/.dev.vars` and add your development secrets there. You can copy the keys from `infra/cloudflare/env.example` but note that `wrangler` does not load `.env` files. The format is `KEY="VALUE"`.

     ```
     # workers/api/.dev.vars

     SUPABASE_URL="YOUR_SUPABASE_URL"
     SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
     OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
     STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET_KEY"
     JWT_SECRET="YOUR_JWT_SECRET"
     ```

   - Create a file `apps/web/.env` for the web app's environment variables:

     ```
     # apps/web/.env

     VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
     VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
     VITE_API_URL="http://localhost:8787"
     ```

3. **Run migrations**

   - Go to your Supabase project's SQL Editor.
   - Copy the content of `scripts/create-migrations.sql` and run it.

4. **Start development servers**

   - In the `workers/api/package.json` file, update the `dev` script to:
     `"dev": "wrangler dev --config ../../infra/cloudflare/wrangler.toml --persist"`

   - In the root directory, run:

   ```bash
   # Start both the web app and the API worker
   pnpm dev
   ```

## 📁 Project Structure

```
qieos/
├─ apps/
│  ├─ web/                                  # React + Vite (TSX) | website + portal
│  │  ├─ index.html
│  │  ├─ vite.config.ts
│  │  ├─ tsconfig.json
│  │  ├─ public/                            # our public website & static KB
│  │  │  ├─ favicon.ico
│  │  │  ├─ logo.svg
│  │  │  ├─ manifest.json
│  │  │  ├─ robots.txt
│  │  │  └─ kb/                             # optional static public KB
│  │  │     ├─ index.json
│  │  │     └─ getting-started.md
│  │  └─ src/
│  │     ├─ main.tsx
│  │     ├─ App.tsx
│  │     ├─ routes/
│  │     │  ├─ public/                      # '/', '/kb', etc.
│  │     │  ├─ auth/                        # '/auth/*'
│  │     │  ├─ client/                      # '/client/:companySlug/*'
│  │     │  ├─ internal/                    # '/internal/*'
│  │     │  └─ admin/                       # '/admin/*' (web fallback)
│  │     ├─ components/                     # reusable UI
│  │     ├─ modules/
│  │     │  ├─ crm/
│  │     │  ├─ projects/                    # projects, tickets
│  │     │  ├─ tasks/                       # tasks (can stand alone; project_id nullable)
│  │     │  ├─ messaging/                   # chat (WS)
│  │     │  ├─ kb/                          # private KB UI (org/company scoped)
│  │     │  ├─ ai/                          # assistants + RAG + voice + vision
│  │     │  │  ├─ chat/
│  │     │  │  ├─ rag/
│  │     │  │  ├─ voice/
│  │     │  │  └─ vision/
│  │     │  ├─ billing/                     # invoices, statements, payments
│  │     │  ├─ lms/                         # (future)
│  │     │  └─ client-tools/                # togglable mini-tool hub
│  │     ├─ lib/                            # client-side libraries
│  │     │  ├─ supabaseClient.ts
│  │     │  ├─ api.ts                       # Worker fetch wrapper
│  │     │  ├─ flags.ts                     # feature flag resolver
│  │     │  └─ claims.ts                    # JWT helpers/types
│  │     ├─ context/                        # Auth, Tenant, Flags
│  │     ├─ hooks/                          # useAuth/useTenant/useFlags/queries
│  │     ├─ store/                          # tanstack-query or zustand config
│  │     └─ styles/                         # tailwind.css, tokens
│  └─ admin-electron/                       # Electron desktop admin (TS)
│     ├─ electron-main.ts                   # main process (no secrets in renderer)
│     ├─ preload.ts                         # secure IPC bridge (contextIsolation)
│     ├─ vite.config.ts
│     └─ src/renderer/                      # React UI inside Electron
│        ├─ App.tsx
│        ├─ routes/
│        │  ├─ dashboard/                   # admin home, KPIs
│        │  ├─ tenants/                     # org/company provisioning + branding
│        │  ├─ crm/
│        │  ├─ projects/
│        │  ├─ tasks/
│        │  ├─ kb-editor/                   # create/edit collections & docs
│        │  ├─ ingest/                      # bulk import → RAG (to Worker endpoints)
│        │  ├─ billing-desk/                # invoices, statements, payments mgmt
│        │  ├─ scripts/                     # script runner UI (server-executed)
│        │  ├─ migrations/                  # db migrations launcher (server)
│        │  └─ auditor/                     # read-only audit views, exports
│        ├─ components/
│        └─ lib/
│           ├─ api.ts                       # talks ONLY to Worker API
│           └─ queue.ts                     # local queue (retry/offline) → Worker
│
├─ sites/                                   # public client sites (each own Pages project)
│  ├─ _themes/                              # shared themes
│  ├─ _assets/
│  ├─ _scripts/
│  └─ clients/
│     ├─ {client-slug}/
│     │  ├─ site/                           # Astro/Vite/Eleventy etc.
│     │  ├─ public/
│     │  └─ pages.config.json               # Pages metadata
│     └─ ...
│
├─ drops/                                   # random public files (served via Worker/R2)
│  ├─ README.md
│  └─ .gitkeep
│
├─ workers/
│  └─ api/                                  # Cloudflare Worker (Hono)
│     ├─ wrangler.toml
│     └─ src/
│        ├─ index.ts                        # mount router + middleware
│        ├─ middleware/
│        │  ├─ auth.ts                      # Supabase JWT verify + enrich claims
│        │  └─ flags.ts                     # org/company feature toggle injector
│        ├─ routes/
│        │  ├─ health.ts
│        │  ├─ auth.ts                      # session→claims endpoint
│        │  ├─ tenants.ts                   # org/company provisioning & branding
│        │  ├─ crm.ts
│        │  ├─ projects.ts
│        │  ├─ tasks.ts
│        │  ├─ messaging.ts
│        │  ├─ kb.ts                        # kb_collections/docs CRUD + signed URLs
│        │  ├─ rag.ts                       # embed/query/citations (RAG)
│        │  ├─ billing.ts                   # Stripe webhooks + statements
│        │  ├─ lms.ts
│        │  ├─ tools.ts                     # script exec (server-side), mini-app hooks
│        │  └─ sites.ts                     # Pages orchestration + R2 drop links
│        ├─ integrations/                   # external APIs (1 file per vendor)
│        │  ├─ openai.ts
│        │  ├─ stripe.ts
│        │  ├─ elevenlabs.ts
│        │  ├─ ocr.ts
│        │  ├─ zoho.ts
│        │  └─ r2.ts
│        └─ lib/
│           ├─ supabaseAdmin.ts             # service-role client (server-only)
│           ├─ vector.ts                    # pgvector queries
│           ├─ embeddings.ts                # OpenAI embeddings
│           ├─ ingest.ts                    # chunkers/parsers (pdf/docx/html)
│           ├─ flags.ts                     # feature flag checks
│           └─ sites.ts                     # Pages helpers
│
├─ templates/                               # reusable content
│  ├─ communications/
│  │  ├─ email/
│  │  ├─ sms/
│  │  └─ whatsapp/
│  ├─ accounting/
│  │  ├─ reports/
│  │  └─ invoices/
│  ├─ legal/
│  │  ├─ contracts/
│  │  └─ letters/
│  ├─ immigration/
│  │  ├─ BLUEPRINTS/                        # mirrors blueprints for docs
│  │  ├─ forms/                             # I-589, I-765, etc.
│  │  └─ narratives/
│  └─ ops/
│     ├─ keysuite/                          # CFO/COO playbooks
│     └─ project-kickoff/
│
├─ blueprints/                              # directory scaffolds you can stamp per client
│  ├─ immigration/
│  │  ├─ I-589/
│  │  ├─ I-765/
│  │  ├─ I-131/
│  │  └─ SIV/
│  ├─ accounting/
│  │  └─ monthly-close/
│  ├─ website/
│  │  └─ minimal-landing/
│  └─ project/
│     └─ default/
│
├─ packages/
│  ├─ ui/
│  ├─ types/
│  └─ utils/
│
├─ infra/
│  ├─ cloudflare/
│  │  ├─ README.md
│  │  └─ env.example
│  └─ supabase/
│     ├─ migrations/
│     │  ├─ 000_init_orgs_companies_contacts.sql
│     │  ├─ 010_projects_tasks_tickets.sql
│     │  ├─ 015_time_entries.sql
│     │  ├─ 020_kb_hierarchy_docs_vectors.sql
│     │  ├─ 025_sites_registry.sql
│     │  ├─ 026_drops_meta.sql
│     │  ├─ 030_billing_ledger_invoices.sql
│     │  ├─ 040_feature_flags.sql
│     │  └─ 900_rls_policies.sql
│     ├─ seeds/
│     │  └─ 000_seed_org_admin.sql
│     └─ README.md
│
├─ docs/
│  ├─ ARCHITECTURE.md
│  ├─ SETUP.md
│  ├─ MODULES.md
│  ├─ AI_RAG.md
│  ├─ BILLING.md
│  ├─ FEATURE_FLAGS.md
│  └─ WEBSITES.md
│
├─ scripts/
│  ├─ db.migrate.mjs
│  ├─ seed.dev.mjs
│  └─ scaffold.mjs                          # stamp blueprints (e.g., I-589)
│
├─ .github/
│  └─ workflows/
│     ├─ web-pages-deploy.yml
│     ├─ worker-deploy.yml
│     └─ sites-deploy.yml
│
├─ package.json
└─ pnpm-workspace.yaml
```

## 🔐 Authentication & Authorization

### JWT Claims Structure
```typescript
type Claims = {
  role: 'admin' | 'internal' | 'external' | 'public';
  org_id: string;
  company_ids?: string[];
  department?: 'public'|'external'|'internal';
  features?: Record<string, boolean>; // merged org + company flags
  scopes?: string[];
};
```

### Feature Flags
- `crm`, `projects`, `tasks`, `messaging`, `kb`, `ai_rag`, `billing`, `lms`
- `client_tools`, `voice_assistant`, `vision_tools`, `client_sites`, `public_drops`
- UI hides disabled modules via `useFlags()`
- API enforces flags, RLS makes bypass impossible

## 🚀 API Endpoints

### Authentication
- `POST /auth/session` → returns enriched claims

### Core Features
- `GET /tasks` / `POST /tasks` / `PATCH /tasks/:id` (scoped by org/company/role)
- `POST /files/sign-upload` → signed URL; `POST /files/complete` → metadata row
- `GET /kb/public` (reads /public/kb/index.json passthrough)
- `GET /kb/private` (scoped list of kb_docs)
- `PATCH /me/profile` (update name, phone, avatar pointer)

### Additional Routes
- `/tenants` - org/company provisioning & branding
- `/crm` - customer relationship management
- `/projects` - project management
- `/messaging` - chat functionality
- `/rag` - AI/RAG operations
- `/billing` - Stripe webhooks + statements
- `/sites` - Pages orchestration + R2 drop links

## ✅ MVP Checklist

- [x] Auth + RBAC: login via Supabase, receive enriched claims from Worker; route guards in web
- [x] Tasks: create/list/update tasks scoped to company/org; visible in client + internal views
- [x] Files: upload via signed URLs to R2; metadata saved; list & download in client view
- [x] KB: Public KB page renders from /public/kb/; Private KB list fetches kb_docs under org
- [x] Profile: /me page where user updates basic profile fields
- [x] Website: main website served (from apps/web/public), visible at root

## 🏗️ Architecture Principles

### Cloudflare-First
- Pages for static sites and web app hosting
- Workers for API and serverless functions
- R2 for file storage with signed URLs

### Supabase Integration
- PostgreSQL with Row Level Security (RLS)
- Built-in authentication and user management
- Real-time subscriptions for live updates

### Security
- All server secrets live only in Workers
- JWT-based authentication with enriched claims
- RLS policies enforce data isolation
- Feature flags control access to functionality

### Scalability
- Multi-tenant architecture with org/company isolation
- Modular design with clear separation of concerns
- Electron admin for desktop management
- Client sites as separate Pages projects

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/qially/qieos/issues)
- **Discussions**: [GitHub Discussions](https://github.com/qially/qieos/discussions)
- **Email**: support@qially.com

## 📄 License

QiEos is released under the [MIT License](LICENSE).

## 🙏 Credits

- Built with [React](https://reactjs.org/)
- Powered by [Cloudflare](https://cloudflare.com/)
- Database by [Supabase](https://supabase.com/)
- UI components with [Tailwind CSS](https://tailwindcss.com/)

## 🏢 About QiAlly

We're a technology company focused on building comprehensive solutions for multi-tenant applications, with expertise in AI integration, billing systems, and client portal development.

## 📢 Stay Updated

Follow us for updates and announcements:
- [Twitter](https://twitter.com/QiAllyLLC)
- [GitHub](https://github.com/qially)
- [Website](https://qially.com)
