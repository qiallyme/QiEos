# QiEOS File Migration Log
**Date**: 2025-01-27
**Purpose**: Move files from incorrect locations to proper QiEOS structure

## Files to Move

### 1. Database Migration Files (Root → infra/supabase/migrations/)
- `migration_000_init_orgs_companies_contacts.sql` → `infra/supabase/migrations/000_init_orgs_companies_contacts.sql`
- `migration_010_projects_tasks_tickets.sql` → `infra/supabase/migrations/010_projects_tasks_tickets.sql`
- `migration_015_time_entries.sql` → `infra/supabase/migrations/015_time_entries.sql`
- `migration_020_kb_hierarchy_docs_vectors.sql` → `infra/supabase/migrations/020_kb_hierarchy_docs_vectors.sql`
- `migration_025_sites_registry.sql` → `infra/supabase/migrations/025_sites_registry.sql`
- `migration_026_drops_meta.sql` → `infra/supabase/migrations/026_drops_meta.sql`
- `migration_030_billing_ledger_invoices.sql` → `infra/supabase/migrations/030_billing_ledger_invoices.sql`
- `migration_040_feature_flags.sql` → `infra/supabase/migrations/040_feature_flags.sql`
- `migration_900_rls_policies.sql` → `infra/supabase/migrations/900_rls_policies.sql`

### 2. Worker Configuration (infra/cloudflare/ → workers/api/)
- `infra/cloudflare/wrangler.toml` → `workers/api/wrangler.toml`

### 3. Additional Files to Organize
- `slugged_auth_rls_policies.sql` → `infra/supabase/migrations/901_slugged_auth_rls_policies.sql`
- `SLUGGED_AUTH_IMPLEMENTATION.md` → `docs/SLUGGED_AUTH_IMPLEMENTATION.md`
- `SLUGGED_AUTH_README.md` → `docs/SLUGGED_AUTH_README.md`

## Status
- [ ] Move migration files
- [ ] Move worker config
- [ ] Move documentation files
- [ ] Verify file locations
- [ ] Test database connection
- [ ] Test worker configuration

## Rollback Instructions
If needed, files can be restored from this log by reversing the moves.
