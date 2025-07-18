'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Check, Heart, Users, Globe } from 'lucide-react'
import { T } from '@/components/ui/auto-translate'
import { supabase } from '@/lib/supabase'
import { notifications } from '@/lib/notifications'
import { SUBSCRIPTION_PLANS, type PlanId } from '@/lib/stripe'

// Convert Stripe plans to component format
const plans = Object.values(SUBSCRIPTION_PLANS).map(plan => ({
  ...plan,
  popular: plan.id === 'supporter'
}))

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showHardshipForm, setShowHardshipForm] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hardshipReason, setHardshipReason] = useState('')
  const [hardshipCountry, setHardshipCountry] = useState('')
  const [submittingHardship, setSubmittingHardship] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check for success or canceled status from Stripe redirect
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success')) {
      notifications.success.subscriptionActivated('your subscription')
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (urlParams.get('canceled')) {
      notifications.warning.unsavedChanges()
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      notifications.error.unauthorized()
      return
    }

    setLoading(planId)
    
    try {
      if (planId === 'free') {
        // Handle free plan - just update local state
        const planName = plans.find(p => p.id === planId)?.name || 'Free Plan'
        notifications.success.subscriptionActivated(planName)
        return
      }

      // For paid plans, redirect to Stripe Checkout
      await subscriptionService.createCheckoutSession(user.id, planId as PlanId)
      
    } catch (error) {
      console.error('Subscription error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('Stripe not configured')) {
        notifications.error.networkError()
        notifications.warning.betaFeature()
      } else {
        notifications.error.submissionFailed()
      }
    } finally {
      setLoading(null)
    }
  }

  const handleHardshipRequest = () => {
    setShowHardshipForm(true)
  }

  const submitHardshipApplication = async () => {
    if (!user || !hardshipReason.trim() || !hardshipCountry.trim()) {
      notifications.error.validationError('all required fields')
      return
    }

    setSubmittingHardship(true)
    
    try {
      let success = false
      
      // Try to save to Supabase first
      if (supabase) {
        try {
          const { error } = await supabase
            .from('hardship_requests')
            .insert({
              user_id: user.id,
              hardship_reason: hardshipReason,
              status: 'pending',
              submitted_at: new Date().toISOString()
            })
          
          if (!error) {
            success = true
            console.log('Hardship request saved to Supabase successfully')
          } else {
            console.error('Supabase error:', error)
          }
        } catch (supabaseError) {
          console.error('Supabase connection error:', supabaseError)
        }
      }

      // Fallback to localStorage (for development and backup)
      const hardshipRequest = {
        id: `hardship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: user.id,
        user_email: user.email,
        user_name: user.email?.split('@')[0] || 'Unknown',
        hardship_reason: hardshipReason,
        country: hardshipCountry,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        type: 'hardship_application'
      }

      // Store in localStorage for admin to review (always as backup)
      const existingRequests = JSON.parse(localStorage.getItem('admin_requests') || '[]')
      existingRequests.push(hardshipRequest)
      localStorage.setItem('admin_requests', JSON.stringify(existingRequests))

      // Clear form and close
      setHardshipReason('')
      setHardshipCountry('')
      setShowHardshipForm(false)
      
      if (success) {
        notifications.success.requestSubmitted()
      } else {
        notifications.warning.dataNotSynced()
        notifications.info.dataBackup()
      }
      
    } catch (error) {
      console.error('Error submitting hardship application:', error)
      notifications.error.submissionFailed()
    } finally {
      setSubmittingHardship(false)
    }
  }

  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="mb-2"
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-foreground"><T>Choose Your Plan</T></h1>
              <p className="text-muted-foreground"><T>Support global education while advancing your own learning</T></p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Impact Statement */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="py-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>1,247 students supported</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <span>23 countries reached</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <span>$12,450 donated to scholarships</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                Every subscription helps provide free education to students who need it most
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground"><T>Most Popular</T></Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{plan.interval}
                  </span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? 'Processing...' : 
                   plan.price === 0 ? 'Current Plan' : 'Subscribe Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Hardship Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>Need Financial Assistance?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We believe education should be accessible to everyone, regardless of financial circumstances. 
              If you're unable to afford a subscription, you can apply for free access through our hardship program.
            </p>
            
            <div className="flex space-x-4">
              <Button variant="outline" onClick={handleHardshipRequest}>
                Apply for Free Access
              </Button>
              <Button variant="ghost" onClick={() => router.push('/our-goals')}>
                See Our Fundraising Goals
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hardship Form Modal */}
        {showHardshipForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle><T>Hardship Access Application</T></CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tell us about your situation
                  </label>
                  <textarea
                    value={hardshipReason}
                    onChange={(e) => setHardshipReason(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Please describe your financial circumstances and why you need free access to education..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Country/Region
                  </label>
                  <input
                    type="text"
                    value={hardshipCountry}
                    onChange={(e) => setHardshipCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Your location"
                    required
                  />
                </div>
                
                <div className="flex space-x-4">
                  <Button 
                    className="flex-1" 
                    onClick={submitHardshipApplication}
                    disabled={submittingHardship || !hardshipReason.trim() || !hardshipCountry.trim()}
                  >
                    {submittingHardship ? 'Submitting...' : 'Submit Application'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowHardshipForm(false)}>
                    Cancel
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Applications are reviewed within 2-3 business days. We'll email you with the decision.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}