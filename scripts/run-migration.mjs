#!/usr/bin/env node
/**
 * QiEOS Migration Runner
 * Runs all database migrations against Supabase
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')

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
]

async function runMigration() {
  console.log('🚀 Running QiEOS database migrations...\n')

  try {
    let allSQL = ''

    for (const migration of migrations) {
      const migrationPath = join(ROOT, 'infra', 'supabase', 'migrations', migration)
      const migrationSQL = readFileSync(migrationPath, 'utf8')

      console.log(`📄 Loaded ${migration}`)
      allSQL += `\n-- ${migration}\n${migrationSQL}\n`
    }

    console.log('\n⚠️  MANUAL STEP REQUIRED:')
    console.log('1. Copy the SQL below to your Supabase SQL Editor')
    console.log('2. Run it in your Supabase project')
    console.log('3. Verify tables are created in the Table Editor')
    console.log('4. Run: pnpm test:db to verify connection')

    console.log('\n📋 Complete SQL to copy:')
    console.log('─'.repeat(80))
    console.log(allSQL)
    console.log('─'.repeat(80))

  } catch (err) {
    console.error('❌ Failed to read migration files:', err.message)
    process.exit(1)
  }
}

runMigration()

