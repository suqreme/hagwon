-- Fix database issues preventing Stripe integration and hardship requests

-- 1. Add missing stripe_customer_id column to subscriptions table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscriptions' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE public.subscriptions ADD COLUMN stripe_customer_id TEXT;
        RAISE NOTICE 'Added stripe_customer_id column to subscriptions table';
    ELSE
        RAISE NOTICE 'stripe_customer_id column already exists in subscriptions table';
    END IF;
END $$;

-- 2. Ensure hardship_requests has all required columns
DO $$
BEGIN
    -- Check if created_at exists (different from the auto-generated one)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'hardship_requests' AND column_name = 'created_at') THEN
        ALTER TABLE public.hardship_requests ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL;
        RAISE NOTICE 'Added created_at column to hardship_requests table';
    ELSE
        RAISE NOTICE 'created_at column already exists in hardship_requests table';
    END IF;

    -- Check if admin_notes exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'hardship_requests' AND column_name = 'admin_notes') THEN
        ALTER TABLE public.hardship_requests ADD COLUMN admin_notes TEXT;
        RAISE NOTICE 'Added admin_notes column to hardship_requests table';
    ELSE
        RAISE NOTICE 'admin_notes column already exists in hardship_requests table';
    END IF;
END $$;

-- 3. Add indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_hardship_requests_created_at ON public.hardship_requests(created_at);

-- 4. Check the current structure
DO $$
BEGIN
    RAISE NOTICE '=== CURRENT SUBSCRIPTIONS TABLE STRUCTURE ===';
    -- This will show in the logs what columns exist
END $$;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
ORDER BY ordinal_position;

DO $$
BEGIN
    RAISE NOTICE '=== CURRENT HARDSHIP_REQUESTS TABLE STRUCTURE ===';
END $$;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'hardship_requests' 
ORDER BY ordinal_position;