#!/usr/bin/env node
/**
 * QiEOS Migration Runner
 * Runs the initial schema migration against Supabase
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')

async function runMigration() {
  console.log('🚀 Running QiEOS database migration...')

  try {
    // Read the migration file
    const migrationPath = join(ROOT, 'infra', 'supabase', 'migrations', '000_init_orgs_companies_contacts.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')

    console.log('📄 Migration file loaded:', migrationPath)
    console.log('📝 SQL Preview (first 200 chars):')
    console.log(migrationSQL.substring(0, 200) + '...')

    console.log('\n⚠️  MANUAL STEP REQUIRED:')
    console.log('1. Copy the SQL above to your Supabase SQL Editor')
    console.log('2. Run it in your Supabase project')
    console.log('3. Verify tables are created in the Table Editor')
    console.log('4. Run: pnpm test:db to verify connection')

    console.log('\n📋 Full SQL to copy:')
    console.log('─'.repeat(50))
    console.log(migrationSQL)
    console.log('─'.repeat(50))

  } catch (err) {
    console.error('❌ Failed to read migration file:', err.message)
    process.exit(1)
  }
}

runMigration()

