import { supabase } from '@/lib/supabase'

export interface CachedLessonData {
  lesson: string
  metadata: {
    topic: string
    subtopic: string
    grade_level: string
    subject: string
    target_language: string
    generation_type: 'ai' | 'fallback'
    version: number
  }
}

export interface CachedQuizData {
  questions: Array<{
    id: number
    question: string
    type: string
    options: string[]
    correct_answer: number
    explanation: string
    points: number
    difficulty: string
  }>
  total_points: number
  passing_score: number
  time_estimate: string
  metadata: {
    generation_type: 'ai' | 'fallback'
    version: number
  }
}

class LessonCacheService {
  private createCacheKey(
    subject: string,
    grade_level: string,
    topic: string,
    subtopic: string,
    target_language: string = 'en'
  ): string {
    return `${subject}_${grade_level}_${topic}_${subtopic}_${target_language}`
      .replace(/\s+/g, '_')
      .toLowerCase()
  }

  async getCachedLesson(
    subject: string,
    grade_level: string,
    topic: string,
    subtopic: string,
    target_language: string = 'en'
  ): Promise<CachedLessonData | null> {
    if (!supabase) return null

    const cacheKey = this.createCacheKey(subject, grade_level, topic, subtopic, target_language)
    
    try {
      const { data, error } = await supabase
        .from('cached_lessons')
        .select('*')
        .eq('cache_key', cacheKey)
        .order('quality_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error fetching cached lesson:', error)
        return null
      }

      if (!data) return null

      // Increment usage count
      await supabase
        .from('cached_lessons')
        .update({ usage_count: (data.usage_count || 0) + 1 })
        .eq('id', data.id)

      return {
        lesson: data.lesson_content,
        metadata: {
          topic: data.topic,
          subtopic: data.subtopic,
          grade_level: data.grade_level,
          subject: data.subject,
          target_language: data.target_language,
          generation_type: data.generation_type,
          version: data.version
        }
      }
    } catch (error) {
      console.error('Error in getCachedLesson:', error)
      return null
    }
  }

  async cacheLesson(
    subject: string,
    grade_level: string,
    topic: string,
    subtopic: string,
    target_language: string = 'en',
    lessonContent: string,
    metadata: any,
    generationType: 'ai' | 'fallback' = 'ai'
  ): Promise<void> {
    if (!supabase) return

    const cacheKey = this.createCacheKey(subject, grade_level, topic, subtopic, target_language)
    
    try {
      const { error } = await supabase
        .from('cached_lessons')
        .upsert({
          cache_key: cacheKey,
          subject,
          grade_level,
          topic,
          subtopic,
          target_language,
          lesson_content: lessonContent,
          lesson_metadata: metadata,
          generation_type: generationType,
          version: 1,
          quality_score: generationType === 'ai' ? 5 : 3, // AI content gets higher initial score
          usage_count: 0
        }, {
          onConflict: 'cache_key'
        })

      if (error) {
        console.error('Error caching lesson:', error)
      } else {
        console.log('Lesson cached successfully:', cacheKey)
      }
    } catch (error) {
      console.error('Error in cacheLesson:', error)
    }
  }

  async getCachedQuiz(
    subject: string,
    grade_level: string,
    topic: string,
    subtopic: string,
    target_language: string = 'en'
  ): Promise<CachedQuizData | null> {
    if (!supabase) return null

    const cacheKey = this.createCacheKey(subject, grade_level, topic, subtopic, target_language)
    
    try {
      const { data, error } = await supabase
        .from('cached_quizzes')
        .select('*')
        .eq('cache_key', cacheKey)
        .order('quality_score', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('Error fetching cached quiz:', error)
        return null
      }

      if (!data) return null

      // Increment usage count
      await supabase
        .from('cached_quizzes')
        .update({ usage_count: (data.usage_count || 0) + 1 })
        .eq('id', data.id)

      return {
        ...(data.quiz_content as any),
        metadata: {
          generation_type: data.generation_type,
          version: data.version
        }
      }
    } catch (error) {
      console.error('Error in getCachedQuiz:', error)
      return null
    }
  }

  async cacheQuiz(
    subject: string,
    grade_level: string,
    topic: string,
    subtopic: string,
    target_language: string = 'en',
    quizContent: any,
    generationType: 'ai' | 'fallback' = 'ai'
  ): Promise<void> {
    if (!supabase) return

    const cacheKey = this.createCacheKey(subject, grade_level, topic, subtopic, target_language)
    
    try {
      const { error } = await supabase
        .from('cached_quizzes')
        .upsert({
          cache_key: cacheKey,
          subject,
          grade_level,
          topic,
          subtopic,
          target_language,
          quiz_content: quizContent,
          generation_type: generationType,
          version: 1,
          quality_score: generationType === 'ai' ? 5 : 3,
          usage_count: 0
        }, {
          onConflict: 'cache_key'
        })

      if (error) {
        console.error('Error caching quiz:', error)
      } else {
        console.log('Quiz cached successfully:', cacheKey)
      }
    } catch (error) {
      console.error('Error in cacheQuiz:', error)
    }
  }

  async getCacheStats(): Promise<{
    totalLessons: number
    totalQuizzes: number
    languageBreakdown: Record<string, number>
    popularTopics: Array<{ topic: string; count: number }>
  }> {
    if (!supabase) return {
      totalLessons: 0,
      totalQuizzes: 0,
      languageBreakdown: {},
      popularTopics: []
    }

    try {
      const [lessonsCount, quizzesCount, languageStats, topicStats] = await Promise.all([
        supabase.from('cached_lessons').select('id', { count: 'exact' }),
        supabase.from('cached_quizzes').select('id', { count: 'exact' }),
        supabase
          .from('cached_lessons')
          .select('target_language')
          .then(({ data }) => {
            const breakdown: Record<string, number> = {}
            data?.forEach(item => {
              breakdown[item.target_language] = (breakdown[item.target_language] || 0) + 1
            })
            return breakdown
          }),
        supabase
          .from('cached_lessons')
          .select('topic, usage_count')
          .order('usage_count', { ascending: false })
          .limit(10)
          .then(({ data }) => {
            const topics: Record<string, number> = {}
            data?.forEach(item => {
              topics[item.topic] = (topics[item.topic] || 0) + item.usage_count
            })
            return Object.entries(topics)
              .map(([topic, count]) => ({ topic, count }))
              .sort((a, b) => b.count - a.count)
          })
      ])

      return {
        totalLessons: lessonsCount.count || 0,
        totalQuizzes: quizzesCount.count || 0,
        languageBreakdown: languageStats,
        popularTopics: topicStats
      }
    } catch (error) {
      console.error('Error getting cache stats:', error)
      return {
        totalLessons: 0,
        totalQuizzes: 0,
        languageBreakdown: {},
        popularTopics: []
      }
    }
  }
}

export const lessonCacheService = new LessonCacheService()