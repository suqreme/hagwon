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
import { T } from '@/components/ui/auto-translate'

// Subject-specific content generator
function generateSubjectSpecificContent(subject: string, grade: string, topic: string, subtopic: string): string {
  const topicName = topic.replace(/_/g, ' ')
  const subtopicName = subtopic.replace(/_/g, ' ')
  const gradeLevel = grade.replace('_', ' ')
  
  if (subject === 'math') {
    return `# Welcome to ${subtopicName}!

This is a comprehensive math lesson about **${subtopicName}** for ${gradeLevel} level students.

Mathematics is all around us! Today we're going to explore ${subtopicName} and discover how it helps us solve problems and understand patterns in our world.

## What You'll Learn

In this lesson, we'll explore the fundamental concepts of ${subtopicName} and help you understand this important math topic step by step.

By the end of this lesson, you will be able to:
- Understand the basic principles of ${subtopicName}
- Recognize ${subtopicName} in everyday situations
- Apply what you've learned through practical examples
- Solve problems using ${subtopicName}
- Feel confident about moving to the next topic

## Let's Start with the Basics!

Mathematics is like building blocks - each concept builds on the previous one. ${subtopicName} is an important building block that will help you with more advanced math concepts later.

### What is ${subtopicName}?

${subtopicName} is a mathematical concept that helps us understand relationships between numbers and quantities. Let's think about it in simple terms:

- It's a way to work with numbers systematically
- It helps us solve problems step by step
- It appears in many real-life situations
- It's a foundation for more advanced math concepts

### Real-World Examples

Where do you see ${subtopicName} in everyday life?

**Example 1: At Home**
When you're helping in the kitchen, you might use ${subtopicName} to measure ingredients or divide snacks equally among friends.

**Example 2: At School**
In the classroom, ${subtopicName} helps you organize your work, count materials, or solve word problems.

**Example 3: Playing Games**
Many games use ${subtopicName} concepts - from keeping score to figuring out strategies.

## Working Through Problems

Let's practice with some step-by-step examples:

### Step 1: Understand the Problem
First, we need to read carefully and understand what we're being asked to find.

### Step 2: Identify What We Know
Next, we look for the information we already have - these are our "givens."

### Step 3: Choose Our Strategy
Then we decide which approach will work best to solve the problem.

### Step 4: Solve Carefully
We work through the problem step by step, showing all our work.

### Step 5: Check Our Answer
Finally, we check if our answer makes sense and is correct.

## Practice Makes Perfect

Remember, learning math is like learning to ride a bike - it takes practice! Don't worry if it seems challenging at first. Every mathematician started exactly where you are now.

### Tips for Success:
- Take your time and think through each step
- Ask questions when you're not sure
- Practice regularly, even just a few minutes each day
- Connect what you learn to things you already know
- Celebrate your progress, no matter how small

### What's Next?

After you master ${subtopicName}, you'll be ready to tackle more exciting math concepts. Each topic builds on what you've learned before, so you're building a strong foundation for future success.

Great job taking on this challenge! Remember, every expert was once a beginner. You've got this!`;
  } else if (subject === 'english') {
    return `# Welcome to ${subtopicName}!

This is a comprehensive English lesson about **${subtopicName}** for ${gradeLevel} level students.

Language is our superpower! Today we're going to explore ${subtopicName} and discover how it helps us communicate better and understand the world around us.

## What You'll Learn

In this lesson, we'll explore the fundamental concepts of ${subtopicName} and help you understand this important English topic step by step.

By the end of this lesson, you will be able to:
- Understand the basic principles of ${subtopicName}
- Recognize ${subtopicName} in books, stories, and conversations
- Apply what you've learned in your own reading and writing
- Use ${subtopicName} to communicate more effectively
- Feel confident about tackling more advanced topics

## Let's Start with the Basics!

English is like a toolbox - each skill gives us new tools to express ourselves and understand others. ${subtopicName} is an important tool that will help you become a better reader, writer, and communicator.

### What is ${subtopicName}?

${subtopicName} is a language concept that helps us understand how words, sentences, and ideas work together. Let's think about it in simple terms:

- It's a way to use language more effectively
- It helps us express our thoughts clearly
- It appears in everything we read and write
- It's a foundation for more advanced language skills

### Real-World Examples

Where do you see ${subtopicName} in everyday life?

**Example 1: Reading Stories**
When you read books or stories, ${subtopicName} helps you understand characters, plot, and meaning.

**Example 2: Writing and Speaking**
In your own writing and conversations, ${subtopicName} helps you express your ideas clearly and creatively.

**Example 3: Understanding Others**
When listening to others speak or reading their writing, ${subtopicName} helps you understand their message.

## Working Through Examples

Let's practice with some step-by-step examples:

### Step 1: Observe and Identify
First, we look at examples and identify how ${subtopicName} is being used.

### Step 2: Understand the Pattern
Next, we figure out the rules or patterns that make ${subtopicName} work.

### Step 3: Practice with Guidance
Then we try using ${subtopicName} ourselves with help and feedback.

### Step 4: Apply Independently
We practice using ${subtopicName} in our own reading and writing.

### Step 5: Reflect and Improve
Finally, we think about how we can use ${subtopicName} even better.

## Building Your Skills

Remember, learning English is like building a vocabulary of superpowers - each new skill makes you more powerful as a communicator!

### Tips for Success:
- Read regularly - books, stories, articles, anything you enjoy
- Write often - journals, stories, letters, or just for fun
- Listen carefully to how others use language
- Ask questions when you encounter new words or ideas
- Practice using new skills in your daily conversations

### What's Next?

After you master ${subtopicName}, you'll be ready to explore more exciting aspects of English. Each skill builds on what you've learned before, so you're developing strong communication abilities.

Great job taking on this language adventure! Remember, every great writer and speaker started exactly where you are now. You've got this!`;
  } else {
    return `# Welcome to ${subtopicName}!

This is a comprehensive lesson about **${subtopicName}** for ${gradeLevel} level students.

Learning is an adventure! Today we're going to explore ${subtopicName} and discover how it connects to the world around us.

## What You'll Learn

In this lesson, we'll explore the fundamental concepts of ${subtopicName} and help you understand this important topic step by step.

By the end of this lesson, you will be able to:
- Understand the basic principles of ${subtopicName}
- Apply what you've learned through practical examples
- Feel confident about the key concepts
- Be ready to take the quiz and demonstrate your knowledge

## Let's Get Started!

This is an interactive lesson that will guide you through the material at your own pace. We'll start with the basics and gradually build up your understanding.

### Why This Topic Matters

Understanding ${subtopicName} is important because it forms the foundation for more advanced concepts in your studies.

### How This Lesson Works

1. **Read carefully** - Take your time with each section
2. **Think about examples** - Try to relate concepts to real life
3. **Ask questions** - Use the AI tutor if you need help
4. **Take the quiz** - Test your understanding at the end

### Ready to Learn?

Great! Let's dive into the fascinating world of ${subtopicName}. Remember, learning is a journey, and every expert was once a beginner.

Take your time, read carefully, and don't hesitate to ask for help if you need it. You've got this!`;
  }
}

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
        lesson: generateSubjectSpecificContent(subject, grade, topic, subtopic),
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
            <p className="mt-4 text-muted-foreground"><T>Loading...</T></p>
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
              {currentStep === 'lesson' ? <T>Generating your lesson...</T> : <T>Creating your quiz...</T>}
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
              <CardTitle className="text-2xl"><T>Something went wrong</T></CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <div className="flex space-x-2 justify-center">
              {error.includes('Daily limit') && (
                <Button onClick={() => router.push('/subscription')}>
<T>Upgrade Now</T>
                </Button>
              )}
              <Button variant="outline" onClick={goToDashboard}>
<T>Back to Dashboard</T>
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
<T>← Back to Dashboard</T>
              </Button>
              <h1 className="text-2xl font-bold text-foreground">
                {subtopicInfo?.name || <T>Lesson</T>}
              </h1>
              <p className="text-muted-foreground">
                {subject === 'math' ? <T>Mathematics</T> : <T>English Language Arts</T>} • {grade.replace('_', ' ')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                <T>Step</T> {currentStep === 'lesson' ? '1' : currentStep === 'quiz' ? '2' : '3'} <T>of</T> 3
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
              <h2 className="text-3xl font-bold text-foreground"><T>Lesson Complete!</T></h2>
              <p className="text-muted-foreground">
                <T>Congratulations! You've successfully completed the lesson on</T> {subtopicInfo?.name}.
              </p>
              <Button onClick={goToDashboard} size="lg">
<T>Continue Learning</T>
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