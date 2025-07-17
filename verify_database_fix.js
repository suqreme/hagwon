#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function verifyFix() {
  console.log('🔍 Verifying database fixes...\n');
  
  let allGood = true;

  // Test 1: Check all subscription columns
  console.log('1️⃣ Testing subscriptions table with all columns...');
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, hardship_approved')
      .limit(1);
    
    if (error) {
      console.log('❌ Subscriptions issue:', error.message);
      allGood = false;
    } else {
      console.log('✅ All subscription columns exist');
    }
  } catch (e) {
    console.log('❌ Subscriptions error:', e.message);
    allGood = false;
  }

  // Test 2: Check help_requests table
  console.log('\n2️⃣ Testing help_requests table...');
  try {
    const { data, error } = await supabase
      .from('help_requests')
      .select('id, title, description, location, status')
      .limit(1);
    
    if (error) {
      console.log('❌ Help requests issue:', error.message);
      allGood = false;
    } else {
      console.log('✅ Help requests table exists and accessible');
    }
  } catch (e) {
    console.log('❌ Help requests error:', e.message);
    allGood = false;
  }

  // Test 3: Check hardship_requests table
  console.log('\n3️⃣ Testing hardship_requests table...');
  try {
    const { data, error } = await supabase
      .from('hardship_requests')
      .select('id, user_id, status')
      .limit(1);
    
    if (error) {
      console.log('❌ Hardship requests issue:', error.message);
      allGood = false;
    } else {
      console.log('✅ Hardship requests table accessible');
    }
  } catch (e) {
    console.log('❌ Hardship requests error:', e.message);
    allGood = false;
  }

  console.log('\n🎯 Final Result:');
  if (allGood) {
    console.log('🎉 ALL DATABASE ISSUES FIXED!');
    console.log('✅ Lesson access should now work without 400 errors');
    console.log('✅ Hardship and community requests should save properly');
    console.log('✅ Subscription service should work correctly');
  } else {
    console.log('❌ Some issues remain - please run the SQL in Supabase dashboard');
  }
}

verifyFix();