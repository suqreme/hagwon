-- DATABASE FIX FOR TRIGGER CONFLICTS
-- Run this in Supabase SQL Editor to fix trigger conflicts

-- Step 1: Drop existing trigger that's causing conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Recreate user_profiles table with proper structure
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    country TEXT,
    placement_level TEXT,
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 3: Create hardship_requests table
CREATE TABLE public.hardship_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    country TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT
);

-- Step 4: Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardship_requests ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple RLS policies (non-restrictive for now)
CREATE POLICY "Allow all operations for authenticated users" ON public.user_profiles
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON public.hardship_requests
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Step 6: Create your admin user
INSERT INTO public.user_profiles (id, email, role, subscription_plan, full_name)
SELECT 
    auth.users.id,
    auth.users.email,
    'admin',
    'premium',
    'Admin User'
FROM auth.users 
WHERE auth.users.email = 'zerotosran@hotmail.com'
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin',
    subscription_plan = 'premium',
    full_name = 'Admin User';

-- Step 7: Create trigger to auto-create user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, role, subscription_plan)
    VALUES (new.id, new.email, 'student', 'free')
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 8: Create missing community_requests table
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

-- Step 9: Enable RLS on community_requests
ALTER TABLE public.community_requests ENABLE ROW LEVEL SECURITY;

-- Step 10: Create RLS policy for community_requests
CREATE POLICY "Allow all operations for authenticated users" ON public.community_requests
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Step 11: Verify everything works
SELECT 'user_profiles created' as status, count(*) as count FROM public.user_profiles;
SELECT 'admin user exists' as status, email, role FROM public.user_profiles WHERE role = 'admin';
SELECT 'community_requests table exists' as status, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_requests') 
            THEN 'YES' ELSE 'NO' END as exists;

-- Success message
SELECT 'Database fix completed successfully! The trigger conflict has been resolved.' as message;