-- COMPLETE DATABASE SETUP V2 - Includes subscriptions table
-- This script safely creates all missing tables and fixes all issues

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

-- Step 4: Create subscriptions table ONLY if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'supporter', 'sponsor', 'hardship')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    hardship_approved BOOLEAN DEFAULT FALSE,
    hardship_reason TEXT,
    approved_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Step 5: Create hardship_requests table ONLY if it doesn't exist
CREATE TABLE IF NOT EXISTS public.hardship_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    hardship_reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.user_profiles(id),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Step 6: Add missing columns to user_profiles if they don't exist
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

-- Step 7: Enable RLS on subscriptions table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Step 8: Enable RLS on hardship_requests table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hardship_requests') THEN
        ALTER TABLE public.hardship_requests ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Step 9: Create RLS policies for subscriptions
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can access own subscriptions" ON public.subscriptions;
        DROP POLICY IF EXISTS "Admins can access all subscriptions" ON public.subscriptions;
        
        -- Create new policies
        CREATE POLICY "Users can access own subscriptions" ON public.subscriptions
            FOR ALL USING (auth.uid() = user_id);
            
        CREATE POLICY "Admins can access all subscriptions" ON public.subscriptions
            FOR ALL USING (
                (auth.uid() = user_id) OR 
                (auth.uid() IN (
                    SELECT id FROM public.user_profiles WHERE role = 'admin'
                ))
            );
    END IF;
END $$;

-- Step 10: Create RLS policies for hardship_requests
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hardship_requests') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can access own hardship requests" ON public.hardship_requests;
        DROP POLICY IF EXISTS "Admins can access all hardship requests" ON public.hardship_requests;
        
        -- Create new policies
        CREATE POLICY "Users can access own hardship requests" ON public.hardship_requests
            FOR ALL USING (auth.uid() = user_id);
            
        CREATE POLICY "Admins can access all hardship requests" ON public.hardship_requests
            FOR ALL USING (
                (auth.uid() = user_id) OR 
                (auth.uid() IN (
                    SELECT id FROM public.user_profiles WHERE role = 'admin'
                ))
            );
    END IF;
END $$;

-- Step 11: Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Create updated_at triggers
DO $$
BEGIN
    -- Trigger for subscriptions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        DROP TRIGGER IF EXISTS handle_updated_at ON public.subscriptions;
        CREATE TRIGGER handle_updated_at 
            BEFORE UPDATE ON public.subscriptions
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
    
    -- Trigger for hardship_requests
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hardship_requests') THEN
        DROP TRIGGER IF EXISTS handle_updated_at_hardship ON public.hardship_requests;
        CREATE TRIGGER handle_updated_at_hardship 
            BEFORE UPDATE ON public.hardship_requests
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- Step 13: Create indexes for better performance
DO $$
BEGIN
    -- Subscriptions indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan);
        CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
    END IF;
    
    -- Hardship requests indexes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hardship_requests') THEN
        CREATE INDEX IF NOT EXISTS idx_hardship_requests_user_id ON public.hardship_requests(user_id);
        CREATE INDEX IF NOT EXISTS idx_hardship_requests_status ON public.hardship_requests(status);
    END IF;
END $$;

-- Step 14: Verify what was created/updated
DO $$
BEGIN
    RAISE NOTICE '=== COMPLETE DATABASE SETUP V2 COMPLETED ===';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE NOTICE '✓ user_profiles table exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        RAISE NOTICE '✓ subscriptions table created/exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hardship_requests') THEN
        RAISE NOTICE '✓ hardship_requests table created/exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'handle_new_user') THEN
        RAISE NOTICE '✓ handle_new_user function created';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') THEN
        RAISE NOTICE '✓ on_auth_user_created trigger created';
    END IF;
    
    RAISE NOTICE '=== Ready for subscriptions and hardship requests! ===';
END $$;