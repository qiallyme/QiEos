#!/usr/bin/env node

// Test database connection directly

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vwqkhjnkummwtvfxgqml.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3cWtoam5rdW1td3R2ZnhncW1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjAwMzA0OSwiZXhwIjoyMDcxNTc5MDQ5fQ.IonJfbD_34jImKfPIfdEwUHPhLx0bnMRniq2wJ3Uqmc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function testDatabase() {
  console.log('🗄️ Testing Supabase Database Connection...\n');

  try {
    // Test orgs
    const { data: orgs, error: orgsError } = await supabase
      .from('orgs')
      .select('*');

    if (orgsError) {
      console.log('❌ Orgs error:', orgsError.message);
    } else {
      console.log(`✅ Orgs: Found ${orgs.length} organizations`);
      console.log('   Sample:', orgs[0]);
    }

    // Test contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*');

    if (contactsError) {
      console.log('❌ Contacts error:', contactsError.message);
    } else {
      console.log(`✅ Contacts: Found ${contacts.length} contacts`);
      console.log('   Sample:', contacts[0]);
    }

    // Test kb_docs
    const { data: kbDocs, error: kbDocsError } = await supabase
      .from('kb_docs')
      .select('*');

    if (kbDocsError) {
      console.log('❌ KB Docs error:', kbDocsError.message);
    } else {
      console.log(`✅ KB Docs: Found ${kbDocs.length} documents`);
      console.log('   Sample:', kbDocs[0]);
    }

    // Test tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');

    if (tasksError) {
      console.log('❌ Tasks error:', tasksError.message);
    } else {
      console.log(`✅ Tasks: Found ${tasks.length} tasks`);
      console.log('   Sample:', tasks[0]);
    }

  } catch (error) {
    console.log('❌ Database connection error:', error.message);
  }

  console.log('\n🎯 Database test complete!');
}

testDatabase().catch(console.error);
