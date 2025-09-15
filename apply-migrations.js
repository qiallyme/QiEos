// Script to apply Supabase migrations via REST API
const fs = require('fs');
const path = require('path');

// Your Supabase configuration
const SUPABASE_URL = 'https://vwqkhjnkummwtvfxgqml.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_FCIyVFuvui9lU4XgmptK6Q_prtRwSYe';

async function applyMigrations() {
  const migrationsDir = path.join(__dirname, 'infra', 'supabase', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Apply in order

  console.log('Found migration files:', migrationFiles);

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`\nApplying migration: ${file}`);
    console.log('SQL Preview:', sql.substring(0, 200) + '...');

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': SUPABASE_SERVICE_ROLE_KEY
        },
        body: JSON.stringify({ sql })
      });

      if (response.ok) {
        console.log(`✅ Successfully applied ${file}`);
      } else {
        const error = await response.text();
        console.log(`❌ Error applying ${file}:`, error);
      }
    } catch (error) {
      console.log(`❌ Network error applying ${file}:`, error.message);
    }
  }
}

// Run the migrations
applyMigrations().catch(console.error);
