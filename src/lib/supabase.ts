import { createClient } from '@supabase/supabase-js'

// Check if we have valid Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if we have real configuration
const hasValidConfig = supabaseUrl && supabaseKey && 
  supabaseUrl !== 'your-supabase-url' && 
  supabaseKey !== 'your-supabase-anon-key'

export const supabase = hasValidConfig 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// For server-side operations
export const createServerClient = () => {
  const serverUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serverUrl || !serverKey || 
      serverUrl === 'your-supabase-url' || 
      serverKey === 'your-supabase-service-role-key') {
    return null
  }
  
  return createClient(serverUrl, serverKey)
}

// Database types
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          role: 'student' | 'teacher' | 'admin'
          country: string | null
          date_of_birth: string | null
          phone_number: string | null
          timezone: string | null
          preferred_language: string
          education_level: string | null
          learning_goals: string | null
          about_me: string | null
          placement_level: string | null
          onboarding_completed: boolean
          subscription_plan: 'free' | 'basic' | 'premium'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'teacher' | 'admin'
          country?: string | null
          date_of_birth?: string | null
          phone_number?: string | null
          timezone?: string | null
          preferred_language?: string
          education_level?: string | null
          learning_goals?: string | null
          about_me?: string | null
          placement_level?: string | null
          onboarding_completed?: boolean
          subscription_plan?: 'free' | 'basic' | 'premium'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: 'student' | 'teacher' | 'admin'
          country?: string | null
          date_of_birth?: string | null
          phone_number?: string | null
          timezone?: string | null
          preferred_language?: string
          education_level?: string | null
          learning_goals?: string | null
          about_me?: string | null
          placement_level?: string | null
          onboarding_completed?: boolean
          subscription_plan?: 'free' | 'basic' | 'premium'
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          subject: string
          grade_level: string
          topic: string
          subtopic: string
          status: 'locked' | 'unlocked' | 'in_progress' | 'completed'
          score: number
          attempts: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          grade_level: string
          topic: string
          subtopic: string
          status?: 'locked' | 'unlocked' | 'in_progress' | 'completed'
          score?: number
          attempts?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          grade_level?: string
          topic?: string
          subtopic?: string
          status?: 'locked' | 'unlocked' | 'in_progress' | 'completed'
          score?: number
          attempts?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          user_id: string
          subject: string
          grade_level: string
          topic: string
          subtopic: string
          content: string
          quiz_data: any
          ai_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          grade_level: string
          topic: string
          subtopic: string
          content: string
          quiz_data?: any
          ai_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          grade_level?: string
          topic?: string
          subtopic?: string
          content?: string
          quiz_data?: any
          ai_notes?: string | null
          created_at?: string
        }
      }
      user_gamification: {
        Row: {
          id: string
          user_id: string
          level: number
          total_xp: number
          earned_badges: any
          achievements: any
          stats: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          level?: number
          total_xp?: number
          earned_badges?: any
          achievements?: any
          stats?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          level?: number
          total_xp?: number
          earned_badges?: any
          achievements?: any
          stats?: any
          created_at?: string
          updated_at?: string
        }
      }
      hardship_requests: {
        Row: {
          id: string
          user_id: string
          hardship_reason: string
          status: 'pending' | 'approved' | 'denied'
          submitted_at: string
          reviewed_at: string | null
          reviewed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hardship_reason: string
          status?: 'pending' | 'approved' | 'denied'
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hardship_reason?: string
          status?: 'pending' | 'approved' | 'denied'
          submitted_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      community_requests: {
        Row: {
          id: string
          user_id: string | null
          user_email: string
          user_name: string | null
          request_type: 'hardship_application' | 'language_request' | 'help_request'
          status: 'pending' | 'approved' | 'denied'
          hardship_reason: string | null
          country: string | null
          language_requested: string | null
          community_name: string | null
          location: string | null
          description: string | null
          contact_email: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_email: string
          user_name?: string | null
          request_type: 'hardship_application' | 'language_request' | 'help_request'
          status?: 'pending' | 'approved' | 'denied'
          hardship_reason?: string | null
          country?: string | null
          language_requested?: string | null
          community_name?: string | null
          location?: string | null
          description?: string | null
          contact_email?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          user_email?: string
          user_name?: string | null
          request_type?: 'hardship_application' | 'language_request' | 'help_request'
          status?: 'pending' | 'approved' | 'denied'
          hardship_reason?: string | null
          country?: string | null
          language_requested?: string | null
          community_name?: string | null
          location?: string | null
          description?: string | null
          contact_email?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}