'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { enhancedVoiceService } from '@/services/enhancedVoiceService'
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
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gradient-to-br from-green-100 to-green-50 border-4 border-green-600 shadow-2xl">
          <div className="p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              ¡Lección Completada!
            </h2>
            <p className="text-green-700 mb-6">
              ¡Excelente trabajo! Has completado la lección con éxito.
            </p>
            <Button 
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Continuar al Quiz <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Header with progress */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            )}
            <Badge className="bg-blue-600 text-white px-4 py-2 text-sm font-medium">
              Sección {currentSection + 1} de {sections.length}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white text-sm">
              Progreso: {Math.round(progress)}%
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-slate-700" />
      </div>

      {/* Main blackboard */}
      <div className="max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-slate-600 shadow-2xl min-h-[500px]">
          <div className="relative p-8">
            {/* Blackboard texture overlay */}
            <div className="absolute inset-0 bg-slate-900 opacity-20 rounded-lg"></div>
            
            {/* Chalk-like text content */}
            <div className="relative z-10">
              <div className="min-h-[400px] text-white font-mono text-lg leading-relaxed">
                <div 
                  className="prose prose-invert max-w-none"
                  style={{ 
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                    filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.5))'
                  }}
                >
                  <pre className="whitespace-pre-wrap font-mono">
                    {animatedText}
                    {!textAnimationComplete && (
                      <span className="animate-pulse">|</span>
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
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={!textAnimationComplete}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {currentSection === sections.length - 1 ? 'Completar' : 'Siguiente'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Audio & Help Controls */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={handlePlayPause}
              variant="outline"
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Escuchar
                </>
              )}
            </Button>
            
            <Button
              onClick={() => setShowTutorModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Tutor IA
            </Button>
          </div>
        </div>
      </div>

      {/* Tutor Modal */}
      {showTutorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Tutor IA</h3>
            <p className="text-gray-600 mb-4">
              ¿Necesitas ayuda con esta lección? ¡Pregúntame cualquier cosa!
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setShowTutorModal(false)}
                variant="outline"
              >
                Cerrar
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Abrir Chat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}