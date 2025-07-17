'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { enhancedVoiceService } from '@/services/enhancedVoiceService'
import { T } from '@/components/ui/auto-translate'
import { Play, Pause, Volume2, VolumeX, MessageCircle, ChevronRight, ChevronLeft, Sparkles, ArrowLeft } from 'lucide-react'

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
    } else {
      try {
        setIsPlaying(true)
        await enhancedVoiceService.speak(currentText)
        setIsPlaying(false)
      } catch (error) {
        console.error('Voice playback error:', error)
        setIsPlaying(false)
      }
    }
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
        <Card className="max-w-md w-full bg-background border-4 border-primary shadow-[8px_8px_0px_0px] shadow-primary/20">
          <div className="p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              <T>Lesson Complete!</T>
            </h2>
            <p className="text-muted-foreground mb-6">
              <T>Excellent work! You have successfully completed the lesson.</T>
            </p>
            <Button 
              onClick={handleComplete}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 shadow-[4px_4px_0px_0px] shadow-primary/30 transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px] transition-all duration-200"
            >
              <T>Continue to Quiz</T> <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      {/* Header with progress */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                className="bg-secondary border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground shadow-[3px_3px_0px_0px] shadow-primary/30 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px] transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <T>Back</T>
              </Button>
            )}
            <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-[2px_2px_0px_0px] shadow-primary/30">
              <T>Section</T> {currentSection + 1} <T>of</T> {sections.length}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-foreground text-sm font-medium">
              <T>Progress</T>: {Math.round(progress)}%
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-3 bg-secondary border-2 border-primary shadow-[2px_2px_0px_0px] shadow-primary/20" />
      </div>

      {/* Main blackboard */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-card to-card/80 border-4 border-primary shadow-[12px_12px_0px_0px] shadow-primary/30 min-h-[500px]">
          <div className="relative p-8">
            {/* Neo-brutalist content frame */}
            <div className="absolute inset-4 bg-background/90 border-2 border-primary shadow-[4px_4px_0px_0px] shadow-primary/20"></div>
            
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
                      <span className="animate-pulse text-primary font-bold">|</span>
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
              className="bg-secondary border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground disabled:opacity-50 shadow-[3px_3px_0px_0px] shadow-primary/30 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px] transition-all duration-200 disabled:transform-none disabled:shadow-[3px_3px_0px_0px]"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              <T>Previous</T>
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!textAnimationComplete}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 shadow-[4px_4px_0px_0px] shadow-primary/30 transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px] transition-all duration-200 disabled:transform-none disabled:shadow-[4px_4px_0px_0px]"
            >
              {currentSection === sections.length - 1 ? <T>Complete</T> : <T>Next</T>}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Audio & Help Controls */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={handlePlayPause}
              variant="outline"
              className="bg-accent border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground shadow-[3px_3px_0px_0px] shadow-primary/30 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px] transition-all duration-200"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  <T>Pause</T>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  <T>Listen</T>
                </>
              )}
            </Button>
            
            <Button
              onClick={() => setShowTutorModal(true)}
              className="bg-secondary border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground shadow-[3px_3px_0px_0px] shadow-primary/30 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px] transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              <T>AI Tutor</T>
            </Button>
          </div>
        </div>
      </div>

      {/* Tutor Modal */}
      {showTutorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background border-4 border-primary shadow-[8px_8px_0px_0px] shadow-primary/40 p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-foreground"><T>AI Tutor</T></h3>
            <p className="text-muted-foreground mb-4">
              <T>Need help with this lesson? Ask me anything!</T>
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setShowTutorModal(false)}
                variant="outline"
                className="bg-secondary border-2 border-primary text-foreground hover:bg-primary hover:text-primary-foreground shadow-[2px_2px_0px_0px] shadow-primary/30 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px] transition-all duration-200"
              >
                <T>Close</T>
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[2px_2px_0px_0px] shadow-primary/30 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px] transition-all duration-200">
                <T>Open Chat</T>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}