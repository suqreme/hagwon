'use client'

import { useProfile } from '@/contexts/ProfileContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Users, 
  LogOut, 
  Settings,
  Play,
  Star
} from 'lucide-react'

export default function StudentDashboard() {
  const { currentProfile, signOut, updateProgress } = useProfile()

  if (!currentProfile) return null

  const handleStartLesson = () => {
    // TODO: Navigate to lesson page
    console.log('Starting lesson for:', currentProfile.name)
  }

  const handleTakeQuiz = () => {
    // TODO: Navigate to quiz page
    console.log('Taking quiz for:', currentProfile.name)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{currentProfile.avatar}</div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Hi {currentProfile.name}!
                </h1>
                <p className="text-sm text-muted-foreground">
                  {currentProfile.grade} • {currentProfile.subject}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Show profile switcher
                  signOut()
                }}
              >
                <Users className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Switch Profile</span>
                <span className="sm:hidden">Switch</span>
              </Button>
              
              <ThemeToggle />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="px-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{currentProfile.progress.lessonsCompleted}</p>
                  <p className="text-sm text-muted-foreground">Lessons Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{currentProfile.progress.quizzesPassed}</p>
                  <p className="text-sm text-muted-foreground">Quizzes Passed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{currentProfile.progress.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Topic */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>Current Topic</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {currentProfile.progress.currentTopic.replace('_', ' ')}
                </h3>
                <p className="text-muted-foreground">
                  Continue your {currentProfile.subject} learning journey
                </p>
              </div>
              
              <div className="flex space-x-4">
                <Button onClick={handleStartLesson} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Continue Lesson
                </Button>
                <Button variant="outline" onClick={handleTakeQuiz} className="flex-1">
                  <Trophy className="w-4 h-4 mr-2" />
                  Take Quiz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Change Grade Level
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="w-4 h-4 mr-2" />
                Switch Subject
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="w-4 h-4 mr-2" />
                View Progress
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                  <p>Take breaks every 20-30 minutes</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                  <p>Practice a little bit every day</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-1.5"></div>
                  <p>Don't worry about mistakes - they help you learn!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}