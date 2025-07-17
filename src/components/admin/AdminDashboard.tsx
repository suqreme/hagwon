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
import { supabase } from '@/lib/supabase'
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
  Trash2,
  AlertTriangle,
  LogOut,
  Settings
} from 'lucide-react'
import { T } from '@/components/ui/auto-translate'
import { useNotification } from '@/components/ui/notification'

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
  const { showNotification } = useNotification()
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<AdminUserView[]>([])
  const [hardshipRequests, setHardshipRequests] = useState<any[]>([])
  const [allRequests, setAllRequests] = useState<any[]>([])
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
      
      // Load hardship requests from Supabase
      let supabaseRequests: any[] = []
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('hardship_requests')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (data && !error) {
            supabaseRequests = data.map(req => ({
              ...req,
              type: 'hardship_application',
              user_name: req.user_id, // We'll need to join with user_profiles in the future
              user_email: req.user_id // Placeholder
            }))
            console.log('Loaded hardship requests from Supabase:', supabaseRequests.length)
          }
        } catch (supabaseError) {
          console.error('Error loading from Supabase:', supabaseError)
        }
      }
      
      // Load all requests from localStorage
      const allStoredRequests = JSON.parse(localStorage.getItem('admin_requests') || '[]')
      
      // Combine Supabase and localStorage requests, avoiding duplicates
      const combinedRequests = [...supabaseRequests, ...allStoredRequests]
      const uniqueRequests = combinedRequests.filter((request, index, self) => 
        index === self.findIndex(r => r.id === request.id)
      )
      
      setAllRequests(uniqueRequests)
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

  const handleApproveRequest = async (requestId: string, requestType: string) => {
    try {
      const request = allRequests.find(r => r.id === requestId)
      if (!request) return

      // Update in Supabase if it's a hardship request and we have Supabase
      if (requestType === 'hardship_application' && supabase) {
        try {
          const { error } = await supabase
            .from('hardship_requests')
            .update({
              status: 'approved',
              reviewed_at: new Date().toISOString(),
              reviewed_by: user?.id
            })
            .eq('id', requestId)
          
          if (error) {
            console.error('Supabase update error:', error)
          } else {
            console.log('Updated hardship request in Supabase')
          }
        } catch (supabaseError) {
          console.error('Supabase connection error:', supabaseError)
        }
      }

      // Update localStorage
      const updatedRequests = allRequests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: user?.email }
          : req
      )
      
      localStorage.setItem('admin_requests', JSON.stringify(updatedRequests))
      setAllRequests(updatedRequests)
      
      // If it's a hardship request, grant access
      if (requestType === 'hardship_application' && request.user_id) {
        // Grant hardship access
        const { subscriptionService } = require('@/services/subscriptionService')
        subscriptionService.grantHardshipAccess(request.user_id)
      }
      
      showNotification(`Request ${requestType} approved successfully!`, 'success')
    } catch (error) {
      console.error('Error approving request:', error)
      showNotification('Failed to approve request', 'error')
    }
  }

  const handleDenyRequest = async (requestId: string, requestType: string) => {
    try {
      // Update in Supabase if it's a hardship request and we have Supabase
      if (requestType === 'hardship_application' && supabase) {
        try {
          const { error } = await supabase
            .from('hardship_requests')
            .update({
              status: 'denied',
              reviewed_at: new Date().toISOString(),
              reviewed_by: user?.id
            })
            .eq('id', requestId)
          
          if (error) {
            console.error('Supabase update error:', error)
          } else {
            console.log('Updated hardship request in Supabase')
          }
        } catch (supabaseError) {
          console.error('Supabase connection error:', supabaseError)
        }
      }

      // Update localStorage
      const updatedRequests = allRequests.map(request => 
        request.id === requestId 
          ? { ...request, status: 'denied', reviewed_at: new Date().toISOString(), reviewed_by: user?.email }
          : request
      )
      
      localStorage.setItem('admin_requests', JSON.stringify(updatedRequests))
      setAllRequests(updatedRequests)
      
      showNotification(`Request ${requestType} denied.`, 'info')
    } catch (error) {
      console.error('Error denying request:', error)
      showNotification('Failed to deny request', 'error')
    }
  }

  const handleDeleteRequest = async (requestId: string, requestType: string) => {
    if (!confirm(`Are you sure you want to permanently delete this ${requestType}? This action cannot be undone.`)) {
      return
    }

    try {
      // Delete from Supabase if it's a hardship request and we have Supabase
      if (requestType === 'hardship_application' && supabase) {
        try {
          const { error } = await supabase
            .from('hardship_requests')
            .delete()
            .eq('id', requestId)
          
          if (error) {
            console.error('Supabase delete error:', error)
          } else {
            console.log('Deleted hardship request from Supabase')
          }
        } catch (supabaseError) {
          console.error('Supabase connection error:', supabaseError)
        }
      }

      // Delete from localStorage
      const updatedRequests = allRequests.filter(request => request.id !== requestId)
      localStorage.setItem('admin_requests', JSON.stringify(updatedRequests))
      setAllRequests(updatedRequests)
      
      showNotification(`Request deleted successfully.`, 'success')
    } catch (error) {
      console.error('Error deleting request:', error)
      showNotification('Failed to delete request', 'error')
    }
  }

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to permanently delete user ${userEmail}? This will remove all their data and cannot be undone.`)) {
      return
    }

    try {
      // Remove from users data
      const updatedUsers = users.filter(u => u.id !== userId)
      setUsers(updatedUsers)
      
      // Remove user's progress data
      localStorage.removeItem(`onboarding_${userId}`)
      localStorage.removeItem(`placement_${userId}`)
      localStorage.removeItem(`progress_${userId}`)
      localStorage.removeItem(`subscription_${userId}`)
      
      // Remove from classroom students if exists
      const classroomStudents = JSON.parse(localStorage.getItem('classroom_students') || '[]')
      const updatedClassroom = classroomStudents.filter((student: any) => student.id !== userId)
      localStorage.setItem('classroom_students', JSON.stringify(updatedClassroom))
      
      // Remove any requests from this user
      const updatedRequests = allRequests.filter(request => request.user_id !== userId)
      localStorage.setItem('admin_requests', JSON.stringify(updatedRequests))
      setAllRequests(updatedRequests)
      
      showNotification(`User ${userEmail} and all associated data deleted successfully.`, 'success')
      await loadAdminData() // Refresh data
    } catch (error) {
      console.error('Error deleting user:', error)
      showNotification('Failed to delete user', 'error')
    }
  }

  const handleClearAllData = async () => {
    if (!confirm('⚠️ DANGER: This will permanently delete ALL user data, requests, and progress. Type "DELETE ALL" to confirm.')) {
      return
    }
    
    const confirmation = prompt('Type "DELETE ALL" to confirm permanent deletion of all data:')
    if (confirmation !== 'DELETE ALL') {
      showNotification('Deletion cancelled - confirmation text did not match.', 'warning')
      return
    }

    try {
      // Clear all localStorage data
      localStorage.removeItem('admin_requests')
      localStorage.removeItem('classroom_students')
      
      // Clear all user-specific data
      users.forEach(user => {
        localStorage.removeItem(`onboarding_${user.id}`)
        localStorage.removeItem(`placement_${user.id}`)
        localStorage.removeItem(`progress_${user.id}`)
        localStorage.removeItem(`subscription_${user.id}`)
      })
      
      // Reset state
      setUsers([])
      setAllRequests([])
      
      showNotification('All data has been permanently deleted.', 'success')
      await loadAdminData() // Refresh data
    } catch (error) {
      console.error('Error clearing all data:', error)
      showNotification('Failed to clear all data', 'error')
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

        {/* All Community Requests */}
        {allRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-500" />
                <span><T>Community Requests</T></span>
                <Badge variant="secondary">{allRequests.filter(r => r.status === 'pending').length} pending</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allRequests.slice(0, 10).map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline" className="capitalize">
                            {request.type.replace('_', ' ')}
                          </Badge>
                          <Badge 
                            variant={request.status === 'pending' ? 'default' : request.status === 'approved' ? 'secondary' : 'destructive'}
                          >
                            {request.status}
                          </Badge>
                        </div>
                        
                        {request.type === 'language_request' && (
                          <>
                            <p className="font-medium"><T>Language Request</T>: {request.language_requested}</p>
                            <p className="text-sm text-muted-foreground">
                              <T>Submitted</T>: {new Date(request.submitted_at).toLocaleDateString()}
                            </p>
                          </>
                        )}
                        
                        {request.type === 'hardship_application' && (
                          <>
                            <p className="font-medium">{request.user_name || request.user_email}</p>
                            <p className="text-sm text-muted-foreground">{request.country}</p>
                            <p className="text-sm mt-1">{request.hardship_reason}</p>
                            <p className="text-xs text-muted-foreground">
                              <T>Submitted</T>: {new Date(request.submitted_at).toLocaleDateString()}
                            </p>
                          </>
                        )}
                        
                        {request.type === 'community_help_request' && (
                          <>
                            <p className="font-medium"><T>Help Request</T>: {request.request_type.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground">{request.location}</p>
                            <p className="text-sm text-muted-foreground"><T>Contact</T>: {request.contact_info}</p>
                            <p className="text-sm mt-1">{request.request_details}</p>
                            <p className="text-xs text-muted-foreground">
                              <T>Submitted</T>: {new Date(request.submitted_at).toLocaleDateString()}
                            </p>
                          </>
                        )}
                        
                        {request.reviewed_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            <T>Reviewed by</T> {request.reviewed_by} <T>on</T> {new Date(request.reviewed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {request.status === 'pending' ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(request.id, request.type)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <T>Approve</T>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDenyRequest(request.id, request.type)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              <T>Deny</T>
                            </Button>
                          </>
                        ) : null}
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteRequest(request.id, request.type)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          <T>Delete</T>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {allRequests.length > 10 && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      <T>Showing 10 of</T> {allRequests.length} <T>total requests</T>
                    </p>
                  </div>
                )}
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
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {user.lessons_completed} <T>lessons completed</T>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <T>Joined</T> {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id, user.email)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      <T>Delete</T>
                    </Button>
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

        {/* Data Management Section */}
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span><T>Data Management</T></span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                <T>Danger Zone</T>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                <T>These actions are permanent and cannot be undone. Use with extreme caution.</T>
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded border-red-200 dark:border-red-800">
                  <div>
                    <p className="font-medium"><T>Clear All Platform Data</T></p>
                    <p className="text-sm text-muted-foreground">
                      <T>Delete all users, requests, progress data, and settings</T>
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleClearAllData}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    <T>Delete All Data</T>
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-400">
                      <T>Export Data (Coming Soon)</T>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <T>Download all platform data as JSON backup</T>
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    <T>Export Data</T>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>⚠️ <T>Data deletion is permanent and cannot be recovered</T></p>
              <p>📊 <T>Always export data before performing destructive operations</T></p>
              <p>🔒 <T>Only administrators can perform these actions</T></p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}