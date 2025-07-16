'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { T } from '@/components/ui/auto-translate'
import { User, Mail, Globe, Calendar, BookOpen, Trophy, Settings, ArrowLeft } from 'lucide-react'

interface UserProfile {
  firstName: string
  lastName: string
  country: string
  dateOfBirth: string
  preferredLanguage: string
  learningGoals: string
  educationLevel: string
  aboutMe: string
  timezone: string
  phoneNumber: string
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    country: '',
    dateOfBirth: '',
    preferredLanguage: 'en',
    learningGoals: '',
    educationLevel: '',
    aboutMe: '',
    timezone: '',
    phoneNumber: ''
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
    
    if (user) {
      loadUserProfile()
    }
  }, [user, loading, router])

  const loadUserProfile = () => {
    if (!user) return
    
    // Load profile from localStorage
    const savedProfile = localStorage.getItem(`profile_${user.id}`)
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile)
      setProfile(parsedProfile)
    } else {
      // Set defaults from user data
      setProfile(prev => ({
        ...prev,
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        country: user.user_metadata?.country || ''
      }))
    }
  }

  const saveProfile = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      // Save to localStorage
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(profile))
      
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <T>← Back to Dashboard</T>
              </Button>
              <h1 className="text-2xl font-bold text-foreground"><T>My Profile</T></h1>
              <p className="text-muted-foreground"><T>Manage your personal information and learning preferences</T></p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button 
                onClick={() => editing ? saveProfile() : setEditing(true)}
                disabled={saving}
              >
                {editing ? (
                  saving ? <T>Saving...</T> : <T>Save Changes</T>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    <T>Edit Profile</T>
                  </>
                )}
              </Button>
              {editing && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditing(false)
                    loadUserProfile() // Reset changes
                  }}
                >
                  <T>Cancel</T>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span><T>Profile Overview</T></span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {(profile.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">
                  {profile.firstName && profile.lastName 
                    ? `${profile.firstName} ${profile.lastName}` 
                    : user.email}
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                {profile.country && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{profile.country}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle><T>Personal Information</T></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <T>First Name</T>
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter your first name"
                  />
                ) : (
                  <p className="text-foreground">{profile.firstName || <span className="text-muted-foreground">Not specified</span>}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <T>Last Name</T>
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter your last name"
                  />
                ) : (
                  <p className="text-foreground">{profile.lastName || <span className="text-muted-foreground">Not specified</span>}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <T>Country</T>
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={profile.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter your country"
                  />
                ) : (
                  <p className="text-foreground">{profile.country || <span className="text-muted-foreground">Not specified</span>}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <T>Date of Birth</T>
                </label>
                {editing ? (
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                ) : (
                  <p className="text-foreground">
                    {profile.dateOfBirth 
                      ? new Date(profile.dateOfBirth).toLocaleDateString()
                      : <span className="text-muted-foreground">Not specified</span>
                    }
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <T>Phone Number</T>
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={profile.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-foreground">{profile.phoneNumber || <span className="text-muted-foreground">Not specified</span>}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <T>Timezone</T>
                </label>
                {editing ? (
                  <select
                    value={profile.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select timezone</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Seoul">Seoul</option>
                  </select>
                ) : (
                  <p className="text-foreground">{profile.timezone || <span className="text-muted-foreground">Not specified</span>}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Preferences */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span><T>Learning Preferences</T></span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <T>Preferred Language</T>
              </label>
              {editing ? (
                <select
                  value={profile.preferredLanguage}
                  onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="ko">한국어</option>
                  <option value="pt">Português</option>
                  <option value="fr">Français</option>
                  <option value="hi">हिन्दी</option>
                  <option value="ar">العربية</option>
                  <option value="sw">Kiswahili</option>
                </select>
              ) : (
                <p className="text-foreground">
                  {profile.preferredLanguage === 'en' ? 'English' :
                   profile.preferredLanguage === 'es' ? 'Español' :
                   profile.preferredLanguage === 'ko' ? '한국어' :
                   profile.preferredLanguage === 'pt' ? 'Português' :
                   profile.preferredLanguage === 'fr' ? 'Français' :
                   profile.preferredLanguage === 'hi' ? 'हिन्दी' :
                   profile.preferredLanguage === 'ar' ? 'العربية' :
                   profile.preferredLanguage === 'sw' ? 'Kiswahili' : 'English'}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <T>Education Level</T>
              </label>
              {editing ? (
                <select
                  value={profile.educationLevel}
                  onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select your current level</option>
                  <option value="elementary">Elementary School</option>
                  <option value="middle">Middle School</option>
                  <option value="high">High School</option>
                  <option value="ged">GED Student</option>
                  <option value="college">College</option>
                  <option value="graduate">Graduate School</option>
                  <option value="adult">Adult Learner</option>
                </select>
              ) : (
                <p className="text-foreground">{profile.educationLevel || <span className="text-muted-foreground">Not specified</span>}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <T>Learning Goals</T>
              </label>
              {editing ? (
                <textarea
                  value={profile.learningGoals}
                  onChange={(e) => handleInputChange('learningGoals', e.target.value)}
                  className="w-full h-24 px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="What do you hope to achieve with your learning?"
                />
              ) : (
                <p className="text-foreground">{profile.learningGoals || <span className="text-muted-foreground">Not specified</span>}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* About Me */}
        <Card>
          <CardHeader>
            <CardTitle><T>About Me</T></CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <textarea
                value={profile.aboutMe}
                onChange={(e) => handleInputChange('aboutMe', e.target.value)}
                className="w-full h-32 px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Tell us about yourself, your interests, and your learning journey..."
              />
            ) : (
              <p className="text-foreground">{profile.aboutMe || <span className="text-muted-foreground">Tell us about yourself...</span>}</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}