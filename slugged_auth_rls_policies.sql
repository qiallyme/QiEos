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
