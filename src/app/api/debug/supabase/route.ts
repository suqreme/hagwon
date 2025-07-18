import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const debug = {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET',
      keyPreview: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET'
    }
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing Supabase configuration',
        debug
      }, { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test basic connection
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['cached_lessons', 'cached_quizzes'])
    
    if (tablesError) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: tablesError.message,
        debug
      }, { status: 500 })
    }
    
    // Check table structures
    const results = {
      connection: 'SUCCESS',
      tables: tables || [],
      debug
    }
    
    // Try to get sample data
    try {
      const { data: sampleLessons, error: lessonsError } = await supabase
        .from('cached_lessons')
        .select('*')
        .limit(1)
      
      const { data: sampleQuizzes, error: quizzesError } = await supabase
        .from('cached_quizzes')
        .select('*')
        .limit(1)
      
      results.sampleData = {
        lessons: lessonsError ? { error: lessonsError.message } : sampleLessons,
        quizzes: quizzesError ? { error: quizzesError.message } : sampleQuizzes
      }
    } catch (sampleError) {
      results.sampleData = { error: 'Could not fetch sample data' }
    }
    
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({
      error: 'Unexpected error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}