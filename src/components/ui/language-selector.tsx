'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { languageService } from '@/services/languageService'
import { useTranslation } from '@/hooks/useTranslation'
import { getLanguageByCode } from '@/lib/languages'
import { Globe, Check, X, MapPin, Monitor, User, Plus } from 'lucide-react'

interface LanguageSelectorProps {
  onClose?: () => void
}

export function LanguageSelector({ onClose }: LanguageSelectorProps) {
  const { t, changeLanguage, supportedLanguages } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [detectionSource, setDetectionSource] = useState<'location' | 'browser' | 'manual'>('manual')
  const [showRequestForm, setShowRequestForm] = useState(false)

  useEffect(() => {
    setCurrentLanguage(languageService.getCurrentLanguage())
    setMounted(true)
    
    // Check detection source
    const savedLanguage = localStorage.getItem('selected_language')
    if (savedLanguage) {
      setDetectionSource('manual')
    } else {
      // This is a simplified check - you might want to track this more precisely
      setDetectionSource('location')
    }
  }, [])

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode)
    setCurrentLanguage(languageCode)
    setDetectionSource('manual')
  }

  const handleRequestLanguage = () => {
    // Simple implementation - could be enhanced to open a form or send to admin
    const userLanguage = prompt('What language would you like us to add? Please provide the language name and country:')
    if (userLanguage) {
      // In a real implementation, this would send to your admin/support system
      alert(`Thank you! We've received your request for: "${userLanguage}". We'll consider adding it in a future update.`)
      console.log('Language request:', userLanguage)
      // TODO: Send to admin dashboard or support system
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    if (onClose) onClose()
  }

  const getCurrentLanguageInfo = () => {
    return getLanguageByCode(currentLanguage)
  }

  const getDetectionSourceIcon = () => {
    switch (detectionSource) {
      case 'location':
        return <MapPin className="w-4 h-4" />
      case 'browser':
        return <Monitor className="w-4 h-4" />
      case 'manual':
        return <User className="w-4 h-4" />
    }
  }

  const getDetectionSourceText = () => {
    switch (detectionSource) {
      case 'location':
        return t('language.detected')
      case 'browser':
        return t('language.browser')
      case 'manual':
        return t('language.manual')
    }
  }

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[9999]">
      <div className="bg-background border rounded-lg theme-shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">{t('language.select')}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Current Language Info */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {t('language.current')}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getCurrentLanguageInfo()?.flag}</span>
                  <span className="font-semibold">{getCurrentLanguageInfo()?.nativeName}</span>
                  <span className="text-muted-foreground">({getCurrentLanguageInfo()?.name})</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {getDetectionSourceIcon()}
                <span>{getDetectionSourceText()}</span>
              </div>
            </div>
          </div>

          {/* Language Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {supportedLanguages.map((language) => (
              <Card 
                key={language.code} 
                className={`cursor-pointer transition-all theme-shadow hover:theme-shadow-lg ${
                  currentLanguage === language.code ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleLanguageChange(language.code)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{language.flag}</span>
                      <div>
                        <div className="font-semibold">{language.nativeName}</div>
                        <div className="text-sm text-muted-foreground">{language.name}</div>
                      </div>
                    </div>
                    {currentLanguage === language.code && (
                      <Badge className="bg-primary text-primary-foreground">
                        <Check className="w-3 h-3 mr-1" />
                        {t('themes.active')}
                      </Badge>
                    )}
                  </div>
                  {language.rtl && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        RTL
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Language Detection
                </p>
                <p className="text-blue-700 dark:text-blue-200">
                  We automatically detect your language based on your location. You can override this selection at any time, and your preference will be remembered.
                </p>
              </div>
            </div>
          </div>

          {/* Request Language Section */}
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-start space-x-3">
              <Plus className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                  Don't see your language?
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-200 mb-3">
                  We're always adding new languages to make education accessible to everyone worldwide.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRequestLanguage}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Request Your Language
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {t('themes.description')}
            </div>
            <Button onClick={handleClose}>
              {t('themes.done')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{getCurrentLanguageInfo()?.flag}</span>
        <span className="hidden md:inline">{getCurrentLanguageInfo()?.code.toUpperCase()}</span>
      </Button>
      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  )
}