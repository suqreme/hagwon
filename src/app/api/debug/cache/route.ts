import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    // Get cache statistics
    const [lessonsResult, quizzesResult] = await Promise.all([
      supabase.from('cached_lessons').select('*'),
      supabase.from('cached_quizzes').select('*')
    ])
    
    if (lessonsResult.error || quizzesResult.error) {
      return NextResponse.json({
        error: 'Failed to fetch cache data',
        details: lessonsResult.error?.message || quizzesResult.error?.message
      }, { status: 500 })
    }
    
    const lessons = lessonsResult.data || []
    const quizzes = quizzesResult.data || []
    
    // Calculate statistics
    const stats = {
      totalLessons: lessons.length,
      totalQuizzes: quizzes.length,
      lessonsByType: lessons.reduce((acc, lesson) => {
        acc[lesson.generation_type] = (acc[lesson.generation_type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      lessonsByLanguage: lessons.reduce((acc, lesson) => {
        acc[lesson.target_language] = (acc[lesson.target_language] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      lessonsBySubject: lessons.reduce((acc, lesson) => {
        acc[lesson.subject] = (acc[lesson.subject] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      quizzesByType: quizzes.reduce((acc, quiz) => {
        acc[quiz.generation_type] = (acc[quiz.generation_type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      recentLessons: lessons
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(lesson => ({
          path: `${lesson.subject} → ${lesson.grade_level} → ${lesson.topic} → ${lesson.subtopic}`,
          language: lesson.target_language,
          type: lesson.generation_type,
          created: lesson.created_at,
          contentLength: lesson.content?.length || 0,
          usageCount: lesson.usage_count || 0
        }))
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cache statistics retrieved successfully',
      timestamp: new Date().toISOString(),
      statistics: stats,
      rawData: {
        lessons: lessons.map(lesson => ({
          id: lesson.id,
          subject: lesson.subject,
          grade_level: lesson.grade_level,
          topic: lesson.topic,
          subtopic: lesson.subtopic,
          target_language: lesson.target_language,
          generation_type: lesson.generation_type,
          quality_score: lesson.quality_score,
          usage_count: lesson.usage_count,
          created_at: lesson.created_at,
          content_preview: lesson.content?.substring(0, 200) + '...'
        })),
        quizzes: quizzes.map(quiz => ({
          id: quiz.id,
          subject: quiz.subject,
          grade_level: quiz.grade_level,
          topic: quiz.topic,
          subtopic: quiz.subtopic,
          target_language: quiz.target_language,
          generation_type: quiz.generation_type,
          created_at: quiz.created_at,
          questions_count: quiz.questions?.length || 0
        }))
      }
    })
  } catch (error) {
    console.error('Cache debug error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Also support POST for consistency
export async function POST() {
  return GET()
}