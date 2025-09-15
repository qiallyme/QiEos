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
