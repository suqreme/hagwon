#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function grantUnlimitedAccess() {
  console.log('🚀 Granting unlimited access to all users...\n');

  try {
    // Get all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email');
    
    if (usersError) {
      console.log('❌ Error getting users:', usersError.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No users found');
      return;
    }
    
    console.log(`📋 Found ${users.length} users. Granting unlimited access...`);
    
    for (const user of users) {
      try {
        // Upsert subscription with hardship plan (unlimited lessons)
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            plan: 'hardship',
            status: 'active',
            hardship_approved: true,
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.log(`❌ Error for ${user.email}:`, error.message);
        } else {
          console.log(`✅ ${user.email} - granted unlimited access`);
        }
      } catch (userError) {
        console.log(`❌ Exception for ${user.email}:`, userError.message);
      }
    }
    
    console.log('\n🎉 Unlimited access granted to all users!');
    console.log('💡 All users now have unlimited daily lessons');
    console.log('🔄 Users may need to refresh their browser');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

grantUnlimitedAccess();