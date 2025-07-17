#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const helpRequestsSQL = `
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

-- Enable RLS
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Help requests are publicly viewable" ON public.help_requests
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can create own help requests" ON public.help_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own help requests" ON public.help_requests
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Admins can access all help requests" ON public.help_requests
    FOR ALL USING (
        true OR
        (auth.uid() IN (
            SELECT id FROM public.user_profiles WHERE role = 'admin'
        ))
    );

-- Create updated_at trigger
CREATE TRIGGER IF NOT EXISTS handle_updated_at_help_requests 
    BEFORE UPDATE ON public.help_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON public.help_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_requests_location ON public.help_requests(location);
CREATE INDEX IF NOT EXISTS idx_help_requests_user_id ON public.help_requests(user_id);
`;

async function createHelpRequestsTable() {
  console.log('🔄 Creating help_requests table...');
  
  try {
    // Check if we can connect and execute a simple query
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
      
    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
      process.exit(1);
    }
    
    console.log('✅ Connected to Supabase successfully');
    
    // Try to query help_requests to see if it exists
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ help_requests table does not exist, creating it...');
      console.log('\n💡 You need to run this SQL in Supabase Dashboard:');
      console.log('1. Go to https://supabase.com/dashboard/projects');
      console.log('2. Select your project');
      console.log('3. Go to SQL Editor');
      console.log('4. Run the following SQL:');
      console.log('\n' + helpRequestsSQL);
      console.log('\n📋 SQL copied to console for manual execution');
    } else {
      console.log('✅ help_requests table already exists and is accessible!');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createHelpRequestsTable();