'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import LandingPage from '@/components/landing/LandingPage'
import LoginForm from '@/components/auth/LoginForm'
import GradeEstimate from '@/components/auth/GradeEstimate'
import DiagnosticTest from '@/components/auth/DiagnosticTest'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { T } from '@/components/ui/auto-translate'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<'login' | 'estimate' | 'diagnostic' | 'complete'>('login')
  const [estimatedGrade, setEstimatedGrade] = useState('')
  const [placementLevel, setPlacementLevel] = useState('')
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  // Check if user has completed onboarding
  useEffect(() => {
    if (user && !loading) {
      // In demo mode, check localStorage for onboarding completion
      const onboardingComplete = localStorage.getItem(`onboarding_${user.id}`)
      if (onboardingComplete) {
        setHasCompletedOnboarding(true)
        router.push('/dashboard')
      } else {
        setStep('estimate')
      }
    }
  }, [user, loading, router])

  const handleGradeSelected = (grade: string) => {
    setEstimatedGrade(grade)
    setStep('diagnostic')
  }

  const handlePlacementComplete = (level: string) => {
    setPlacementLevel(level)
    setStep('complete')
    
    // Mark onboarding as complete
    if (user) {
      localStorage.setItem(`onboarding_${user.id}`, 'true')
      localStorage.setItem(`placement_${user.id}`, level)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground"><T>Loading...</T></p>
        </div>
      </div>
    )
  }

  // Show landing page for non-authenticated users
  if (!user && step === 'login') {
    return <LandingPage />
  }

  // If user is logged in but hasn't completed onboarding, continue with flow
  if (user && step === 'login' && !hasCompletedOnboarding) {
    setStep('estimate')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <T>Welcome to Hagwon</T>
          </h1>
          <p className="text-xl text-muted-foreground">
            <T>Let's find your perfect starting point</T>
          </p>
        </div>

        {step === 'estimate' && (
          <GradeEstimate onGradeSelected={handleGradeSelected} />
        )}

        {step === 'diagnostic' && (
          <DiagnosticTest 
            estimatedGrade={estimatedGrade}
            onPlacementComplete={handlePlacementComplete}
          />
        )}

        {step === 'complete' && (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <div className="text-green-500 text-6xl mb-6">🎓</div>
              <CardTitle className="text-2xl mb-4"><T>Ready to Learn!</T></CardTitle>
              <p className="text-muted-foreground mb-4">
                <T>Based on your diagnostic test, we've placed you at</T> <strong className="text-foreground">{placementLevel}</strong> <T>level</T>.
              </p>
              <p className="text-muted-foreground mb-6">
                <T>You can always adjust this later as you progress through your lessons.</T>
              </p>
              <Button
                onClick={() => {
                  // Mark onboarding as complete and navigate to dashboard
                  if (user) {
                    localStorage.setItem(`onboarding_${user.id}`, 'true')
                    localStorage.setItem(`placement_${user.id}`, placementLevel)
                  }
                  router.push('/dashboard')
                }}
                className="w-full"
              >
                <T>Start Learning</T>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
