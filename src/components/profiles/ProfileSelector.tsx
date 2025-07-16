'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { profileService, type StudentProfile } from '@/services/profileService'
import { Users, Plus, ArrowRight, Settings, Trash2 } from 'lucide-react'

interface ProfileSelectorProps {
  onProfileSelected: (profile: StudentProfile) => void
}

export default function ProfileSelector({ onProfileSelected }: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<StudentProfile[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<StudentProfile | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = () => {
    const deviceProfiles = profileService.getDeviceProfiles()
    setProfiles(deviceProfiles.profiles)
  }

  const handleProfileClick = (profile: StudentProfile) => {
    setSelectedProfile(profile)
    setPin('')
    setError('')
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const profile = profileService.switchProfile(pin)
      if (profile) {
        onProfileSelected(profile)
      } else {
        setError('Incorrect PIN. Please try again.')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProfile = (profileId: string) => {
    if (confirm('Are you sure you want to delete this profile? This cannot be undone.')) {
      profileService.deleteProfile(profileId)
      loadProfiles()
      setSelectedProfile(null)
    }
  }

  // Show PIN entry form
  if (selectedProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">{selectedProfile.avatar}</div>
            <CardTitle className="text-2xl">Hi {selectedProfile.name}!</CardTitle>
            <p className="text-muted-foreground">Enter your PIN to continue</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter 4-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
                {error && (
                  <p className="text-destructive text-sm mt-2">{error}</p>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  disabled={pin.length !== 4 || loading}
                  className="flex-1"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedProfile(null)}
                >
                  Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show create profile form
  if (showCreateForm) {
    return (
      <CreateProfileForm
        onProfileCreated={(profile) => {
          loadProfiles()
          setShowCreateForm(false)
          onProfileSelected(profile)
        }}
        onCancel={() => setShowCreateForm(false)}
      />
    )
  }

  // Show profile selection
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Users className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Choose Your Profile</h1>
          <p className="text-muted-foreground">Select your profile to continue learning</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {profiles.map((profile) => (
            <Card 
              key={profile.id} 
              className="cursor-pointer theme-shadow hover:theme-shadow-lg transition-shadow group"
              onClick={() => handleProfileClick(profile)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-4">{profile.avatar}</div>
                <h3 className="text-xl font-semibold mb-2">{profile.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grade:</span>
                    <Badge variant="outline">{profile.grade}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject:</span>
                    <Badge variant="outline">{profile.subject}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lessons:</span>
                    <span className="font-medium">{profile.progress.lessonsCompleted}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Add edit profile functionality
                      }}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProfile(profile.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Add new profile card */}
          <Card 
            className="cursor-pointer theme-shadow hover:theme-shadow-lg transition-shadow border-dashed"
            onClick={() => setShowCreateForm(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-4 text-muted-foreground">
                <Plus className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Add New Student</h3>
              <p className="text-muted-foreground text-sm">
                Create a new profile for another student
              </p>
            </CardContent>
          </Card>
        </div>

        {profiles.length === 0 && (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No profiles yet. Create your first student profile!</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Create Profile Form Component
function CreateProfileForm({ 
  onProfileCreated, 
  onCancel 
}: {
  onProfileCreated: (profile: StudentProfile) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [grade, setGrade] = useState('grade_1')
  const [subject, setSubject] = useState('math')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const profile = profileService.createProfile(name, pin, grade, subject)
      onProfileCreated(profile)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create New Profile</CardTitle>
          <p className="text-muted-foreground text-center">Set up a new student profile</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Student Name</label>
              <Input
                type="text"
                placeholder="Enter student name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">4-Digit PIN</label>
              <Input
                type="password"
                placeholder="Enter 4-digit PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                maxLength={4}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                This PIN will be used to access the profile
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Grade Level</label>
              <select 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="kindergarten">Kindergarten</option>
                <option value="grade_1">Grade 1</option>
                <option value="grade_2">Grade 2</option>
                <option value="grade_3">Grade 3</option>
                <option value="grade_4">Grade 4</option>
                <option value="grade_5">Grade 5</option>
                <option value="not_sure">Not Sure</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="math">Math</option>
                <option value="english">English</option>
              </select>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                type="submit"
                disabled={!name || pin.length !== 4 || loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Profile'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}