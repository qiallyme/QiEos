-- QiEOS Seed Data for Supabase
-- Paste this into your Supabase SQL Editor to create test data
--
-- IMPORTANT: Run the schema migration first (000_init_schema.sql and 001_rls_policies.sql)
-- before running this seed data.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create test organization
INSERT INTO orgs (id, slug, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'test-org', 'Test Organization')
ON CONFLICT (slug) DO NOTHING;

-- Create test company
INSERT INTO companies (id, org_id, name, slug) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Test Company', 'test-company')
ON CONFLICT (org_id, slug) DO NOTHING;

-- Create test contacts (these will need to be linked to actual Supabase auth users)
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
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', 'welcome-internal', 'Welcome to QiEOS', 'This is a sample internal knowledge base document. It contains information about the QiEOS system and how to use it effectively.

## Getting Started

1. **Authentication**: Use your Supabase auth credentials to log in
2. **Navigation**: Use the sidebar to access different modules
3. **Tasks**: Create and manage tasks in the Tasks module
4. **Knowledge Base**: Access internal documentation in the KB module

## Features

- Multi-tenant organization support
- Role-based access control
- Task and project management
- Knowledge base with hierarchical collections
- File upload and management
- Real-time collaboration

## Support

For questions or issues, contact your system administrator.', ARRAY['welcome', 'internal', 'getting-started'], ARRAY['internal'])
ON CONFLICT (org_id, slug) DO NOTHING;

-- Verify the data was created
SELECT 'Orgs' as table_name, count(*) as count FROM orgs
UNION ALL
SELECT 'Companies', count(*) FROM companies
UNION ALL
SELECT 'Contacts', count(*) FROM contacts
UNION ALL
SELECT 'Projects', count(*) FROM projects
UNION ALL
SELECT 'Tasks', count(*) FROM tasks
UNION ALL
SELECT 'KB Collections', count(*) FROM kb_collections
UNION ALL
SELECT 'KB Docs', count(*) FROM kb_docs;
