'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: any) => Promise<void>
  signOut: () => Promise<void>
  createAnonymousUser: (country?: string) => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  hasSubscription: () => boolean
  isAdmin: () => boolean
  isPremiumUser: () => boolean
  canAccessFeature: (feature: string) => boolean
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [authInProgress, setAuthInProgress] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Auth loading timeout - forcing loading to false')
      setLoading(false)
    }, 5000) // 5 seconds max (reduced from 10)

    // Check for classroom student first
    const classroomStudent = localStorage.getItem('current_classroom_student')
    if (classroomStudent) {
      try {
        const student = JSON.parse(classroomStudent)
        setUser({
          id: student.id,
          email: student.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_metadata: student.user_metadata
        })
      } catch (error) {
        console.error('Failed to parse classroom student data:', error)
        localStorage.removeItem('current_classroom_student')
      }
      setLoading(false)
      clearTimeout(timeout)
      return
    }

    // Skip if Supabase is not configured
    if (!supabase) {
      console.log('Supabase not configured - running in demo mode')
      setLoading(false)
      clearTimeout(timeout)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id)
      setSupabaseUser(session?.user ?? null)
      
      if (session?.user) {
        console.log('User found, fetching profile...')
        await fetchUserProfile(session.user.id)
      } else {
        console.log('No user, setting to null')
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [mounted])

  const fetchUserProfile = async (userId: string) => {
    if (!supabase) {
      setLoading(false)
      return
    }

    if (authInProgress) {
      console.log('Auth already in progress, skipping profile fetch')
      return
    }

    setAuthInProgress(true)
    
    try {
      console.log('Fetching user profile for ID:', userId)
      
      // Add timeout to prevent hanging
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
      )

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any

      if (error) {
        console.error('Database error:', error)
        
        // If user profile doesn't exist, try to create it
        if (error.code === 'PGRST116') {
          console.log('User profile not found, attempting to create one...')
          
          const { data: userData } = await supabase.auth.getUser()
          if (userData.user) {
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert({
                id: userData.user.id,
                email: userData.user.email,
                role: 'student',
                subscription_plan: 'free'
              })
              .select()
              .single()
            
            if (createError) {
              console.error('Failed to create user profile:', createError)
              setUser(null)
            } else {
              console.log('User profile created successfully:', newProfile)
              setUser(newProfile)
            }
          }
        } else {
          console.error('Profile fetch failed, clearing user')
          setUser(null)
        }
      } else {
        console.log('User profile found:', data)
        setUser(data)
      }
    } catch (error: any) {
      console.error('Failed to fetch user profile:', error)
      if (error.message === 'Profile fetch timeout') {
        console.error('Profile fetch timed out - this may indicate database connectivity issues')
      }
      setUser(null)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
      setAuthInProgress(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('SignIn called with:', email)
    
    if (!supabase) {
      // Demo mode - create a fake user
      const demoUser = {
        id: 'demo-user',
        email,
        country: 'US',
        isAnonymous: false,
        subscription_status: 'free' as const,
        created_at: new Date().toISOString()
      }
      setUser(demoUser)
      return
    }
    
    console.log('Calling supabase signInWithPassword...')
    
    // Add timeout to prevent hanging
    const signInPromise = supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Sign in timeout - please check your internet connection')), 10000)
    )

    const { error } = await Promise.race([signInPromise, timeoutPromise]) as any
    
    console.log('signInWithPassword completed, error:', error)
    if (error) {
      if (error.message?.includes('timeout')) {
        throw new Error('Login timed out. Please check your internet connection and try again.')
      }
      throw error
    }
    console.log('signIn method completed successfully')
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    if (!supabase) {
      // Demo mode - create a fake user
      const demoUser = {
        id: 'demo-user',
        email,
        country: metadata?.country || 'US',
        isAnonymous: false,
        subscription_status: 'free' as const,
        created_at: new Date().toISOString(),
        user_metadata: metadata
      }
      setUser(demoUser)
      return
    }
    
    // Get the current domain for the confirmation email
    const currentDomain = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://www.hagwon.app' // Fallback to production domain
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${currentDomain}/auth/callback`
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    // Clear classroom student if exists
    localStorage.removeItem('current_classroom_student')
    
    if (!supabase) {
      setUser(null)
      setSupabaseUser(null)
      return
    }
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.warn('Supabase logout failed, clearing local session:', error)
        // Fallback: clear local session even if Supabase fails
        setUser(null)
        setSupabaseUser(null)
        return
      }
    } catch (error) {
      console.warn('Logout error, clearing local session:', error)
      // Fallback: clear local session even if Supabase fails
      setUser(null)
      setSupabaseUser(null)
    }
  }

  const createAnonymousUser = async () => {
    // For anonymous users, we'll create a local session
    // This will be implemented in Phase 5 for classroom mode
    throw new Error('Anonymous mode not yet implemented')
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!supabase || !user) {
      console.warn('Cannot update profile: Supabase not configured or user not logged in')
      return
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      throw new Error(error.message || 'Failed to update profile')
    }
  }

  const hasSubscription = () => {
    if (!user) return false
    return user.subscription_status !== 'free'
  }

  const isAdmin = () => {
    if (!user) return false
    return user.role === 'admin'
  }

  const isPremiumUser = () => {
    if (!user) return false
    return user.subscription_status === 'premium' || user.subscription_status === 'sponsor'
  }

  const canAccessFeature = (feature: string) => {
    if (!user) return false
    
    // Admin can access everything
    if (isAdmin()) return true

    // Feature-based access control
    switch (feature) {
      case 'ai_tutor':
        return hasSubscription() || user.subscription_status === 'free' // AI tutor available to all
      case 'premium_voices':
        return isPremiumUser()
      case 'offline_downloads':
        return hasSubscription()
      case 'advanced_analytics':
        return isPremiumUser()
      case 'unlimited_lessons':
        return hasSubscription()
      default:
        return true // Default features available to all
    }
  }

  const refreshUserProfile = async () => {
    if (!user) return
    await fetchUserProfile(user.id)
  }

  const value = {
    user,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    createAnonymousUser,
    updateProfile,
    hasSubscription,
    isAdmin,
    isPremiumUser,
    canAccessFeature,
    refreshUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}