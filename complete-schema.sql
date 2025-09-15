
-- 000_init_orgs_companies_contacts.sql
-- Migration: 000_init_orgs_companies_contacts.sql
-- Purpose: Create foundational tables for organizations, departments, companies, and contacts
-- RLS: All tables have org_id and RLS enabled
-- Created: 2025-01-27

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS orgs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
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
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, slug)
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    supabase_user_id UUID UNIQUE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'external',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_departments_org_id ON departments(org_id);
CREATE INDEX IF NOT EXISTS idx_companies_org_id ON companies(org_id);
CREATE INDEX IF NOT EXISTS idx_companies_department_id ON companies(department_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_supabase_user_id ON contacts(supabase_user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_orgs_updated_at BEFORE UPDATE ON orgs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 010_projects_tasks_tickets.sql
-- QiEOS: Enhanced Projects, Tasks, and Tickets with Todoist-level features
-- Migration: 010_projects_tasks_tickets.sql
-- Purpose: Full-featured task management system with team collaboration
-- Created: 2025-01-27

-- Projects (personal and team)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'personal' CHECK (type IN ('personal', 'team')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  color TEXT DEFAULT '#3498db', -- Hex color for project
  icon TEXT, -- Icon identifier
  settings JSONB DEFAULT '{}', -- Project-specific settings
  parent_id UUID REFERENCES projects(id), -- For project folders
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks with full Todoist feature set
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 4), -- 1=urgent, 4=low
  due_date TIMESTAMPTZ,
  due_time TIME, -- Specific time of day
  duration_minutes INTEGER, -- Estimated duration
  labels TEXT[] DEFAULT '{}', -- Array of label strings
  assignee_id UUID REFERENCES contacts(id),
  parent_task_id UUID REFERENCES tasks(id), -- For sub-tasks
  sort_order INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Comments
CREATE TABLE IF NOT EXISTS task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES contacts(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Attachments
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  file_path TEXT NOT NULL, -- R2 path
  uploaded_by UUID NOT NULL REFERENCES contacts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Filters (like Todoist's 150 filter views)
CREATE TABLE IF NOT EXISTS task_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL, -- JSON query object
  is_shared BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES contacts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Reminders
CREATE TABLE IF NOT EXISTS task_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES contacts(id),
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('due_date', 'custom', 'recurring')),
  reminder_time TIMESTAMPTZ NOT NULL,
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recurring Task Templates
CREATE TABLE IF NOT EXISTS recurring_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 3,
  duration_minutes INTEGER,
  labels TEXT[] DEFAULT '{}',
  assignee_id UUID REFERENCES contacts(id),
  recurrence_rule TEXT NOT NULL, -- RRULE format
  next_due_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Templates
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL, -- Project structure and tasks
  is_shared BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES contacts(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Project Members
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id),
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, contact_id)
);

-- Activity Log (for unlimited activity history)
CREATE TABLE IF NOT EXISTS task_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES contacts(id),
  action TEXT NOT NULL, -- created, updated, completed, commented, etc.
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (will be enhanced in 900_rls_policies.sql)
CREATE POLICY "Users can view projects in their org" ON projects FOR SELECT USING (true);
CREATE POLICY "Users can view tasks in their org" ON tasks FOR SELECT USING (true);
CREATE POLICY "Users can view task comments in their org" ON task_comments FOR SELECT USING (true);
CREATE POLICY "Users can view task attachments in their org" ON task_attachments FOR SELECT USING (true);
CREATE POLICY "Users can view task filters in their org" ON task_filters FOR SELECT USING (true);
CREATE POLICY "Users can view task reminders in their org" ON task_reminders FOR SELECT USING (true);
CREATE POLICY "Users can view recurring tasks in their org" ON recurring_tasks FOR SELECT USING (true);
CREATE POLICY "Users can view project templates in their org" ON project_templates FOR SELECT USING (true);
CREATE POLICY "Users can view project members in their org" ON project_members FOR SELECT USING (true);
CREATE POLICY "Users can view task activity in their org" ON task_activity FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON projects(parent_id);

CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_labels ON tasks USING GIN(labels);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_filters_org_id ON task_filters(org_id);
CREATE INDEX IF NOT EXISTS idx_task_reminders_task_id ON task_reminders(task_id);
CREATE INDEX IF NOT EXISTS idx_task_reminders_user_id ON task_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_org_id ON recurring_tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_org_id ON task_activity(org_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_task_id ON task_activity(task_id);

-- Comments for documentation
COMMENT ON TABLE projects IS 'Personal and team projects with full Todoist feature set';
COMMENT ON TABLE tasks IS 'Tasks with priorities, due dates, labels, sub-tasks, and assignments';
COMMENT ON TABLE task_comments IS 'Comments on tasks for collaboration';
COMMENT ON TABLE task_attachments IS 'File attachments for tasks (stored in R2)';
COMMENT ON TABLE task_filters IS 'Custom filter views (up to 150 per user)';
COMMENT ON TABLE task_reminders IS 'Task reminders and notifications';
COMMENT ON TABLE recurring_tasks IS 'Recurring task templates with RRULE support';
COMMENT ON TABLE project_templates IS 'Reusable project templates';
COMMENT ON TABLE project_members IS 'Team project membership and roles';
COMMENT ON TABLE task_activity IS 'Unlimited activity history for tasks and projects';

-- 015_time_entries.sql
-- Migration: 015_time_entries.sql
-- Purpose: Create polymorphic time entries table
-- RLS: All tables have org_id and RLS enabled
-- Created: 2025-01-27

-- Time entries table (polymorphic: can reference project_id or task_id)
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    billable BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(10,2),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'billed')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Ensure at least one reference is provided
    CONSTRAINT time_entry_reference_check CHECK (
        (project_id IS NOT NULL) OR
        (task_id IS NOT NULL) OR
        (ticket_id IS NOT NULL)
    )
);

-- Enable RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_entries_org_id ON time_entries(org_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_company_id ON time_entries(company_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_contact_id ON time_entries(contact_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_ticket_id ON time_entries(ticket_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_billable ON time_entries(billable);

-- Add updated_at trigger
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate duration automatically
CREATE OR REPLACE FUNCTION calculate_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-calculate duration
CREATE TRIGGER calculate_time_entry_duration
    BEFORE INSERT OR UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION calculate_duration();


-- 020_kb_hierarchy_docs_vectors.sql
-- Migration: 020_kb_hierarchy_docs_vectors.sql
-- Purpose: Create hierarchical knowledge base with collections, docs, and vectors for RAG
-- RLS: All tables have org_id and RLS enabled
-- Created: 2025-01-27

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- KB Collections table (hierarchical tree structure)
CREATE TABLE IF NOT EXISTS kb_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES kb_collections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    path TEXT NOT NULL, -- Full path for easy breadcrumbs (e.g., "/getting-started/basics")
    sort_order INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, path)
);

-- KB Documents table
CREATE TABLE IF NOT EXISTS kb_docs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    collection_id UUID REFERENCES kb_collections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'markdown' CHECK (content_type IN ('markdown', 'html', 'text')),
    excerpt TEXT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE,
    author_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, collection_id, slug)
);

-- KB Vectors table for RAG (embeddings)
CREATE TABLE IF NOT EXISTS kb_vectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    doc_id UUID NOT NULL REFERENCES kb_docs(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536), -- OpenAI ada-002 embedding dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doc_id, chunk_index)
);

-- Enable RLS on all tables
ALTER TABLE kb_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_vectors ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kb_collections_org_id ON kb_collections(org_id);
CREATE INDEX IF NOT EXISTS idx_kb_collections_company_id ON kb_collections(company_id);
CREATE INDEX IF NOT EXISTS idx_kb_collections_parent_id ON kb_collections(parent_id);
CREATE INDEX IF NOT EXISTS idx_kb_collections_path ON kb_collections(path);
CREATE INDEX IF NOT EXISTS idx_kb_collections_is_public ON kb_collections(is_public);

CREATE INDEX IF NOT EXISTS idx_kb_docs_org_id ON kb_docs(org_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_company_id ON kb_docs(company_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_collection_id ON kb_docs(collection_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_is_public ON kb_docs(is_public);
CREATE INDEX IF NOT EXISTS idx_kb_docs_is_published ON kb_docs(is_published);
CREATE INDEX IF NOT EXISTS idx_kb_docs_tags ON kb_docs USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_kb_docs_published_at ON kb_docs(published_at);

CREATE INDEX IF NOT EXISTS idx_kb_vectors_org_id ON kb_vectors(org_id);
CREATE INDEX IF NOT EXISTS idx_kb_vectors_company_id ON kb_vectors(company_id);
CREATE INDEX IF NOT EXISTS idx_kb_vectors_doc_id ON kb_vectors(doc_id);
-- Vector similarity search index (using HNSW for better performance)
CREATE INDEX IF NOT EXISTS idx_kb_vectors_embedding ON kb_vectors USING hnsw (embedding vector_cosine_ops);

-- Add updated_at triggers
CREATE TRIGGER update_kb_collections_updated_at BEFORE UPDATE ON kb_collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kb_docs_updated_at BEFORE UPDATE ON kb_docs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update collection path when parent changes
CREATE OR REPLACE FUNCTION update_collection_path()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.path = '/' || NEW.slug;
    ELSE
        SELECT path || '/' || NEW.slug INTO NEW.path
        FROM kb_collections
        WHERE id = NEW.parent_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update collection paths
CREATE TRIGGER update_kb_collection_path
    BEFORE INSERT OR UPDATE ON kb_collections
    FOR EACH ROW EXECUTE FUNCTION update_collection_path();


-- 025_sites_registry.sql
-- Migration: 025_sites_registry.sql
-- Purpose: Create client site registry for Cloudflare Pages projects
-- RLS: All tables have org_id and RLS enabled
-- Created: 2025-01-27

-- Sites Registry table
CREATE TABLE IF NOT EXISTS sites_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    domain TEXT,
    subdomain TEXT,
    cloudflare_project_name TEXT,
    cloudflare_project_id TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'building', 'deployed', 'failed', 'archived')),
    template_type TEXT DEFAULT 'generic' CHECK (template_type IN ('generic', 'portfolio', 'business', 'landing', 'blog')),
    theme_settings JSONB DEFAULT '{}',
    custom_domain BOOLEAN DEFAULT false,
    ssl_enabled BOOLEAN DEFAULT true,
    last_deployed_at TIMESTAMP WITH TIME ZONE,
    deployment_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, slug)
);

-- Site Deployments table (track deployment history)
CREATE TABLE IF NOT EXISTS site_deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites_registry(id) ON DELETE CASCADE,
    deployment_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('queued', 'building', 'ready', 'failed')),
    build_time_seconds INTEGER,
    file_count INTEGER,
    total_size_bytes BIGINT,
    error_message TEXT,
    deployed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(site_id, deployment_id)
);

-- Enable RLS on all tables
ALTER TABLE sites_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_deployments ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sites_registry_org_id ON sites_registry(org_id);
CREATE INDEX IF NOT EXISTS idx_sites_registry_company_id ON sites_registry(company_id);
CREATE INDEX IF NOT EXISTS idx_sites_registry_status ON sites_registry(status);
CREATE INDEX IF NOT EXISTS idx_sites_registry_domain ON sites_registry(domain);
CREATE INDEX IF NOT EXISTS idx_sites_registry_cloudflare_project_id ON sites_registry(cloudflare_project_id);

CREATE INDEX IF NOT EXISTS idx_site_deployments_org_id ON site_deployments(org_id);
CREATE INDEX IF NOT EXISTS idx_site_deployments_site_id ON site_deployments(site_id);
CREATE INDEX IF NOT EXISTS idx_site_deployments_status ON site_deployments(status);
CREATE INDEX IF NOT EXISTS idx_site_deployments_deployed_at ON site_deployments(deployed_at);

-- Add updated_at triggers
CREATE TRIGGER update_sites_registry_updated_at BEFORE UPDATE ON sites_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate deployment URL
CREATE OR REPLACE FUNCTION generate_deployment_url()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'ready' AND NEW.deployment_id IS NOT NULL THEN
        NEW.deployment_url = 'https://' || NEW.deployment_id || '.pages.dev';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-generate deployment URL
CREATE TRIGGER generate_site_deployment_url
    BEFORE INSERT OR UPDATE ON sites_registry
    FOR EACH ROW EXECUTE FUNCTION generate_deployment_url();


-- 026_drops_meta.sql
-- Migration: 026_drops_meta.sql
-- Purpose: Create metadata table for R2 public drops with optional TTL
-- RLS: All tables have org_id and RLS enabled
-- Created: 2025-01-27

-- Drops Metadata table
CREATE TABLE IF NOT EXISTS drops_meta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    r2_key TEXT NOT NULL UNIQUE, -- R2 object key
    filename TEXT NOT NULL,
    original_filename TEXT,
    content_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    checksum TEXT, -- MD5 or SHA256 hash
    public_url TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional TTL
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES contacts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE drops_meta ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_drops_meta_org_id ON drops_meta(org_id);
CREATE INDEX IF NOT EXISTS idx_drops_meta_company_id ON drops_meta(company_id);
CREATE INDEX IF NOT EXISTS idx_drops_meta_r2_key ON drops_meta(r2_key);
CREATE INDEX IF NOT EXISTS idx_drops_meta_is_public ON drops_meta(is_public);
CREATE INDEX IF NOT EXISTS idx_drops_meta_expires_at ON drops_meta(expires_at);
CREATE INDEX IF NOT EXISTS idx_drops_meta_tags ON drops_meta USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_drops_meta_created_at ON drops_meta(created_at);

-- Add updated_at trigger
CREATE TRIGGER update_drops_meta_updated_at BEFORE UPDATE ON drops_meta FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment access count
CREATE OR REPLACE FUNCTION increment_drop_access()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE drops_meta
    SET access_count = access_count + 1,
        last_accessed_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to clean up expired drops (can be called by cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_drops()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM drops_meta
    WHERE expires_at IS NOT NULL
    AND expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';


-- 030_billing_ledger_invoices.sql
-- Migration: 030_billing_ledger_invoices.sql
-- Purpose: Create billing system with invoices and ledger entries
-- RLS: All tables have org_id and RLS enabled
-- Created: 2025-01-27

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    stripe_invoice_id TEXT UNIQUE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    due_date DATE,
    issued_date DATE,
    paid_date DATE,
    description TEXT,
    notes TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, invoice_number)
);

-- Invoice Line Items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing Ledger table (for tracking all financial transactions)
CREATE TABLE IF NOT EXISTS billing_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('invoice', 'payment', 'refund', 'adjustment', 'credit')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    description TEXT NOT NULL,
    reference_id TEXT, -- External reference (Stripe payment intent, etc.)
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_ledger ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_org_id ON invoice_line_items(org_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

CREATE INDEX IF NOT EXISTS idx_billing_ledger_org_id ON billing_ledger(org_id);
CREATE INDEX IF NOT EXISTS idx_billing_ledger_company_id ON billing_ledger(company_id);
CREATE INDEX IF NOT EXISTS idx_billing_ledger_invoice_id ON billing_ledger(invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_ledger_entry_type ON billing_ledger(entry_type);
CREATE INDEX IF NOT EXISTS idx_billing_ledger_created_at ON billing_ledger(created_at);

-- Add updated_at triggers
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate totals when line items change
    UPDATE invoices
    SET subtotal = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM invoice_line_items
        WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    ),
    total_amount = subtotal + tax_amount
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to auto-calculate invoice totals
CREATE TRIGGER calculate_invoice_totals
    AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items
    FOR EACH ROW EXECUTE FUNCTION calculate_invoice_total();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number = 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' ||
                           LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-generate invoice numbers
CREATE TRIGGER generate_invoice_number_trigger
    BEFORE INSERT ON invoices
    FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();


-- 040_feature_flags.sql
-- Migration: 040_feature_flags.sql
-- Purpose: Create feature flag system for org and company-level feature toggles
-- RLS: All tables have org_id and RLS enabled
-- Created: 2025-01-27

-- Feature Keys table (defines available features)
CREATE TABLE IF NOT EXISTS feature_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'billing', 'integrations', 'ai', 'collaboration')),
    default_enabled BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false, -- System features cannot be disabled
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Org Features table (org-level feature toggles)
CREATE TABLE IF NOT EXISTS org_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    feature_key_id UUID NOT NULL REFERENCES feature_keys(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, feature_key_id)
);

-- Company Features table (company-level feature toggles)
CREATE TABLE IF NOT EXISTS company_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    feature_key_id UUID NOT NULL REFERENCES feature_keys(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, feature_key_id)
);

-- Module Access table (defines which modules/features a user can access)
CREATE TABLE IF NOT EXISTS module_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    module_name TEXT NOT NULL,
    access_level TEXT DEFAULT 'read' CHECK (access_level IN ('none', 'read', 'write', 'admin')),
    granted_by UUID REFERENCES contacts(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, COALESCE(company_id, '00000000-0000-0000-0000-000000000000'::UUID), contact_id, module_name)
);

-- Enable RLS on all tables
ALTER TABLE feature_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_access ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_keys_key ON feature_keys(key);
CREATE INDEX IF NOT EXISTS idx_feature_keys_category ON feature_keys(category);
CREATE INDEX IF NOT EXISTS idx_feature_keys_is_system ON feature_keys(is_system);

CREATE INDEX IF NOT EXISTS idx_org_features_org_id ON org_features(org_id);
CREATE INDEX IF NOT EXISTS idx_org_features_feature_key_id ON org_features(feature_key_id);
CREATE INDEX IF NOT EXISTS idx_org_features_enabled ON org_features(enabled);

CREATE INDEX IF NOT EXISTS idx_company_features_org_id ON company_features(org_id);
CREATE INDEX IF NOT EXISTS idx_company_features_company_id ON company_features(company_id);
CREATE INDEX IF NOT EXISTS idx_company_features_feature_key_id ON company_features(feature_key_id);
CREATE INDEX IF NOT EXISTS idx_company_features_enabled ON company_features(enabled);

CREATE INDEX IF NOT EXISTS idx_module_access_org_id ON module_access(org_id);
CREATE INDEX IF NOT EXISTS idx_module_access_company_id ON module_access(company_id);
CREATE INDEX IF NOT EXISTS idx_module_access_contact_id ON module_access(contact_id);
CREATE INDEX IF NOT EXISTS idx_module_access_module_name ON module_access(module_name);
CREATE INDEX IF NOT EXISTS idx_module_access_access_level ON module_access(access_level);

-- Add updated_at triggers
CREATE TRIGGER update_feature_keys_updated_at BEFORE UPDATE ON feature_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_org_features_updated_at BEFORE UPDATE ON org_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_features_updated_at BEFORE UPDATE ON company_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_module_access_updated_at BEFORE UPDATE ON module_access FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default feature keys
INSERT INTO feature_keys (key, name, description, category, default_enabled, is_system) VALUES
('crm', 'CRM', 'Customer Relationship Management', 'general', true, false),
('projects', 'Projects', 'Project Management', 'general', true, false),
('tasks', 'Tasks', 'Task Management', 'general', true, false),
('messaging', 'Messaging', 'Internal Messaging System', 'collaboration', true, false),
('kb', 'Knowledge Base', 'Knowledge Base Management', 'general', true, false),
('ai_rag', 'AI RAG', 'AI Retrieval Augmented Generation', 'ai', false, false),
('billing', 'Billing', 'Billing and Invoicing', 'billing', true, false),
('lms', 'LMS', 'Learning Management System', 'general', false, false),
('client_tools', 'Client Tools', 'Client-facing Tools', 'general', true, false),
('voice_assistant', 'Voice Assistant', 'Voice-based AI Assistant', 'ai', false, false),
('vision_tools', 'Vision Tools', 'Computer Vision Tools', 'ai', false, false),
('client_sites', 'Client Sites', 'Client Website Management', 'general', true, false),
('public_drops', 'Public Drops', 'Public File Sharing', 'general', true, false),
('stripe_integration', 'Stripe Integration', 'Stripe Payment Processing', 'integrations', false, false),
('openai_integration', 'OpenAI Integration', 'OpenAI API Integration', 'integrations', false, false),
('elevenlabs_integration', 'ElevenLabs Integration', 'ElevenLabs Voice Synthesis', 'integrations', false, false)
ON CONFLICT (key) DO NOTHING;


-- 900_rls_policies.sql
-- Migration: 900_rls_policies.sql
-- Purpose: Create Row Level Security policies using qieos_org(), qieos_role(), qieos_company_ids()
-- RLS: All policies use JWT claims for multi-tenant isolation
-- Created: 2025-01-27

-- Helper functions for JWT claims (these would be implemented in the Worker)
-- These are placeholder functions - actual implementation depends on JWT structure

-- Function to get current user's org_id from JWT
CREATE OR REPLACE FUNCTION qieos_org()
RETURNS UUID AS $$
BEGIN
    -- This would extract org_id from JWT claims
    -- For now, return a placeholder - actual implementation in Worker
    RETURN COALESCE(
        current_setting('request.jwt.claims.org_id', true)::UUID,
        '00000000-0000-0000-0000-000000000000'::UUID
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's role from JWT
CREATE OR REPLACE FUNCTION qieos_role()
RETURNS TEXT AS $$
BEGIN
    -- This would extract role from JWT claims
    RETURN COALESCE(
        current_setting('request.jwt.claims.role', true),
        'public'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's company_ids from JWT
CREATE OR REPLACE FUNCTION qieos_company_ids()
RETURNS UUID[] AS $$
BEGIN
    -- This would extract company_ids array from JWT claims
    RETURN COALESCE(
        string_to_array(current_setting('request.jwt.claims.company_ids', true), ',')::UUID[],
        ARRAY[]::UUID[]
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to a company
CREATE OR REPLACE FUNCTION qieos_has_company_access(company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Admin and internal roles have access to all companies in their org
    IF qieos_role() IN ('admin', 'internal') THEN
        RETURN EXISTS (
            SELECT 1 FROM companies
            WHERE id = company_id
            AND org_id = qieos_org()
        );
    END IF;

    -- External users only have access to their assigned companies
    RETURN company_id = ANY(qieos_company_ids());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for Organizations
CREATE POLICY "Users can view their own org" ON orgs
    FOR SELECT USING (id = qieos_org());

CREATE POLICY "Admins can update their org" ON orgs
    FOR UPDATE USING (id = qieos_org() AND qieos_role() = 'admin');

-- RLS Policies for Departments
CREATE POLICY "Users can view departments in their org" ON departments
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Admins can manage departments in their org" ON departments
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

-- RLS Policies for Companies
CREATE POLICY "Users can view companies in their org" ON companies
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view companies they have access to" ON companies
    FOR SELECT USING (qieos_has_company_access(id));

CREATE POLICY "Admins can manage companies in their org" ON companies
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

-- RLS Policies for Contacts
CREATE POLICY "Users can view contacts in their org" ON contacts
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view contacts in their companies" ON contacts
    FOR SELECT USING (qieos_has_company_access(company_id));

CREATE POLICY "Admins can manage contacts in their org" ON contacts
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

CREATE POLICY "Users can update their own contact record" ON contacts
    FOR UPDATE USING (supabase_user_id = auth.uid());

-- RLS Policies for Projects
CREATE POLICY "Users can view projects in their org" ON projects
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view projects in their companies" ON projects
    FOR SELECT USING (qieos_has_company_access(company_id));

CREATE POLICY "Admins can manage projects in their org" ON projects
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

CREATE POLICY "Internal users can manage projects in their companies" ON projects
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'internal' AND qieos_has_company_access(company_id));

-- RLS Policies for Tasks
CREATE POLICY "Users can view tasks in their org" ON tasks
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view tasks in their companies" ON tasks
    FOR SELECT USING (qieos_has_company_access(company_id));

CREATE POLICY "Users can view tasks assigned to them" ON tasks
    FOR SELECT USING (assigned_to IN (
        SELECT id FROM contacts WHERE supabase_user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage tasks in their org" ON tasks
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

CREATE POLICY "Internal users can manage tasks in their companies" ON tasks
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'internal' AND qieos_has_company_access(company_id));

CREATE POLICY "Users can update tasks assigned to them" ON tasks
    FOR UPDATE USING (assigned_to IN (
        SELECT id FROM contacts WHERE supabase_user_id = auth.uid()
    ));

-- RLS Policies for Tickets
CREATE POLICY "Users can view tickets in their org" ON tickets
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view tickets in their companies" ON tickets
    FOR SELECT USING (qieos_has_company_access(company_id));

CREATE POLICY "Users can view tickets assigned to them" ON tickets
    FOR SELECT USING (assigned_to IN (
        SELECT id FROM contacts WHERE supabase_user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage tickets in their org" ON tickets
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

CREATE POLICY "Internal users can manage tickets in their companies" ON tickets
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'internal' AND qieos_has_company_access(company_id));

-- RLS Policies for Time Entries
CREATE POLICY "Users can view time entries in their org" ON time_entries
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view time entries in their companies" ON time_entries
    FOR SELECT USING (qieos_has_company_access(company_id));

CREATE POLICY "Users can view their own time entries" ON time_entries
    FOR SELECT USING (contact_id IN (
        SELECT id FROM contacts WHERE supabase_user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own time entries" ON time_entries
    FOR ALL USING (contact_id IN (
        SELECT id FROM contacts WHERE supabase_user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage time entries in their org" ON time_entries
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

-- RLS Policies for Knowledge Base Collections
CREATE POLICY "Users can view public KB collections" ON kb_collections
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view KB collections in their org" ON kb_collections
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view KB collections in their companies" ON kb_collections
    FOR SELECT USING (qieos_has_company_access(company_id));

CREATE POLICY "Admins can manage KB collections in their org" ON kb_collections
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

-- RLS Policies for Knowledge Base Documents
CREATE POLICY "Users can view public KB documents" ON kb_docs
    FOR SELECT USING (is_public = true AND is_published = true);

CREATE POLICY "Users can view KB documents in their org" ON kb_docs
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view KB documents in their companies" ON kb_docs
    FOR SELECT USING (qieos_has_company_access(company_id));

CREATE POLICY "Admins can manage KB documents in their org" ON kb_docs
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

-- RLS Policies for Knowledge Base Vectors
CREATE POLICY "Users can view KB vectors in their org" ON kb_vectors
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view KB vectors in their companies" ON kb_vectors
    FOR SELECT USING (qieos_has_company_access(company_id));

CREATE POLICY "Admins can manage KB vectors in their org" ON kb_vectors
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

-- RLS Policies for Sites Registry
CREATE POLICY "Users can view sites in their org" ON sites_registry
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view sites in their companies" ON sites_registry
    FOR SELECT USING (qieos_has_company_access(company_id));

CREATE POLICY "Admins can manage sites in their org" ON sites_registry
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

-- RLS Policies for Site Deployments
CREATE POLICY "Users can view deployments for sites in their org" ON site_deployments
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view deployments for sites in their companies" ON site_deployments
    FOR SELECT USING (org_id = qieos_org() AND site_id IN (
        SELECT id FROM sites_registry WHERE qieos_has_company_access(company_id)
    ));

CREATE POLICY "Admins can manage deployments in their org" ON site_deployments
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

-- RLS Policies for Drops Metadata
CREATE POLICY "Users can view public drops" ON drops_meta
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view drops in their org" ON drops_meta
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view drops in their companies" ON drops_meta
    FOR SELECT USING (qieos_has_company_access(company_id));

CREATE POLICY "Users can manage drops in their org" ON drops_meta
    FOR ALL USING (org_id = qieos_org() AND qieos_role() IN ('admin', 'internal'));

-- RLS Policies for Invoices
CREATE POLICY "Users can view invoices in their org" ON invoices
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view invoices for their companies" ON invoices
    FOR SELECT USING (qieos_has_company_access(company_id));

CREATE POLICY "Admins can manage invoices in their org" ON invoices
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

-- RLS Policies for Invoice Line Items
CREATE POLICY "Users can view line items for invoices in their org" ON invoice_line_items
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Admins can manage line items in their org" ON invoice_line_items
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

-- RLS Policies for Billing Ledger
CREATE POLICY "Users can view ledger entries in their org" ON billing_ledger
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view ledger entries for their companies" ON billing_ledger
    FOR SELECT USING (qieos_has_company_access(company_id));

CREATE POLICY "Admins can manage ledger entries in their org" ON billing_ledger
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

-- RLS Policies for Feature Keys (system-wide, no org isolation)
CREATE POLICY "All users can view feature keys" ON feature_keys
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage feature keys" ON feature_keys
    FOR ALL USING (qieos_role() = 'admin');

-- RLS Policies for Org Features
CREATE POLICY "Users can view org features for their org" ON org_features
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Admins can manage org features for their org" ON org_features
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

-- RLS Policies for Company Features
CREATE POLICY "Users can view company features in their org" ON company_features
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view company features for their companies" ON company_features
    FOR SELECT USING (qieos_has_company_access(company_id));

CREATE POLICY "Admins can manage company features in their org" ON company_features
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');

-- RLS Policies for Module Access
CREATE POLICY "Users can view module access in their org" ON module_access
    FOR SELECT USING (org_id = qieos_org());

CREATE POLICY "Users can view their own module access" ON module_access
    FOR SELECT USING (contact_id IN (
        SELECT id FROM contacts WHERE supabase_user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage module access in their org" ON module_access
    FOR ALL USING (org_id = qieos_org() AND qieos_role() = 'admin');


-- 901_slugged_auth_rls_policies.sql
-- QiEOS Slugged Authentication RLS Policies
-- Migration: 050_slugged_auth_rls.sql
-- Purpose: Row Level Security policies for slugged multi-tenant authentication
-- Created: 2025-01-27

-- Helper view to map JWT auth.uid() to their org memberships
CREATE OR REPLACE VIEW public.user_orgs AS
SELECT
  c.supabase_user_id as user_id,
  c.org_id,
  c.role,
  c.company_id,
  o.slug as org_slug
FROM contacts c
JOIN orgs o ON o.id = c.org_id
WHERE c.is_active = true;

-- Enable RLS on the view
ALTER VIEW public.user_orgs SET (security_invoker = true);

-- Drop existing basic policies
DROP POLICY IF EXISTS "Users can view their org" ON orgs;
DROP POLICY IF EXISTS "Users can view companies in their org" ON companies;
DROP POLICY IF EXISTS "Users can view contacts in their org" ON contacts;

-- Enhanced RLS Policies for orgs table
CREATE POLICY "Users can view their orgs" ON orgs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_orgs uo
    WHERE uo.user_id = auth.uid()
      AND uo.org_id = orgs.id
  )
);

CREATE POLICY "Users can update their orgs" ON orgs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.user_orgs uo
    WHERE uo.user_id = auth.uid()
      AND uo.org_id = orgs.id
      AND uo.role IN ('admin', 'internal')
  )
);

-- Enhanced RLS Policies for companies table
CREATE POLICY "Users can view companies in their orgs" ON companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_orgs uo
    WHERE uo.user_id = auth.uid()
      AND uo.org_id = companies.org_id
  )
);

CREATE POLICY "Users can insert companies in their orgs" ON companies
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_orgs uo
    WHERE uo.user_id = auth.uid()
      AND uo.org_id = companies.org_id
      AND uo.role IN ('admin', 'internal')
  )
);

CREATE POLICY "Users can update companies in their orgs" ON companies
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.user_orgs uo
    WHERE uo.user_id = auth.uid()
      AND uo.org_id = companies.org_id
      AND uo.role IN ('admin', 'internal')
  )
);

-- Enhanced RLS Policies for contacts table
CREATE POLICY "Users can view contacts in their orgs" ON contacts
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_orgs uo
    WHERE uo.user_id = auth.uid()
      AND uo.org_id = contacts.org_id
  )
);

CREATE POLICY "Users can insert contacts in their orgs" ON contacts
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_orgs uo
    WHERE uo.user_id = auth.uid()
      AND uo.org_id = contacts.org_id
      AND uo.role IN ('admin', 'internal')
  )
);

CREATE POLICY "Users can update their own contact" ON contacts
FOR UPDATE
USING (
  supabase_user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.user_orgs uo
    WHERE uo.user_id = auth.uid()
      AND uo.org_id = contacts.org_id
      AND uo.role IN ('admin', 'internal')
  )
);

-- Add unique constraints for data integrity
ALTER TABLE public.orgs
ADD CONSTRAINT IF NOT EXISTS orgs_slug_unique UNIQUE(slug);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_orgs_user_id ON public.user_orgs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_orgs_org_id ON public.user_orgs(org_id);
CREATE INDEX IF NOT EXISTS idx_user_orgs_org_slug ON public.user_orgs(org_slug);

-- Comments for documentation
COMMENT ON VIEW public.user_orgs IS 'Maps Supabase auth users to their organization memberships for RLS';
COMMENT ON POLICY "Users can view their orgs" ON orgs IS 'Users can only see organizations they belong to';
COMMENT ON POLICY "Users can view companies in their orgs" ON companies IS 'Users can only see companies within their organizations';
COMMENT ON POLICY "Users can view contacts in their orgs" ON contacts IS 'Users can only see contacts within their organizations';

