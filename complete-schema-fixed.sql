-- QiEOS Database Schema - Fixed Version
-- This version removes the problematic JWT functions and uses simpler RLS policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

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
    full_name TEXT,
    role TEXT DEFAULT 'external' CHECK (role IN ('admin', 'internal', 'external')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    onboarding_complete BOOLEAN DEFAULT false,
    preferred_locale TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    metadata JSONB DEFAULT '{}',
    sms_opt_in BOOLEAN DEFAULT false,
    email_opt_in BOOLEAN DEFAULT true,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    mfa_enabled BOOLEAN DEFAULT false,
    tos_version TEXT,
    privacy_version TEXT,
    consent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, email)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, slug)
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES contacts(id) ON DELETE SET NULL,
    created_by UUID REFERENCES contacts(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    settings JSONB DEFAULT '{}',
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
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES contacts(id) ON DELETE SET NULL,
    created_by UUID REFERENCES contacts(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time Entries table
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    billable BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(10,2),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KB Collections table
CREATE TABLE IF NOT EXISTS kb_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES kb_collections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    path TEXT NOT NULL,
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

-- KB Vectors table for RAG
CREATE TABLE IF NOT EXISTS kb_vectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    doc_id UUID NOT NULL REFERENCES kb_docs(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doc_id, chunk_index)
);

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

-- Drops Metadata table
CREATE TABLE IF NOT EXISTS drops_meta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    r2_key TEXT NOT NULL UNIQUE,
    filename TEXT NOT NULL,
    original_filename TEXT,
    content_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    checksum TEXT,
    public_url TEXT NOT NULL,
    is_public BOOLEAN DEFAULT true,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES contacts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Billing Ledger table
CREATE TABLE IF NOT EXISTS billing_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('invoice', 'payment', 'refund', 'adjustment', 'credit')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    description TEXT NOT NULL,
    reference_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature Keys table
CREATE TABLE IF NOT EXISTS feature_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'billing', 'integrations', 'ai', 'collaboration')),
    default_enabled BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Org Features table
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

-- Company Features table
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

-- Module Access table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orgs_slug ON orgs(slug);
CREATE INDEX IF NOT EXISTS idx_departments_org_id ON departments(org_id);
CREATE INDEX IF NOT EXISTS idx_companies_org_id ON companies(org_id);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(org_id, slug);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_supabase_user_id ON contacts(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_projects_org_id ON projects(org_id);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_org_id ON tickets(org_id);
CREATE INDEX IF NOT EXISTS idx_tickets_company_id ON tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_org_id ON time_entries(org_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_contact_id ON time_entries(contact_id);
CREATE INDEX IF NOT EXISTS idx_kb_collections_org_id ON kb_collections(org_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_org_id ON kb_docs(org_id);
CREATE INDEX IF NOT EXISTS idx_kb_vectors_org_id ON kb_vectors(org_id);
CREATE INDEX IF NOT EXISTS idx_sites_registry_org_id ON sites_registry(org_id);
CREATE INDEX IF NOT EXISTS idx_drops_meta_org_id ON drops_meta(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_org_id ON invoice_line_items(org_id);
CREATE INDEX IF NOT EXISTS idx_billing_ledger_org_id ON billing_ledger(org_id);
CREATE INDEX IF NOT EXISTS idx_org_features_org_id ON org_features(org_id);
CREATE INDEX IF NOT EXISTS idx_company_features_org_id ON company_features(org_id);
CREATE INDEX IF NOT EXISTS idx_module_access_org_id ON module_access(org_id);

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

-- Enable RLS on all tables
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE drops_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_access ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (simplified version)
-- These will be enhanced later with proper JWT integration

-- Allow all operations for now (will be restricted later)
CREATE POLICY "Allow all operations on orgs" ON orgs FOR ALL USING (true);
CREATE POLICY "Allow all operations on departments" ON departments FOR ALL USING (true);
CREATE POLICY "Allow all operations on companies" ON companies FOR ALL USING (true);
CREATE POLICY "Allow all operations on contacts" ON contacts FOR ALL USING (true);
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on tickets" ON tickets FOR ALL USING (true);
CREATE POLICY "Allow all operations on time_entries" ON time_entries FOR ALL USING (true);
CREATE POLICY "Allow all operations on kb_collections" ON kb_collections FOR ALL USING (true);
CREATE POLICY "Allow all operations on kb_docs" ON kb_docs FOR ALL USING (true);
CREATE POLICY "Allow all operations on kb_vectors" ON kb_vectors FOR ALL USING (true);
CREATE POLICY "Allow all operations on sites_registry" ON sites_registry FOR ALL USING (true);
CREATE POLICY "Allow all operations on drops_meta" ON drops_meta FOR ALL USING (true);
CREATE POLICY "Allow all operations on invoices" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all operations on invoice_line_items" ON invoice_line_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on billing_ledger" ON billing_ledger FOR ALL USING (true);
CREATE POLICY "Allow all operations on feature_keys" ON feature_keys FOR ALL USING (true);
CREATE POLICY "Allow all operations on org_features" ON org_features FOR ALL USING (true);
CREATE POLICY "Allow all operations on company_features" ON company_features FOR ALL USING (true);
CREATE POLICY "Allow all operations on module_access" ON module_access FOR ALL USING (true);

-- Create a test organization
INSERT INTO orgs (name, slug) VALUES ('QiEOS Test Org', 'qieos-test') ON CONFLICT (slug) DO NOTHING;

-- Create a test company
INSERT INTO companies (org_id, name, slug)
SELECT id, 'Test Company', 'test-company'
FROM orgs WHERE slug = 'qieos-test'
ON CONFLICT (org_id, slug) DO NOTHING;

-- Create a test contact
INSERT INTO contacts (org_id, company_id, email, full_name, role)
SELECT o.id, c.id, 'admin@qieos.com', 'Admin User', 'admin'
FROM orgs o, companies c
WHERE o.slug = 'qieos-test' AND c.slug = 'test-company'
ON CONFLICT (org_id, email) DO NOTHING;

COMMENT ON TABLE orgs IS 'Organizations in the QiEOS system';
COMMENT ON TABLE companies IS 'Companies within organizations';
COMMENT ON TABLE contacts IS 'Contacts/users within organizations';
COMMENT ON TABLE projects IS 'Projects within organizations';
COMMENT ON TABLE tasks IS 'Tasks within projects';
COMMENT ON TABLE tickets IS 'Support tickets';
COMMENT ON TABLE time_entries IS 'Time tracking entries';
COMMENT ON TABLE kb_collections IS 'Knowledge base collections';
COMMENT ON TABLE kb_docs IS 'Knowledge base documents';
COMMENT ON TABLE kb_vectors IS 'Vector embeddings for RAG';
COMMENT ON TABLE sites_registry IS 'Client website registry';
COMMENT ON TABLE drops_meta IS 'Public file drops metadata';
COMMENT ON TABLE invoices IS 'Billing invoices';
COMMENT ON TABLE invoice_line_items IS 'Invoice line items';
COMMENT ON TABLE billing_ledger IS 'Billing ledger entries';
COMMENT ON TABLE feature_keys IS 'Available feature keys';
COMMENT ON TABLE org_features IS 'Organization feature toggles';
COMMENT ON TABLE company_features IS 'Company feature toggles';
COMMENT ON TABLE module_access IS 'User module access permissions';
