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
