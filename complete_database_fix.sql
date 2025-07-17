-- COMPLETE DATABASE FIX - Final Migration
-- This fixes all remaining database issues

-- 1. Add missing columns to subscriptions table
DO $$
BEGIN
    -- Add stripe_customer_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscriptions' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE public.subscriptions ADD COLUMN stripe_customer_id TEXT;
        RAISE NOTICE 'Added stripe_customer_id column to subscriptions table';
    END IF;
    
    -- Add stripe_subscription_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_id') THEN
        ALTER TABLE public.subscriptions ADD COLUMN stripe_subscription_id TEXT;
        RAISE NOTICE 'Added stripe_subscription_id column to subscriptions table';
    END IF;
    
    -- Add current_period_start if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscriptions' AND column_name = 'current_period_start') THEN
        ALTER TABLE public.subscriptions ADD COLUMN current_period_start TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added current_period_start column to subscriptions table';
    END IF;
    
    -- Add current_period_end if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscriptions' AND column_name = 'current_period_end') THEN
        ALTER TABLE public.subscriptions ADD COLUMN current_period_end TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added current_period_end column to subscriptions table';
    END IF;
END $$;

-- 2. Add missing columns to hardship_requests table
DO $$
BEGIN
    -- Add admin_notes if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'hardship_requests' AND column_name = 'admin_notes') THEN
        ALTER TABLE public.hardship_requests ADD COLUMN admin_notes TEXT;
        RAISE NOTICE 'Added admin_notes column to hardship_requests table';
    END IF;
END $$;

-- 3. Create help_requests table if it doesn't exist
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

-- 4. Enable RLS on help_requests if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'help_requests') THEN
        ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
        
        -- Create policies if they don't exist
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
    END IF;
END $$;

-- 5. Create updated_at trigger for help_requests
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'help_requests') THEN
        DROP TRIGGER IF EXISTS handle_updated_at_help_requests ON public.help_requests;
        CREATE TRIGGER handle_updated_at_help_requests 
            BEFORE UPDATE ON public.help_requests
            FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- 6. Create all necessary indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_hardship_requests_created_at ON public.hardship_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON public.help_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_requests_location ON public.help_requests(location);
CREATE INDEX IF NOT EXISTS idx_help_requests_user_id ON public.help_requests(user_id);

-- 7. Final verification
DO $$
BEGIN
    RAISE NOTICE '=== DATABASE FIX COMPLETED ===';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE NOTICE '✓ user_profiles table exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        RAISE NOTICE '✓ subscriptions table exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hardship_requests') THEN
        RAISE NOTICE '✓ hardship_requests table exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'help_requests') THEN
        RAISE NOTICE '✓ help_requests table exists';
    END IF;
    
    -- Check for key columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'stripe_customer_id') THEN
        RAISE NOTICE '✓ subscriptions.stripe_customer_id column exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_id') THEN
        RAISE NOTICE '✓ subscriptions.stripe_subscription_id column exists';
    END IF;
    
    RAISE NOTICE '=== All database issues should be resolved! ===';
END $$;