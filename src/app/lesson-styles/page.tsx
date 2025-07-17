'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Play, ChevronRight, ChevronLeft, MessageCircle, Settings, Volume2 } from 'lucide-react'
import { T } from '@/components/ui/auto-translate'

const sampleLessonText = `# Welcome to Counting!

Hi there! Today we're going to learn how to count from 1 to 10. Counting is one of the most important math skills you'll ever learn!

## What is Counting?
Counting means saying numbers in order to find out how many things there are.

## Let's Learn the Numbers 1-10
**1 (One)** - Hold up 1 finger
**2 (Two)** - Hold up 2 fingers  
**3 (Three)** - Hold up 3 fingers`

const styles = [
  {
    id: 'holographic',
    name: 'Holographic Terminal',
    description: 'Cyberpunk/Futuristic with glowing neon effects'
  },
  {
    id: 'gaming',
    name: 'Retro Gaming Console',
    description: '8-bit style with pixelated elements'
  },
  {
    id: 'glass',
    name: 'Glass Morphism',
    description: 'Modern frosted glass with blur effects'
  },
  {
    id: 'comic',
    name: 'Comic Book Style',
    description: 'Fun speech bubbles and bold outlines'
  },
  {
    id: 'notebook',
    name: 'Notebook/Journal',
    description: 'Warm paper texture with handwritten feel'
  }
]

export default function LessonStylesPage() {
  const [currentStyle, setCurrentStyle] = useState('holographic')
  const [currentSection, setCurrentSection] = useState(0)
  const sections = sampleLessonText.split('##').filter(s => s.trim())
  const progress = ((currentSection + 1) / sections.length) * 100

  const renderHolographicStyle = () => (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-green-900/20"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjeWFuIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4zIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      
      {/* Scan lines */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-pulse"></div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-6 p-4 border border-cyan-400 bg-black/50 backdrop-blur-sm rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.3)]">
          <div className="flex items-center justify-between">
            <div className="text-cyan-400 font-mono">
              <span className="text-lg font-bold animate-pulse">📖 LESSON TERMINAL</span>
              <div className="text-sm mt-1 text-cyan-300">counting_to_10.exe</div>
            </div>
            <div className="text-cyan-400 font-mono text-sm">
              PROGRESS: {Math.round(progress)}%
            </div>
          </div>
        </div>

        {/* Main content */}
        <Card className="bg-black/70 border-2 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.4)] backdrop-blur-sm">
          <div className="p-8">
            <div className="min-h-[400px] text-cyan-100 font-mono leading-relaxed">
              <div className="border-l-4 border-cyan-400 pl-4">
                <pre className="whitespace-pre-wrap text-cyan-100 text-lg">
                  {sections[currentSection]}
                  <span className="animate-pulse text-cyan-400 ml-2">█</span>
                </pre>
              </div>
            </div>
          </div>
        </Card>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex space-x-4">
            <Button 
              variant="outline" 
              className="border-cyan-400 text-cyan-400 bg-black/50 hover:bg-cyan-400/20 font-mono shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            >
              ← PREV
            </Button>
            <Button 
              className="bg-cyan-500 text-black hover:bg-cyan-400 font-mono font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
            >
              NEXT →
            </Button>
          </div>
          <div className="flex space-x-4">
            <Button variant="outline" className="border-green-400 text-green-400 bg-black/50 hover:bg-green-400/20 font-mono">
              🔊 AUDIO
            </Button>
            <Button variant="outline" className="border-purple-400 text-purple-400 bg-black/50 hover:bg-purple-400/20 font-mono">
              🤖 AI_TUTOR
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderGamingStyle = () => (
    <div className="min-h-screen bg-gray-900 relative" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23333' fill-opacity='0.4'%3E%3Crect width='6' height='6'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }}>
      {/* Retro scan effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 via-transparent to-green-500/10 animate-pulse"></div>
      
      <div className="relative z-10 p-6">
        {/* 8-bit style header */}
        <div className="mb-6 p-4 bg-gray-800 border-4 border-green-400" style={{
          boxShadow: '8px 8px 0px rgba(34, 197, 94, 0.3)',
          imageRendering: 'pixelated'
        }}>
          <div className="flex items-center justify-between">
            <div className="text-green-400 font-mono text-xl font-bold pixelated">
              🎮 LEVEL 1: COUNTING
            </div>
            <div className="text-green-400 font-mono">
              XP: {Math.round(progress)}%
            </div>
          </div>
          <Progress value={progress} className="mt-2 h-6 bg-gray-700 border-2 border-green-400" />
        </div>

        {/* Game-style content box */}
        <Card className="bg-gray-800 border-4 border-yellow-400 shadow-[8px_8px_0px_rgba(234,179,8,0.5)]">
          <div className="p-8">
            <div className="min-h-[400px] text-yellow-100 font-mono text-lg leading-relaxed">
              <div className="bg-gray-900 p-6 border-2 border-yellow-400 rounded-none">
                <pre className="whitespace-pre-wrap">
                  {sections[currentSection]}
                  <span className="animate-bounce text-yellow-400 ml-2 text-2xl">▶</span>
                </pre>
              </div>
            </div>
          </div>
        </Card>

        {/* Game controls */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex space-x-4">
            <Button 
              className="bg-red-500 border-4 border-red-600 text-white font-mono font-bold shadow-[4px_4px_0px_rgba(220,38,38,0.7)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_rgba(220,38,38,0.7)]"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            >
              ◀ BACK
            </Button>
            <Button 
              className="bg-green-500 border-4 border-green-600 text-white font-mono font-bold shadow-[4px_4px_0px_rgba(34,197,94,0.7)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_rgba(34,197,94,0.7)]"
              onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
            >
              NEXT ▶
            </Button>
          </div>
          <div className="flex space-x-4">
            <Button className="bg-blue-500 border-4 border-blue-600 text-white font-mono font-bold shadow-[4px_4px_0px_rgba(37,99,235,0.7)]">
              🔊 SFX
            </Button>
            <Button className="bg-purple-500 border-4 border-purple-600 text-white font-mono font-bold shadow-[4px_4px_0px_rgba(147,51,234,0.7)]">
              🤖 HELP
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderGlassStyle = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 relative">
      {/* Floating shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-1/2 right-20 w-48 h-48 bg-blue-300/30 rounded-full blur-2xl animate-pulse delay-500"></div>
      <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-yellow-300/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 p-6">
        {/* Glass header */}
        <div className="mb-6 p-6 bg-white/20 backdrop-blur-lg rounded-3xl border border-white/30 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="text-white font-semibold text-xl">
              ✨ Beautiful Learning Experience
            </div>
            <div className="text-white/80 text-sm">
              Progress: {Math.round(progress)}%
            </div>
          </div>
          <Progress value={progress} className="mt-3 h-3 bg-white/30 rounded-full" />
        </div>

        {/* Glass content */}
        <Card className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
          <div className="p-8">
            <div className="min-h-[400px] text-white leading-relaxed">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <pre className="whitespace-pre-wrap text-lg font-light">
                  {sections[currentSection]}
                  <span className="animate-pulse text-white/70 ml-2">|</span>
                </pre>
              </div>
            </div>
          </div>
        </Card>

        {/* Floating controls */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex space-x-4">
            <Button 
              className="bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-2xl hover:bg-white/30 transition-all duration-300 shadow-lg"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            >
              ← Previous
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg font-semibold"
              onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
            >
              Continue →
            </Button>
          </div>
          <div className="flex space-x-4">
            <Button className="bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-2xl hover:bg-white/30 transition-all duration-300">
              🎵 Listen
            </Button>
            <Button className="bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-2xl hover:bg-white/30 transition-all duration-300">
              💬 Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderComicStyle = () => (
    <div className="min-h-screen bg-yellow-100 relative" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f59e0b' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='m0 40l40-40h-40v40z'/%3E%3C/g%3E%3C/svg%3E")`
    }}>
      {/* Comic effects */}
      <div className="absolute top-20 right-20 text-6xl animate-bounce">💥</div>
      <div className="absolute bottom-32 left-16 text-4xl animate-pulse">⭐</div>
      <div className="absolute top-1/3 left-10 text-3xl animate-spin">✨</div>
      
      <div className="relative z-10 p-6">
        {/* Comic header */}
        <div className="mb-6 p-6 bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] transform rotate-1">
          <div className="flex items-center justify-between">
            <div className="text-black font-bold text-2xl comic-font">
              🦸‍♂️ SUPER LEARNING ADVENTURE!
            </div>
            <Badge className="bg-red-500 text-white border-2 border-black text-lg p-2 comic-font transform -rotate-12">
              {Math.round(progress)}% COMPLETE!
            </Badge>
          </div>
        </div>

        {/* Speech bubble content */}
        <div className="relative">
          <Card className="bg-white border-4 border-black rounded-3xl shadow-[12px_12px_0px_rgba(0,0,0,1)] transform -rotate-1">
            <div className="p-8">
              {/* Speech bubble tail */}
              <div className="absolute -bottom-8 left-20 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-white"></div>
              <div className="absolute -bottom-10 left-[76px] w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-t-[24px] border-t-black"></div>
              
              <div className="min-h-[400px] text-black text-xl leading-relaxed comic-font">
                <pre className="whitespace-pre-wrap font-bold">
                  {sections[currentSection]}
                  <span className="animate-bounce text-blue-500 ml-2 text-3xl">💫</span>
                </pre>
              </div>
            </div>
          </Card>
        </div>

        {/* Comic action buttons */}
        <div className="mt-12 flex items-center justify-between">
          <div className="flex space-x-6">
            <Button 
              className="bg-blue-500 border-4 border-black text-white font-bold text-lg comic-font shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transform rotate-2"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            >
              ← BAM! BACK
            </Button>
            <Button 
              className="bg-red-500 border-4 border-black text-white font-bold text-lg comic-font shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transform -rotate-1"
              onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
            >
              POW! NEXT →
            </Button>
          </div>
          <div className="flex space-x-4">
            <Button className="bg-green-500 border-4 border-black text-white font-bold comic-font shadow-[6px_6px_0px_rgba(0,0,0,1)] transform rotate-1">
              🔊 ZAP!
            </Button>
            <Button className="bg-purple-500 border-4 border-black text-white font-bold comic-font shadow-[6px_6px_0px_rgba(0,0,0,1)] transform -rotate-2">
              💬 WHOOSH!
            </Button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .comic-font {
          font-family: "Comic Sans MS", cursive, sans-serif;
        }
      `}</style>
    </div>
  )

  const renderNotebookStyle = () => (
    <div className="min-h-screen bg-amber-50 relative" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z' fill='%23d97706' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
    }}>
      {/* Paper texture overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 opacity-50"></div>
      
      {/* Spiral binding */}
      <div className="absolute left-16 top-0 bottom-0 w-1 bg-red-300 shadow-lg"></div>
      <div className="absolute left-12 top-8 w-6 h-6 bg-gray-300 rounded-full shadow-md border-2 border-gray-400"></div>
      <div className="absolute left-12 top-24 w-6 h-6 bg-gray-300 rounded-full shadow-md border-2 border-gray-400"></div>
      <div className="absolute left-12 top-40 w-6 h-6 bg-gray-300 rounded-full shadow-md border-2 border-gray-400"></div>
      
      <div className="relative z-10 p-8 pl-24">
        {/* Notebook header */}
        <div className="mb-8 p-6 bg-white/80 rounded-lg shadow-lg border-l-4 border-blue-400" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2393c5fd' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
        }}>
          <div className="flex items-center justify-between">
            <div className="text-gray-700">
              <h1 className="text-2xl font-handwriting text-blue-600 mb-2">📚 Today's Lesson</h1>
              <p className="text-sm text-gray-600 font-handwriting">Math - Counting Numbers</p>
            </div>
            <div className="text-right">
              <Badge className="bg-yellow-200 text-yellow-800 border border-yellow-400 font-handwriting">
                📈 Progress: {Math.round(progress)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Notebook content */}
        <Card className="bg-white/90 border border-gray-200 shadow-xl" style={{
          backgroundImage: `linear-gradient(to right, #ef4444 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`,
          backgroundSize: '25px 25px',
          backgroundPosition: '60px 0'
        }}>
          <div className="p-8 pl-16">
            <div className="min-h-[400px] text-gray-700 leading-loose">
              {/* Margin line */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-red-300"></div>
              
              <div className="font-handwriting text-lg">
                <pre className="whitespace-pre-wrap">
                  {sections[currentSection]}
                  <span className="animate-pulse text-blue-500 ml-2">✏️</span>
                </pre>
              </div>
              
              {/* Doodles */}
              <div className="absolute right-8 top-20 text-2xl animate-pulse">🌟</div>
              <div className="absolute right-16 bottom-32 text-xl animate-bounce">😊</div>
            </div>
          </div>
        </Card>

        {/* Notebook controls */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex space-x-4">
            <Button 
              className="bg-amber-200 border-2 border-amber-400 text-amber-800 font-handwriting shadow-lg hover:bg-amber-300 rounded-lg"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            >
              ← Previous Page
            </Button>
            <Button 
              className="bg-blue-200 border-2 border-blue-400 text-blue-800 font-handwriting shadow-lg hover:bg-blue-300 rounded-lg font-semibold"
              onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
            >
              Next Page →
            </Button>
          </div>
          <div className="flex space-x-4">
            <Button className="bg-green-200 border-2 border-green-400 text-green-800 font-handwriting shadow-lg hover:bg-green-300 rounded-lg">
              🎵 Read Aloud
            </Button>
            <Button className="bg-purple-200 border-2 border-purple-400 text-purple-800 font-handwriting shadow-lg hover:bg-purple-300 rounded-lg">
              ✋ Ask Question
            </Button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .font-handwriting {
          font-family: "Kalam", "Comic Sans MS", cursive, sans-serif;
        }
      `}</style>
    </div>
  )

  const renderCurrentStyle = () => {
    switch (currentStyle) {
      case 'holographic': return renderHolographicStyle()
      case 'gaming': return renderGamingStyle()
      case 'glass': return renderGlassStyle()
      case 'comic': return renderComicStyle()
      case 'notebook': return renderNotebookStyle()
      default: return renderHolographicStyle()
    }
  }

  return (
    <div className="min-h-screen">
      {/* Style selector */}
      <div className="fixed top-4 left-4 z-50 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border">
        <h3 className="font-bold mb-2">Choose Your Style:</h3>
        <div className="grid grid-cols-1 gap-2">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => setCurrentStyle(style.id)}
              className={`text-left p-2 rounded text-sm border transition-all ${
                currentStyle === style.id 
                  ? 'bg-blue-500 text-white border-blue-600' 
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className="font-semibold">{style.name}</div>
              <div className="text-xs opacity-75">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current style preview */}
      {renderCurrentStyle()}
    </div>
  )
}