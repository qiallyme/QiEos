# QiEOS Database Migration Files - Manual Creation Required

The `infra/supabase/migrations/` directory is protected and requires manual file creation. Below are the 9 canonical migration files that need to be created:

## 1. 000_init_orgs_companies_contacts.sql

```sql
-- QiEOS Migration: 000_init_orgs_companies_contacts.sql
-- Purpose: Initialize core organizational structure (orgs, departments, companies, contacts)
-- Rollback: DROP TABLE contacts, companies, departments, orgs CASCADE;
-- Dependencies: None (first migration)
-- Date: 2025-01-27

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS orgs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('public', 'external', 'internal')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    domain TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, slug)
);

-- Contacts table (users)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    supabase_user_id UUID UNIQUE NOT NULL, -- Links to auth.users
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'internal', 'external', 'public')),
    department TEXT,
    features JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_departments_org_id ON departments(org_id);
CREATE INDEX IF NOT EXISTS idx_companies_org_id ON companies(org_id);
CREATE INDEX IF NOT EXISTS idx_companies_department_id ON companies(department_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_supabase_user_id ON contacts(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);

-- Enable RLS on all tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
```

## 2. 010_projects_tasks_tickets.sql

```sql
-- QiEOS Migration: 010_projects_tasks_tickets.sql
-- Purpose: Create project management tables (projects, tasks, tickets)
-- Rollback: DROP TABLE tickets, tasks, projects CASCADE;
-- Dependencies: 000_init_orgs_companies_contacts.sql
-- Date: 2025-01-27

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    start_date DATE,
    end_date DATE,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES contacts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table (can be standalone or linked to projects)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES contacts(id),
    created_by UUID REFERENCES contacts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    type TEXT NOT NULL DEFAULT 'bug' CHECK (type IN ('bug', 'feature', 'question', 'task')),
    assigned_to UUID REFERENCES contacts(id),
    created_by UUID REFERENCES contacts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_org_id ON tickets(org_id);
CREATE INDEX IF NOT EXISTS idx_tickets_company_id ON tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_tickets_project_id ON tickets(project_id);

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
```

## 3. 015_time_entries.sql

```sql
-- QiEOS Migration: 015_time_entries.sql
-- Purpose: Create time tracking table
-- Rollback: DROP TABLE time_entries CASCADE;
-- Dependencies: 000_init_orgs_companies_contacts.sql, 010_projects_tasks_tickets.sql
-- Date: 2025-01-27

-- Time entries (polymorphic - can reference project_id or task_id)
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES contacts(id),
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    billable BOOLEAN DEFAULT false,
    hourly_rate DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (project_id IS NOT NULL AND task_id IS NULL) OR
        (project_id IS NULL AND task_id IS NOT NULL) OR
        (project_id IS NULL AND task_id IS NULL)
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_entries_org_id ON time_entries(org_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);

-- Enable RLS on all tables
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
```

## 4. 020_kb_hierarchy_docs_vectors.sql

```sql
-- QiEOS Migration: 020_kb_hierarchy_docs_vectors.sql
-- Purpose: Create knowledge base tables with vector support
-- Rollback: DROP TABLE kb_vectors, kb_docs, kb_collections CASCADE;
-- Dependencies: 000_init_orgs_companies_contacts.sql
-- Date: 2025-01-27

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS "vector";

-- Knowledge base collections (hierarchical)
CREATE TABLE IF NOT EXISTS kb_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES kb_collections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    path TEXT NOT NULL, -- Full path for easy breadcrumbs
    is_public BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES contacts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, path)
);

-- Knowledge base documents
CREATE TABLE IF NOT EXISTS kb_docs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    collection_id UUID REFERENCES kb_collections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    path TEXT NOT NULL, -- Full path for easy breadcrumbs
    is_public BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES contacts(id),
    updated_by UUID REFERENCES contacts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, path)
);

-- Knowledge base vectors for RAG
CREATE TABLE IF NOT EXISTS kb_vectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    doc_id UUID NOT NULL REFERENCES kb_docs(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI ada-002 embedding dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kb_collections_org_id ON kb_collections(org_id);
CREATE INDEX IF NOT EXISTS idx_kb_collections_company_id ON kb_collections(company_id);
CREATE INDEX IF NOT EXISTS idx_kb_collections_parent_id ON kb_collections(parent_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_org_id ON kb_docs(org_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_company_id ON kb_docs(company_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_collection_id ON kb_docs(collection_id);
CREATE INDEX IF NOT EXISTS idx_kb_vectors_org_id ON kb_vectors(org_id);
CREATE INDEX IF NOT EXISTS idx_kb_vectors_doc_id ON kb_vectors(doc_id);

-- Enable RLS on all tables
ALTER TABLE kb_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_vectors ENABLE ROW LEVEL SECURITY;
```

## 5. 025_sites_registry.sql

```sql
-- QiEOS Migration: 025_sites_registry.sql
-- Purpose: Create client sites registry
-- Rollback: DROP TABLE sites_registry CASCADE;
-- Dependencies: 000_init_orgs_companies_contacts.sql
-- Date: 2025-01-27

-- Client sites registry
CREATE TABLE IF NOT EXISTS sites_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    domain TEXT,
    pages_project_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, slug)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sites_registry_org_id ON sites_registry(org_id);
CREATE INDEX IF NOT EXISTS idx_sites_registry_company_id ON sites_registry(company_id);

-- Enable RLS on all tables
ALTER TABLE sites_registry ENABLE ROW LEVEL SECURITY;
```

## 6. 026_drops_meta.sql

```sql
-- QiEOS Migration: 026_drops_meta.sql
-- Purpose: Create R2 public drops metadata table
-- Rollback: DROP TABLE drops_meta CASCADE;
-- Dependencies: 000_init_orgs_companies_contacts.sql
-- Date: 2025-01-27

-- R2 public drops metadata
CREATE TABLE IF NOT EXISTS drops_meta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    key TEXT NOT NULL, -- R2 object key
    filename TEXT NOT NULL,
    content_type TEXT,
    size_bytes BIGINT,
    expires_at TIMESTAMP WITH TIME ZONE,
    download_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES contacts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_drops_meta_org_id ON drops_meta(org_id);
CREATE INDEX IF NOT EXISTS idx_drops_meta_company_id ON drops_meta(company_id);

-- Enable RLS on all tables
ALTER TABLE drops_meta ENABLE ROW LEVEL SECURITY;
```

## 7. 030_billing_ledger_invoices.sql

```sql
-- QiEOS Migration: 030_billing_ledger_invoices.sql
-- Purpose: Create billing and invoice tables
-- Rollback: DROP TABLE invoices, billing_ledger CASCADE;
-- Dependencies: 000_init_orgs_companies_contacts.sql
-- Date: 2025-01-27

-- Billing ledger
CREATE TABLE IF NOT EXISTS billing_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('invoice', 'payment', 'credit', 'refund')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    description TEXT,
    reference_id TEXT, -- External system reference
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    stripe_invoice_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES contacts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, invoice_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_billing_ledger_org_id ON billing_ledger(org_id);
CREATE INDEX IF NOT EXISTS idx_billing_ledger_company_id ON billing_ledger(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);

-- Enable RLS on all tables
ALTER TABLE billing_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
```

## 8. 040_feature_flags.sql

```sql
-- QiEOS Migration: 040_feature_flags.sql
-- Purpose: Create feature flags system
-- Rollback: DROP TABLE company_features, org_features, feature_flags CASCADE;
-- Dependencies: 000_init_orgs_companies_contacts.sql
-- Date: 2025-01-27

-- Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    default_value BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization feature flags
CREATE TABLE IF NOT EXISTS org_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL REFERENCES feature_flags(key),
    enabled BOOLEAN NOT NULL DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, feature_key)
);

-- Company feature flags
CREATE TABLE IF NOT EXISTS company_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL REFERENCES feature_flags(key),
    enabled BOOLEAN NOT NULL DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, feature_key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_features_org_id ON org_features(org_id);
CREATE INDEX IF NOT EXISTS idx_company_features_company_id ON company_features(company_id);

-- Enable RLS on all tables
ALTER TABLE org_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_features ENABLE ROW LEVEL SECURITY;

-- Insert default feature flags
INSERT INTO feature_flags (key, name, description, default_value) VALUES
('crm', 'CRM', 'Customer Relationship Management', false),
('projects', 'Projects', 'Project Management', false),
('tasks', 'Tasks', 'Task Management', false),
('messaging', 'Messaging', 'Internal Messaging System', false),
('kb', 'Knowledge Base', 'Knowledge Base Access', false),
('ai_rag', 'AI RAG', 'AI-powered Retrieval Augmented Generation', false),
('billing', 'Billing', 'Billing and Invoicing', false),
('lms', 'LMS', 'Learning Management System', false),
('client_tools', 'Client Tools', 'Client-specific Tools', false),
('voice_assistant', 'Voice Assistant', 'Voice Assistant Features', false),
('vision_tools', 'Vision Tools', 'Computer Vision Tools', false),
('client_sites', 'Client Sites', 'Client Public Websites', false),
('public_drops', 'Public Drops', 'Public File Drops', false)
ON CONFLICT (key) DO NOTHING;
```

## 9. 900_rls_policies.sql

```sql
-- QiEOS Migration: 900_rls_policies.sql
-- Purpose: Create Row Level Security policies and helper functions
-- Rollback: DROP FUNCTION qieos_company_ids(), qieos_role(), qieos_org() CASCADE; DROP POLICY statements
-- Dependencies: All previous migrations
-- Date: 2025-01-27

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION qieos_org()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT org_id
        FROM contacts
        WHERE supabase_user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION qieos_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role
        FROM contacts
        WHERE supabase_user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION qieos_company_ids()
RETURNS UUID[] AS $$
BEGIN
    RETURN (
        SELECT ARRAY[company_id]
        FROM contacts
        WHERE supabase_user_id = auth.uid()
        AND company_id IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations: Users can only see their own org
CREATE POLICY "Users can view their own org" ON orgs
    FOR SELECT USING (id = qieos_org());

-- Departments: Users can see departments in their org
CREATE POLICY "Users can view departments in their org" ON departments
    FOR SELECT USING (org_id = qieos_org());

-- Companies: Users can see companies in their org, external users only see their assigned companies
CREATE POLICY "Users can view companies in their org" ON companies
    FOR SELECT USING (
        org_id = qieos_org() AND (
            qieos_role() IN ('admin', 'internal') OR
            (qieos_role() = 'external' AND id = ANY(qieos_company_ids()))
        )
    );

-- Contacts: Users can see contacts in their org, external users only see contacts in their companies
CREATE POLICY "Users can view contacts in their org" ON contacts
    FOR SELECT USING (
        org_id = qieos_org() AND (
            qieos_role() IN ('admin', 'internal') OR
            (qieos_role() = 'external' AND company_id = ANY(qieos_company_ids()))
        )
    );

-- Projects: Similar to companies
CREATE POLICY "Users can view projects in their org" ON projects
    FOR SELECT USING (
        org_id = qieos_org() AND (
            qieos_role() IN ('admin', 'internal') OR
            (qieos_role() = 'external' AND company_id = ANY(qieos_company_ids()))
        )
    );

-- Tasks: Similar to projects
CREATE POLICY "Users can view tasks in their org" ON tasks
    FOR SELECT USING (
        org_id = qieos_org() AND (
            qieos_role() IN ('admin', 'internal') OR
            (qieos_role() = 'external' AND company_id = ANY(qieos_company_ids()))
        )
    );

-- Tickets: Similar to projects
CREATE POLICY "Users can view tickets in their org" ON tickets
    FOR SELECT USING (
        org_id = qieos_org() AND (
            qieos_role() IN ('admin', 'internal') OR
            (qieos_role() = 'external' AND company_id = ANY(qieos_company_ids()))
        )
    );

-- Time entries: Users can see their own entries, admins can see all in org
CREATE POLICY "Users can view time entries in their org" ON time_entries
    FOR SELECT USING (
        org_id = qieos_org() AND (
            qieos_role() IN ('admin', 'internal') OR
            user_id = (SELECT id FROM contacts WHERE supabase_user_id = auth.uid())
        )
    );

-- Knowledge base: Public docs visible to all, private docs follow company rules
CREATE POLICY "Users can view public KB docs" ON kb_docs
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view private KB docs in their org" ON kb_docs
    FOR SELECT USING (
        org_id = qieos_org() AND is_public = false AND (
            qieos_role() IN ('admin', 'internal') OR
            (qieos_role() = 'external' AND company_id = ANY(qieos_company_ids()))
        )
    );

-- Similar policies for kb_collections and kb_vectors
CREATE POLICY "Users can view public KB collections" ON kb_collections
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view private KB collections in their org" ON kb_collections
    FOR SELECT USING (
        org_id = qieos_org() AND is_public = false AND (
            qieos_role() IN ('admin', 'internal') OR
            (qieos_role() = 'external' AND company_id = ANY(qieos_company_ids()))
        )
    );

CREATE POLICY "Users can view KB vectors in their org" ON kb_vectors
    FOR SELECT USING (
        org_id = qieos_org() AND (
            qieos_role() IN ('admin', 'internal') OR
            (qieos_role() = 'external' AND company_id = ANY(qieos_company_ids()))
        )
    );

-- Sites registry: Similar to companies
CREATE POLICY "Users can view sites in their org" ON sites_registry
    FOR SELECT USING (
        org_id = qieos_org() AND (
            qieos_role() IN ('admin', 'internal') OR
            (qieos_role() = 'external' AND company_id = ANY(qieos_company_ids()))
        )
    );

-- Drops: Similar to companies
CREATE POLICY "Users can view drops in their org" ON drops_meta
    FOR SELECT USING (
        org_id = qieos_org() AND (
            qieos_role() IN ('admin', 'internal') OR
            (qieos_role() = 'external' AND company_id = ANY(qieos_company_ids()))
        )
    );

-- Billing: Only admins and internal users can see billing data
CREATE POLICY "Admins and internal users can view billing" ON billing_ledger
    FOR SELECT USING (
        org_id = qieos_org() AND qieos_role() IN ('admin', 'internal')
    );

CREATE POLICY "Admins and internal users can view invoices" ON invoices
    FOR SELECT USING (
        org_id = qieos_org() AND qieos_role() IN ('admin', 'internal')
    );

-- Feature flags: Users can see feature flags for their org/company
CREATE POLICY "Users can view org features" ON org_features
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view company features" ON company_features
    FOR SELECT USING (
        company_id = ANY(qieos_company_ids()) OR qieos_role() IN ('admin', 'internal')
    );
```

## Manual Creation Instructions

1. Navigate to `QiEos/infra/supabase/migrations/`
2. Create each of the 9 files listed above with their respective content
3. Ensure proper file naming (000_, 010_, etc.) for correct execution order
4. Run migrations in order using Supabase CLI or SQL editor

## Seed Data (Optional)

After creating all migrations, you can add this seed data:

```sql
-- Insert a default organization for testing
INSERT INTO orgs (id, name, slug, domain) VALUES
('00000000-0000-0000-0000-000000000001', 'QiEOS Demo', 'qieos-demo', 'qieos.com')
ON CONFLICT (slug) DO NOTHING;

-- Insert default departments
INSERT INTO departments (org_id, name, type) VALUES
('00000000-0000-0000-0000-000000000001', 'Public', 'public'),
('00000000-0000-0000-0000-000000000001', 'External', 'external'),
('00000000-0000-0000-0000-000000000001', 'Internal', 'internal')
ON CONFLICT DO NOTHING;

-- Enable all features for the demo org
INSERT INTO org_features (org_id, feature_key, enabled)
SELECT '00000000-0000-0000-0000-000000000001', key, true
FROM feature_flags
ON CONFLICT (org_id, feature_key) DO NOTHING;
```