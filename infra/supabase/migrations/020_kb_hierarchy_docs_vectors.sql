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
