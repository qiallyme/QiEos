-- Files and storage management
-- Migration: 050_files_storage.sql
-- Description: Creates tables for file management and storage

-- Files table for tracking uploaded files
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  ticket_id uuid references public.tickets(id) on delete set null,
  
  -- File metadata
  filename text not null,
  original_filename text not null,
  file_size bigint not null,
  mime_type text not null,
  file_extension text,
  
  -- Storage information
  storage_path text not null, -- R2 path
  storage_bucket text not null default 'qieos-files',
  storage_provider text not null default 'r2',
  
  -- File content and processing
  file_hash text, -- SHA-256 hash for deduplication
  is_processed boolean default false,
  processing_status text default 'pending', -- pending, processing, completed, failed
  processing_error text,
  
  -- Access control
  is_public boolean default false,
  access_level text default 'private', -- private, company, org, public
  download_count integer default 0,
  
  -- Metadata
  description text,
  tags text[],
  metadata jsonb default '{}',
  
  -- Audit fields
  uploaded_by uuid not null references public.contacts(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);
