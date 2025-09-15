#!/usr/bin/env node
/**
 * Apply QiEOS Database Schema
 * This script applies all migrations to your Supabase database
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

async function applyDatabase() {
  console.log('🚀 Applying QiEOS database schema...\n');

  try {
    // Check if we're in a Supabase project
    try {
      execSync('supabase status', { stdio: 'pipe' });
      console.log('✅ Supabase project detected');
    } catch (error) {
      console.log('⚠️  No local Supabase project found. You can still apply to remote.');
    }

    // Read all migration files
    const migrations = [
      '000_init_orgs_companies_contacts.sql',
      '010_projects_tasks_tickets.sql',
      '015_time_entries.sql',
      '020_kb_hierarchy_docs_vectors.sql',
      '025_sites_registry.sql',
      '026_drops_meta.sql',
      '030_billing_ledger_invoices.sql',
      '040_feature_flags.sql',
      '900_rls_policies.sql',
      '901_slugged_auth_rls_policies.sql'
    ];

    let allSQL = '';

    for (const migration of migrations) {
      const migrationPath = join(ROOT, 'infra', 'supabase', 'migrations', migration);
      const migrationSQL = readFileSync(migrationPath, 'utf8');

      console.log(`📄 Loaded ${migration}`);
      allSQL += `\n-- ${migration}\n${migrationSQL}\n`;
    }

    // Write combined SQL to a file
    const outputPath = join(ROOT, 'complete-schema.sql');
    writeFileSync(outputPath, allSQL);

    console.log(`\n✅ Complete schema written to: ${outputPath}`);
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy the contents of complete-schema.sql');
    console.log('4. Paste and run the SQL');
    console.log('5. Verify tables are created');
    console.log('\n🔗 Or use Supabase CLI:');
    console.log(`   supabase db reset --linked`);
    console.log(`   supabase db push --linked`);

    return true;
  } catch (err) {
    console.error('❌ Failed to prepare database schema:', err.message);
    return false;
  }
}

// Run the script
applyDatabase().then((success) => {
  process.exit(success ? 0 : 1);
});
