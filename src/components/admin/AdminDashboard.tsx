'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/contexts/AuthContext'
import { userManagementService, type AdminUserView } from '@/services/userManagementService'
import { subscriptionService } from '@/services/subscriptionService'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Globe,
  Heart,
  BookOpen,
  Crown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Home,
  LogOut,
  Settings
} from 'lucide-react'
import { T } from '@/components/ui/auto-translate'

interface PlatformStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  totalLessonsCompleted: number
  averageLessonsPerUser: number
  topCountries: Array<{ country: string; count: number }>
}

interface SubscriptionStats {
  totalUsers: number
  freeUsers: number
  supporterUsers: number
  sponsorUsers: number
  hardshipUsers: number
  monthlyRevenue: number
}

export default function AdminDashboard() {
  const { user, isAdmin, signOut } = useAuth()
  const router = useRouter()
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<AdminUserView[]>([])
  const [hardshipRequests, setHardshipRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAdmin()) {
      loadAdminData()
    }
  }, [user])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      
      // Load all admin data in parallel
      const [platform, subscription, users, hardship] = await Promise.all([
        userManagementService.getPlatformStats(),
        subscriptionService.getSubscriptionStats(),
        userManagementService.getAllUsers(1, 10),
        subscriptionService.getPendingHardshipRequests()
      ])

      setPlatformStats(platform)
      setSubscriptionStats(subscription)
      setRecentUsers(users.users)
      setHardshipRequests(hardship)
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveHardship = async (userId: string) => {
    if (!user) return
    
    try {
      await subscriptionService.approveHardshipRequest(userId, user.id)
      await loadAdminData() // Refresh data
    } catch (error) {
      console.error('Error approving hardship request:', error)
    }
  }

  const handleDenyHardship = async (userId: string) => {
    if (!user) return
    
    try {
      await subscriptionService.denyHardshipRequest(userId, user.id)
      await loadAdminData() // Refresh data
    } catch (error) {
      console.error('Error denying hardship request:', error)
    }
  }

  const handleUpdateUserRole = async (userId: string, role: 'student' | 'teacher' | 'admin') => {
    try {
      await userManagementService.updateUserRole(userId, role)
      await loadAdminData() // Refresh data
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2"><T>Access Denied</T></h2>
            <p className="text-muted-foreground">
              <T>You need administrator privileges to access this page.</T>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground"><T>Loading admin dashboard...</T></p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground"><T>Admin Dashboard</T></h1>
                  <p className="text-sm text-muted-foreground"><T>Hagwon Platform Management</T></p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard?view=student')}
              >
                <Home className="w-4 h-4 mr-2" />
<T>Student View</T>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={loadAdminData}
              >
<T>Refresh Data</T>
              </Button>
              
              <ThemeToggle />
              
              <div className="flex items-center space-x-2 px-3 py-2 bg-primary/10 rounded-lg">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {user?.email?.split('@')[0] || 'Admin'}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{platformStats?.totalUsers || 0}</p>
                  <p className="text-sm text-muted-foreground"><T>Total Users</T></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{platformStats?.activeUsers || 0}</p>
                  <p className="text-sm text-muted-foreground"><T>Active Users</T></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{platformStats?.totalLessonsCompleted || 0}</p>
                  <p className="text-sm text-muted-foreground"><T>Lessons Completed</T></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">${subscriptionStats?.monthlyRevenue || 0}</p>
                  <p className="text-sm text-muted-foreground"><T>Monthly Revenue</T></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5" />
              <span><T>Subscription Overview</T></span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-500">{subscriptionStats?.freeUsers || 0}</p>
                <p className="text-sm text-muted-foreground"><T>Free Users</T></p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">{subscriptionStats?.supporterUsers || 0}</p>
                <p className="text-sm text-muted-foreground"><T>Supporters ($5/mo)</T></p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-500">{subscriptionStats?.sponsorUsers || 0}</p>
                <p className="text-sm text-muted-foreground"><T>Sponsors ($25/mo)</T></p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">{subscriptionStats?.hardshipUsers || 0}</p>
                <p className="text-sm text-muted-foreground"><T>Hardship Approved</T></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hardship Requests */}
        {hardshipRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span><T>Pending Hardship Requests</T></span>
                <Badge variant="destructive">{hardshipRequests.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hardshipRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{request.user_profiles?.full_name || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">{request.user_profiles?.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.user_profiles?.country || 'Country not specified'}
                        </p>
                        <div className="mt-2">
                          <p className="text-sm">{request.hardship_reason}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveHardship(request.user_id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
<T>Approve</T>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDenyHardship(request.user_id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
<T>Deny</T>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span><T>Recent Users</T></span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="font-medium">{user.full_name || 'Unknown Name'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.subscription_status === 'free' ? 'outline' : 'default'}>
                        {user.subscription_status}
                      </Badge>
                      {user.hardship_approved && (
                        <Badge variant="default" className="bg-green-500">
  <T>Hardship Approved</T>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {user.lessons_completed} <T>lessons completed</T>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <T>Joined</T> {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5" />
              <span><T>Top Countries</T></span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {platformStats?.topCountries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                    <span className="font-medium">{country.country}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24">
                      <Progress 
                        value={(country.count / (platformStats?.totalUsers || 1)) * 100} 
                        className="h-2"
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{country.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}