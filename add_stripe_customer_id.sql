-- Add stripe_customer_id column to subscriptions table if it doesn't exist
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