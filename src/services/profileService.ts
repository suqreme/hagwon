// Multi-Student Profile Service
// Handles shared computer scenarios where multiple students use same device

export interface StudentProfile {
  id: string
  name: string
  pin: string
  grade: string
  subject: string
  avatar: string
  createdAt: string
  lastActivity: string
  progress: {
    currentTopic: string
    lessonsCompleted: number
    quizzesPassed: number
    currentStreak: number
  }
}

export interface DeviceProfiles {
  deviceId: string
  profiles: StudentProfile[]
  currentProfile: string | null
  createdAt: string
}

class ProfileService {
  private storageKey = 'hagwon_device_profiles'
  private deviceId: string

  constructor() {
    this.deviceId = this.getOrCreateDeviceId()
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('hagwon_device_id')
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('hagwon_device_id', deviceId)
    }
    return deviceId
  }

  // Get all profiles for this device
  getDeviceProfiles(): DeviceProfiles {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading device profiles:', error)
    }

    // Default empty profiles
    return {
      deviceId: this.deviceId,
      profiles: [],
      currentProfile: null,
      createdAt: new Date().toISOString()
    }
  }

  // Save profiles to localStorage
  private saveProfiles(deviceProfiles: DeviceProfiles): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(deviceProfiles))
    } catch (error) {
      console.error('Error saving device profiles:', error)
    }
  }

  // Create a new student profile
  createProfile(name: string, pin: string, grade: string, subject: string = 'math'): StudentProfile {
    const deviceProfiles = this.getDeviceProfiles()
    
    // Check if PIN already exists
    const existingPin = deviceProfiles.profiles.find(p => p.pin === pin)
    if (existingPin) {
      throw new Error('PIN already exists. Please choose a different PIN.')
    }

    // Check if name already exists
    const existingName = deviceProfiles.profiles.find(p => p.name.toLowerCase() === name.toLowerCase())
    if (existingName) {
      throw new Error('Name already exists. Please choose a different name.')
    }

    // Create new profile
    const newProfile: StudentProfile = {
      id: 'profile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name,
      pin,
      grade,
      subject,
      avatar: this.getRandomAvatar(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      progress: {
        currentTopic: 'basic_addition', // Default starting topic
        lessonsCompleted: 0,
        quizzesPassed: 0,
        currentStreak: 0
      }
    }

    deviceProfiles.profiles.push(newProfile)
    this.saveProfiles(deviceProfiles)
    
    return newProfile
  }

  // Verify PIN and switch to profile
  switchProfile(pin: string): StudentProfile | null {
    const deviceProfiles = this.getDeviceProfiles()
    const profile = deviceProfiles.profiles.find(p => p.pin === pin)
    
    if (!profile) {
      return null
    }

    // Update current profile and last activity
    deviceProfiles.currentProfile = profile.id
    profile.lastActivity = new Date().toISOString()
    this.saveProfiles(deviceProfiles)
    
    return profile
  }

  // Get currently active profile
  getCurrentProfile(): StudentProfile | null {
    const deviceProfiles = this.getDeviceProfiles()
    if (!deviceProfiles.currentProfile) return null
    
    return deviceProfiles.profiles.find(p => p.id === deviceProfiles.currentProfile) || null
  }

  // Update profile progress
  updateProgress(profileId: string, progressUpdate: Partial<StudentProfile['progress']>): void {
    const deviceProfiles = this.getDeviceProfiles()
    const profile = deviceProfiles.profiles.find(p => p.id === profileId)
    
    if (profile) {
      profile.progress = { ...profile.progress, ...progressUpdate }
      profile.lastActivity = new Date().toISOString()
      this.saveProfiles(deviceProfiles)
    }
  }

  // Update profile settings
  updateProfile(profileId: string, updates: Partial<Pick<StudentProfile, 'name' | 'grade' | 'subject' | 'avatar'>>): void {
    const deviceProfiles = this.getDeviceProfiles()
    const profile = deviceProfiles.profiles.find(p => p.id === profileId)
    
    if (profile) {
      Object.assign(profile, updates)
      profile.lastActivity = new Date().toISOString()
      this.saveProfiles(deviceProfiles)
    }
  }

  // Delete a profile
  deleteProfile(profileId: string): void {
    const deviceProfiles = this.getDeviceProfiles()
    deviceProfiles.profiles = deviceProfiles.profiles.filter(p => p.id !== profileId)
    
    // Clear current profile if it was deleted
    if (deviceProfiles.currentProfile === profileId) {
      deviceProfiles.currentProfile = null
    }
    
    this.saveProfiles(deviceProfiles)
  }

  // Sign out current profile
  signOut(): void {
    const deviceProfiles = this.getDeviceProfiles()
    deviceProfiles.currentProfile = null
    this.saveProfiles(deviceProfiles)
  }

  // Get random avatar emoji
  private getRandomAvatar(): string {
    const avatars = [
      '👦', '👧', '🧒', '👨‍🎓', '👩‍🎓', '🧑‍🎓',
      '🙋‍♂️', '🙋‍♀️', '🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍🏫'
    ]
    return avatars[Math.floor(Math.random() * avatars.length)]
  }

  // Get device statistics
  getDeviceStats(): {
    totalProfiles: number
    activeProfiles: number
    totalLessons: number
    totalQuizzes: number
  } {
    const deviceProfiles = this.getDeviceProfiles()
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    return {
      totalProfiles: deviceProfiles.profiles.length,
      activeProfiles: deviceProfiles.profiles.filter(p => 
        new Date(p.lastActivity) > weekAgo
      ).length,
      totalLessons: deviceProfiles.profiles.reduce((sum, p) => sum + p.progress.lessonsCompleted, 0),
      totalQuizzes: deviceProfiles.profiles.reduce((sum, p) => sum + p.progress.quizzesPassed, 0)
    }
  }
}

export const profileService = new ProfileService()