'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { aiTutorService } from '@/services/aiTutorService'
import { enhancedVoiceService } from '@/services/enhancedVoiceService'
import { T } from '@/components/ui/auto-translate'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  X, 
  Send,
  Brain,
  Sparkles,
  Zap
} from 'lucide-react'

interface AITutorModalProps {
  isOpen: boolean
  onClose: () => void
  lessonTopic: string
  gradeLevel: string
  lessonContent: string
}

interface Message {
  role: 'student' | 'tutor'
  message: string
  timestamp: string
  isPlaying?: boolean
}

export default function AITutorModal({ 
  isOpen, 
  onClose, 
  lessonTopic, 
  gradeLevel, 
  lessonContent 
}: AITutorModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [recognition, setRecognition] = useState<any>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && !hasStarted) {
      initializeTutor()
      setHasStarted(true)
    }

    // Initialize speech recognition with live transcription
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'
      
      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        setInterimTranscript(interimTranscript)
        if (finalTranscript) {
          setFinalTranscript(prev => prev + finalTranscript)
          setInputText(prev => prev + finalTranscript)
        }
      }
      
      recognitionInstance.onstart = () => {
        setIsTranscribing(true)
        setInterimTranscript('')
        setFinalTranscript('')
      }
      
      recognitionInstance.onerror = () => {
        setIsListening(false)
        setIsTranscribing(false)
      }
      
      recognitionInstance.onend = () => {
        setIsListening(false)
        setIsTranscribing(false)
        setInterimTranscript('')
      }
      
      setRecognition(recognitionInstance)
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeTutor = () => {
    const session = aiTutorService.startTutorSession(lessonTopic, gradeLevel, lessonContent)
    setMessages(session.conversation.map(msg => ({ ...msg, isPlaying: false })))
    
    // Speak the initial greeting
    if (isVoiceEnabled && session.conversation.length > 0) {
      speakMessage(session.conversation[0].message)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const speakMessage = async (message: string) => {
    if (!isVoiceEnabled) return
    
    try {
      setIsSpeaking(true)
      await enhancedVoiceService.speak({
        text: message,
        provider: 'elevenlabs',
        voice: gradeLevel.includes('kindergarten') || gradeLevel.includes('grade_1') ? 'child' : 'adult'
      })
    } catch (error) {
      console.log('Voice failed, trying web speech:', error)
      try {
        await enhancedVoiceService.speak({
          text: message,
          provider: 'web'
        })
      } catch (webError) {
        console.log('Web speech also failed:', webError)
      }
    } finally {
      setIsSpeaking(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    setIsLoading(true)
    const studentMessage = inputText.trim()
    setInputText('')

    try {
      const tutorResponse = await aiTutorService.askTutor(studentMessage)
      
      // Update messages from the current session
      const session = aiTutorService.getCurrentSession()
      if (session) {
        setMessages(session.conversation.map(msg => ({ ...msg, isPlaying: false })))
        
        // Speak the tutor's response
        if (isVoiceEnabled) {
          setTimeout(() => speakMessage(tutorResponse), 500)
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true)
      setIsTranscribing(true)
      setInterimTranscript('')
      setFinalTranscript('')
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
      setIsTranscribing(false)
      setInterimTranscript('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const playMessage = (messageIndex: number) => {
    const message = messages[messageIndex]
    if (message && message.role === 'tutor') {
      speakMessage(message.message)
    }
  }

  const handleClose = () => {
    enhancedVoiceService.stop()
    aiTutorService.endTutorSession()
    setMessages([])
    setHasStarted(false)
    setInterimTranscript('')
    setFinalTranscript('')
    setIsTranscribing(false)
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col bg-card border border-primary shadow-[8px_8px_0px_0px] shadow-primary/40">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent border border-primary shadow-[2px_2px_0px_0px] shadow-primary/30 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span><T>AI Tutor</T></span>
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  <T>Learning about</T> {lessonTopic} • {gradeLevel}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className="bg-secondary border border-primary text-foreground hover:bg-primary hover:text-primary-foreground shadow-[2px_2px_0px_0px] shadow-primary/30 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px] transition-all duration-200"
              >
                {isVoiceEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClose}
                className="bg-secondary border border-primary text-foreground hover:bg-primary hover:text-primary-foreground shadow-[2px_2px_0px_0px] shadow-primary/30 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px] transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 border border-primary shadow-[2px_2px_0px_0px] shadow-primary/20 ${
                    message.role === 'student'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm">{message.message}</p>
                    {message.role === 'tutor' && isVoiceEnabled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 p-1 h-6 w-6 hover:bg-primary hover:text-primary-foreground"
                        onClick={() => playMessage(index)}
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 border border-primary shadow-[2px_2px_0px_0px] shadow-primary/20">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground"><T>Tutor is thinking...</T></span>
                  </div>
                </div>
              </div>
            )}
            
            {isSpeaking && (
              <div className="flex justify-center">
                <Badge variant="secondary" className="animate-pulse border border-primary shadow-[2px_2px_0px_0px] shadow-primary/20">
                  🔊 <T>Tutor is speaking...</T>
                </Badge>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Live Transcription Box */}
          {(isTranscribing || interimTranscript || finalTranscript) && (
            <div className="border-t border-primary p-4 bg-accent/10">
              <div className="mb-2 flex items-center space-x-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary"><T>Live Transcription</T></span>
                {isTranscribing && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="bg-background border border-primary p-3 shadow-[2px_2px_0px_0px] shadow-primary/20 min-h-[50px] font-mono text-sm">
                <span className="text-foreground">{finalTranscript}</span>
                <span className="text-muted-foreground italic">{interimTranscript}</span>
                {isTranscribing && !interimTranscript && (
                  <span className="text-muted-foreground italic"><T>Listening... speak your question</T></span>
                )}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-primary p-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask your tutor anything about this lesson...`}
                  className="w-full px-3 py-2 border border-primary bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary shadow-[2px_2px_0px_0px] shadow-primary/20"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              
              <div className="flex flex-col space-y-1">
                {recognition && (
                  <Button
                    variant={isListening ? "destructive" : "outline"}
                    size="sm"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isLoading}
                    className={`border border-primary shadow-[2px_2px_0px_0px] shadow-primary/30 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px] transition-all duration-200 ${
                      isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-secondary hover:bg-primary hover:text-primary-foreground'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-[2px_2px_0px_0px] shadow-primary/30 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px] transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {isListening && !isTranscribing && (
              <div className="mt-2 flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></div>
                <span><T>Listening... speak your question</T></span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}