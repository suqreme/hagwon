-- Fix admin user setup
-- 🚨 IMPORTANT: Replace 'your-email@example.com' with your actual email address below

-- Step 1: Update existing user profile to admin
UPDATE public.user_profiles 
SET 
    role = 'admin',
    subscription_plan = 'premium',
    full_name = 'Admin User'
WHERE email = 'zerotosran@hotmail.com';

-- Step 2: If the above returns 0 rows, create the profile
INSERT INTO public.user_profiles (id, email, role, subscription_plan, full_name)
SELECT 
    auth.users.id,
    auth.users.email,
    'admin',
    'premium',
    'Admin User'
FROM auth.users 
WHERE auth.users.email = 'your-email@example.com'
AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.email = auth.users.email
);

-- Step 3: Verify the update worked
SELECT id, email, role, subscription_plan, full_name 
FROM public.user_profiles 
WHERE email = 'zerotosran@hotmail.com';