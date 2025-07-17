-- Create lesson cache table for storing AI-generated lessons
CREATE TABLE IF NOT EXISTS public.cached_lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cache_key TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    topic TEXT NOT NULL,
    subtopic TEXT NOT NULL,
    target_language TEXT DEFAULT 'en',
    lesson_content TEXT NOT NULL,
    lesson_metadata JSONB,
    generation_type TEXT DEFAULT 'ai' CHECK (generation_type IN ('ai', 'fallback')),
    version INTEGER DEFAULT 1,
    quality_score INTEGER DEFAULT 0, -- For A/B testing later
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_cached_lessons_cache_key ON public.cached_lessons(cache_key);
CREATE INDEX IF NOT EXISTS idx_cached_lessons_subject_grade ON public.cached_lessons(subject, grade_level);
CREATE INDEX IF NOT EXISTS idx_cached_lessons_language ON public.cached_lessons(target_language);
CREATE INDEX IF NOT EXISTS idx_cached_lessons_usage ON public.cached_lessons(usage_count DESC);

-- Create quiz cache table for storing AI-generated quizzes
CREATE TABLE IF NOT EXISTS public.cached_quizzes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cache_key TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    topic TEXT NOT NULL,
    subtopic TEXT NOT NULL,
    target_language TEXT DEFAULT 'en',
    quiz_content JSONB NOT NULL,
    generation_type TEXT DEFAULT 'ai' CHECK (generation_type IN ('ai', 'fallback')),
    version INTEGER DEFAULT 1,
    quality_score INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Create indexes for quiz cache
CREATE INDEX IF NOT EXISTS idx_cached_quizzes_cache_key ON public.cached_quizzes(cache_key);
CREATE INDEX IF NOT EXISTS idx_cached_quizzes_subject_grade ON public.cached_quizzes(subject, grade_level);
CREATE INDEX IF NOT EXISTS idx_cached_quizzes_language ON public.cached_quizzes(target_language);

-- Enable Row Level Security
ALTER TABLE public.cached_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cached_quizzes ENABLE ROW LEVEL SECURITY;

-- Create policies for cached lessons (read-only for authenticated users)
CREATE POLICY "Allow authenticated users to read cached lessons" ON public.cached_lessons
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage cached lessons" ON public.cached_lessons
    FOR ALL USING (auth.role() = 'service_role');

-- Create policies for cached quizzes (read-only for authenticated users)
CREATE POLICY "Allow authenticated users to read cached quizzes" ON public.cached_quizzes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to manage cached quizzes" ON public.cached_quizzes
    FOR ALL USING (auth.role() = 'service_role');