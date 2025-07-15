'use client'

import { useProfile } from '@/contexts/ProfileContext'
import ProfileSelector from '@/components/profiles/ProfileSelector'
import StudentDashboard from '@/components/student/StudentDashboard'
import { type StudentProfile } from '@/services/profileService'

export default function StudentPage() {
  const { currentProfile, setCurrentProfile, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show profile selector if no profile is selected
  if (!currentProfile) {
    return (
      <ProfileSelector 
        onProfileSelected={(profile: StudentProfile) => {
          setCurrentProfile(profile)
        }}
      />
    )
  }

  // Show student dashboard if profile is selected
  return <StudentDashboard />
}