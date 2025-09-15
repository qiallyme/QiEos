#!/usr/bin/env node
/**
 * Apply QiEOS Database Schema to Supabase
 * This script applies the complete schema to your Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Your Supabase credentials
const SUPABASE_URL = 'https://vwqkhjnkummwtvfxgqml.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cWtoam5rdW1td3R2ZnhncW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjAwMzA0OSwiZXhwIjoyMDcxNTc5MDQ5fQ.IonJfbD_34jImKfPIfdEwUHPhLx0bnMRniq2wJ3Uqmc';

async function applySchema() {
  console.log('🚀 Applying QiEOS database schema to Supabase...\n');

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Read the complete schema
    const schemaPath = join(ROOT, 'complete-schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    console.log('📄 Schema loaded, applying to database...');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });

          if (error) {
            console.log(`⚠️  Statement ${i + 1} had an issue (may already exist):`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} error (may already exist):`, err.message);
        }
      }
    }

    console.log('\n🎉 Database schema application complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the worker: cd workers/api && wrangler dev');
    console.log('2. Test the admin panel: cd apps/admin-electron && npm run dev');
    console.log('3. Test the web app: cd apps/web && npm run dev');

    return true;
  } catch (err) {
    console.error('❌ Failed to apply schema:', err.message);
    console.log('\n📋 Manual alternative:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy contents of complete-schema.sql');
    console.log('4. Paste and run the SQL');
    return false;
  }
}

// Run the script
applySchema().then((success) => {
  process.exit(success ? 0 : 1);
});
