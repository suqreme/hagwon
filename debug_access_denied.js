#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Using anon key like the app would
);

async function debugAccessDenied() {
  console.log('🔍 Debugging "Access denied" error...\n');

  // Test 1: Check if we can access public tables without auth
  console.log('1️⃣ Testing public table access (no auth)...');
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Public access error:', error.message);
      console.log('❌ This suggests RLS policies are too restrictive');
    } else {
      console.log('✅ Public access works');
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }

  // Test 2: Check lesson access specifically
  console.log('\n2️⃣ Testing lesson-related tables...');
  
  const tables = ['user_progress', 'lessons', 'quiz_results'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: accessible`);
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
    }
  }

  // Test 3: Test auth status
  console.log('\n3️⃣ Testing auth status...');
  const { data: authData, error: authError } = await supabase.auth.getSession();
  
  if (authError) {
    console.log('❌ Auth error:', authError.message);
  } else if (!authData.session) {
    console.log('ℹ️ No active session (user not logged in)');
    console.log('💡 This might be the issue - lessons may require authentication');
  } else {
    console.log('✅ User is authenticated:', authData.session.user.email);
  }

  // Test 4: Check RLS policies
  console.log('\n4️⃣ Checking if RLS is blocking access...');
  
  // Test with service role key to see if it's an RLS issue
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    const { data, error } = await supabaseAdmin
      .from('user_progress')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('❌ Even admin access fails:', error.message);
    } else {
      console.log('✅ Admin access works - this confirms it\'s an RLS/auth issue');
      console.log('💡 Regular users need proper authentication or adjusted RLS policies');
    }
  } catch (e) {
    console.log('❌ Admin test failed:', e.message);
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Check if user is properly logged in');
  console.log('2. Verify RLS policies allow authenticated users to access lesson data');
  console.log('3. Check the lesson page code for proper auth handling');
}

debugAccessDenied();