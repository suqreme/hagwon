#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

// Use the same client setup as the app
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Using anon key like the app
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Replicate the exact subscription service logic
class TestSubscriptionService {
  constructor() {
    this.storageKey = 'user_subscription';
  }

  getDefaultSubscription() {
    return {
      plan: 'free',
      status: 'active',
      features: {
        dailyLessonLimit: 3,
        analyticsAccess: false,
        prioritySupport: false,
        offlineDownloads: false,
        certificateGeneration: false,
        scholarshipFunding: false
      }
    }
  }

  async getUserSubscription(userId) {
    console.log(`🔍 Getting subscription for user: ${userId}`);
    
    // Try to load from Supabase first, but handle missing tables gracefully
    if (supabase) {
      try {
        console.log('📡 Querying subscriptions table...');
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()
        
        console.log('📋 Query result:', { data, error: error?.message });
        
        if (data && !error) {
          const result = {
            plan: data.plan || 'free',
            status: data.status || 'active',
            expiresAt: data.current_period_end,
            features: this.getPlanFeatures(data.plan || 'free')
          }
          console.log('✅ Subscription found:', result);
          return result;
        }
        
        // If no subscription found (not an error), create default free subscription
        if (!data && !error) {
          console.log('⚠️ No subscription found, using default');
          const defaultSubscription = this.getDefaultSubscription()
          return defaultSubscription;
        }
        
        if (error) {
          console.log('❌ Supabase error:', error.message);
          throw error;
        }
      } catch (error) {
        console.error('❌ Error loading subscription from Supabase:', error.message);
        // If table doesn't exist, fallback immediately to localStorage/default
      }
    }

    // Default free plan with active status
    const defaultSub = this.getDefaultSubscription()
    defaultSub.status = 'active' // Ensure it's active
    console.log('🔄 Using default subscription:', defaultSub);
    return defaultSub
  }

  async checkLessonAccess(userId) {
    console.log(`\n🚪 Checking lesson access for user: ${userId}`);
    
    try {
      const subscription = await this.getUserSubscription(userId)
      console.log('📊 Subscription status:', subscription);
      
      // Be more permissive with subscription status - allow if status is active or if it's default/free
      if (subscription.status !== 'active' && subscription.plan !== 'free') {
        console.log('❌ Access denied: Subscription not active');
        return { allowed: false, reason: 'Subscription not active' }
      }

      if (subscription.features.dailyLessonLimit === null || subscription.plan === 'hardship') {
        console.log('✅ Access allowed: Unlimited lessons');
        return { allowed: true } // unlimited
      }

      // Check daily lesson count (this would normally check localStorage)
      console.log(`🔢 Daily limit: ${subscription.features.dailyLessonLimit} lessons`);
      console.log('📅 Would check localStorage for daily count...');
      
      // For testing, assume 0 lessons used today
      const todayCount = 0;
      console.log(`📈 Lessons used today: ${todayCount}`);

      if (todayCount >= subscription.features.dailyLessonLimit) {
        console.log(`❌ Access denied: Daily limit reached (${subscription.features.dailyLessonLimit})`);
        return { 
          allowed: false, 
          reason: `Daily limit of ${subscription.features.dailyLessonLimit} lessons reached. Upgrade for unlimited access.`
        }
      }

      console.log('✅ Access allowed: Within daily limit');
      return { allowed: true }
    } catch (error) {
      console.error('❌ Error checking lesson access:', error.message);
      // If there's an error, allow access with default free tier limits
      console.log('🔄 Fallback: Allowing access due to error');
      return { allowed: true }
    }
  }

  getPlanFeatures(planId) {
    console.log(`🎯 Getting features for plan: ${planId}`);
    switch (planId) {
      case 'supporter':
        return {
          dailyLessonLimit: null, // unlimited
          analyticsAccess: true,
          prioritySupport: true,
          offlineDownloads: true,
          certificateGeneration: true,
          scholarshipFunding: true
        }
      case 'sponsor':
        return {
          dailyLessonLimit: null, // unlimited
          analyticsAccess: true,
          prioritySupport: true,
          offlineDownloads: true,
          certificateGeneration: true,
          scholarshipFunding: true
        }
      case 'free':
      default:
        return {
          dailyLessonLimit: 3,
          analyticsAccess: false,
          prioritySupport: false,
          offlineDownloads: false,
          certificateGeneration: false,
          scholarshipFunding: false
        }
    }
  }
}

async function testRealLessonAccess() {
  console.log('🧪 Testing real-time lesson access logic...\n');

  // Get all users
  const { data: users } = await supabaseAdmin
    .from('user_profiles')
    .select('id, email, role')
    .limit(5);

  const testService = new TestSubscriptionService();

  for (const user of users || []) {
    console.log(`\n👤 Testing user: ${user.email} (${user.role})`);
    console.log(`User ID: ${user.id}`);
    
    const accessResult = await testService.checkLessonAccess(user.id);
    
    console.log('🎯 FINAL RESULT:', accessResult);
    console.log('─'.repeat(50));
  }
}

testRealLessonAccess();