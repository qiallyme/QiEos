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
