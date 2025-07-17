#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function fixDatabase() {
  console.log('🔄 Fixing database issues using direct Supabase client...');
  
  try {
    // Step 1: Check current subscriptions table structure
    console.log('\n1️⃣ Checking subscriptions table...');
    const { data: subsData, error: subsError } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status')
      .limit(1);
    
    if (subsError) {
      console.log('❌ Subscriptions table issue:', subsError.message);
    } else {
      console.log('✅ Subscriptions table accessible');
    }

    // Step 2: Check hardship_requests table
    console.log('\n2️⃣ Checking hardship_requests table...');
    const { data: hardshipData, error: hardshipError } = await supabase
      .from('hardship_requests')
      .select('id, user_id, hardship_reason, status')
      .limit(1);
    
    if (hardshipError) {
      console.log('❌ Hardship requests table issue:', hardshipError.message);
    } else {
      console.log('✅ Hardship requests table accessible');
    }

    // Step 3: Try to create help_requests table
    console.log('\n3️⃣ Checking/creating help_requests table...');
    const { data: helpData, error: helpError } = await supabase
      .from('help_requests')
      .select('id')
      .limit(1);
    
    if (helpError) {
      console.log('❌ Help requests table missing:', helpError.message);
      console.log('💡 This table needs to be created manually in Supabase dashboard');
    } else {
      console.log('✅ Help requests table accessible');
    }

    // Step 4: Test subscription service functionality
    console.log('\n4️⃣ Testing subscription service...');
    
    // Try to query with columns that might be missing
    const { data: fullSubsData, error: fullSubsError } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, hardship_approved')
      .limit(1);
    
    if (fullSubsError) {
      console.log('❌ Missing columns in subscriptions:', fullSubsError.message);
      
      // Identify which specific columns are missing
      if (fullSubsError.message.includes('stripe_customer_id')) {
        console.log('📋 Missing: stripe_customer_id column');
      }
      if (fullSubsError.message.includes('stripe_subscription_id')) {
        console.log('📋 Missing: stripe_subscription_id column');
      }
      if (fullSubsError.message.includes('current_period_start')) {
        console.log('📋 Missing: current_period_start column');
      }
      if (fullSubsError.message.includes('current_period_end')) {
        console.log('📋 Missing: current_period_end column');
      }
    } else {
      console.log('✅ All subscription columns exist');
      console.log('Sample data structure:', Object.keys(fullSubsData[0] || {}));
    }

    // Step 5: Test user_profiles table
    console.log('\n5️⃣ Testing user_profiles table...');
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, role, subscription_plan')
      .limit(1);
    
    if (profileError) {
      console.log('❌ User profiles issue:', profileError.message);
    } else {
      console.log('✅ User profiles table working');
    }

    console.log('\n🎯 Summary:');
    console.log('- The main issue is missing columns in the subscriptions table');
    console.log('- The help_requests table needs to be created');
    console.log('- These require DDL operations that need to be run in Supabase dashboard');
    
    console.log('\n📋 Required SQL (copy to Supabase dashboard):');
    console.log(`
-- Add missing columns to subscriptions table
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- Create help_requests table
CREATE TABLE IF NOT EXISTS public.help_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('equipment', 'internet', 'funding')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    coordinates JSONB,
    students_count INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'funded', 'completed')),
    donor_name TEXT,
    donor_message TEXT,
    amount_needed DECIMAL(10,2),
    amount_raised DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS on help_requests
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for help_requests
CREATE POLICY IF NOT EXISTS "Help requests are publicly viewable" ON public.help_requests
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can create own help requests" ON public.help_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own help requests" ON public.help_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON public.help_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_requests_user_id ON public.help_requests(user_id);
    `);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixDatabase();