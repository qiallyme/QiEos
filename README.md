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

   - Set up Supabase project
   - Configure Cloudflare Workers
   - Add environment variables to `workers/api/wrangler.toml`

3. **Run migrations**

   ```bash
   pnpm -C infra/supabase migrate
   ```

4. **Start development servers**

   ```bash
   # Web application
   pnpm -C apps/web dev

   # API worker
   pnpm -C workers/api dev

   # Admin Electron app
   pnpm -C apps/admin-electron dev
   ```

## 📁 Project Structure

```
qieos/
├── apps/
│   ├── web/                    # React web application
│   └── admin-electron/         # Electron admin desktop app
├── workers/
│   └── api/                    # Cloudflare Worker API
├── sites/                      # Client public websites
├── infra/
│   ├── supabase/              # Database migrations & seeds
│   └── cloudflare/            # Cloudflare configuration
├── templates/                  # Reusable content templates
├── blueprints/                 # Directory scaffolds per client
├── packages/                   # Shared packages (ui, types, utils)
└── docs/                      # Documentation
```

## 🔒 Security & Guardrails

- **RLS (Row Level Security)**: All user-facing tables have org_id and RLS enabled
- **JWT Claims**: Server-side claims enrichment with role, org_id, company_ids, features
- **Sacred Paths**: Protected directories that require RFC for changes
- **Service Role**: All privileged operations run in Workers only

## 🎛️ Cursor AI Integration

This project includes specialized Cursor AI agents for different domains:

- **API Agent**: Server-side Worker development
- **UI Agent**: React web application development
- **KB/RAG Agent**: Knowledge base and AI features
- **Migrations Agent**: Database schema management

## 📚 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Setup Guide](docs/SETUP.md)
- [Module Documentation](docs/MODULES.md)
- [AI & RAG Guide](docs/AI_RAG.md)
- [Billing System](docs/BILLING.md)
- [Feature Flags](docs/FEATURE_FLAGS.md)
- [Website Management](docs/WEBSITES.md)

## 🚧 MVP Status

Current MVP includes:

- ✅ Authentication + RBAC
- ✅ Tasks (tenant-scoped)
- ✅ File storage (R2 signed URLs)
- ✅ Knowledge Base (public + private read)
- ✅ Profile updates
- ✅ Public website visibility

## 🤝 Contributing

1. Follow the God Doc structure exactly
2. Use appropriate Cursor AI agents for your domain
3. Keep files under 400 lines; split if needed
4. Never expose secrets to client code
5. All service-role operations in Workers only

## 📄 License

Proprietary - QiAlly LLC (QiEOS)

---

**Built with ❤️ by the QiEOS team**
