'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { curriculumService } from '@/services/curriculumService'
import { progressService } from '@/services/progressService'
import { subscriptionService } from '@/services/subscriptionService'
import LessonContent from '@/components/lesson/LessonContent'
import QuizComponent from '@/components/lesson/QuizComponent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface LessonData {
  lesson: string
  metadata: {
    topic: string
    subtopic: string
    grade_level: string
    subject: string
  }
}

interface QuizData {
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
}

function LessonPageContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const subject = searchParams.get('subject') || ''
  const grade = searchParams.get('grade') || ''
  const topic = searchParams.get('topic') || ''
  const subtopic = searchParams.get('subtopic') || ''

  const [lessonData, setLessonData] = useState<LessonData | null>(null)
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [currentStep, setCurrentStep] = useState<'lesson' | 'quiz' | 'complete'>('lesson')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [subtopicInfo, setSubtopicInfo] = useState<any>(null)
  const [lessonStartTime, setLessonStartTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || authLoading) return
    
    if (!user) {
      router.push('/')
      return
    }

    // Check subscription access before loading lesson
    const accessCheck = subscriptionService.checkLessonAccess(user.id)
    if (!accessCheck.allowed) {
      setError(accessCheck.reason || 'Access denied')
      setLoading(false)
      return
    }

    if (subject && grade && topic && subtopic) {
      loadLessonContent()
    }
  }, [user, subject, grade, topic, subtopic, router, mounted, authLoading])

  const loadLessonContent = async () => {
    setLoading(true)
    setError('')

    console.log('Loading lesson with params:', { subject, grade, topic, subtopic })

    try {
      // Get subtopic info from curriculum
      const subtopicData = await curriculumService.getSubtopic(subject, grade, topic, subtopic)
      console.log('Subtopic data:', subtopicData)
      setSubtopicInfo(subtopicData)

      if (!subtopicData) {
        throw new Error(`Subtopic not found: ${subject}/${grade}/${topic}/${subtopic}`)
      }

      // Generate lesson using AI
      const lessonRequest = {
        grade_level: grade.replace('_', ' '),
        subject: subject === 'math' ? 'Mathematics' : 'English Language Arts',
        topic: topic,
        subtopic: subtopic,
        learning_objective: subtopicData.learning_objective,
        estimated_duration: subtopicData.estimated_duration
      }
      
      console.log('Lesson request:', lessonRequest)
      
      const response = await fetch('/api/ai/lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonRequest)
      })

      console.log('Lesson response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Lesson API error:', errorText)
        throw new Error(`Failed to generate lesson: ${response.status} - ${errorText}`)
      }

      const lesson = await response.json()
      console.log('Lesson data received:', lesson)
      setLessonData(lesson)
      
      // Track lesson start and record access
      if (user) {
        progressService.startLesson(user.id, subject, grade, topic, subtopic)
        subscriptionService.recordLessonAccess(user.id)
        setLessonStartTime(new Date())
      }
    } catch (error) {
      console.error('Error loading lesson:', error)
      
      // Create a fallback lesson for demo purposes
      const fallbackLesson = {
        lesson: `# Welcome to ${subtopic.replace(/_/g, ' ')}!

This is a comprehensive lesson about **${subtopic.replace(/_/g, ' ')}** for ${grade.replace('_', ' ')} level students.

In this lesson, we'll explore the fundamental concepts step by step, with practical examples and clear explanations. This topic is essential for building a strong foundation in ${subject === 'math' ? 'mathematics' : 'English language arts'}.

**What makes this lesson special:**
- Clear, step-by-step explanations
- Real-world examples you can relate to
- Practice opportunities to reinforce learning
- Interactive elements to keep you engaged

## Understanding the Basics

Let's start with the foundation. ${subtopic.replace(/_/g, ' ')} is a crucial concept that you'll use throughout your studies and even in everyday life.

**Key concepts to remember:**
- Every topic builds on previous knowledge
- Practice makes perfect
- It's okay to take your time
- Questions are encouraged

**Why this matters:** Understanding ${subtopic.replace(/_/g, ' ')} helps you think more clearly, solve problems more effectively, and prepares you for more advanced topics. Many students find this challenging at first, but with practice, it becomes much easier.

**Real-world connections:** You encounter concepts related to ${subtopic.replace(/_/g, ' ')} in many situations - from everyday problem-solving to more complex tasks. This makes learning it both practical and rewarding.

## Breaking It Down Step by Step

Now let's dive deeper into the specific elements of ${subtopic.replace(/_/g, ' ')}. We'll take this one step at a time.

**Step 1: Foundation**
The first thing to understand is the basic structure. Think of this like building a house - you need a solid foundation before you can build the walls and roof.

**Step 2: Building Up**
Once you have the foundation, we add the next layer of understanding. This is where things start to come together and make sense.

**Step 3: Application**
Finally, we learn how to apply what we've learned. This is the most rewarding part because you get to see how it all works together.

**Important tips:**
- Don't rush through the material
- Make sure you understand each step before moving on
- Practice with different examples
- Ask for help when you need it

## Practical Examples and Applications

Let's look at some concrete examples to help you understand ${subtopic.replace(/_/g, ' ')} better.

**Example 1: Everyday Situations**
Think about times in your daily life when you might use these concepts. Whether it's organizing your room, planning your time, or solving everyday problems, these skills are everywhere.

**Example 2: Academic Applications**
In school, you'll use ${subtopic.replace(/_/g, ' ')} in many different subjects. It's not just about this one topic - it's about developing thinking skills that help you everywhere.

**Example 3: Future Learning**
As you advance in your studies, this foundation will support more complex topics. Students who master these basics find later topics much easier to understand.

**Practice suggestions:**
- Try to identify these concepts in your daily life
- Practice explaining them to someone else
- Work through different types of problems
- Don't be afraid to make mistakes - they're part of learning

## Putting It All Together

Now that we've covered the basics, let's see how everything connects. ${subtopic.replace(/_/g, ' ')} isn't just isolated facts - it's part of a bigger picture.

**The big picture:**
Understanding how different concepts relate to each other helps you see patterns and make connections. This makes learning more efficient and more enjoyable.

**Review checklist:**
- Can you explain the basic concepts?
- Do you understand why this topic is important?
- Can you think of real-world examples?
- Are you ready to practice what you've learned?

**Next steps:**
After you finish this lesson, you'll take a quiz to test your understanding. Don't worry - it's designed to help you learn, not to trick you. If you don't pass the first time, you can review the material and try again.

Remember: Every expert was once a beginner. You're doing great by taking the time to learn this properly. Take your time, ask questions, and most importantly, believe in yourself!`,
        metadata: {
          topic: topic,
          subtopic: subtopic,
          grade_level: grade.replace('_', ' '),
          subject: subject === 'math' ? 'Mathematics' : 'English Language Arts'
        }
      }
      
      console.log('Using fallback lesson:', fallbackLesson)
      setLessonData(fallbackLesson)
      
      // Also create minimal subtopic info if missing
      if (!subtopicInfo) {
        setSubtopicInfo({
          name: subtopic.replace(/_/g, ' '),
          learning_objective: `Learn about ${subtopic.replace(/_/g, ' ')}`,
          estimated_duration: '5-10 minutes'
        })
      }
      
      // Track lesson start even with fallback
      if (user) {
        progressService.startLesson(user.id, subject, grade, topic, subtopic)
        setLessonStartTime(new Date())
      }
    } finally {
      setLoading(false)
    }
  }

  const generateQuiz = async () => {
    if (!lessonData || !subtopicInfo) return

    setLoading(true)
    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grade_level: grade.replace('_', ' '),
          subject: subject === 'math' ? 'Mathematics' : 'English Language Arts',
          topic: topic,
          subtopic: subtopic,
          learning_objective: subtopicInfo.learning_objective,
          lesson_summary: lessonData.lesson.substring(0, 500) + '...'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz')
      }

      const quiz = await response.json()
      setQuizData(quiz)
      setCurrentStep('quiz')
    } catch (error) {
      console.error('Error generating quiz:', error)
      setError('Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleQuizComplete = (passed: boolean, score: number) => {
    if (passed) {
      // Calculate time spent
      const timeSpent = lessonStartTime 
        ? Math.round((new Date().getTime() - lessonStartTime.getTime()) / (1000 * 60)) 
        : 0
      
      // Mark lesson as completed
      if (user) {
        progressService.completeLesson(user.id, subject, grade, topic, subtopic, score, timeSpent)
      }
      
      setCurrentStep('complete')
    } else {
      // Allow retry - stay on quiz
      setError('You need to score higher to pass. Please try again!')
    }
  }

  const goToDashboard = () => {
    // Force dashboard refresh to show updated progress
    router.push('/dashboard')
    router.refresh()
  }

  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              {currentStep === 'lesson' ? 'Generating your lesson...' : 'Creating your quiz...'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-96">
          <CardHeader>
            <div className="text-center">
              <div className="text-destructive text-6xl mb-4">⚠️</div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="flex space-x-2 justify-center">
              {error.includes('Daily limit') && (
                <Button onClick={() => router.push('/subscription')}>
                  Upgrade Now
                </Button>
              )}
              <Button variant="outline" onClick={goToDashboard}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToDashboard}
                className="mb-2"
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-foreground">
                {subtopicInfo?.name || 'Lesson'}
              </h1>
              <p className="text-muted-foreground">
                {subject === 'math' ? 'Mathematics' : 'English Language Arts'} • {grade.replace('_', ' ')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Step {currentStep === 'lesson' ? '1' : currentStep === 'quiz' ? '2' : '3'} of 3
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'lesson' && lessonData && (
          <LessonContent
            lessonData={lessonData}
            onComplete={generateQuiz}
          />
        )}

        {currentStep === 'quiz' && quizData && (
          <QuizComponent
            quizData={quizData}
            onComplete={handleQuizComplete}
          />
        )}

        {currentStep === 'complete' && (
          <Card>
            <CardContent className="text-center py-8 space-y-4">
              <div className="text-green-500 text-6xl mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-foreground">Lesson Complete!</h2>
              <p className="text-muted-foreground">
                Congratulations! You&apos;ve successfully completed the lesson on {subtopicInfo?.name}.
              </p>
              <Button onClick={goToDashboard} size="lg">
                Continue Learning
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default function LessonPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <LessonPageContent />
    </Suspense>
  )
}