'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Mail, AlertCircle } from 'lucide-react'
import { T } from '@/components/ui/auto-translate'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [country, setCountry] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)

  const { signIn, signUp, user, loading: authLoading } = useAuth()
  const router = useRouter()


  // Check for URL parameters on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const confirmed = urlParams.get('confirmed')
      const error = urlParams.get('error')
      const message = urlParams.get('message')

      if (confirmed) {
        setSuccess('Email confirmed successfully! You can now sign in.')
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }

      if (error) {
        setError(message || 'Authentication error occurred')
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [])

  // Handle successful login redirect
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User logged in, redirecting to dashboard')
      // Add a small delay to ensure state is settled
      setTimeout(() => {
        router.push('/dashboard')
      }, 100)
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('LoginForm: handleSubmit called')
    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isSignUp) {
        console.log('LoginForm: Calling signUp...')
        await signUp(email, password, { country })
        setShowConfirmation(true)
        setSuccess('Account created! Please check your email for a confirmation link.')
      } else {
        console.log('LoginForm: Calling signIn...')
        await signIn(email, password)
        console.log('LoginForm: signIn completed successfully')
        setSuccess('Login successful! Redirecting...')
      }
    } catch (error: unknown) {
      console.log('LoginForm: Error occurred:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      console.log('LoginForm: Setting loading to false')
      setFormLoading(false)
    }
  }

  // Show confirmation screen after successful signup
  if (showConfirmation) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center space-x-2">
            <Mail className="w-6 h-6 text-blue-500" />
            <span><T>Check Your Email</T></span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-green-500">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          </div>
          <p className="text-foreground">
            <T>We've sent a confirmation link to:</T>
          </p>
          <p className="font-semibold text-primary">{email}</p>
          <p className="text-muted-foreground text-sm">
            <T>Click the link in your email to activate your account. You may need to check your spam folder.</T>
          </p>
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmation(false)
                setIsSignUp(false)
                setEmail('')
                setPassword('')
                setCountry('')
              }}
            >
<T>Back to Sign In</T>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {isSignUp ? <T>Create Account</T> : <T>Sign In</T>}
        </CardTitle>
      </CardHeader>
      <CardContent>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground">
            <T>Email</T>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground">
            <T>Password</T>
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {isSignUp && (
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-foreground">
              <T>Country (Optional)</T>
            </label>
            <input
              type="text"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 block w-full border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            <span className="text-destructive text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={formLoading || authLoading}
          className="w-full"
        >
          {formLoading || authLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>{isSignUp ? <T>Creating Account...</T> : <T>Signing In...</T>}</span>
            </div>
          ) : (
            isSignUp ? <T>Create Account</T> : <T>Sign In</T>
          )}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? <T>Already have an account? Sign in</T> : <T>Don't have an account? Sign up</T>}
        </Button>
      </div>

      <div className="mt-4 text-center">
        <Button
          type="button"
          variant="link"
          size="sm"
          disabled
        >
<T>Continue as Guest (Coming Soon)</T>
        </Button>
      </div>
      </CardContent>
    </Card>
  )
}