import { supabase } from '@/lib/supabase'

export interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  role: 'student' | 'teacher' | 'admin'
  country: string | null
  placement_level: string | null
  subscription_plan: 'free' | 'basic' | 'premium'
  created_at: string
  updated_at: string
}

export interface UserStats {
  lessonsCompleted: number
  quizzesPassed: number
  totalXP: number
  currentStreak: number
  lastLessonDate: string
}

export interface AdminUserView extends UserProfile {
  subscription_status: string
  hardship_approved: boolean
  lessons_completed: number
  last_active: string
}

class UserManagementService {
  // Get all users (admin only)
  async getAllUsers(page = 1, limit = 50): Promise<{
    users: AdminUserView[]
    total: number
    hasMore: boolean
  }> {
    if (!supabase) {
      return {
        users: [],
        total: 0,
        hasMore: false
      }
    }

    try {
      const offset = (page - 1) * limit

      const { data, error, count } = await supabase
        .from('user_profiles')
        .select(`
          *,
          subscriptions (
            plan,
            status,
            hardship_approved
          ),
          user_progress (
            status
          )
        `, { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) throw error

      const users: AdminUserView[] = (data || []).map(user => ({
        ...user,
        subscription_status: user.subscriptions?.[0]?.plan || 'free',
        hardship_approved: user.subscriptions?.[0]?.hardship_approved || false,
        lessons_completed: user.user_progress?.filter((p: any) => p.status === 'completed').length || 0,
        last_active: user.updated_at
      }))

      return {
        users,
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      return {
        users: [],
        total: 0,
        hasMore: false
      }
    }
  }

  // Update user role (admin only)
  async updateUserRole(userId: string, role: 'student' | 'teacher' | 'admin'): Promise<void> {
    if (!supabase) {
      console.warn('Supabase not configured - cannot update user role')
      return
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating user role:', error)
      throw error
    }
  }

  // Update user subscription (admin only)
  async updateUserSubscription(userId: string, plan: 'free' | 'basic' | 'premium'): Promise<void> {
    if (!supabase) {
      console.warn('Supabase not configured - cannot update subscription')
      return
    }

    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ 
          subscription_plan: plan,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (profileError) throw profileError

      // Update or create subscription record
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan,
          status: 'active',
          updated_at: new Date().toISOString()
        })

      if (subError) throw subError
    } catch (error) {
      console.error('Error updating user subscription:', error)
      throw error
    }
  }

  // Get user statistics (for admin dashboard)
  async getUserStats(userId: string): Promise<UserStats> {
    if (!supabase) {
      return {
        lessonsCompleted: 0,
        quizzesPassed: 0,
        totalXP: 0,
        currentStreak: 0,
        lastLessonDate: ''
      }
    }

    try {
      // Get user progress
      const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)

      if (progressError) throw progressError

      // Get gamification data
      const { data: gamification, error: gamError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (gamError && gamError.code !== 'PGRST116') throw gamError

      // Get quiz results
      const { data: quizzes, error: quizError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .eq('passed', true)

      if (quizError) throw quizError

      const lessonsCompleted = progress?.filter(p => p.status === 'completed').length || 0
      const quizzesPassed = quizzes?.length || 0
      const totalXP = gamification?.total_xp || 0
      const currentStreak = gamification?.stats?.currentStreak || 0
      
      // Find last lesson date
      const lastLesson = progress
        ?.filter(p => p.completed_at)
        ?.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())?.[0]

      return {
        lessonsCompleted,
        quizzesPassed,
        totalXP,
        currentStreak,
        lastLessonDate: lastLesson?.completed_at || ''
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      return {
        lessonsCompleted: 0,
        quizzesPassed: 0,
        totalXP: 0,
        currentStreak: 0,
        lastLessonDate: ''
      }
    }
  }

  // Search users by email or name (admin only)
  async searchUsers(query: string): Promise<AdminUserView[]> {
    if (!supabase) return []

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          subscriptions (
            plan,
            status,
            hardship_approved
          )
        `)
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20)

      if (error) throw error

      return (data || []).map(user => ({
        ...user,
        subscription_status: user.subscriptions?.[0]?.plan || 'free',
        hardship_approved: user.subscriptions?.[0]?.hardship_approved || false,
        lessons_completed: 0, // Would need separate query for exact count
        last_active: user.updated_at
      }))
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  // Deactivate user account (admin only)
  async deactivateUser(userId: string): Promise<void> {
    if (!supabase) {
      console.warn('Supabase not configured - cannot deactivate user')
      return
    }

    try {
      // Update subscription status
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) throw error

      // Note: We don't delete the user account, just deactivate subscriptions
      // Actual user deletion would require additional considerations
    } catch (error) {
      console.error('Error deactivating user:', error)
      throw error
    }
  }

  // Get platform statistics (admin dashboard)
  async getPlatformStats(): Promise<{
    totalUsers: number
    activeUsers: number
    newUsersThisMonth: number
    totalLessonsCompleted: number
    averageLessonsPerUser: number
    topCountries: Array<{ country: string; count: number }>
  }> {
    if (!supabase) {
      return {
        totalUsers: 1,
        activeUsers: 1,
        newUsersThisMonth: 1,
        totalLessonsCompleted: 0,
        averageLessonsPerUser: 0,
        topCountries: [{ country: 'Demo', count: 1 }]
      }
    }

    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Get users created this month
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const { count: newUsersThisMonth } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonth.toISOString())

      // Get active users (those with recent progress)
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      const { count: activeUsers } = await supabase
        .from('user_progress')
        .select('user_id', { count: 'exact', head: true })
        .gte('updated_at', lastMonth.toISOString())

      // Get total lessons completed
      const { count: totalLessonsCompleted } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      // Get top countries
      const { data: countries } = await supabase
        .from('user_profiles')
        .select('country')
        .not('country', 'is', null)

      const countryCount = countries?.reduce((acc, { country }) => {
        acc[country] = (acc[country] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const topCountries = Object.entries(countryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([country, count]) => ({ country, count }))

      const averageLessonsPerUser = totalUsers ? 
        Math.round((totalLessonsCompleted || 0) / totalUsers) : 0

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        totalLessonsCompleted: totalLessonsCompleted || 0,
        averageLessonsPerUser,
        topCountries
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        totalLessonsCompleted: 0,
        averageLessonsPerUser: 0,
        topCountries: []
      }
    }
  }
}

export const userManagementService = new UserManagementService()