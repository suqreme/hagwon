-- MINIMAL DATABASE FIX - Only add missing pieces
-- This preserves all existing data and tables

-- Step 1: Fix the trigger conflict (safely)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Recreate the user creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, role, subscription_plan)
    VALUES (new.id, new.email, 'student', 'free')
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Add missing columns to user_profiles if they don't exist
DO $$
BEGIN
    -- Add first_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'first_name') THEN
        ALTER TABLE public.user_profiles ADD COLUMN first_name TEXT;
    END IF;
    
    -- Add last_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'last_name') THEN
        ALTER TABLE public.user_profiles ADD COLUMN last_name TEXT;
    END IF;
    
    -- Add date_of_birth if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'date_of_birth') THEN
        ALTER TABLE public.user_profiles ADD COLUMN date_of_birth DATE;
    END IF;
    
    -- Add phone_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'phone_number') THEN
        ALTER TABLE public.user_profiles ADD COLUMN phone_number TEXT;
    END IF;
    
    -- Add timezone if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'timezone') THEN
        ALTER TABLE public.user_profiles ADD COLUMN timezone TEXT;
    END IF;
    
    -- Add preferred_language if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'preferred_language') THEN
        ALTER TABLE public.user_profiles ADD COLUMN preferred_language TEXT DEFAULT 'en';
    END IF;
    
    -- Add education_level if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'education_level') THEN
        ALTER TABLE public.user_profiles ADD COLUMN education_level TEXT;
    END IF;
    
    -- Add learning_goals if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'learning_goals') THEN
        ALTER TABLE public.user_profiles ADD COLUMN learning_goals TEXT;
    END IF;
    
    -- Add about_me if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'about_me') THEN
        ALTER TABLE public.user_profiles ADD COLUMN about_me TEXT;
    END IF;
    
    -- Add onboarding_completed if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE public.user_profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Step 5: Create missing community_requests table ONLY if it doesn't exist
CREATE TABLE IF NOT EXISTS public.community_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    request_type TEXT NOT NULL CHECK (request_type IN ('hardship_application', 'language_request', 'help_request')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    hardship_reason TEXT,
    country TEXT,
    language_requested TEXT,
    community_name TEXT,
    location TEXT,
    description TEXT,
    contact_email TEXT,
    reviewed_by UUID REFERENCES public.user_profiles(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 6: Enable RLS on community_requests if table was created
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_requests') THEN
        ALTER TABLE public.community_requests ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Step 7: Create RLS policies for community_requests (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_requests') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can access own community requests" ON public.community_requests;
        DROP POLICY IF EXISTS "Admins can access all community requests" ON public.community_requests;
        
        -- Create new policies
        CREATE POLICY "Users can access own community requests" ON public.community_requests
            FOR ALL USING (auth.uid() = user_id);
            
        CREATE POLICY "Admins can access all community requests" ON public.community_requests
            FOR ALL USING (
                (auth.uid() = user_id) OR 
                (auth.uid() IN (
                    SELECT id FROM public.user_profiles WHERE role = 'admin'
                ))
            );
    END IF;
END $$;

-- Step 8: Create updated_at trigger for community_requests if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_requests') THEN
        -- Create updated_at function if it doesn't exist
        CREATE OR REPLACE FUNCTION public.handle_updated_at()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
        
        -- Drop existing trigger if it exists
        DROP TRIGGER IF EXISTS handle_updated_at ON public.community_requests;
        
        -- Create new trigger
        CREATE TRIGGER handle_updated_at 
            BEFORE UPDATE ON public.community_requests
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- Step 9: Create indexes for community_requests if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_requests') THEN
        CREATE INDEX IF NOT EXISTS idx_community_requests_user_id ON public.community_requests(user_id);
        CREATE INDEX IF NOT EXISTS idx_community_requests_status ON public.community_requests(status);
        CREATE INDEX IF NOT EXISTS idx_community_requests_type ON public.community_requests(request_type);
    END IF;
END $$;

-- Step 10: Verify what was added
DO $$
BEGIN
    RAISE NOTICE '=== MINIMAL DATABASE FIX COMPLETED ===';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE NOTICE '✓ user_profiles table exists (preserved existing data)';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_requests') THEN
        RAISE NOTICE '✓ community_requests table created successfully';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user') THEN
        RAISE NOTICE '✓ handle_new_user function created';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') THEN
        RAISE NOTICE '✓ on_auth_user_created trigger created';
    END IF;
    
    RAISE NOTICE '=== All existing data preserved, only missing pieces added ===';
END $$;