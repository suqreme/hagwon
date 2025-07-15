-- Create an admin user manually
-- Run this after creating a regular account through the UI

-- Replace 'your-user-id-here' with the actual UUID from auth.users table
-- You can find this in Supabase Dashboard > Authentication > Users

UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'admin@eduroot.com';

-- Alternative: If you know the user ID
-- UPDATE public.user_profiles 
-- SET role = 'admin' 
-- WHERE id = 'your-user-id-here';

-- Verify the update worked
SELECT id, email, role FROM public.user_profiles WHERE role = 'admin';