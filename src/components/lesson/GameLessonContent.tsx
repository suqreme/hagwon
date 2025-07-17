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
import { Play, Pause, Volume2, VolumeX, MessageCircle, ChevronRight, ChevronLeft, Sparkles, ArrowLeft, RotateCcw, Settings, Crown } from 'lucide-react'

interface LessonData {
  lesson: string
  metadata: {
    topic: string
    subtopic: string
    grade_level: string
    subject: string
  }
}

interface GameLessonContentProps {
  lessonData: LessonData
  onComplete: () => void
  onBack?: () => void
}

export default function GameLessonContent({ lessonData, onComplete, onBack }: GameLessonContentProps) {
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
    const headerSections = lessonData.lesson.split(/\n(?=## )/);
    if (headerSections.length === 1) {
      const paragraphs = lessonData.lesson.split('\n\n').filter(p => p.trim().length > 0);
      const groupedSections = [];
      for (let i = 0; i < paragraphs.length; i += 3) {
        const section = paragraphs.slice(i, i + 3).join('\n\n');
        if (section.trim()) {
          groupedSections.push(section);
        }
      }
      return groupedSections.length > 0 ? groupedSections : [lessonData.lesson];
    }
    return headerSections.filter(section => section.trim().length > 0);
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
    }, 20) // Adjust speed here (lower = faster)

    return () => clearInterval(timer)
  }, [currentText])

  // Initialize voice service
  useEffect(() => {
    // Check if voice is supported
    setIsVoiceSupported(enhancedVoiceService.isSupported())
    
    // Get available voice providers
    const providers = enhancedVoiceService.getAvailableProviders()
    setAvailableProviders(providers)
    
    // Check if ElevenLabs is available
    const elevenLabsProvider = providers.find(p => p.name === 'elevenlabs')
    setIsElevenLabsAvailable(elevenLabsProvider?.isAvailable || false)
    
    // Set age-appropriate voice based on grade level
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
      // Start reading current section
      const textToRead = currentText
      if (textToRead.trim()) {
        setIsPlaying(true)
        setIsPaused(false)
        
        try {
          await enhancedVoiceService.speak({
            text: textToRead,
            provider: voiceProvider,
            rate: 0.9, // Slightly slower for learning
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
      <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-background border-4 border-primary shadow-[8px_8px_0px_0px] shadow-primary/60">
          <div className="p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <T>Lesson Complete!</T>
            </h2>
            <p className="text-muted-foreground mb-6">
              🎉 <T>Excellent work! You have successfully completed the lesson.</T> 🌟
            </p>
            <Button 
              onClick={handleComplete}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 border-2 border-primary shadow-[4px_4px_0px_0px] shadow-primary/60 transform hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px] transition-all duration-200 font-mono"
            >
              🚀 <T>Continue to Quiz</T> <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Top Navigation Menu */}
      <div className="bg-card border-b border-primary shadow-[2px_2px_0px_0px] shadow-primary/20 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="outline"
                  size="sm"
                  className="bg-secondary border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground shadow-[4px_4px_0px_0px] shadow-primary/60 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px] transition-all duration-200 font-mono font-bold"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <T>Dashboard</T>
                </Button>
              )}
              <div className="text-sm text-muted-foreground">
                📖 <T>Lesson</T>: {lessonData.metadata.subtopic.replace(/_/g, ' ')}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              🌟 <T>Progress</T>: {Math.round(progress)}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
      {/* Header with progress */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                className="bg-secondary border border-primary text-foreground hover:bg-primary hover:text-primary-foreground shadow-[2px_2px_0px_0px] shadow-primary/30 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px] transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <T>Back</T>
              </Button>
            )}
            <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm font-bold border-2 border-primary shadow-[4px_4px_0px_0px] shadow-primary/60 font-mono">
              📚 <T>Section</T> {currentSection + 1} <T>of</T> {sections.length}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-foreground text-sm font-medium">
              🎯 <T>Progress</T>: {Math.round(progress)}%
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-4 bg-secondary border-2 border-primary shadow-[4px_4px_0px_0px] shadow-primary/60" />
      </div>

      {/* Main blackboard */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-card border-4 border-primary shadow-[8px_8px_0px_0px] shadow-primary/60 min-h-[500px]">
          <div className="relative p-8">
            {/* Neo-brutalist content frame */}
            <div className="absolute inset-4 bg-background border-2 border-primary shadow-[4px_4px_0px_0px] shadow-primary/60"></div>
            
            {/* Gaming-inspired text content */}
            <div className="relative z-10">
              <div className="min-h-[400px] text-foreground font-mono text-lg leading-relaxed p-4">
                <div 
                  className="prose prose-none max-w-none"
                  style={{ 
                    textShadow: '2px 2px 0px rgba(0, 0, 0, 0.1)',
                    filter: 'drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.1))'
                  }}
                >
                  <pre className="whitespace-pre-wrap font-mono text-foreground">
                    {animatedText}
                    {!textAnimationComplete && (
                      <span className="animate-pulse text-primary font-bold">✍️</span>
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Control Panel */}
        <div className="mt-6 flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={handlePrevious}
              disabled={currentSection === 0}
              variant="outline"
              className="bg-secondary border border-primary text-foreground hover:bg-primary hover:text-primary-foreground disabled:opacity-50 shadow-[2px_2px_0px_0px] shadow-primary/30 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px] transition-all duration-200 disabled:transform-none disabled:shadow-[3px_3px_0px_0px]"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              ⬅️ <T>Previous</T>
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!textAnimationComplete}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 shadow-[3px_3px_0px_0px] shadow-primary/30 transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px] transition-all duration-200 disabled:transform-none disabled:shadow-[4px_4px_0px_0px]"
            >
              {currentSection === sections.length - 1 ? '✅ ' : '➡️ '}{currentSection === sections.length - 1 ? <T>Complete</T> : <T>Next</T>}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Audio & Help Controls */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={handlePlayPause}
              variant="outline"
              className="bg-accent border border-primary text-foreground hover:bg-primary hover:text-primary-foreground shadow-[2px_2px_0px_0px] shadow-primary/30 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px] transition-all duration-200"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  ⏸️ <T>Pause</T>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  🔊 <T>Listen</T>
                </>
              )}
            </Button>
            
            <Button
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="bg-secondary border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground shadow-[4px_4px_0px_0px] shadow-primary/60 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px] transition-all duration-200 font-mono font-bold"
            >
              <Settings className="h-4 w-4 mr-2" />
              ⚙️ <T>Voice</T>
            </Button>
            
            <Button
              onClick={() => setShowTutorModal(true)}
              className="bg-secondary border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground shadow-[4px_4px_0px_0px] shadow-primary/60 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px] transition-all duration-200 font-mono font-bold"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              🤖 <T>AI Tutor</T>
            </Button>
          </div>
        </div>

        {/* Voice Settings Panel */}
        {showVoiceSettings && isVoiceSupported && (
          <div className="max-w-4xl mx-auto mt-6">
            <Card className="bg-card border-4 border-primary shadow-[8px_8px_0px_0px] shadow-primary/60">
              <div className="p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-6 h-6 text-primary" />
                  <span className="text-lg font-bold font-mono">🎧 <T>Audio Assistant</T></span>
                  <Badge variant="secondary" className="text-xs border-2 border-primary font-mono font-bold">
                    👶 <T>For Non-Readers</T>
                  </Badge>
                  {voiceProvider === 'elevenlabs' && (
                    <Badge variant="default" className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500 border-2 border-primary font-mono font-bold">
                      <Crown className="w-3 h-3 mr-1" />
                      👑 <T>Premium</T>
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold mb-3 block font-mono">⚙️ <T>Voice Provider</T></label>
                    <Select value={voiceProvider} onValueChange={(value: 'web' | 'elevenlabs') => setVoiceProvider(value)}>
                      <SelectTrigger className="w-full border-2 border-primary shadow-[4px_4px_0px_0px] shadow-primary/60 font-mono font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-primary shadow-[4px_4px_0px_0px] shadow-primary/60">
                        <SelectItem value="web">
                          <div className="flex items-center space-x-2 font-mono font-bold">
                            <Volume2 className="w-4 h-4" />
                            <span>🌐 <T>Browser Voice (Free)</T></span>
                          </div>
                        </SelectItem>
                        {isElevenLabsAvailable && (
                          <SelectItem value="elevenlabs">
                            <div className="flex items-center space-x-2 font-mono font-bold">
                              <Crown className="w-4 h-4 text-yellow-500" />
                              <span>⭐ <T>ElevenLabs (Premium)</T></span>
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {!isElevenLabsAvailable && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        ⚠️ <T>Premium voices require ElevenLabs API key</T>
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/20 p-4 border-2 border-primary shadow-[2px_2px_0px_0px] shadow-primary/40">
                      <label className="text-sm font-bold font-mono block mb-2">🎵 <T>Quality</T></label>
                      <p className="text-xs text-muted-foreground font-mono">
                        {voiceProvider === 'elevenlabs' ? '🚀 ' : '🔊 '}{voiceProvider === 'elevenlabs' ? <T>High-quality AI voices</T> : <T>Standard browser voices</T>}
                      </p>
                    </div>
                    <div className="bg-secondary/20 p-4 border-2 border-primary shadow-[2px_2px_0px_0px] shadow-primary/40">
                      <label className="text-sm font-bold font-mono block mb-2">🎭 <T>Age-Appropriate</T></label>
                      <p className="text-xs text-muted-foreground font-mono">
                        {lessonData.metadata.grade_level.includes('kindergarten') || lessonData.metadata.grade_level.includes('grade_1') ? '👶 ' : '👩‍🎓 '}{lessonData.metadata.grade_level.includes('kindergarten') || lessonData.metadata.grade_level.includes('grade_1') ? <T>Child-friendly voice</T> : <T>Adult voice</T>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {!isVoiceSupported && (
          <div className="max-w-4xl mx-auto mt-6">
            <Card className="bg-destructive/10 border-4 border-destructive shadow-[8px_8px_0px_0px] shadow-destructive/60">
              <div className="p-4 flex items-center space-x-3">
                <VolumeX className="w-5 h-5 text-destructive" />
                <span className="text-sm font-bold font-mono">❌ <T>Voice not supported in this browser</T></span>
              </div>
            </Card>
          </div>
        )}
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