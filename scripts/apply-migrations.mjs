#!/usr/bin/env node
/**
 * QiEOS Database Migration Script
 * Applies all migration files in order to set up the database schema
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '../infra/supabase/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌');
  console.error('\nPlease create infra/supabase/.env with your Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Migration files in order
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

async function applyMigrations() {
  console.log('🚀 Starting QiEOS database migrations...\n');

  for (const migration of migrations) {
    try {
      console.log(`📄 Applying ${migration}...`);

      const migrationPath = join(__dirname, '../infra/supabase/migrations', migration);
      const sql = readFileSync(migrationPath, 'utf8');

      const { error } = await supabase.rpc('exec_sql', { sql });

      if (error) {
        console.error(`❌ Failed to apply ${migration}:`, error.message);
        return false;
      }

      console.log(`✅ Applied ${migration}`);
    } catch (err) {
      console.error(`❌ Error applying ${migration}:`, err.message);
      return false;
    }
  }

  console.log('\n🎉 All migrations applied successfully!');
  return true;
}

// Test the connection and apply migrations
async function main() {
  try {
    // Test connection first
    console.log('🔍 Testing database connection...');
    const { error: testError } = await supabase.from('orgs').select('count');

    if (testError) {
      console.log('⚠️  Orgs table does not exist yet, applying migrations...');
    } else {
      console.log('✅ Database connection successful');
    }

    const success = await applyMigrations();

    if (success) {
      console.log('\n🔍 Verifying tables...');
      const tables = ['orgs', 'companies', 'contacts', 'projects', 'tasks'];

      for (const table of tables) {
        const { error } = await supabase.from(table).select('count');
        if (error) {
          console.error(`❌ Table ${table} not accessible:`, error.message);
        } else {
          console.log(`✅ Table ${table} accessible`);
        }
      }
    }

    process.exit(success ? 0 : 1);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

main();
