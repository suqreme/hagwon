#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Using anon key like the frontend
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSupabaseAuth() {
  console.log('🔍 Debugging Supabase authentication and RLS issues...\n');

  // Step 1: Check if we can query user_profiles with anon key
  console.log('1️⃣ Testing user_profiles access with anon key...');
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email')
      .limit(1);
    
    if (error) {
      console.log('❌ user_profiles query failed:', error.message);
      console.log('💡 This suggests RLS is blocking anonymous access');
    } else {
      console.log('✅ user_profiles accessible with anon key');
      console.log('👤 Found users:', data?.length || 0);
    }
  } catch (e) {
    console.log('❌ user_profiles query error:', e.message);
  }

  // Step 2: Check subscriptions table access with anon key
  console.log('\n2️⃣ Testing subscriptions table access with anon key...');
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status')
      .limit(1);
    
    if (error) {
      console.log('❌ subscriptions query failed:', error.message);
      console.log('💡 This suggests RLS is blocking anonymous access to subscriptions');
      console.log('🎯 This is likely WHY access is denied!');
    } else {
      console.log('✅ subscriptions accessible with anon key');
      console.log('📋 Found subscriptions:', data?.length || 0);
    }
  } catch (e) {
    console.log('❌ subscriptions query error:', e.message);
  }

  // Step 3: Compare with admin access
  console.log('\n3️⃣ Testing same queries with admin key...');
  try {
    const { data: adminUsers, error: adminUserError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
      .limit(3);
    
    const { data: adminSubs, error: adminSubError } = await supabaseAdmin
      .from('subscriptions')
      .select('id, user_id, plan, status')
      .limit(3);

    console.log('👤 Admin users query:', adminUserError ? `❌ ${adminUserError.message}` : `✅ ${adminUsers?.length || 0} users`);
    console.log('📋 Admin subscriptions query:', adminSubError ? `❌ ${adminSubError.message}` : `✅ ${adminSubs?.length || 0} subscriptions`);

  } catch (e) {
    console.log('❌ Admin queries error:', e.message);
  }

  // Step 4: Test the exact subscription service query logic
  console.log('\n4️⃣ Testing subscription service logic...');
  
  // Get a real user ID to test with
  const { data: testUsers } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .limit(1);
  
  if (testUsers && testUsers.length > 0) {
    const testUserId = testUsers[0].id;
    console.log(`🧪 Testing with user ID: ${testUserId}`);
    
    // Test the exact query from subscriptionService
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', testUserId)
        .maybeSingle();
      
      if (error) {
        console.log('❌ Subscription query for user failed:', error.message);
        console.log('🎯 THIS IS THE EXACT CAUSE OF ACCESS DENIED!');
        console.log('💡 The frontend cannot query subscriptions due to RLS policies');
      } else {
        console.log('✅ Subscription query worked');
        console.log('📊 Result:', data ? 'Found subscription' : 'No subscription (will use default)');
      }
    } catch (e) {
      console.log('❌ Subscription service query error:', e.message);
    }
  }

  console.log('\n📋 Summary:');
  console.log('If subscription queries fail with anon key:');
  console.log('1. RLS policies are blocking frontend access');
  console.log('2. Need to adjust RLS policies to allow authenticated users');
  console.log('3. Or modify subscription service to handle RLS failures gracefully');
}

debugSupabaseAuth().catch(console.error);