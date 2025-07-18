-- Create cache tables for lessons and quizzes
-- This enables fast loading and reduces OpenAI API costs

-- Cached lessons table
CREATE TABLE IF NOT EXISTS cached_lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    topic TEXT NOT NULL,
    subtopic TEXT NOT NULL,
    target_language TEXT NOT NULL DEFAULT 'en',
    lesson_content TEXT NOT NULL,
    lesson_metadata JSONB,
    generation_type TEXT NOT NULL CHECK (generation_type IN ('ai', 'fallback')),
    version INTEGER NOT NULL DEFAULT 1,
    quality_score INTEGER NOT NULL DEFAULT 3 CHECK (quality_score >= 1 AND quality_score <= 5),
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Cached quizzes table
CREATE TABLE IF NOT EXISTS cached_quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    topic TEXT NOT NULL,
    subtopic TEXT NOT NULL,
    target_language TEXT NOT NULL DEFAULT 'en',
    quiz_content JSONB NOT NULL,
    generation_type TEXT NOT NULL CHECK (generation_type IN ('ai', 'fallback')),
    version INTEGER NOT NULL DEFAULT 1,
    quality_score INTEGER NOT NULL DEFAULT 3 CHECK (quality_score >= 1 AND quality_score <= 5),
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cached_lessons_cache_key ON cached_lessons(cache_key);
CREATE INDEX IF NOT EXISTS idx_cached_lessons_subject_grade ON cached_lessons(subject, grade_level);
CREATE INDEX IF NOT EXISTS idx_cached_lessons_language ON cached_lessons(target_language);
CREATE INDEX IF NOT EXISTS idx_cached_lessons_quality_usage ON cached_lessons(quality_score DESC, usage_count DESC);

CREATE INDEX IF NOT EXISTS idx_cached_quizzes_cache_key ON cached_quizzes(cache_key);
CREATE INDEX IF NOT EXISTS idx_cached_quizzes_subject_grade ON cached_quizzes(subject, grade_level);
CREATE INDEX IF NOT EXISTS idx_cached_quizzes_language ON cached_quizzes(target_language);
CREATE INDEX IF NOT EXISTS idx_cached_quizzes_quality_usage ON cached_quizzes(quality_score DESC, usage_count DESC);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cached_lessons_updated_at BEFORE UPDATE ON cached_lessons FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_cached_quizzes_updated_at BEFORE UPDATE ON cached_quizzes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE cached_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_quizzes ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (can be restricted later)
CREATE POLICY "Allow all operations on cached_lessons" ON cached_lessons FOR ALL USING (true);
CREATE POLICY "Allow all operations on cached_quizzes" ON cached_quizzes FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON cached_lessons TO anon, authenticated;
GRANT ALL ON cached_quizzes TO anon, authenticated;