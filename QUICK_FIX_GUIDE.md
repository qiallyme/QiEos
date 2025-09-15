# QiEOS Data Connectivity Quick Fix Guide

## 🚨 The Problem

Your UI is showing empty data because:

1. **Missing Worker endpoints** - UI calls `/api/apps`, `/kb/private`, `/orgs`, `/contacts` but these don't exist
2. **Empty database** - No Supabase tables or seed data
3. **Missing wrangler.toml** - Worker configuration file

## ✅ The Solution (5-10 minutes)

### Step 1: Set up Supabase Database

1. **Go to your Supabase SQL Editor**
2. **Run the schema migration** (paste this into SQL Editor):

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Organizations table
CREATE TABLE IF NOT EXISTS orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table (belongs to orgs)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, slug)
);

-- Contacts table (users in the system)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  supabase_user_id UUID UNIQUE, -- Links to Supabase auth.users
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'external', -- admin, internal, external, public
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES contacts(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KB Collections (hierarchical)
CREATE TABLE IF NOT EXISTS kb_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES kb_collections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  path VARCHAR(500) NOT NULL, -- Full path like "Internal/Onboarding"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KB Documents
CREATE TABLE IF NOT EXISTS kb_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES kb_collections(id) ON DELETE SET NULL,
  slug VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[], -- Array of tags
  audiences TEXT[], -- Array of audience types: internal, external, public
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, slug)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_supabase_user_id ON contacts(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_org_id ON kb_docs(org_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_collection_id ON kb_docs(collection_id);
CREATE INDEX IF NOT EXISTS idx_kb_collections_org_id ON kb_collections(org_id);
CREATE INDEX IF NOT EXISTS idx_kb_collections_parent_id ON kb_collections(parent_id);
```

3. **Run the seed data** (paste this into SQL Editor):

```sql
-- Create test organization
INSERT INTO orgs (id, slug, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'test-org', 'Test Organization')
ON CONFLICT (slug) DO NOTHING;

-- Create test company
INSERT INTO companies (id, org_id, name, slug) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Test Company', 'test-company')
ON CONFLICT (org_id, slug) DO NOTHING;

-- Create test contacts
INSERT INTO contacts (id, org_id, company_id, email, full_name, role) VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'admin@test.org', 'Test Admin', 'admin'),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'user@test.org', 'Test User', 'external')
ON CONFLICT (email) DO NOTHING;

-- Create test project
INSERT INTO projects (id, org_id, company_id, name, description) VALUES
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Test Project', 'A sample project for testing')
ON CONFLICT DO NOTHING;

-- Create test tasks
INSERT INTO tasks (id, org_id, project_id, company_id, assigned_to, title, description, status, priority) VALUES
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Setup Development Environment', 'Configure the development environment for the project', 'pending', 'high'),
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Review Documentation', 'Review and update project documentation', 'in_progress', 'medium')
ON CONFLICT DO NOTHING;

-- Create test KB collection
INSERT INTO kb_collections (id, org_id, name, path) VALUES
  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'Internal', 'Internal')
ON CONFLICT DO NOTHING;

-- Create test KB document
INSERT INTO kb_docs (id, org_id, collection_id, slug, title, content, tags, audiences) VALUES
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', 'welcome-internal', 'Welcome to QiEOS', 'This is a sample internal knowledge base document. It contains information about the QiEOS system and how to use it effectively.', ARRAY['welcome', 'internal', 'getting-started'], ARRAY['internal'])
ON CONFLICT (org_id, slug) DO NOTHING;
```

### Step 2: Configure Worker Secrets

1. **Get your Supabase credentials** from your Supabase dashboard:

   - Project URL
   - Service Role Key (from Settings > API)

2. **Set Worker secrets**:

```bash
cd workers/api
wrangler secret put SUPABASE_URL
# Paste your Supabase URL when prompted

wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# Paste your service role key when prompted
```

### Step 3: Start the Worker

```bash
cd workers/api
pnpm dev
```

### Step 4: Test Everything

Run the smoke test script:

```bash
node scripts/smoke-test.mjs --service-role-key=YOUR_SERVICE_ROLE_KEY
```

## 🧪 Quick Tests

### Test Worker endpoints directly:

```bash
# Test health
curl http://localhost:8787/health

# Test public KB
curl http://localhost:8787/kb/public

# Test apps
curl http://localhost:8787/api/apps

# Test private KB (with service role key)
curl -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" http://localhost:8787/kb/private
```

### Test in your Electron app:

1. **Start your Electron app**
2. **Click "Connect"** - it should now show data
3. **Check DevTools Network tab** - you should see successful API calls

## 🔧 What I Fixed

1. **Created missing Worker endpoints**:

   - `/kb/public` - Public knowledge base
   - `/kb/private` - Private knowledge base (auth required)
   - `/api/apps` - List of available mini-apps
   - `/orgs` - Organization management
   - `/crm/contacts` - Contact management (already existed)

2. **Created wrangler.toml** - Worker configuration file

3. **Created database schema** - All the tables your system needs

4. **Created seed data** - Test data so you can see something immediately

5. **Created smoke test script** - Automated testing of all endpoints

## 🚀 Next Steps

1. **Link real users**: Update the `supabase_user_id` field in the contacts table to link to actual Supabase auth users
2. **Add RLS policies**: The schema is ready, but you'll want to add Row Level Security policies for production
3. **Customize the data**: Replace the test data with your real organizations, companies, and contacts

## 🆘 Still Having Issues?

Run the smoke test with verbose output:

```bash
node scripts/smoke-test.mjs --service-role-key=YOUR_KEY --verbose
```

This will show you exactly which endpoints are failing and why.
