'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { enhancedVoiceService } from '@/services/enhancedVoiceService'
import { useAuth } from '@/contexts/AuthContext'
import AITutorModal from './AITutorModal'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  MessageCircle, 
  Brain,
  ArrowLeft,
  ArrowRight,
  Menu,
  X
} from 'lucide-react'

interface MobileLessonViewerProps {
  lessonData: {
    lesson: string
    metadata: {
      topic: string
      subtopic: string
      grade_level: string
      subject: string
    }
  }
  onComplete: () => void
}

export default function MobileLessonViewer({ lessonData, onComplete }: MobileLessonViewerProps) {
  const { canAccessFeature } = useAuth()
  const [currentSection, setCurrentSection] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)
  const [showTutorModal, setShowTutorModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [fontSize, setFontSize] = useState('text-base')
  const [voiceProvider, setVoiceProvider] = useState<'web' | 'elevenlabs'>('web')

  // Split lesson content into mobile-friendly sections
  const sections = lessonData.lesson.split('\n\n').filter(section => section.trim().length > 0)

  // Initialize voice service
  useEffect(() => {
    setIsVoiceSupported(enhancedVoiceService.isSupported())
    
    // Set age-appropriate voice
    const gradeLevel = lessonData.metadata.grade_level.toLowerCase()
    if (gradeLevel.includes('kindergarten') || gradeLevel.includes('grade_1') || gradeLevel.includes('grade_2')) {
      enhancedVoiceService.setAgeGroup('child')
    } else {
      enhancedVoiceService.setAgeGroup('adult')
    }

    // Determine voice provider based on subscription
    if (canAccessFeature('premium_voices')) {
      setVoiceProvider('elevenlabs')
    } else {
      setVoiceProvider('web')
    }
  }, [lessonData.metadata.grade_level, canAccessFeature])

  const handlePlayPause = async () => {
    if (isPlaying) {
      enhancedVoiceService.pause()
      setIsPlaying(false)
      setIsPaused(true)
    } else if (isPaused) {
      enhancedVoiceService.resume()
      setIsPlaying(true)
      setIsPaused(false)
    } else {
      const textToRead = sections[currentSection] || ''
      if (textToRead.trim()) {
        setIsPlaying(true)
        setIsPaused(false)
        
        try {
          await enhancedVoiceService.speak({
            text: textToRead,
            provider: voiceProvider,
            rate: 0.9,
            onStart: () => setIsPlaying(true),
            onEnd: () => {
              setIsPlaying(false)
              setIsPaused(false)
            },
            onError: () => {
              setIsPlaying(false)
              setIsPaused(false)
            }
          })
        } catch (error) {
          console.error('Speech error:', error)
          setIsPlaying(false)
          setIsPaused(false)
        }
      }
    }
  }

  const handleStop = () => {
    enhancedVoiceService.stop()
    setIsPlaying(false)
    setIsPaused(false)
  }

  const goToNext = () => {
    handleStop()
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      setIsComplete(true)
    }
  }

  const goToPrevious = () => {
    handleStop()
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleComplete = () => {
    onComplete()
  }

  const adjustFontSize = (size: string) => {
    setFontSize(size)
    setShowMobileMenu(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">
              {lessonData.metadata.subtopic}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lessonData.metadata.subject} • {lessonData.metadata.grade_level.replace('_', ' ')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs text-muted-foreground">
              {isComplete ? 'Complete!' : `${currentSection + 1} of ${sections.length}`}
            </span>
          </div>
          <Progress 
            value={isComplete ? 100 : ((currentSection + 1) / sections.length) * 100}
            className="h-2"
          />
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-card border-b shadow-lg p-4 space-y-3">
            {/* Font Size Controls */}
            <div>
              <p className="text-sm font-medium mb-2">Text Size</p>
              <div className="flex space-x-2">
                <Button
                  variant={fontSize === 'text-sm' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => adjustFontSize('text-sm')}
                >
                  Small
                </Button>
                <Button
                  variant={fontSize === 'text-base' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => adjustFontSize('text-base')}
                >
                  Normal
                </Button>
                <Button
                  variant={fontSize === 'text-lg' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => adjustFontSize('text-lg')}
                >
                  Large
                </Button>
              </div>
            </div>

            {/* Voice Controls */}
            {isVoiceSupported && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Audio</p>
                  <Badge variant={voiceProvider === 'elevenlabs' ? 'default' : 'secondary'} className="text-xs">
                    {voiceProvider === 'elevenlabs' ? '✨ Premium Voice' : '🔊 Standard Voice'}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handlePlayPause}
                    disabled={!sections[currentSection]?.trim()}
                    variant={isPlaying ? "default" : "outline"}
                    size="sm"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {isPaused ? 'Resume' : 'Listen'}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleStop}
                    disabled={!isPlaying && !isPaused}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </div>
            )}

            {/* AI Tutor */}
            <div>
              <Button
                onClick={() => {
                  setShowTutorModal(true)
                  setShowMobileMenu(false)
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Brain className="w-4 h-4 mr-2" />
                Ask AI Tutor
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {!isComplete ? (
          <div className="space-y-6">
            {/* Lesson Content */}
            <Card>
              <CardContent className="p-6">
                <div className={`${fontSize} leading-relaxed whitespace-pre-line text-foreground`}>
                  {sections[currentSection]}
                </div>
              </CardContent>
            </Card>

            {/* Quick AI Tutor Access */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Need Help?</h4>
                    <p className="text-sm text-muted-foreground">Ask your AI tutor anything!</p>
                  </div>
                  <Button
                    onClick={() => setShowTutorModal(true)}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-green-500 text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Lesson Complete!</h3>
              <p className="text-muted-foreground mb-6">
                Great job! You've finished learning about {lessonData.metadata.subtopic}. 
                Now let's test your understanding with a quiz.
              </p>
              <Button
                onClick={handleComplete}
                size="lg"
                className="px-8 py-3 text-lg"
              >
                Take the Quiz
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile Navigation Footer */}
      {!isComplete && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4">
          <div className="flex justify-between items-center">
            <Button
              onClick={goToPrevious}
              disabled={currentSection === 0}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {currentSection + 1} of {sections.length}
            </div>

            <Button
              onClick={goToNext}
              size="sm"
            >
              {currentSection === sections.length - 1 ? 'Finish' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Voice Status Indicator */}
      {isVoiceSupported && (isPlaying || isPaused) && (
        <div className="fixed top-20 right-4 z-30">
          <Badge variant="secondary" className="animate-pulse">
            {isPlaying ? '🔊 Playing' : '⏸️ Paused'}
          </Badge>
        </div>
      )}

      {/* AI Tutor Modal */}
      <AITutorModal
        isOpen={showTutorModal}
        onClose={() => setShowTutorModal(false)}
        lessonTopic={lessonData.metadata.subtopic}
        gradeLevel={lessonData.metadata.grade_level}
        lessonContent={lessonData.lesson}
      />

      {/* Bottom Padding for Fixed Navigation */}
      <div className="h-20"></div>
    </div>
  )
}