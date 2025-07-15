-- TEMPORARY: Disable RLS for testing
-- Run this ONLY if you're having RLS issues during development
-- DO NOT use this in production!

-- Disable RLS on all tables temporarily
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hardship_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_content DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS, run this:
-- ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.hardship_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.offline_content ENABLE ROW LEVEL SECURITY;