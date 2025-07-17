#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🔄 Starting database migration...');
  
  try {
    // First, let's check what tables currently exist
    console.log('🔍 Checking current database state...');
    
    const tables = ['user_profiles', 'subscriptions', 'hardship_requests', 'help_requests'];
    
    for (const tableName of tables) {
      const { data: tableData, error: tableError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (tableError) {
        console.log(`❌ Table ${tableName} not accessible:`, tableError.message);
      } else {
        console.log(`✅ Table ${tableName} exists and is accessible`);
      }
    }
    
    // Since direct SQL execution via RPC isn't standard, let's try creating missing tables manually
    console.log('📄 Creating missing tables manually...');
    
    // Check if subscriptions table exists by trying to create it
    const { error: subError } = await supabase.rpc('create_subscriptions_table');
    if (subError && !subError.message.includes('already exists')) {
      console.error('❌ Error with subscriptions table:', subError.message);
    }
    
    console.log('✅ Migration process completed!');
    console.log('💡 If tables are still missing, please run the SQL migration manually in Supabase Dashboard SQL Editor:');
    console.log('📁 File: complete_database_setup_v2.sql');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    
    console.log('\n💡 Please run the SQL migration manually:');
    console.log('1. Go to https://supabase.com/dashboard/projects');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and paste the contents of complete_database_setup_v2.sql');
    console.log('5. Run the query');
  }
}

runMigration();