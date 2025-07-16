'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { curriculumService } from '@/services/curriculumService'
import { progressService } from '@/services/progressService'
import { subscriptionService } from '@/services/subscriptionService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UserMenu } from '@/components/ui/user-menu'
import { T } from '@/components/ui/auto-translate'

interface CurriculumTopic {
  id: string
  name: string
  subtopics: Array<{
    id: string
    name: string
    unlocked: boolean
    completed: boolean
  }>
}

interface UserStats {
  lessonsCompleted: number
  quizzesPassed: number
  totalXP: number
  currentStreak: number
  lastLessonDate: string
}

export default function Dashboard() {
  const { user, loading, signOut, isAdmin } = useAuth()
  const router = useRouter()
  const [subjects, setSubjects] = useState<string[]>([])
  const [selectedSubject, setSelectedSubject] = useState('math')
  const [topics, setTopics] = useState<CurriculumTopic[]>([])
  const [currentGrade, setCurrentGrade] = useState('grade_1')
  const [userPlacement, setUserPlacement] = useState('')
  const [userStats, setUserStats] = useState<UserStats>({
    lessonsCompleted: 0,
    quizzesPassed: 0,
    totalXP: 0,
    currentStreak: 0,
    lastLessonDate: ''
  })
  const [lastLesson, setLastLesson] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
    
    // Check if admin wants to view student dashboard
    const urlParams = new URLSearchParams(window.location.search)
    const viewAsStudent = urlParams.get('view') === 'student'
    
    // Redirect admins to admin dashboard (unless they specifically want student view)
    if (!loading && user && isAdmin() && !viewAsStudent) {
      router.push('/admin')
    }
  }, [user, loading, router, isAdmin])

  useEffect(() => {
    loadSubjects()
    
    // Load user's placement level and progress
    if (user) {
      const placement = localStorage.getItem(`placement_${user.id}`)
      if (placement) {
        setUserPlacement(placement)
        // Convert placement to grade format
        const gradeMap: Record<string, string> = {
          'Kindergarten': 'kindergarten',
          '1st Grade': 'grade_1',
          '2nd Grade': 'grade_2',
          '3rd Grade': 'grade_3'
        }
        const mappedGrade = gradeMap[placement]
        if (mappedGrade) {
          setCurrentGrade(mappedGrade)
        }
      }
      
      // Load user stats, last lesson, and subscription
      loadUserProgress()
      loadSubscriptionInfo()
    }
  }, [user])

  useEffect(() => {
    if (selectedSubject) {
      loadCurriculum()
    }
  }, [selectedSubject, currentGrade])

  const loadSubjects = async () => {
    try {
      const subjectList = await curriculumService.getAllSubjects()
      setSubjects(subjectList)
    } catch (error) {
      console.error('Failed to load subjects:', error)
    }
  }

  const loadUserProgress = async () => {
    if (!user) return
    
    try {
      // For now, use default profile (user.id) until multi-student is fully integrated
      const stats = await progressService.getProgressStats(user.id)
      setUserStats({
        lessonsCompleted: stats.totalLessonsCompleted,
        quizzesPassed: stats.totalQuizzesPassed,
        totalXP: Math.floor(stats.averageScore * stats.totalQuizzesPassed),
        currentStreak: stats.currentStreak,
        lastLessonDate: stats.lastActivity
      })
      
      // Get in-progress lessons as fallback for last lesson
      const inProgressLessons = progressService.getInProgressLessons(user.id)
      if (inProgressLessons.length > 0) {
        const lastLesson = inProgressLessons[inProgressLessons.length - 1]
        setLastLesson({
          subject: lastLesson.subject,
          grade: lastLesson.grade,
          topic: lastLesson.topic,
          subtopic: lastLesson.subtopic,
          lastAccessed: lastLesson.lastAccessedAt
        })
      }
    } catch (error) {
      console.error('Error loading user progress:', error)
      // Set default values if there's an error
      setUserStats({
        lessonsCompleted: 0,
        quizzesPassed: 0,
        totalXP: 0,
        currentStreak: 0,
        lastLessonDate: ''
      })
    }
  }

  const loadSubscriptionInfo = () => {
    if (!user) return
    
    const subscriptionData = subscriptionService.getUserSubscription(user.id)
    setSubscription(subscriptionData)
  }

  const loadCurriculum = async () => {
    try {
      const availableTopics = await curriculumService.getAvailableTopics(selectedSubject, currentGrade)
      
      // Convert to the format expected by the dashboard
      const topicsArray = Object.entries(availableTopics)
        .sort(([,a], [,b]) => a.order - b.order)
        .map(([topicId, topicData]) => ({
          id: topicId,
          name: topicData.title,
          subtopics: Object.entries(topicData.subtopics)
            .sort(([,a], [,b]) => a.order - b.order)
            .map(([subtopicId, subtopicData]) => ({
              id: subtopicId,
              name: subtopicData.title,
              unlocked: true, // For now, unlock all - should check prerequisites
              completed: false // Should check progress
            }))
        }))
      
      setTopics(topicsArray)
    } catch (error) {
      console.error('Failed to load curriculum:', error)
    }
  }

  const startLesson = (topicId: string, subtopicId: string) => {
    console.log('Starting lesson with:', { selectedSubject, currentGrade, topicId, subtopicId })
    router.push(`/lesson?subject=${selectedSubject}&grade=${currentGrade}&topic=${topicId}&subtopic=${subtopicId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600"><T>Loading your learning dashboard...</T></p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground"><T>Hagwon Dashboard</T></h1>
              <p className="text-muted-foreground">
                <T>Welcome back</T>, {user.email}! 
                {userPlacement && <span className="ml-2 text-primary">• <T>Placed at</T> {userPlacement}</span>}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                <T>Level</T>: {currentGrade.replace('_', ' ')}
              </Badge>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => router.push('/subscription')}
              >
                <T>Upgrade</T>
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => router.push('/impact')}
              >
                🗺️ <T>Impact Map</T>
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => router.push('/our-goals')}
              >
                🎯 <T>Our Goals</T>
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => router.push('/games')}
              >
                <T>Games</T>
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => router.push('/achievements')}
              >
                <T>Achievements</T>
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => router.push('/offline')}
              >
                <T>Offline Learning</T>
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => router.push('/help')}
              >
                💝 <T>Community Help</T>
              </Button>
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subject Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4"><T>Choose Your Subject</T></h2>
          <div className="flex space-x-4">
            {subjects.map((subject) => (
              <Button
                key={subject}
                variant={selectedSubject === subject ? 'default' : 'outline'}
                onClick={() => setSelectedSubject(subject)}
                className="px-6 py-3"
              >
                <T>{subject === 'math' ? 'Mathematics' : 'English Language Arts'}</T>
              </Button>
            ))}
          </div>
        </div>

        {/* Grade Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4"><T>Current Grade Level</T></h2>
          <select
            value={currentGrade}
            onChange={(e) => setCurrentGrade(e.target.value)}
            className="px-4 py-2 border border-input bg-background text-foreground focus:ring-ring focus:border-ring"
          >
            <option value="kindergarten"><T>Kindergarten</T></option>
            <option value="grade_1"><T>1st Grade</T></option>
            <option value="grade_2"><T>2nd Grade</T></option>
            <option value="grade_3"><T>3rd Grade</T></option>
          </select>
        </div>

        {/* Continue Learning Section */}
        {lastLesson && (
          <Card className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-2"><T>Continue Learning</T></h2>
              <p className="mb-4">
                <T>Resume your lesson</T>: <span className="font-semibold">{lastLesson.subtopic.replace(/_/g, ' ')}</span>
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => startLesson(lastLesson.topic, lastLesson.subtopic)}
                >
                  <T>{lastLesson.completed ? 'Review Lesson' : 'Continue Lesson'}</T>
                </Button>
                {lastLesson.completed && (
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    ✅ <T>Completed</T>
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Path */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground"><T>Your Learning Path</T></h2>
          
          {topics.map((topic) => (
            <Card key={topic.id}>
              <CardHeader>
                <CardTitle>{topic.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topic.subtopics.map((subtopic) => (
                    <Card
                      key={subtopic.id}
                      className={`transition-colors ${
                        subtopic.completed
                          ? 'border-green-500/50 bg-green-50/50'
                          : subtopic.unlocked
                          ? 'border-primary/50 bg-primary/5 hover:bg-primary/10'
                          : 'border-muted bg-muted/30'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-foreground">{subtopic.name}</h4>
                          {subtopic.completed && (
                            <Badge variant="secondary" className="bg-green-500 text-white">
                              ✅ <T>Complete</T>
                            </Badge>
                          )}
                        </div>
                        
                        {subtopic.unlocked ? (
                          <Button
                            onClick={() => startLesson(topic.id, subtopic.id)}
                            className="w-full"
                            variant={subtopic.completed ? "secondary" : "default"}
                          >
                            <T>{subtopic.completed ? 'Review Lesson' : 'Start Lesson'}</T>
                          </Button>
                        ) : (
                          <div className="text-muted-foreground text-sm">
                            🔒 <T>Complete previous lessons to unlock</T>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Subscription Status */}
        {subscription && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span><T>Your Plan</T></span>
                <Badge variant={subscription.plan === 'free' ? 'secondary' : 'default'}>
                  {subscription.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'Free'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {subscription.features?.dailyLessonLimit || '∞'}
                  </div>
                  <div className="text-sm text-muted-foreground"><T>Daily Lessons</T></div>
                  {subscription.features?.dailyLessonLimit && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {subscriptionService.getRemainingLessons(user?.id || '')} <T>remaining today</T>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {subscription.features?.analyticsAccess ? '✓' : '✗'}
                  </div>
                  <div className="text-sm text-muted-foreground"><T>Advanced Analytics</T></div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {subscription.features?.certificateGeneration ? '✓' : '✗'}
                  </div>
                  <div className="text-sm text-muted-foreground"><T>Certificates</T></div>
                </div>
              </div>
              
              {subscription.plan === 'free' && (
                <div className="mt-4 text-center">
                  <Button onClick={() => router.push('/subscription')} size="sm">
<T>Upgrade for Unlimited Access</T>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Progress Overview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle><T>Your Progress</T></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{userStats.lessonsCompleted}</div>
                <div className="text-muted-foreground"><T>Lessons Completed</T></div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{userStats.quizzesPassed}</div>
                <div className="text-muted-foreground"><T>Quizzes Passed</T></div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{userStats.totalXP}</div>
                <div className="text-muted-foreground"><T>XP Earned</T></div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{userStats.currentStreak}</div>
                <div className="text-muted-foreground"><T>Day Streak</T></div>
              </div>
            </div>
            
            {userStats.lastLessonDate && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                <T>Last activity</T>: {new Date(userStats.lastLessonDate).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}