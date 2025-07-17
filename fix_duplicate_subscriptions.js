#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDuplicateSubscriptions() {
  console.log('🔧 Fixing duplicate subscription records...\n');

  // Step 1: Find all users with multiple subscriptions
  console.log('1️⃣ Finding users with duplicate subscriptions...');
  
  const { data: allSubs, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .order('user_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.log('❌ Error fetching subscriptions:', error.message);
    return;
  }

  const userGroups = {};
  allSubs.forEach(sub => {
    if (!userGroups[sub.user_id]) {
      userGroups[sub.user_id] = [];
    }
    userGroups[sub.user_id].push(sub);
  });

  const duplicateUsers = Object.entries(userGroups).filter(([_, subs]) => subs.length > 1);
  
  console.log(`Found ${duplicateUsers.length} users with duplicate subscriptions`);

  // Step 2: For each user with duplicates, keep the most recent and delete the rest
  for (const [userId, subs] of duplicateUsers) {
    console.log(`\n👤 Processing user ${userId} (${subs.length} records):`);
    
    // Sort by created_at DESC to get most recent first
    subs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const keepRecord = subs[0];
    const deleteRecords = subs.slice(1);
    
    console.log(`   ✅ Keeping: ${keepRecord.id} (${keepRecord.plan}, ${keepRecord.created_at})`);
    
    for (const deleteRecord of deleteRecords) {
      console.log(`   🗑️  Deleting: ${deleteRecord.id} (${deleteRecord.plan}, ${deleteRecord.created_at})`);
      
      const { error: deleteError } = await supabaseAdmin
        .from('subscriptions')
        .delete()
        .eq('id', deleteRecord.id);
      
      if (deleteError) {
        console.log(`   ❌ Failed to delete ${deleteRecord.id}: ${deleteError.message}`);
      } else {
        console.log(`   ✅ Deleted ${deleteRecord.id}`);
      }
    }
  }

  // Step 3: Verify the fix
  console.log('\n3️⃣ Verifying fix...');
  
  for (const [userId] of duplicateUsers) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.log(`❌ User ${userId} still has issues: ${error.message}`);
    } else {
      console.log(`✅ User ${userId} now has single subscription record`);
    }
  }

  console.log('\n🎉 Duplicate subscription cleanup completed!');
  console.log('💡 Consider adding a unique constraint on user_id to prevent future duplicates');
}

fixDuplicateSubscriptions().catch(console.error);