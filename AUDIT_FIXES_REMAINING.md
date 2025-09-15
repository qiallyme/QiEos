# 🔧 Remaining Critical Fixes - Manual Steps Required

## Overview

The audit identified several critical issues that require manual fixes due to cursor rules protection. These must be completed to make the repository functional.

## ✅ Completed Fixes

- ✅ Created `packages/` structure with UI, types, and utils
- ✅ Created `workers/api/.dev.vars` template
- ✅ Code formatting applied to all new files

## 🔒 Manual Fixes Required

### 1. Move wrangler.toml to correct location

**Current**: `infra/cloudflare/wrangler.toml`
**Target**: `workers/api/wrangler.toml`

**Steps**:

```bash
# Move the file
mv infra/cloudflare/wrangler.toml workers/api/wrangler.toml

# Edit the file to fix the main path
# Change: main = "workers/api/src/index.ts"
# To:     main = "src/index.ts"
```

### 2. Create missing environment files

**Create `apps/web/.env`**:

```bash
cat > apps/web/.env << 'EOF'
# QiEOS Web App Environment Variables
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_API_URL="http://localhost:8787"
EOF
```

**Create `infra/supabase/.env`**:

```bash
cat > infra/supabase/.env << 'EOF'
# QiEOS Supabase Environment Variables
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
EOF
```

### 3. Move SQL migrations to proper directory

**Move migration files**:

```bash
# Move the main migration
mv migration_000_init_orgs_companies_contacts.sql infra/supabase/migrations/

# Move the RLS policies with proper naming
mv slugged_auth_rls_policies.sql infra/supabase/migrations/050_slugged_auth_rls.sql
```

### 4. Create missing public assets

**Create basic public assets**:

```bash
# Create public directory structure
mkdir -p apps/web/public/kb

# Create favicon (you'll need to add actual favicon.ico)
touch apps/web/public/favicon.ico

# Create logo (you'll need to add actual logo.svg)
touch apps/web/public/logo.svg

# Create manifest.json
cat > apps/web/public/manifest.json << 'EOF'
{
  "name": "QiEOS",
  "short_name": "QiEOS",
  "description": "Unified client portal, admin control, APIs, AI, billing, and per-client public websites",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/logo.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
EOF

# Create robots.txt
cat > apps/web/public/robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://qieos.com/sitemap.xml
EOF

# Create KB index
cat > apps/web/public/kb/index.json << 'EOF'
[
  {
    "title": "Getting Started",
    "slug": "getting-started",
    "description": "Welcome to QiEOS - your unified client portal",
    "updated": "2025-01-27"
  }
]
EOF

# Create KB getting started page
cat > apps/web/public/kb/getting-started.md << 'EOF'
# Getting Started with QiEOS

Welcome to QiEOS - your unified client portal, admin control, APIs, AI, billing, and per-client public websites.

## What is QiEOS?

QiEOS is a comprehensive platform that unifies:
- Client portals with task management
- Admin control and tenant provisioning
- APIs and serverless functions
- AI assistants with RAG, voice, and vision
- Billing and invoicing systems
- Per-client public websites

## Getting Started

1. **Authentication**: Use your organization's login credentials
2. **Dashboard**: Access your personalized dashboard
3. **Tasks**: Create and manage your tasks
4. **Files**: Upload and organize your documents
5. **Knowledge Base**: Access shared resources and documentation

## Need Help?

Contact your administrator or support team for assistance.

---
*Last updated: 2025-01-27*
EOF
```

## 🧪 Verification Steps

After completing the manual fixes:

1. **Install dependencies**:

   ```bash
   pnpm install
   ```

2. **Test the setup**:

   ```bash
   pnpm dev
   ```

3. **Verify endpoints**:

   - Worker health: `http://localhost:8787/health`
   - Web app: `http://localhost:5173`

4. **Check for errors**:
   - Look for missing environment variable warnings
   - Verify all imports resolve correctly
   - Test basic functionality

## 📋 Post-Fix Checklist

- [ ] wrangler.toml moved and main path updated
- [ ] Environment files created with actual values
- [ ] SQL migrations moved to proper directory
- [ ] Public assets created (favicon, logo, manifest, etc.)
- [ ] KB structure created
- [ ] `pnpm install` runs without errors
- [ ] `pnpm dev` starts both worker and web app
- [ ] Health endpoint responds correctly
- [ ] Web app loads without console errors

## 🚨 Important Notes

1. **Replace placeholder values** in environment files with actual Supabase project details
2. **Add actual favicon.ico and logo.svg** files (currently just placeholders)
3. **Test thoroughly** after each fix to ensure nothing breaks
4. **Commit changes** incrementally to track what's working

## 🎯 Next Steps After Fixes

Once all manual fixes are complete:

1. Address remaining audit issues (outdated dependencies, console statements)
2. Set up proper CI/CD workflows
3. Configure production environment variables
4. Test full deployment pipeline

---

**Status**: Ready for manual fixes - all automated fixes completed ✅
