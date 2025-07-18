'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageSelector } from '@/components/ui/language-selector'
import { useTranslation } from '@/hooks/useTranslation'
import { 
  GraduationCap, 
  Brain, 
  Users, 
  Wifi, 
  MapPin, 
  Target, 
  BookOpen, 
  Award,
  ArrowRight,
  CheckCircle,
  Globe,
  Smartphone,
  Clock
} from 'lucide-react'

export default function LandingPage() {
  const { t, isLoading } = useTranslation()
  const router = useRouter()
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: t('features.aiPowered.title'),
      description: t('features.aiPowered.description')
    },
    {
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      title: t('features.multiStudent.title'),
      description: t('features.multiStudent.description')
    },
    {
      icon: <Wifi className="w-8 h-8 text-secondary" />,
      title: t('features.offline.title'),
      description: t('features.offline.description')
    },
    {
      icon: <Target className="w-8 h-8 text-orange-600" />,
      title: t('features.adaptive.title'),
      description: t('features.adaptive.description')
    },
    {
      icon: <Globe className="w-8 h-8 text-indigo-600" />,
      title: t('features.global.title'),
      description: t('features.global.description')
    },
    {
      icon: <Award className="w-8 h-8 text-pink-600" />,
      title: t('features.k12.title'),
      description: t('features.k12.description')
    }
  ]

  const steps = [
    {
      number: "01",
      title: "Take Diagnostic Test",
      description: "AI assesses your current knowledge level and places you at the right starting point"
    },
    {
      number: "02", 
      title: "Learn & Practice",
      description: "Work through personalized lessons with AI tutoring and interactive quizzes"
    },
    {
      number: "03",
      title: "Track Progress", 
      description: "Monitor your learning journey with detailed progress tracking and achievements"
    }
  ]

  const benefits = [
    "Perfect for homeschooling families",
    "Ideal for rural schools with limited resources", 
    "Great for GED preparation",
    "Works on shared computers",
    "Offline learning capability",
    "Self-paced learning"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Hagwon
                </h1>
                <p className="text-xs text-muted-foreground">AI-Powered Learning</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              <LanguageSelector />
              <div className="relative">
                <ThemeToggle />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => router.push('/login')}
              >
                <span className="hidden md:inline">{t('nav.signIn')}</span>
                <span className="md:hidden">{t('nav.login')}</span>
              </Button>
              <Button 
                size="sm"
                onClick={() => router.push('/student')}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                <span className="hidden sm:inline">{t('nav.getStarted')}</span>
                <span className="sm:hidden">{t('nav.start')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/20">
            <Smartphone className="w-4 h-4 mr-2" />
            {t('landing.hero.availableWorldwide')}
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-pink-600 bg-clip-text text-transparent">
            {t('landing.hero.title')}
            <br />
            <span className="text-foreground">{t('landing.hero.subtitle')}</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto px-4">
            {t('landing.hero.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-lg px-8 py-6"
              onClick={() => router.push('/student')}
            >
              Start Learning Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => router.push('/login')}
            >
              <Users className="w-5 h-5 mr-2" />
              Multi-Student Mode
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">K-12</div>
              <p className="text-muted-foreground">Complete curriculum from Kindergarten to Grade 12</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">GED</div>
              <p className="text-muted-foreground">Comprehensive GED preparation and practice</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">Global</div>
              <p className="text-muted-foreground">Designed for learners in all environments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Hagwon?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for diverse learning environments, from urban classrooms to rural communities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={`transition-all duration-300 theme-shadow-md hover:theme-shadow-xl border-2 ${
                  hoveredFeature === index ? 'border-primary/30 theme-shadow-xl' : 'border-border'
                }`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple, AI-powered learning process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-primary to-secondary text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Perfect for Every Learning Environment
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Whether you're in a bustling city school or a remote village classroom, 
                Hagwon adapts to your unique learning environment and needs.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                onClick={() => router.push('/student')}
              >
                Try It Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="p-6">
                  <BookOpen className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Homeschooling</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete curriculum with AI tutoring support for homeschooling families
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
                <CardContent className="p-6">
                  <MapPin className="w-8 h-8 text-secondary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Rural Schools</h3>
                  <p className="text-sm text-muted-foreground">
                    Offline-capable platform designed for areas with limited internet access
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
                <CardContent className="p-6">
                  <Users className="w-8 h-8 text-emerald-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Shared Devices</h3>
                  <p className="text-sm text-muted-foreground">
                    Multiple students can use the same computer with individual progress tracking
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                <CardContent className="p-6">
                  <Clock className="w-8 h-8 text-orange-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Self-Paced</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn at your own pace with AI that adapts to your learning speed
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of learners worldwide who are already using Hagwon to achieve their educational goals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-6"
              onClick={() => router.push('/student')}
            >
              <Users className="w-5 h-5 mr-2" />
              Multi-Student Mode
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-6"
              onClick={() => router.push('/login')}
            >
              Individual Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">Hagwon</span>
          </div>
          <p className="text-muted-foreground mb-4">
            AI-Powered Learning Platform for Everyone, Everywhere
          </p>
          <p className="text-muted-foreground/70 text-sm">
            © 2024 Hagwon. Making quality education accessible worldwide.
          </p>
        </div>
      </footer>
    </div>
  )
}