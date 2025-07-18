-- Safe migration: only create missing cache tables and components
-- This handles existing tables gracefully

-- Create cached_lessons table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cached_lessons') THEN
        CREATE TABLE cached_lessons (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            cache_key TEXT UNIQUE NOT NULL,
            subject TEXT NOT NULL,
            grade_level TEXT NOT NULL,
            topic TEXT NOT NULL,
            subtopic TEXT NOT NULL,
            target_language TEXT NOT NULL DEFAULT 'en',
            content TEXT NOT NULL,
            metadata JSONB,
            generation_type TEXT NOT NULL CHECK (generation_type IN ('ai', 'fallback')),
            version INTEGER NOT NULL DEFAULT 1,
            quality_score INTEGER NOT NULL DEFAULT 3 CHECK (quality_score >= 1 AND quality_score <= 5),
            usage_count INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        RAISE NOTICE 'Created cached_lessons table';
    ELSE
        RAISE NOTICE 'cached_lessons table already exists, skipping creation';
    END IF;
END $$;

-- Create cached_quizzes table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cached_quizzes') THEN
        CREATE TABLE cached_quizzes (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            cache_key TEXT UNIQUE NOT NULL,
            subject TEXT NOT NULL,
            grade_level TEXT NOT NULL,
            topic TEXT NOT NULL,
            subtopic TEXT NOT NULL,
            target_language TEXT NOT NULL DEFAULT 'en',
            questions JSONB NOT NULL,
            generation_type TEXT NOT NULL CHECK (generation_type IN ('ai', 'fallback')),
            version INTEGER NOT NULL DEFAULT 1,
            quality_score INTEGER NOT NULL DEFAULT 3 CHECK (quality_score >= 1 AND quality_score <= 5),
            usage_count INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        RAISE NOTICE 'Created cached_quizzes table';
    ELSE
        RAISE NOTICE 'cached_quizzes table already exists, skipping creation';
    END IF;
END $$;

-- Create indexes (these are safe with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_cached_lessons_cache_key ON cached_lessons(cache_key);
CREATE INDEX IF NOT EXISTS idx_cached_lessons_subject_grade ON cached_lessons(subject, grade_level);
CREATE INDEX IF NOT EXISTS idx_cached_lessons_language ON cached_lessons(target_language);
CREATE INDEX IF NOT EXISTS idx_cached_lessons_quality_usage ON cached_lessons(quality_score DESC, usage_count DESC);

CREATE INDEX IF NOT EXISTS idx_cached_quizzes_cache_key ON cached_quizzes(cache_key);
CREATE INDEX IF NOT EXISTS idx_cached_quizzes_subject_grade ON cached_quizzes(subject, grade_level);
CREATE INDEX IF NOT EXISTS idx_cached_quizzes_language ON cached_quizzes(target_language);
CREATE INDEX IF NOT EXISTS idx_cached_quizzes_quality_usage ON cached_quizzes(quality_score DESC, usage_count DESC);

-- Create the trigger function (safely)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers (safely)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cached_lessons_updated_at') THEN
        CREATE TRIGGER update_cached_lessons_updated_at 
        BEFORE UPDATE ON cached_lessons 
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
        RAISE NOTICE 'Created trigger for cached_lessons';
    ELSE
        RAISE NOTICE 'Trigger for cached_lessons already exists';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cached_quizzes_updated_at') THEN
        CREATE TRIGGER update_cached_quizzes_updated_at 
        BEFORE UPDATE ON cached_quizzes 
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
        RAISE NOTICE 'Created trigger for cached_quizzes';
    ELSE
        RAISE NOTICE 'Trigger for cached_quizzes already exists';
    END IF;
END $$;

-- Enable RLS (Row Level Security) - safe to run multiple times
ALTER TABLE cached_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_quizzes ENABLE ROW LEVEL SECURITY;

-- Create policies (safely)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on cached_lessons') THEN
        CREATE POLICY "Allow all operations on cached_lessons" ON cached_lessons FOR ALL USING (true);
        RAISE NOTICE 'Created policy for cached_lessons';
    ELSE
        RAISE NOTICE 'Policy for cached_lessons already exists';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all operations on cached_quizzes') THEN
        CREATE POLICY "Allow all operations on cached_quizzes" ON cached_quizzes FOR ALL USING (true);
        RAISE NOTICE 'Created policy for cached_quizzes';
    ELSE
        RAISE NOTICE 'Policy for cached_quizzes already exists';
    END IF;
END $$;

-- Grant permissions (safe to run multiple times)
GRANT ALL ON cached_lessons TO anon, authenticated;
GRANT ALL ON cached_quizzes TO anon, authenticated;

-- Show final status
SELECT 
    'cached_lessons' as table_name,
    EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'cached_lessons') as exists
UNION ALL
SELECT 
    'cached_quizzes' as table_name,
    EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'cached_quizzes') as exists;