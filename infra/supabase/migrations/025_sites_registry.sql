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
