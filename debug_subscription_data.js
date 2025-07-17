#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSubscriptionData() {
  console.log('🔍 Debugging subscription data integrity...\n');

  // Get all subscription records
  console.log('📊 All subscription records:');
  const { data: allSubs, error: allSubsError } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (allSubsError) {
    console.log('❌ Error fetching subscriptions:', allSubsError.message);
    return;
  }

  console.log(`Found ${allSubs?.length || 0} total subscription records`);
  
  // Group by user_id to find duplicates
  const userGroups = {};
  allSubs?.forEach(sub => {
    if (!userGroups[sub.user_id]) {
      userGroups[sub.user_id] = [];
    }
    userGroups[sub.user_id].push(sub);
  });

  console.log('\n🔍 Checking for duplicate subscriptions...');
  let duplicatesFound = false;
  
  for (const [userId, subs] of Object.entries(userGroups)) {
    if (subs.length > 1) {
      duplicatesFound = true;
      console.log(`❌ User ${userId} has ${subs.length} subscription records:`);
      subs.forEach((sub, index) => {
        console.log(`   ${index + 1}. ID: ${sub.id}, Plan: ${sub.plan}, Status: ${sub.status}, Created: ${sub.created_at}`);
      });
    }
  }

  if (!duplicatesFound) {
    console.log('✅ No duplicate subscriptions found');
  }

  // Test the problematic query for each user
  console.log('\n🧪 Testing .maybeSingle() query for each user...');
  
  for (const userId of Object.keys(userGroups)) {
    try {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.log(`❌ User ${userId}: ${error.message}`);
        
        // Show what the regular query returns
        const { data: allForUser } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId);
        
        console.log(`   Regular query returns ${allForUser?.length || 0} records`);
        
      } else {
        console.log(`✅ User ${userId}: Query successful`);
      }
    } catch (e) {
      console.log(`❌ User ${userId}: Exception - ${e.message}`);
    }
  }

  // Suggest fixes
  console.log('\n💡 Suggested fixes:');
  if (duplicatesFound) {
    console.log('1. Remove duplicate subscription records');
    console.log('2. Add unique constraint on user_id in subscriptions table');
  }
  console.log('3. Change .maybeSingle() to .limit(1).single() to get the first record');
  console.log('4. Or use regular .select() and handle multiple records gracefully');

  // Show SQL to fix duplicates
  if (duplicatesFound) {
    console.log('\n🔧 SQL to remove duplicates (keep most recent):');
    console.log(`
DELETE FROM subscriptions 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM subscriptions 
  ORDER BY user_id, created_at DESC
);
    `);
  }
}

debugSubscriptionData().catch(console.error);