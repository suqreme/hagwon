'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { profileService, type StudentProfile } from '@/services/profileService'

interface ProfileContextType {
  currentProfile: StudentProfile | null
  setCurrentProfile: (profile: StudentProfile | null) => void
  updateProgress: (progress: Partial<StudentProfile['progress']>) => void
  signOut: () => void
  isLoading: boolean
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [currentProfile, setCurrentProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if there's a current profile on mount
    const profile = profileService.getCurrentProfile()
    setCurrentProfile(profile)
    setIsLoading(false)
  }, [])

  const updateProgress = (progress: Partial<StudentProfile['progress']>) => {
    if (currentProfile) {
      profileService.updateProgress(currentProfile.id, progress)
      
      // Update local state
      setCurrentProfile(prev => prev ? {
        ...prev,
        progress: { ...prev.progress, ...progress }
      } : null)
    }
  }

  const signOut = () => {
    profileService.signOut()
    setCurrentProfile(null)
  }

  const value = {
    currentProfile,
    setCurrentProfile,
    updateProgress,
    signOut,
    isLoading
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

// Helper hook to check if profile is authenticated
export function useProfileAuth() {
  const { currentProfile } = useProfile()
  
  return {
    user: currentProfile,
    isAuthenticated: !!currentProfile
  }
}