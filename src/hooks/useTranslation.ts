'use client'

import { useState, useEffect } from 'react'
import { languageService } from '@/services/languageService'
import { getTranslation, isLocaleSupported, type TranslationKey, type SupportedLocale } from '@/locales'

export function useTranslation() {
  const [locale, setLocale] = useState<SupportedLocale>('en')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeLanguage = async () => {
      await languageService.initializeLanguage()
      const currentLang = languageService.getCurrentLanguage()
      
      if (isLocaleSupported(currentLang)) {
        setLocale(currentLang)
      } else {
        setLocale('en') // Fallback to English if translation not available
      }
      
      setIsLoading(false)
    }

    initializeLanguage()

    // Subscribe to language changes
    const unsubscribe = languageService.subscribe((newLanguage) => {
      if (isLocaleSupported(newLanguage)) {
        setLocale(newLanguage)
      }
    })

    return unsubscribe
  }, [])

  const t = (key: TranslationKey): string => {
    return getTranslation(locale, key)
  }

  const changeLanguage = (newLanguage: string) => {
    languageService.setLanguage(newLanguage)
  }

  return {
    t,
    locale,
    changeLanguage,
    isLoading,
    supportedLanguages: languageService.getSupportedLanguages(),
    currentLanguage: languageService.getCurrentLanguage()
  }
}