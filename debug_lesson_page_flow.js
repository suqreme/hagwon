#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugLessonPageFlow() {
  console.log('🔍 Debugging complete lesson page flow...\n');

  // Step 1: Check if user is authenticated (this is what the lesson page checks first)
  console.log('1️⃣ Testing authentication flow...');
  
  // Get a user to test with
  const { data: users } = await supabaseAdmin
    .from('user_profiles')
    .select('id, email, role')
    .limit(1);
  
  if (!users || users.length === 0) {
    console.log('❌ No users found');
    return;
  }
  
  const testUser = users[0];
  console.log(`Testing with user: ${testUser.email} (${testUser.role})`);
  
  // Step 2: Test the exact subscription service checkLessonAccess call
  console.log('\n2️⃣ Testing subscriptionService.checkLessonAccess()...');
  
  try {
    // Test with anon client (like the app does)
    console.log('📡 Testing with anon client...');
    const { data: anonSubData, error: anonError } = await supabaseAnon
      .from('subscriptions')
      .select('*')
      .eq('user_id', testUser.id)
      .maybeSingle();
    
    console.log('Anon client result:', { data: anonSubData, error: anonError?.message });
    
    // Test with admin client
    console.log('📡 Testing with admin client...');
    const { data: adminSubData, error: adminError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', testUser.id)
      .maybeSingle();
    
    console.log('Admin client result:', { data: adminSubData, error: adminError?.message });
    
  } catch (error) {
    console.log('❌ Subscription check failed:', error.message);
  }
  
  // Step 3: Check if there's a specific condition causing the denial
  console.log('\n3️⃣ Testing specific subscription service conditions...');
  
  // Simulate the actual subscription service logic step by step
  const { data: subData } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', testUser.id)
    .maybeSingle();
  
  if (!subData) {
    console.log('⚠️ No subscription data - should default to free with 3 lessons/day');
    console.log('✅ This should ALLOW access');
  } else {
    console.log('📊 Subscription data found:', subData);
    
    // Check the specific conditions in the subscription service
    if (subData.status !== 'active' && subData.plan !== 'free') {
      console.log('❌ WOULD DENY: Subscription not active');
    } else if (subData.plan === 'hardship' || subData.plan === 'supporter' || subData.plan === 'sponsor') {
      console.log('✅ SHOULD ALLOW: Unlimited access plan');
    } else if (subData.plan === 'free') {
      console.log('✅ SHOULD ALLOW: Free plan with daily limit');
    } else {
      console.log('⚠️ UNKNOWN: Unexpected plan type');
    }
  }
  
  // Step 4: Check if there are any errors in the actual lesson page route
  console.log('\n4️⃣ Testing lesson page API endpoints...');
  
  try {
    // Test the curriculum service that the lesson page uses
    const { data: curriculumData, error: curriculumError } = await supabaseAnon
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (curriculumError) {
      console.log('❌ Basic table access failed:', curriculumError.message);
      console.log('💡 This suggests RLS is blocking all access');
    } else {
      console.log('✅ Basic table access works');
    }
    
  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }
  
  // Step 5: Check for any JavaScript errors that might cause "Access denied"
  console.log('\n5️⃣ Checking for other possible causes...');
  
  // Check if there are any localStorage simulation issues
  console.log('📅 Today\'s date:', new Date().toDateString());
  console.log('🔢 Daily lesson key would be:', `daily_lessons_${testUser.id}_${new Date().toDateString()}`);
  
  // Check if the user has any progress records
  const { data: progressData, error: progressError } = await supabaseAdmin
    .from('user_progress')
    .select('*')
    .eq('user_id', testUser.id)
    .limit(1);
  
  if (progressError) {
    console.log('❌ Progress table error:', progressError.message);
  } else {
    console.log('📈 User progress records:', progressData?.length || 0);
  }
  
  // Step 6: Check if there's an actual error being thrown somewhere
  console.log('\n6️⃣ Final diagnosis...');
  
  // The real issue might be in the error handling
  console.log('💡 Possible causes of "Access denied":');
  console.log('1. RLS policies still blocking access (most likely)');
  console.log('2. Subscription service throwing an error and defaulting to denied');
  console.log('3. Daily lesson limit already reached');
  console.log('4. Some other authentication middleware blocking access');
  console.log('5. Missing user profile or corrupted user data');
  
  // Let's check the user profile specifically
  const { data: profileData, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', testUser.id)
    .single();
  
  if (profileError) {
    console.log('❌ User profile error:', profileError.message);
    console.log('💡 This could be why access is denied!');
  } else {
    console.log('👤 User profile:', {
      id: profileData.id,
      email: profileData.email,
      role: profileData.role,
      subscription_plan: profileData.subscription_plan,
      onboarding_completed: profileData.onboarding_completed
    });
  }
}

debugLessonPageFlow();