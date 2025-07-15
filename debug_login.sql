-- Debug login issues
-- Run this in Supabase SQL Editor to check what's happening

-- 1. Check if your user exists in auth.users
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'zerotosran@hotmail.com';

-- 2. Check if user_profiles table exists and has data
SELECT id, email, role, subscription_plan, created_at 
FROM public.user_profiles 
WHERE email = 'zerotosran@hotmail.com';

-- 3. Check RLS policies on user_profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 4. Temporarily disable RLS to test (ONLY FOR DEBUGGING)
-- UNCOMMENT ONLY IF NEEDED FOR TESTING:
-- ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 5. Re-enable RLS after testing (IMPORTANT!)
-- ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;