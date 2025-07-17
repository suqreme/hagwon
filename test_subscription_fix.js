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

async function testSubscriptionFix() {
  console.log('🧪 Testing subscription service fix...\n');

  // Get test users
  const { data: users } = await supabaseAdmin
    .from('user_profiles')
    .select('id, email')
    .limit(3);

  for (const user of users || []) {
    console.log(`\n👤 Testing user: ${user.email}`);

    // Test the new query logic
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.log(`❌ Query failed: ${error.message}`);
      } else {
        console.log(`✅ Query successful - found ${data?.length || 0} records`);
        if (data && data.length > 0) {
          console.log(`   Plan: ${data[0].plan}, Status: ${data[0].status}`);
        } else {
          console.log('   Will use default free subscription');
        }
      }
    } catch (e) {
      console.log(`❌ Exception: ${e.message}`);
    }

    // Test checkLessonAccess simulation
    try {
      let subscription;
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0 && !error) {
        subscription = {
          plan: data[0].plan || 'free',
          status: data[0].status || 'active',
          features: {
            dailyLessonLimit: ['supporter', 'sponsor', 'hardship'].includes(data[0].plan) ? null : 3
          }
        };
      } else {
        subscription = {
          plan: 'free',
          status: 'active',
          features: {
            dailyLessonLimit: 3
          }
        };
      }

      // Check access
      if (subscription.status !== 'active' && subscription.plan !== 'free') {
        console.log('   🚫 Access: DENIED - Subscription not active');
      } else if (subscription.features.dailyLessonLimit === null || subscription.plan === 'hardship') {
        console.log('   ✅ Access: ALLOWED - Unlimited lessons');
      } else {
        console.log('   ✅ Access: ALLOWED - Free tier (3 lessons/day)');
      }

    } catch (e) {
      console.log(`   ❌ Access check failed: ${e.message}`);
    }
  }

  console.log('\n🎉 Subscription service fix testing completed!');
}

testSubscriptionFix().catch(console.error);