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
import { Play, Pause, Volume2, VolumeX, MessageCircle, ChevronRight, ChevronLeft, Sparkles, ArrowLeft, RotateCcw, Settings, Crown, Zap, Star } from 'lucide-react'

interface LessonData {
  lesson: string
  metadata: {
    topic: string
    subtopic: string
    grade_level: string
    subject: string
  }
}

interface HybridLessonContentProps {
  lessonData: LessonData
  onComplete: () => void
  onBack?: () => void
}

export default function HybridLessonContent({ lessonData, onComplete, onBack }: HybridLessonContentProps) {
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
    }, 25) // Slightly slower for readability

    return () => clearInterval(timer)
  }, [currentText])

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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-purple-100 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Floating celebration elements */}
        <div className="absolute top-20 left-20 text-6xl animate-bounce">🎉</div>
        <div className="absolute top-32 right-32 text-5xl animate-pulse">✨</div>
        <div className="absolute bottom-20 left-1/4 text-4xl animate-spin">🌟</div>
        <div className="absolute bottom-32 right-20 text-3xl animate-bounce delay-500">🎊</div>
        
        {/* Glowing effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-pink-400/10 animate-pulse"></div>
        
        <Card className="max-w-md w-full bg-white/90 backdrop-blur-sm border-4 border-purple-400 shadow-[12px_12px_0px_rgba(168,85,247,0.4)] relative">
          {/* Comic-style explosion background */}
          <div className="absolute -top-8 -right-8 text-6xl animate-pulse">💥</div>
          <div className="absolute -bottom-4 -left-4 text-4xl animate-bounce">⚡</div>
          
          <div className="p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-3xl font-bold text-purple-700 mb-4 comic-font">
              <T>MISSION COMPLETE!</T>
            </h2>
            <p className="text-gray-600 mb-6 font-handwriting text-lg">
              🎉 <T>Awesome work, superstar! You've mastered this lesson like a true champion!</T> 🌟
            </p>
            <Button 
              onClick={handleComplete}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 border-4 border-purple-700 shadow-[8px_8px_0px_rgba(168,85,247,0.6)] transform hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[12px_12px_0px_rgba(168,85,247,0.6)] transition-all duration-200 comic-font text-lg"
            >
              🚀 <T>CONTINUE ADVENTURE</T> <Sparkles className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </Card>
        
        <style jsx>{`
          .comic-font {
            font-family: "Comic Sans MS", cursive, sans-serif;
          }
          .font-handwriting {
            font-family: "Kalam", "Comic Sans MS", cursive, sans-serif;
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-cyan-50 relative overflow-hidden">
      {/* Notebook texture background */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d97706' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40z'/%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      {/* Holographic grid overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='50' height='50' viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='50' height='50' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 50 0 L 0 0 0 50' fill='none' stroke='%2306b6d4' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
      }}></div>
      
      {/* Floating comic elements */}
      <div className="absolute top-16 right-16 text-3xl animate-pulse text-cyan-400">✨</div>
      <div className="absolute bottom-32 left-16 text-2xl animate-bounce text-purple-500">💫</div>
      <div className="absolute top-1/3 left-10 text-xl animate-pulse text-pink-400">⭐</div>

      {/* Top Navigation Menu - Notebook style with holo touches */}
      <div className="bg-white/80 backdrop-blur-sm border-b-4 border-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.3)] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="outline"
                  size="sm"
                  className="bg-amber-100 border-3 border-amber-400 text-amber-800 hover:bg-amber-200 hover:text-amber-900 shadow-[4px_4px_0px_rgba(245,158,11,0.4)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_rgba(245,158,11,0.4)] transition-all duration-200 font-handwriting font-bold"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <T>My Dashboard</T>
                </Button>
              )}
              <div className="text-sm text-amber-700 font-handwriting">
                📖 <T>Lesson</T>: <T>{lessonData.metadata.subtopic.replace(/_/g, ' ')}</T>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-cyan-400 to-purple-500 text-white px-4 py-2 text-sm font-bold border-2 border-purple-600 shadow-[4px_4px_0px_rgba(168,85,247,0.4)] comic-font">
              🌟 <T>Progress</T>: {Math.round(progress)}%
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Progress section - Hybrid style */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-white/90 border-3 border-purple-400 text-purple-700 px-6 py-3 text-lg font-bold shadow-[6px_6px_0px_rgba(168,85,247,0.3)] comic-font">
              📚 <T>Section</T> {currentSection + 1} <T>of</T> {sections.length}
            </Badge>
            <div className="text-amber-700 text-lg font-handwriting font-bold">
              🎯 <T>Adventure Progress</T>: {Math.round(progress)}%
            </div>
          </div>
          <Progress 
            value={progress} 
            className="h-6 bg-white/80 border-3 border-amber-400 shadow-[4px_4px_0px_rgba(245,158,11,0.3)] rounded-none" 
          />
        </div>

        {/* Main lesson area - Speech bubble + notebook hybrid */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Speech bubble design */}
            <Card className="bg-white/95 backdrop-blur-sm border-4 border-purple-500 shadow-[12px_12px_0px_rgba(168,85,247,0.4)] min-h-[500px] relative">
              {/* Comic book speech bubble tail */}
              <div className="absolute -bottom-8 left-20 w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-t-[24px] border-t-white/95"></div>
              <div className="absolute -bottom-12 left-[76px] w-0 h-0 border-l-[28px] border-l-transparent border-r-[28px] border-r-transparent border-t-[28px] border-t-purple-500"></div>
              
              {/* Notebook-style margin */}
              <div className="absolute left-16 top-0 bottom-0 w-1 bg-red-300 opacity-50"></div>
              
              {/* Holographic glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-pink-400/10 rounded-none animate-pulse"></div>
              
              <div className="relative p-8 pl-20">
                {/* Notebook holes */}
                <div className="absolute left-4 top-12 w-4 h-4 bg-gray-300 rounded-full border-2 border-gray-400 shadow-inner"></div>
                <div className="absolute left-4 top-32 w-4 h-4 bg-gray-300 rounded-full border-2 border-gray-400 shadow-inner"></div>
                <div className="absolute left-4 bottom-32 w-4 h-4 bg-gray-300 rounded-full border-2 border-gray-400 shadow-inner"></div>
                
                {/* Content area */}
                <div className="min-h-[400px] text-gray-800 leading-relaxed">
                  <div className="font-handwriting text-xl" style={{
                    textShadow: '1px 1px 0px rgba(168,85,247,0.2)',
                    filter: 'drop-shadow(0px 0px 1px rgba(6,182,212,0.3))'
                  }}>
                    <pre className="whitespace-pre-wrap">
                      {animatedText}
                      {!textAnimationComplete && (
                        <span className="animate-pulse text-purple-500 ml-2 text-2xl">✏️</span>
                      )}
                    </pre>
                  </div>
                </div>
                
                {/* Doodles and decorations */}
                <div className="absolute right-8 top-16 text-2xl animate-pulse text-cyan-400">⭐</div>
                <div className="absolute right-12 bottom-24 text-xl animate-bounce text-purple-500">😊</div>
              </div>
            </Card>
          </div>

          {/* Control Panel - Comic book action buttons with notebook warmth */}
          <div className="mt-12 flex items-center justify-between">
            {/* Navigation */}
            <div className="flex items-center space-x-6">
              <Button
                onClick={handlePrevious}
                disabled={currentSection === 0}
                className="bg-amber-200 border-4 border-amber-500 text-amber-800 hover:bg-amber-300 disabled:opacity-50 shadow-[6px_6px_0px_rgba(245,158,11,0.4)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_rgba(245,158,11,0.4)] transition-all duration-200 disabled:transform-none comic-font font-bold text-lg transform rotate-1"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                ⬅️ <T>BACK!</T>
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!textAnimationComplete}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-3 border-4 border-purple-700 shadow-[6px_6px_0px_rgba(168,85,247,0.6)] transform hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_rgba(168,85,247,0.6)] transition-all duration-200 disabled:transform-none disabled:shadow-[4px_4px_0px_rgba(168,85,247,0.4)] comic-font text-lg -rotate-1"
              >
                {currentSection === sections.length - 1 ? '🎉 ' : '➡️ '}{currentSection === sections.length - 1 ? <T>FINISH!</T> : <T>NEXT!</T>}
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            {/* Audio & Help Controls */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={handlePlayPause}
                className="bg-cyan-400 border-4 border-cyan-600 text-white hover:bg-cyan-500 shadow-[6px_6px_0px_rgba(6,182,212,0.4)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[8px_8px_0px_rgba(6,182,212,0.4)] transition-all duration-200 comic-font font-bold transform rotate-1"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    ⏸️ <T>PAUSE!</T>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    🔊 <T>PLAY!</T>
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                className="bg-green-400 border-4 border-green-600 text-white hover:bg-green-500 shadow-[6px_6px_0px_rgba(34,197,94,0.4)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[8px_8px_0px_rgba(34,197,94,0.4)] transition-all duration-200 comic-font font-bold transform -rotate-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                ⚙️ <T>VOICE!</T>
              </Button>
              
              <Button
                onClick={() => setShowTutorModal(true)}
                className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white border-4 border-red-600 shadow-[6px_6px_0px_rgba(220,38,38,0.4)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[8px_8px_0px_rgba(220,38,38,0.4)] transition-all duration-200 comic-font font-bold transform rotate-2"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                🤖 <T>HELP!</T>
              </Button>
            </div>
          </div>

          {/* Voice Settings Panel - Notebook style with holo effects */}
          {showVoiceSettings && isVoiceSupported && (
            <div className="max-w-4xl mx-auto mt-8">
              <Card className="bg-white/90 backdrop-blur-sm border-4 border-green-400 shadow-[8px_8px_0px_rgba(34,197,94,0.4)]">
                <div className="p-6 space-y-6">
                  <div className="flex items-center space-x-3">
                    <Volume2 className="w-6 h-6 text-green-600" />
                    <span className="text-xl font-bold comic-font text-green-700">🎧 <T>VOICE POWERS!</T></span>
                    <Badge variant="secondary" className="text-xs border-2 border-amber-400 bg-amber-100 text-amber-800 font-handwriting font-bold">
                      👶 <T>Kid-Friendly Magic</T>
                    </Badge>
                    {voiceProvider === 'elevenlabs' && (
                      <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 border-2 border-orange-600 text-white comic-font font-bold">
                        <Crown className="w-3 h-3 mr-1" />
                        👑 <T>PREMIUM!</T>
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold mb-3 block font-handwriting text-green-700">⚙️ <T>Choose Your Voice</T></label>
                      <Select value={voiceProvider} onValueChange={(value: 'web' | 'elevenlabs') => setVoiceProvider(value)}>
                        <SelectTrigger className="w-full border-3 border-green-400 shadow-[4px_4px_0px_rgba(34,197,94,0.3)] font-handwriting font-bold bg-white/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-3 border-green-400 shadow-[4px_4px_0px_rgba(34,197,94,0.3)]">
                          <SelectItem value="web">
                            <div className="flex items-center space-x-2 font-handwriting font-bold">
                              <Volume2 className="w-4 h-4" />
                              <span>🌐 <T>Browser Voice (Free)</T></span>
                            </div>
                          </SelectItem>
                          {isElevenLabsAvailable && (
                            <SelectItem value="elevenlabs">
                              <div className="flex items-center space-x-2 font-handwriting font-bold">
                                <Crown className="w-4 h-4 text-yellow-500" />
                                <span>⭐ <T>ElevenLabs (Premium)</T></span>
                              </div>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-amber-50 p-4 border-3 border-amber-300 shadow-[3px_3px_0px_rgba(245,158,11,0.3)]">
                        <label className="text-sm font-bold font-handwriting block mb-2 text-amber-700">🎵 <T>Sound Quality</T></label>
                        <p className="text-xs text-amber-600 font-handwriting">
                          {voiceProvider === 'elevenlabs' ? '🚀 ' : '🔊 '}{voiceProvider === 'elevenlabs' ? <T>Super AI voices</T> : <T>Standard voices</T>}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 border-3 border-purple-300 shadow-[3px_3px_0px_rgba(168,85,247,0.3)]">
                        <label className="text-sm font-bold font-handwriting block mb-2 text-purple-700">🎭 <T>Age Perfect</T></label>
                        <p className="text-xs text-purple-600 font-handwriting">
                          {lessonData.metadata.grade_level.includes('kindergarten') || lessonData.metadata.grade_level.includes('grade_1') ? '👶 ' : '👩‍🎓 '}{lessonData.metadata.grade_level.includes('kindergarten') || lessonData.metadata.grade_level.includes('grade_1') ? <T>Kid voice</T> : <T>Grown-up voice</T>}
                        </p>
                      </div>
                    </div>
                  </div>
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
      
      <style jsx>{`
        .comic-font {
          font-family: "Comic Sans MS", cursive, sans-serif;
        }
        .font-handwriting {
          font-family: "Kalam", "Comic Sans MS", cursive, sans-serif;
        }
      `}</style>
    </div>
  )
}