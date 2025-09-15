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
