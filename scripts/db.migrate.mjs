#!/usr/bin/env node
/**
 * QiEOS Database Migration Runner
 * 
 * This script provides utilities for managing database migrations:
 * - Lists available migrations
 * - Concatenates migrations in order for manual application
 * - Provides Supabase CLI commands
 * 
 * Usage:
 *   node scripts/db.migrate.mjs list
 *   node scripts/db.migrate.mjs concat
 *   node scripts/db.migrate.mjs commands
 */

import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationsDir = join(__dirname, '..', 'infra', 'supabase', 'migrations');

/**
 * Get all migration files in order
 */
async function getMigrations() {
  try {
    const files = await readdir(migrationsDir);
    return files
      .filter(file => file.endsWith('.sql'))
      .sort()
      .map(file => ({
        name: file,
        path: join(migrationsDir, file)
      }));
  } catch (error) {
    console.error('Error reading migrations directory:', error.message);
    return [];
  }
}

/**
 * List all available migrations
 */
async function listMigrations() {
  console.log('📋 Available Migrations:');
  console.log('========================');
  
  const migrations = await getMigrations();
  
  if (migrations.length === 0) {
    console.log('❌ No migration files found in:', migrationsDir);
    console.log('💡 Create migration files manually using the content in .trash/2025-01-27/migration-files-content.md');
    return;
  }
  
  migrations.forEach((migration, index) => {
    console.log(`${index + 1}. ${migration.name}`);
  });
  
  console.log(`\n📁 Migration directory: ${migrationsDir}`);
}

/**
 * Concatenate all migrations in order
 */
async function concatMigrations() {
  console.log('🔗 Concatenated Migrations:');
  console.log('============================');
  
  const migrations = await getMigrations();
  
  if (migrations.length === 0) {
    console.log('❌ No migration files found');
    return;
  }
  
  let output = '';
  
  for (const migration of migrations) {
    try {
      const content = await readFile(migration.path, 'utf8');
      output += `-- ============================================\n`;
      output += `-- ${migration.name}\n`;
      output += `-- ============================================\n\n`;
      output += content;
      output += `\n\n`;
    } catch (error) {
      console.error(`❌ Error reading ${migration.name}:`, error.message);
    }
  }
  
  console.log(output);
}

/**
 * Show Supabase CLI commands
 */
function showCommands() {
  console.log('🚀 Supabase CLI Commands:');
  console.log('=========================');
  console.log('');
  console.log('1. Local Development:');
  console.log('   supabase start');
  console.log('   supabase db reset');
  console.log('   supabase db push');
  console.log('');
  console.log('2. Apply Migrations:');
  console.log('   # Apply all migrations:');
  console.log('   supabase db push');
  console.log('');
  console.log('   # Apply specific migration:');
  console.log('   supabase db push --include-all');
  console.log('');
  console.log('3. Production Deployment:');
  console.log('   supabase db push --linked');
  console.log('');
  console.log('4. Manual SQL Editor:');
  console.log('   # Copy the concatenated output and paste into Supabase SQL Editor');
  console.log('   node scripts/db.migrate.mjs concat');
  console.log('');
  console.log('📋 Verification Queries:');
  console.log('========================');
  console.log('');
  console.log('-- Check table counts:');
  console.log('SELECT \'orgs\' as table_name, COUNT(*) as count FROM orgs');
  console.log('UNION ALL SELECT \'departments\', COUNT(*) FROM departments');
  console.log('UNION ALL SELECT \'companies\', COUNT(*) FROM companies');
  console.log('UNION ALL SELECT \'contacts\', COUNT(*) FROM contacts');
  console.log('UNION ALL SELECT \'projects\', COUNT(*) FROM projects');
  console.log('UNION ALL SELECT \'tasks\', COUNT(*) FROM tasks');
  console.log('UNION ALL SELECT \'tickets\', COUNT(*) FROM tickets');
  console.log('UNION ALL SELECT \'time_entries\', COUNT(*) FROM time_entries');
  console.log('UNION ALL SELECT \'kb_collections\', COUNT(*) FROM kb_collections');
  console.log('UNION ALL SELECT \'kb_docs\', COUNT(*) FROM kb_docs');
  console.log('UNION ALL SELECT \'kb_vectors\', COUNT(*) FROM kb_vectors');
  console.log('UNION ALL SELECT \'sites_registry\', COUNT(*) FROM sites_registry');
  console.log('UNION ALL SELECT \'drops_meta\', COUNT(*) FROM drops_meta');
  console.log('UNION ALL SELECT \'billing_ledger\', COUNT(*) FROM billing_ledger');
  console.log('UNION ALL SELECT \'invoices\', COUNT(*) FROM invoices');
  console.log('UNION ALL SELECT \'feature_flags\', COUNT(*) FROM feature_flags');
  console.log('UNION ALL SELECT \'org_features\', COUNT(*) FROM org_features');
  console.log('UNION ALL SELECT \'company_features\', COUNT(*) FROM company_features;');
  console.log('');
  console.log('-- Check RLS is enabled:');
  console.log('SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = \'public\' AND rowsecurity = true;');
  console.log('');
  console.log('-- Check helper functions:');
  console.log('SELECT proname FROM pg_proc WHERE proname LIKE \'qieos_%\';');
}

/**
 * Main function
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'list':
      await listMigrations();
      break;
    case 'concat':
      await concatMigrations();
      break;
    case 'commands':
      showCommands();
      break;
    default:
      console.log('QiEOS Database Migration Runner');
      console.log('===============================');
      console.log('');
      console.log('Usage:');
      console.log('  node scripts/db.migrate.mjs list     - List available migrations');
      console.log('  node scripts/db.migrate.mjs concat   - Concatenate all migrations');
      console.log('  node scripts/db.migrate.mjs commands - Show Supabase CLI commands');
      console.log('');
      console.log('Examples:');
      console.log('  node scripts/db.migrate.mjs list');
      console.log('  node scripts/db.migrate.mjs concat > all-migrations.sql');
      console.log('  node scripts/db.migrate.mjs commands');
      break;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
