#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugStripeIntegration() {
  console.log('🔍 Debugging Stripe integration access issues...\n');

  try {
    // 1. Check the actual subscription table structure
    console.log('1️⃣ Checking subscription table structure...');
    const { data: columns, error: colError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'subscriptions')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (colError) {
      console.log('❌ Error getting columns:', colError.message);
    } else {
      console.log('📋 Subscription table columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
      });
    }

    // 2. Check actual subscription data
    console.log('\n2️⃣ Checking subscription data...');
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('*');
    
    if (subError) {
      console.log('❌ Error getting subscriptions:', subError.message);
    } else {
      console.log('💳 Current subscriptions:');
      subscriptions.forEach((sub, index) => {
        console.log(`  Subscription ${index + 1}:`);
        console.log(`    user_id: ${sub.user_id}`);
        console.log(`    plan: ${sub.plan}`);
        console.log(`    status: ${sub.status}`);
        console.log(`    stripe_customer_id: ${sub.stripe_customer_id || 'null'}`);
        console.log(`    stripe_subscription_id: ${sub.stripe_subscription_id || 'null'}`);
        console.log(`    hardship_approved: ${sub.hardship_approved}`);
        console.log('');
      });
    }

    // 3. Check user profiles
    console.log('3️⃣ Checking user profiles...');
    const { data: users, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, subscription_plan');
    
    if (userError) {
      console.log('❌ Error getting users:', userError.message);
    } else {
      console.log('👥 User profiles:');
      users.forEach(user => {
        console.log(`  ${user.email}: subscription_plan = ${user.subscription_plan}`);
      });
    }

    // 4. Test the specific subscription service logic
    console.log('4️⃣ Testing subscription service logic...');
    
    // Simulate what the subscription service does
    for (const user of users || []) {
      console.log(`\n🧪 Testing for user: ${user.email}`);
      
      // Get their subscription
      const { data: userSub, error: userSubError } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (userSubError) {
        console.log(`  ❌ Error getting subscription: ${userSubError.message}`);
        continue;
      }
      
      if (!userSub) {
        console.log(`  ⚠️ No subscription record found - should default to free`);
        console.log(`  🎯 Access should be: ALLOWED (3 lessons/day)`);
        continue;
      }
      
      console.log(`  📊 Subscription data:`);
      console.log(`    plan: ${userSub.plan}`);
      console.log(`    status: ${userSub.status}`);
      console.log(`    hardship_approved: ${userSub.hardship_approved}`);
      
      // Apply the subscription service logic
      if (userSub.status !== 'active' && userSub.plan !== 'free') {
        console.log(`  ❌ Access: DENIED - subscription not active`);
      } else if (userSub.plan === 'hardship' || userSub.plan === 'supporter' || userSub.plan === 'sponsor') {
        console.log(`  ✅ Access: ALLOWED - unlimited lessons`);
      } else if (userSub.plan === 'free') {
        console.log(`  ✅ Access: ALLOWED - 3 lessons/day limit`);
      } else {
        console.log(`  ⚠️ Access: UNKNOWN - unexpected plan: ${userSub.plan}`);
      }
    }

    // 5. Check for table constraints that might be causing issues
    console.log('\n5️⃣ Checking table constraints...');
    const { data: constraints, error: constraintError } = await supabaseAdmin
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'subscriptions')
      .eq('table_schema', 'public');
    
    if (constraintError) {
      console.log('❌ Error getting constraints:', constraintError.message);
    } else {
      console.log('🔒 Table constraints:');
      constraints.forEach(constraint => {
        console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
    }

    // 6. Test a simple subscription update
    console.log('\n6️⃣ Testing subscription update...');
    if (users && users.length > 0) {
      const testUser = users[0];
      console.log(`Testing update for: ${testUser.email}`);
      
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: testUser.id,
          plan: 'supporter',
          status: 'active',
          updated_at: new Date().toISOString()
        });
      
      if (updateError) {
        console.log(`❌ Update failed: ${updateError.message}`);
        console.log(`This might be the root cause of access denied issues!`);
      } else {
        console.log(`✅ Update successful - user should now have unlimited access`);
      }
    }

  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

debugStripeIntegration();