import { supabase } from '@/lib/supabase'

interface SubscriptionStatus {
  plan: 'free' | 'supporter' | 'sponsor' | 'hardship'
  status: 'active' | 'inactive' | 'pending' | 'cancelled'
  expiresAt?: string
  features: {
    dailyLessonLimit: number | null // null = unlimited
    analyticsAccess: boolean
    prioritySupport: boolean
    offlineDownloads: boolean
    certificateGeneration: boolean
    scholarshipFunding: boolean
  }
}

interface HardshipRequest {
  id: string
  user_id: string
  hardship_reason: string
  status: 'pending' | 'approved' | 'denied'
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  user_profiles?: {
    full_name: string
    email: string
    country: string
  }
}

class SubscriptionService {
  private storageKey = 'user_subscription'

  getUserSubscription(userId: string): SubscriptionStatus {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_${userId}`)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    }

    // Default free plan
    return {
      plan: 'free',
      status: 'active',
      features: {
        dailyLessonLimit: 3,
        analyticsAccess: false,
        prioritySupport: false,
        offlineDownloads: false,
        certificateGeneration: false,
        scholarshipFunding: false
      }
    }
  }

  updateSubscription(userId: string, subscription: SubscriptionStatus): void {
    try {
      localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(subscription))
    } catch (error) {
      console.error('Error saving subscription:', error)
    }
  }

  subscribeToPlan(userId: string, planId: string): SubscriptionStatus {
    const planFeatures = this.getPlanFeatures(planId)
    const subscription: SubscriptionStatus = {
      plan: planId as any,
      status: 'active',
      expiresAt: planId !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      features: planFeatures
    }

    this.updateSubscription(userId, subscription)
    return subscription
  }

  grantHardshipAccess(userId: string): SubscriptionStatus {
    const subscription: SubscriptionStatus = {
      plan: 'hardship',
      status: 'active',
      features: {
        dailyLessonLimit: null, // unlimited
        analyticsAccess: true,
        prioritySupport: true,
        offlineDownloads: true,
        certificateGeneration: true,
        scholarshipFunding: false
      }
    }

    this.updateSubscription(userId, subscription)
    return subscription
  }

  checkLessonAccess(userId: string): { allowed: boolean; reason?: string } {
    const subscription = this.getUserSubscription(userId)
    
    if (subscription.status !== 'active') {
      return { allowed: false, reason: 'Subscription not active' }
    }

    if (subscription.features.dailyLessonLimit === null) {
      return { allowed: true } // unlimited
    }

    // Check daily lesson count
    const today = new Date().toDateString()
    const dailyKey = `daily_lessons_${userId}_${today}`
    const todayCount = parseInt(localStorage.getItem(dailyKey) || '0')

    if (todayCount >= subscription.features.dailyLessonLimit) {
      return { 
        allowed: false, 
        reason: `Daily limit of ${subscription.features.dailyLessonLimit} lessons reached. Upgrade for unlimited access.`
      }
    }

    return { allowed: true }
  }

  recordLessonAccess(userId: string): void {
    const today = new Date().toDateString()
    const dailyKey = `daily_lessons_${userId}_${today}`
    const todayCount = parseInt(localStorage.getItem(dailyKey) || '0')
    localStorage.setItem(dailyKey, (todayCount + 1).toString())
  }

  private getPlanFeatures(planId: string) {
    switch (planId) {
      case 'supporter':
        return {
          dailyLessonLimit: null,
          analyticsAccess: true,
          prioritySupport: true,
          offlineDownloads: true,
          certificateGeneration: true,
          scholarshipFunding: true
        }
      case 'sponsor':
        return {
          dailyLessonLimit: null,
          analyticsAccess: true,
          prioritySupport: true,
          offlineDownloads: true,
          certificateGeneration: true,
          scholarshipFunding: true
        }
      case 'free':
      default:
        return {
          dailyLessonLimit: 3,
          analyticsAccess: false,
          prioritySupport: false,
          offlineDownloads: false,
          certificateGeneration: false,
          scholarshipFunding: false
        }
    }
  }

  getLessonUsageToday(userId: string): number {
    const today = new Date().toDateString()
    const dailyKey = `daily_lessons_${userId}_${today}`
    return parseInt(localStorage.getItem(dailyKey) || '0')
  }

  getRemainingLessons(userId: string): number | null {
    const subscription = this.getUserSubscription(userId)
    
    if (subscription.features.dailyLessonLimit === null) {
      return null // unlimited
    }

    const used = this.getLessonUsageToday(userId)
    return Math.max(0, subscription.features.dailyLessonLimit - used)
  }

  // Supabase integration methods
  async getSubscriptionStats(): Promise<{
    totalUsers: number
    freeUsers: number
    supporterUsers: number
    sponsorUsers: number
    hardshipUsers: number
    monthlyRevenue: number
  }> {
    if (!supabase) {
      return {
        totalUsers: 1,
        freeUsers: 1,
        supporterUsers: 0,
        sponsorUsers: 0,
        hardshipUsers: 0,
        monthlyRevenue: 0
      }
    }

    try {
      // Get subscription counts
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('status', 'active')

      const stats = {
        totalUsers: subscriptions?.length || 0,
        freeUsers: 0,
        supporterUsers: 0,
        sponsorUsers: 0,
        hardshipUsers: 0,
        monthlyRevenue: 0
      }

      subscriptions?.forEach(sub => {
        switch (sub.plan) {
          case 'free':
            stats.freeUsers++
            break
          case 'supporter':
            stats.supporterUsers++
            stats.monthlyRevenue += 5
            break
          case 'sponsor':
            stats.sponsorUsers++
            stats.monthlyRevenue += 25
            break
          case 'hardship':
            stats.hardshipUsers++
            break
        }
      })

      // Add free users (those without subscription records)
      const { count: totalUserCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      stats.freeUsers = (totalUserCount || 0) - (subscriptions?.length || 0)
      stats.totalUsers = totalUserCount || 0

      return stats
    } catch (error) {
      console.error('Error fetching subscription stats:', error)
      return {
        totalUsers: 0,
        freeUsers: 0,
        supporterUsers: 0,
        sponsorUsers: 0,
        hardshipUsers: 0,
        monthlyRevenue: 0
      }
    }
  }

  async submitHardshipRequest(userId: string, reason: string): Promise<void> {
    if (!supabase) {
      console.warn('Supabase not configured - cannot submit hardship request')
      return
    }

    try {
      const { error } = await supabase
        .from('hardship_requests')
        .insert({
          user_id: userId,
          hardship_reason: reason,
          status: 'pending',
          submitted_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error submitting hardship request:', error)
      throw error
    }
  }

  async getPendingHardshipRequests(): Promise<HardshipRequest[]> {
    if (!supabase) return []

    try {
      const { data, error } = await supabase
        .from('hardship_requests')
        .select(`
          *,
          user_profiles (
            full_name,
            email,
            country
          )
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching hardship requests:', error)
      return []
    }
  }

  async approveHardshipRequest(userId: string, reviewedBy: string): Promise<void> {
    if (!supabase) {
      console.warn('Supabase not configured - cannot approve hardship request')
      return
    }

    try {
      // Update hardship request
      const { error: requestError } = await supabase
        .from('hardship_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewedBy
        })
        .eq('user_id', userId)
        .eq('status', 'pending')

      if (requestError) throw requestError

      // Create/update subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan: 'hardship',
          status: 'active',
          hardship_approved: true,
          updated_at: new Date().toISOString()
        })

      if (subError) throw subError
    } catch (error) {
      console.error('Error approving hardship request:', error)
      throw error
    }
  }

  async denyHardshipRequest(userId: string, reviewedBy: string): Promise<void> {
    if (!supabase) {
      console.warn('Supabase not configured - cannot deny hardship request')
      return
    }

    try {
      const { error } = await supabase
        .from('hardship_requests')
        .update({
          status: 'denied',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewedBy
        })
        .eq('user_id', userId)
        .eq('status', 'pending')

      if (error) throw error
    } catch (error) {
      console.error('Error denying hardship request:', error)
      throw error
    }
  }
}

export const subscriptionService = new SubscriptionService()