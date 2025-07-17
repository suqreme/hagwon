#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugLessonAccess() {
  console.log('🔍 Debugging lesson access denial...\n');

  // Get all users to find a user ID to test with
  console.log('1️⃣ Finding user accounts...');
  try {
    const { data: users, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, subscription_plan')
      .limit(5);
    
    if (error) {
      console.log('❌ Error getting users:', error.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('✅ Found users:', users.length);
    
    for (const user of users) {
      console.log(`\n👤 Testing user: ${user.email} (${user.id})`);
      
      // Check their subscription status
      const { data: subscription, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (subError) {
        console.log('❌ Subscription error:', subError.message);
      } else if (!subscription) {
        console.log('📋 No subscription record - should default to free tier');
      } else {
        console.log('💳 Subscription:', {
          plan: subscription.plan,
          status: subscription.status,
          hardship_approved: subscription.hardship_approved
        });
      }
      
      // Check localStorage lesson count simulation
      const today = new Date().toDateString();
      console.log('📅 Today:', today);
      console.log('🔢 Simulating lesson count check...');
      
      // In browser, this would check localStorage, but we can't access that from Node
      console.log('💡 Browser would check: localStorage.getItem(`daily_lessons_${user.id}_${today}`)');
      
      // Test the subscription access logic
      console.log('🚪 Access check result:');
      if (!subscription) {
        console.log('✅ Should allow access - free tier (3 lessons/day)');
      } else if (subscription.plan === 'hardship' || subscription.plan === 'supporter' || subscription.plan === 'sponsor') {
        console.log('✅ Should allow unlimited access');
      } else if (subscription.status !== 'active') {
        console.log('❌ Would deny access - subscription not active');
      } else {
        console.log('✅ Should allow access - active subscription');
      }
    }
    
    console.log('\n🎯 Most likely causes of "Access denied":');
    console.log('1. User has used 3 lessons today (free tier limit)');
    console.log('2. User subscription status is not "active"');
    console.log('3. Error in subscription service database query');
    
    console.log('\n🔧 Solutions:');
    console.log('1. Clear browser localStorage to reset daily count');
    console.log('2. Set user subscription to "active" status');
    console.log('3. Grant hardship access for unlimited lessons');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugLessonAccess();