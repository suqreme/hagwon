'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { enhancedVoiceService } from '@/services/enhancedVoiceService'
import { T } from '@/components/ui/auto-translate'
import AITutorModal from './AITutorModal'
import { Play, Pause, Volume2, VolumeX, MessageCircle, ChevronRight, ChevronLeft, Sparkles, ArrowLeft, RotateCcw, Settings, Crown, BookOpen, Headphones } from 'lucide-react'

interface LessonData {
  lesson: string
  metadata: {
    topic: string
    subtopic: string
    grade_level: string
    subject: string
  }
}

interface ModernLessonContentProps {
  lessonData: LessonData
  onComplete: () => void
  onBack?: () => void
}

export default function ModernLessonContent({ lessonData, onComplete, onBack }: ModernLessonContentProps) {
  const [currentSection, setCurrentSection] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTutorModal, setShowTutorModal] = useState(false)
  const [textAnimationComplete, setTextAnimationComplete] = useState(false)
  const [animatedText, setAnimatedText] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)
  const [voiceProvider, setVoiceProvider] = useState<'web' | 'elevenlabs'>('web')
  const [availableProviders, setAvailableProviders] = useState<any[]>([])
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [isElevenLabsAvailable, setIsElevenLabsAvailable] = useState(false)

  // Split lesson content into sections
  const sections = useMemo(() => {
    const headerSections = lessonData.lesson.split(/\n(?=## )/)
    if (headerSections.length === 1) {
      const paragraphs = lessonData.lesson.split('\n\n').filter(p => p.trim().length > 0)
      const groupedSections = []
      for (let i = 0; i < paragraphs.length; i += 3) {
        const section = paragraphs.slice(i, i + 3).join('\n\n')
        if (section.trim()) {
          groupedSections.push(section)
        }
      }
      return groupedSections.length > 0 ? groupedSections : [lessonData.lesson]
    }
    return headerSections.filter(section => section.trim().length > 0)
  }, [lessonData.lesson])

  const currentText = sections[currentSection] || ''
  const progress = ((currentSection + 1) / sections.length) * 100

  // Typewriter animation effect
  useEffect(() => {
    setTextAnimationComplete(false)
    setAnimatedText('')
    
    const text = currentText
    let index = 0
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setAnimatedText(text.substring(0, index + 1))
        index++
      } else {
        setTextAnimationComplete(true)
        clearInterval(timer)
      }
    }, 20)

    return () => clearInterval(timer)
  }, [currentText])

  // Skip typing animation on click
  const handleSkipTyping = () => {
    if (!textAnimationComplete) {
      setAnimatedText(currentText)
      setTextAnimationComplete(true)
    }
  }

  // Initialize voice service
  useEffect(() => {
    setIsVoiceSupported(enhancedVoiceService.isSupported())
    const providers = enhancedVoiceService.getAvailableProviders()
    setAvailableProviders(providers)
    const elevenLabsProvider = providers.find(p => p.name === 'elevenlabs')
    setIsElevenLabsAvailable(elevenLabsProvider?.isAvailable || false)
    
    const gradeLevel = lessonData.metadata.grade_level.toLowerCase()
    if (gradeLevel.includes('kindergarten') || gradeLevel.includes('grade_1') || gradeLevel.includes('grade_2')) {
      enhancedVoiceService.setAgeGroup('child')
    } else {
      enhancedVoiceService.setAgeGroup('adult')
    }
  }, [lessonData.metadata.grade_level])

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
      const textToRead = currentText
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
            onError: (error) => {
              console.error('Speech error:', error)
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

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      setIsComplete(true)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleComplete = () => {
    onComplete()
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full bg-card border-2 border-primary shadow-lg">
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              <T>Lesson Complete</T>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              <T>Excellent work! You've successfully completed this lesson. Ready to test your knowledge?</T>
            </p>
            <Button 
              onClick={handleComplete}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              <T>Continue to Quiz</T>
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Top Navigation */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <T>Dashboard</T>
                </Button>
              )}
              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    <T>{lessonData.metadata.subtopic.replace(/_/g, ' ')}</T>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {lessonData.metadata.subject === 'math' ? <T>Mathematics</T> : <T>English Language Arts</T>} • <T>{lessonData.metadata.grade_level.replace('_', ' ')}</T>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                <T>Section</T> {currentSection + 1} <T>of</T> {sections.length}
              </Badge>
              <div className="text-sm text-muted-foreground min-w-[80px] text-right">
                {Math.round(progress)}% <T>complete</T>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress 
            value={progress} 
            className="h-2 bg-muted"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Lesson Content */}
          <div className="lg:col-span-3">
            <Card className="bg-card border border-border shadow-sm">
              <div 
                className={`p-8 lg:p-12 ${!textAnimationComplete ? 'cursor-pointer' : ''}`}
                onClick={handleSkipTyping}
                title={!textAnimationComplete ? 'Click to skip typing animation' : ''}
              >
                <div className="prose prose-lg max-w-none text-foreground">
                  <div className="font-mono leading-relaxed text-lg">
                    <pre className="whitespace-pre-wrap font-mono">
                      {animatedText}
                      {!textAnimationComplete && (
                        <span className="animate-pulse text-primary ml-1">|</span>
                      )}
                    </pre>
                  </div>
                </div>
                {!textAnimationComplete && (
                  <div className="mt-4 text-sm text-muted-foreground italic">
                    💡 <T>Click anywhere to skip typing animation</T>
                  </div>
                )}
              </div>
            </Card>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between mt-8">
              <Button
                onClick={handlePrevious}
                disabled={currentSection === 0}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span><T>Previous</T></span>
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!textAnimationComplete}
                className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <span>
                  {currentSection === sections.length - 1 ? <T>Complete Lesson</T> : <T>Next</T>}
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Audio Controls */}
            <Card className="bg-card border border-border shadow-sm">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Headphones className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground"><T>Audio Assistant</T></h3>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={handlePlayPause}
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4" />
                        <span><T>Pause</T></span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span><T>Listen</T></span>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                    variant="ghost"
                    size="sm"
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span><T>Voice Settings</T></span>
                  </Button>
                </div>

                {/* Voice Settings Panel */}
                {showVoiceSettings && isVoiceSupported && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        <T>Voice Provider</T>
                      </label>
                      <Select value={voiceProvider} onValueChange={(value: 'web' | 'elevenlabs') => setVoiceProvider(value)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web">
                            <div className="flex items-center space-x-2">
                              <Volume2 className="w-4 h-4" />
                              <span><T>Browser Voice</T></span>
                            </div>
                          </SelectItem>
                          {isElevenLabsAvailable && (
                            <SelectItem value="elevenlabs">
                              <div className="flex items-center space-x-2">
                                <Crown className="w-4 h-4 text-primary" />
                                <span><T>ElevenLabs Premium</T></span>
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {voiceProvider === 'elevenlabs' ? (
                        <T>High-quality AI voice synthesis</T>
                      ) : (
                        <T>Standard browser text-to-speech</T>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Help & Support */}
            <Card className="bg-card border border-border shadow-sm">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground"><T>Need Help?</T></h3>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  <T>Get personalized explanations and answers to your questions.</T>
                </p>
                
                <Button
                  onClick={() => setShowTutorModal(true)}
                  variant="outline"
                  className="w-full"
                >
                  <T>Ask AI Tutor</T>
                </Button>
              </div>
            </Card>

            {/* Lesson Info */}
            <Card className="bg-muted/50 border border-border shadow-sm">
              <div className="p-6">
                <h3 className="font-semibold text-foreground mb-3"><T>Lesson Info</T></h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground"><T>Subject</T>:</span>
                    <span className="text-foreground font-medium">
                      {lessonData.metadata.subject === 'math' ? <T>Mathematics</T> : <T>English</T>}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground"><T>Level</T>:</span>
                    <span className="text-foreground font-medium">
                      <T>{lessonData.metadata.grade_level.replace('_', ' ')}</T>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground"><T>Progress</T>:</span>
                    <span className="text-foreground font-medium">{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Tutor Modal */}
      <AITutorModal
        isOpen={showTutorModal}
        onClose={() => setShowTutorModal(false)}
        lessonTopic={lessonData.metadata.subtopic}
        gradeLevel={lessonData.metadata.grade_level}
        lessonContent={lessonData.lesson}
      />
    </div>
  )
}