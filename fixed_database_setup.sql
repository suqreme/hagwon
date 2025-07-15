-- FIXED DATABASE SETUP
-- Run this in Supabase SQL Editor to create missing tables without FK violations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create all missing tables

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'supporter', 'sponsor')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    topic TEXT NOT NULL,
    subtopic TEXT NOT NULL,
    status TEXT DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'in_progress', 'completed')),
    score INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, subject, grade_level, topic, subtopic)
);

-- Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    topic TEXT NOT NULL,
    subtopic TEXT NOT NULL,
    content TEXT NOT NULL,
    quiz_data JSONB,
    ai_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Quiz results table
CREATE TABLE IF NOT EXISTS public.quiz_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    time_taken INTEGER, -- in seconds
    answers JSONB, -- store user answers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User gamification table
CREATE TABLE IF NOT EXISTS public.user_gamification (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    earned_badges JSONB DEFAULT '[]',
    xp_history JSONB DEFAULT '[]',
    achievements JSONB DEFAULT '[]',
    stats JSONB DEFAULT '{"lessonsCompleted": 0, "quizzesPassed": 0, "perfectScores": 0, "currentStreak": 0, "longestStreak": 0}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Offline content table
CREATE TABLE IF NOT EXISTS public.offline_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
    content_data JSONB NOT NULL,
    download_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Enable RLS on all tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_content ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies (simple for now)
CREATE POLICY "Allow all operations for authenticated users" ON public.subscriptions
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON public.user_progress
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON public.lessons
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON public.quiz_results
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON public.user_gamification
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow all operations for authenticated users" ON public.offline_content
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Step 4: Add data for your existing admin user only
INSERT INTO public.subscriptions (user_id, plan, status)
SELECT id, 'free', 'active'
FROM public.user_profiles
WHERE email = 'zerotosran@hotmail.com'
ON CONFLICT DO NOTHING;

-- Add some sample user progress for your admin account
INSERT INTO public.user_progress (user_id, subject, grade_level, topic, subtopic, status, score)
SELECT 
    id,
    'math',
    'grade_1',
    'addition',
    'basic_addition',
    'completed',
    85
FROM public.user_profiles
WHERE email = 'zerotosran@hotmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_progress (user_id, subject, grade_level, topic, subtopic, status, score)
SELECT 
    id,
    'english',
    'grade_1',
    'reading',
    'phonics',
    'completed',
    92
FROM public.user_profiles
WHERE email = 'zerotosran@hotmail.com'
ON CONFLICT DO NOTHING;

-- Add gamification data for your admin account
INSERT INTO public.user_gamification (user_id, level, total_xp)
SELECT id, 3, 450
FROM public.user_profiles
WHERE email = 'zerotosran@hotmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    level = 3,
    total_xp = 450;

-- Step 5: Verify all tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'user_profiles', 
        'subscriptions', 
        'user_progress', 
        'hardship_requests', 
        'user_gamification',
        'lessons',
        'quiz_results',
        'offline_content'
    )
ORDER BY tablename;

-- Step 6: Check your data
SELECT 
    'user_profiles' as table_name, 
    count(*) as row_count 
FROM public.user_profiles
UNION ALL
SELECT 
    'subscriptions' as table_name, 
    count(*) as row_count 
FROM public.subscriptions
UNION ALL
SELECT 
    'user_progress' as table_name, 
    count(*) as row_count 
FROM public.user_progress
ORDER BY table_name;