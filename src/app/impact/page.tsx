'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { MapPin, Users, Heart, Globe, Camera, Mail, Phone } from 'lucide-react'
import { T } from '@/components/ui/auto-translate'

interface EducationCenter {
  id: string
  name: string
  location: {
    country: string
    city: string
    coordinates: [number, number] // [lat, lng]
  }
  story: string
  studentsServed: number
  donorName?: string
  photos: string[]
  contactEmail: string
  establishedDate: string
  status: 'active' | 'requesting' | 'funded'
  monthlyImpact: {
    newStudents: number
    lessonsCompleted: number
    certificatesEarned: number
  }
}

interface DonationStats {
  totalCenters: number
  totalStudents: number
  totalDonors: number
  countriesReached: number
}

export default function ImpactPage() {
  const router = useRouter()
  const [centers, setCenters] = useState<EducationCenter[]>([])
  const [stats, setStats] = useState<DonationStats>({
    totalCenters: 0,
    totalStudents: 0,
    totalDonors: 0,
    countriesReached: 0
  })
  const [selectedCenter, setSelectedCenter] = useState<EducationCenter | null>(null)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [formData, setFormData] = useState({
    communityName: '',
    location: '',
    description: '',
    contactEmail: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadImpactData()
  }, [])

  const loadImpactData = () => {
    // Demo data - in real app, this would come from API
    const demoCenters: EducationCenter[] = [
      {
        id: '1',
        name: 'Kibera Learning Hub',
        location: {
          country: 'Kenya',
          city: 'Nairobi',
          coordinates: [-1.2921, 36.8219]
        },
        story: 'Started in 2023, this center serves students in one of Nairobi\'s largest urban slums. Thanks to donor support, we\'ve provided computers and internet access to help students learn math and English.',
        studentsServed: 45,
        donorName: 'Tech for Good Foundation',
        photos: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        contactEmail: 'kibera@hagwon.app',
        establishedDate: '2023-08-15',
        status: 'active',
        monthlyImpact: {
          newStudents: 8,
          lessonsCompleted: 234,
          certificatesEarned: 12
        }
      },
      {
        id: '2',
        name: 'Rural Guatemala Education Center',
        location: {
          country: 'Guatemala',
          city: 'San Marcos',
          coordinates: [14.9667, -91.8]
        },
        story: 'This center serves indigenous Mayan communities in rural Guatemala. Students learn both Spanish and English while preserving their cultural heritage.',
        studentsServed: 32,
        donorName: 'Anonymous Donor',
        photos: ['/api/placeholder/400/300'],
        contactEmail: 'guatemala@hagwon.app',
        establishedDate: '2023-06-20',
        status: 'active',
        monthlyImpact: {
          newStudents: 5,
          lessonsCompleted: 156,
          certificatesEarned: 8
        }
      },
      {
        id: '3',
        name: 'Syrian Refugee Learning Center',
        location: {
          country: 'Jordan',
          city: 'Amman',
          coordinates: [31.9539, 35.9106]
        },
        story: 'Supporting Syrian refugee families with essential education. Many students here are working toward their high school equivalency while learning valuable life skills.',
        studentsServed: 67,
        donorName: 'Global Education Alliance',
        photos: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        contactEmail: 'jordan@hagwon.app',
        establishedDate: '2023-04-10',
        status: 'active',
        monthlyImpact: {
          newStudents: 12,
          lessonsCompleted: 345,
          certificatesEarned: 18
        }
      },
      {
        id: '4',
        name: 'Rural Philippines Community Center',
        location: {
          country: 'Philippines',
          city: 'Mindanao',
          coordinates: [7.8731, 125.2685]
        },
        story: 'Requesting support to establish a learning center for fishing communities. Need computers, internet connection, and educational materials.',
        studentsServed: 0,
        photos: [],
        contactEmail: 'mindanao.request@gmail.com',
        establishedDate: '2024-01-10',
        status: 'requesting',
        monthlyImpact: {
          newStudents: 0,
          lessonsCompleted: 0,
          certificatesEarned: 0
        }
      }
    ]

    const demoStats: DonationStats = {
      totalCenters: demoCenters.filter(c => c.status === 'active').length,
      totalStudents: demoCenters.reduce((sum, c) => sum + c.studentsServed, 0),
      totalDonors: 3,
      countriesReached: new Set(demoCenters.map(c => c.location.country)).size
    }

    setCenters(demoCenters)
    setStats(demoStats)
  }

  const handleRequestHelp = () => {
    setShowRequestForm(true)
  }

  const submitCommunityRequest = async () => {
    if (!formData.communityName.trim() || !formData.location.trim() || !formData.description.trim() || !formData.contactEmail.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    
    try {
      // Create community help request object
      const helpRequest = {
        id: `community_help_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        community_name: formData.communityName,
        location: formData.location,
        description: formData.description,
        contact_email: formData.contactEmail,
        request_type: 'Community Support',
        status: 'pending',
        submitted_at: new Date().toISOString(),
        type: 'help_request'
      }

      // Store in localStorage for admin to review
      const existingRequests = JSON.parse(localStorage.getItem('admin_requests') || '[]')
      existingRequests.push(helpRequest)
      localStorage.setItem('admin_requests', JSON.stringify(existingRequests))

      // Clear form and close
      setFormData({
        communityName: '',
        location: '',
        description: '',
        contactEmail: ''
      })
      setShowRequestForm(false)
      
      alert('Your community support request has been submitted! We will review it and contact you within 1-2 weeks.')
      
    } catch (error) {
      console.error('Error submitting community request:', error)
      alert('Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
              <h1 className="text-2xl font-bold text-foreground"><T>Global Impact Map</T></h1>
              <p className="text-muted-foreground"><T>See how education is changing lives around the world</T></p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleRequestHelp}>
                <T>Request Help for Your Community</T>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalCenters}</p>
                  <p className="text-sm text-muted-foreground"><T>Active Centers</T></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  <p className="text-sm text-muted-foreground"><T>Students Served</T></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalDonors}</p>
                  <p className="text-sm text-muted-foreground"><T>Generous Donors</T></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.countriesReached}</p>
                  <p className="text-sm text-muted-foreground"><T>Countries Reached</T></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Placeholder */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle><T>Education Centers Worldwide</T></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-muted flex items-center justify-center border">
              <div className="text-center">
                <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground"><T>Interactive map coming soon</T></p>
                <p className="text-sm text-muted-foreground"><T>Click on the centers below to explore their stories</T></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education Centers */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground"><T>Education Centers</T></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {centers.map((center) => (
              <Card key={center.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedCenter(center)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{center.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {center.location.city}, {center.location.country}
                      </p>
                    </div>
                    <Badge variant={
                      center.status === 'active' ? 'default' : 
                      center.status === 'requesting' ? 'secondary' : 'outline'
                    }>
                      {center.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm">{center.story.slice(0, 150)}...</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">{center.studentsServed}</p>
                      <p className="text-muted-foreground"><T>Students Served</T></p>
                    </div>
                    <div>
                      <p className="font-medium">{center.monthlyImpact.lessonsCompleted}</p>
                      <p className="text-muted-foreground"><T>Lessons/Month</T></p>
                    </div>
                  </div>
                  
                  {center.donorName && (
                    <div className="text-sm">
                      <p className="text-muted-foreground"><T>Powered by</T>:</p>
                      <p className="font-medium">{center.donorName}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Center Detail Modal */}
        {selectedCenter && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{selectedCenter.name}</CardTitle>
                    <p className="text-muted-foreground">
                      {selectedCenter.location.city}, {selectedCenter.location.country}
                    </p>
                  </div>
                  <Badge variant={selectedCenter.status === 'active' ? 'default' : 'secondary'}>
                    {selectedCenter.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2"><T>Our Story</T></h3>
                  <p className="text-sm">{selectedCenter.story}</p>
                </div>
                
                {selectedCenter.status === 'active' && (
                  <>
                    <div>
                      <h3 className="font-semibold mb-2"><T>Monthly Impact</T></h3>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{selectedCenter.monthlyImpact.newStudents}</p>
                          <p className="text-muted-foreground"><T>New Students</T></p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-500">{selectedCenter.monthlyImpact.lessonsCompleted}</p>
                          <p className="text-muted-foreground"><T>Lessons Completed</T></p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-500">{selectedCenter.monthlyImpact.certificatesEarned}</p>
                          <p className="text-muted-foreground"><T>Certificates Earned</T></p>
                        </div>
                      </div>
                    </div>
                    
                    {selectedCenter.donorName && (
                      <div>
                        <h3 className="font-semibold mb-2"><T>Made Possible By</T></h3>
                        <p className="text-primary font-medium">{selectedCenter.donorName}</p>
                        <p className="text-sm text-muted-foreground"><T>Thank you for making education accessible!</T></p>
                      </div>
                    )}
                  </>
                )}
                
                <div>
                  <h3 className="font-semibold mb-2"><T>Contact Information</T></h3>
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4" />
                    <span>{selectedCenter.contactEmail}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <T>Established</T>: {new Date(selectedCenter.establishedDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setSelectedCenter(null)}>
                    <T>Close</T>
                  </Button>
                  {selectedCenter.status === 'requesting' && (
                    <Button>
                      <T>Sponsor This Center</T>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Request Form */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle><T>Request Help for Your Community</T></CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <T>Community/Organization Name</T>
                  </label>
                  <input
                    type="text"
                    value={formData.communityName}
                    onChange={(e) => setFormData({...formData, communityName: e.target.value})}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Your community center name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <T>Location</T>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="City, Country"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <T>Tell us about your community and education needs</T>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full h-32 px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Describe your community, the students you serve, and what kind of support you need..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <T>Contact Email</T>
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="your-email@example.com"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <Button 
                    className="flex-1" 
                    onClick={submitCommunityRequest}
                    disabled={submitting || !formData.communityName.trim() || !formData.location.trim() || !formData.description.trim() || !formData.contactEmail.trim()}
                  >
                    {submitting ? 'Submitting...' : <T>Submit Request</T>}
                  </Button>
                  <Button variant="outline" onClick={() => setShowRequestForm(false)}>
                    <T>Cancel</T>
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  <T>We'll review your request and connect you with potential donors within 1-2 weeks.</T>
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}