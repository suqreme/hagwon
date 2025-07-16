'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UserMenu } from '@/components/ui/user-menu'
import { T } from '@/components/ui/auto-translate'
import { Heart, Users, Laptop, Wifi, Book, HelpCircle } from 'lucide-react'

export default function CommunityHelpPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [requestType, setRequestType] = useState('')
  const [requestDetails, setRequestDetails] = useState('')
  const [location, setLocation] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const requestTypes = [
    {
      id: 'equipment',
      title: 'Equipment Request',
      description: 'Request computers, tablets, or learning materials for your community',
      icon: <Laptop className="w-8 h-8" />,
      color: 'text-blue-500'
    },
    {
      id: 'internet',
      title: 'Internet Access',
      description: 'Request help with internet connectivity for educational purposes',
      icon: <Wifi className="w-8 h-8" />,
      color: 'text-green-500'
    },
    {
      id: 'classroom',
      title: 'Classroom Setup',
      description: 'Request help setting up a learning space or classroom',
      icon: <Book className="w-8 h-8" />,
      color: 'text-purple-500'
    },
    {
      id: 'other',
      title: 'Other Support',
      description: 'Other educational support needs for your community',
      icon: <HelpCircle className="w-8 h-8" />,
      color: 'text-orange-500'
    }
  ]

  const handleRequestSubmit = async () => {
    if (!requestType || !requestDetails.trim() || !location.trim() || !contactInfo.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    
    try {
      // Create community help request object
      const helpRequest = {
        id: `help_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: user?.id || 'anonymous',
        user_email: user?.email || contactInfo,
        request_type: requestType,
        request_details: requestDetails,
        location: location,
        contact_info: contactInfo,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        type: 'community_help_request'
      }

      // Store in localStorage for admin to review
      const existingRequests = JSON.parse(localStorage.getItem('admin_requests') || '[]')
      existingRequests.push(helpRequest)
      localStorage.setItem('admin_requests', JSON.stringify(existingRequests))

      // Clear form and close
      setRequestType('')
      setRequestDetails('')
      setLocation('')
      setContactInfo('')
      setShowRequestForm(false)
      
      alert('Your community help request has been submitted! We will review it and reach out if we can assist.')
      
    } catch (error) {
      console.error('Error submitting help request:', error)
      alert('Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground"><T>Loading...</T></p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="mb-2"
              >
                <T>← Back to Dashboard</T>
              </Button>
              <h1 className="text-2xl font-bold text-foreground"><T>Community Help</T></h1>
              <p className="text-muted-foreground"><T>Request support for your educational community</T></p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user && <UserMenu />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Impact Statement */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="py-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Heart className="w-16 h-16 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                <T>Supporting Education Worldwide</T>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                <T>We believe every community deserves access to quality education. If your community needs educational support, equipment, or resources, we're here to help connect you with donors and volunteers.</T>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Request Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {requestTypes.map((type) => (
            <Card key={type.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={type.color}>
                    {type.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg"><T>{type.title}</T></CardTitle>
                    <p className="text-sm text-muted-foreground"><T>{type.description}</T></p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => {
                    setRequestType(type.id)
                    setShowRequestForm(true)
                  }}
                >
                  <T>Request {type.title}</T>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span><T>How Community Support Works</T></span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2"><T>Submit Request</T></h3>
                <p className="text-sm text-muted-foreground">
                  <T>Tell us about your community's educational needs and what support would help most</T>
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2"><T>Review & Match</T></h3>
                <p className="text-sm text-muted-foreground">
                  <T>Our team reviews your request and works to match you with donors or volunteers</T>
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2"><T>Get Support</T></h3>
                <p className="text-sm text-muted-foreground">
                  <T>Receive the educational resources and support your community needs</T>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle><T>Community Help Request</T></CardTitle>
                <p className="text-sm text-muted-foreground">
                  <T>Tell us about your community's needs and we'll work to help</T>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <T>Request Type</T>
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {requestTypes.find(t => t.id === requestType)?.title}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <T>Describe your community's needs</T> *
                  </label>
                  <textarea
                    value={requestDetails}
                    onChange={(e) => setRequestDetails(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Please provide details about your community, the number of students, current challenges, and how this support would help..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <T>Location (Country, City/Region)</T> *
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., Nigeria, Lagos State"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <T>Contact Information</T> *
                  </label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Email or phone number where we can reach you"
                    required
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <Button 
                    className="flex-1" 
                    onClick={handleRequestSubmit}
                    disabled={submitting || !requestType || !requestDetails.trim() || !location.trim() || !contactInfo.trim()}
                  >
                    {submitting ? <T>Submitting...</T> : <T>Submit Request</T>}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowRequestForm(false)
                      setRequestType('')
                      setRequestDetails('')
                      setLocation('')
                      setContactInfo('')
                    }}
                  >
                    <T>Cancel</T>
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  <T>Requests are reviewed by our team. We'll contact you if we can provide support or connect you with donors.</T>
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}