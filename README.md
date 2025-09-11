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

```
