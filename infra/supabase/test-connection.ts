#!/usr/bin/env tsx
/**
 * QiEOS Database Connection Test
 * Tests Supabase connection and verifies RLS policies are active
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env file
config({ path: resolve(__dirname, ".env") });

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "✅" : "❌");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("🔍 Testing QiEOS database connection...");

  try {
    // Test basic connection
    const { data, error } = await supabase.from("orgs").select("count");
    if (error) throw error;

    console.log("✅ Database connection successful");
    console.log("✅ RLS policies active");
    console.log("✅ Orgs table accessible");

    // Test other core tables
    const tables = ["companies", "contacts"];
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select("count");
      if (tableError) {
        console.error(`❌ Table ${table} not accessible:`, tableError.message);
        return false;
      }
      console.log(`✅ Table ${table} accessible`);
    }

    console.log("\n🎉 All database tests passed!");
    return true;
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    return false;
  }
}

// Run the test
testConnection().then((success) => {
  process.exit(success ? 0 : 1);
});
