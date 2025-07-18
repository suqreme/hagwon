import { supabase } from '@/lib/supabase'
import { getStripe, SUBSCRIPTION_PLANS, type PlanId } from '@/lib/stripe'

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

  private getDefaultSubscription(): SubscriptionStatus {
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

  async getUserSubscription(userId: string): Promise<SubscriptionStatus> {
    // Try to load from Supabase first, but handle missing tables gracefully
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
        
        if (data && data.length > 0 && !error) {
          const subscription = data[0] // Get the most recent subscription
          return {
            plan: subscription.plan || 'free',
            status: subscription.status || 'active',
            expiresAt: subscription.current_period_end,
            features: this.getPlanFeatures(subscription.plan || 'free')
          }
        }
        
        // If no subscription found (not an error), create default free subscription
        if ((!data || data.length === 0) && !error) {
          const defaultSubscription = this.getDefaultSubscription()
          // Try to create the subscription record
          try {
            await this.updateSubscription(userId, defaultSubscription)
            return defaultSubscription
          } catch (createError) {
            console.error('Error creating default subscription:', createError)
            return defaultSubscription
          }
        }
      } catch (error) {
        console.error('Error loading subscription from Supabase (table may not exist):', error)
        // If table doesn't exist, fallback immediately to localStorage/default
      }
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(`${this.storageKey}_${userId}`)
      if (stored) {
        const storedSubscription = JSON.parse(stored)
        // Ensure status is active for stored subscriptions
        if (!storedSubscription.status) {
          storedSubscription.status = 'active'
        }
        return storedSubscription
      }
    } catch (error) {
      console.error('Error loading subscription from localStorage:', error)
    }

    // Default free plan with active status
    const defaultSub = this.getDefaultSubscription()
    defaultSub.status = 'active' // Ensure it's active
    
    // Store the default subscription to localStorage
    try {
      localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(defaultSub))
    } catch (error) {
      console.error('Error storing default subscription to localStorage:', error)
    }
    
    return defaultSub
  }

  async updateSubscription(userId: string, subscription: SubscriptionStatus): Promise<void> {
    // Try to save to Supabase first
    if (supabase) {
      try {
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan: subscription.plan,
            status: subscription.status,
            current_period_end: subscription.expiresAt,
            updated_at: new Date().toISOString()
          })
        
        if (error) {
          console.error('Supabase save error:', error)
          throw error
        }
      } catch (error) {
        console.error('Error saving subscription to Supabase:', error)
      }
    }

    // Also save to localStorage as fallback
    try {
      localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(subscription))
    } catch (error) {
      console.error('Error saving subscription to localStorage:', error)
    }
  }

  async subscribeToPlan(userId: string, planId: string): Promise<SubscriptionStatus> {
    const planFeatures = this.getPlanFeatures(planId)
    const subscription: SubscriptionStatus = {
      plan: planId as any,
      status: 'active',
      expiresAt: planId !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      features: planFeatures
    }

    await this.updateSubscription(userId, subscription)
    return subscription
  }

  async grantHardshipAccess(userId: string): Promise<SubscriptionStatus> {
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

    await this.updateSubscription(userId, subscription)
    return subscription
  }

  async checkLessonAccess(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const subscription = await this.getUserSubscription(userId)
      
      // Be more permissive with subscription status - allow if status is active or if it's default/free
      if (subscription.status !== 'active' && subscription.plan !== 'free') {
        return { allowed: false, reason: 'Subscription not active' }
      }

      if (subscription.features.dailyLessonLimit === null || subscription.plan === 'hardship') {
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
    } catch (error) {
      console.error('Error checking lesson access:', error)
      // If there's an error, allow access with default free tier limits
      return { allowed: true }
    }
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

  async getRemainingLessons(userId: string): Promise<number | null> {
    const subscription = await this.getUserSubscription(userId)
    
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
            stats.monthlyRevenue += 10
            break
          case 'sponsor':
            stats.sponsorUsers++
            stats.monthlyRevenue += 30
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

  // Stripe integration methods
  async createCheckoutSession(userId: string, planId: PlanId): Promise<string> {
    if (planId === 'free') {
      throw new Error('Cannot create checkout for free plan')
    }

    const plan = SUBSCRIPTION_PLANS[planId]
    if (!plan.stripePriceId) {
      throw new Error(`No Stripe price ID configured for plan: ${planId}`)
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId: userId,
          planId: planId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      // Redirect to Stripe Checkout
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe not loaded')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      if (error) {
        throw error
      }

      return sessionId
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  async createPortalSession(userId: string): Promise<string> {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create portal session')
      }

      const { url } = await response.json()
      return url
    } catch (error) {
      console.error('Error creating portal session:', error)
      throw error
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    try {
      // Get the portal URL and redirect user to manage subscription
      const portalUrl = await this.createPortalSession(userId)
      window.open(portalUrl, '_blank')
    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw error
    }
  }

  // Get subscription plans for UI
  getSubscriptionPlans() {
    return SUBSCRIPTION_PLANS
  }

  // Check if a plan requires Stripe checkout
  requiresStripeCheckout(planId: string): boolean {
    return planId !== 'free' && planId !== 'hardship'
  }
}

export const subscriptionService = new SubscriptionService()