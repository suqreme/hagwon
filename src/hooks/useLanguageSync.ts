import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { languageService } from '@/services/languageService'

/**
 * Hook to sync language selection between:
 * 1. Frontend language service (localStorage)
 * 2. User profile preferred_language (database)
 * 3. Lesson generation system
 */
export function useLanguageSync() {
  const { user, updateProfile } = useAuth()

  useEffect(() => {
    if (!user) return

    // Initialize language from user profile or detect automatically
    const initializeLanguage = async () => {
      try {
        // If user has a preferred language in their profile, use that
        if (user.preferred_language) {
          languageService.setLanguage(user.preferred_language)
        } else {
          // Otherwise, detect language and save to profile
          const detectedLanguage = await languageService.detectUserLanguage()
          languageService.setLanguage(detectedLanguage)
          
          // Update user profile with detected language
          await updateProfile({ preferred_language: detectedLanguage })
        }
      } catch (error) {
        console.error('Error initializing language:', error)
      }
    }

    initializeLanguage()

    // Listen for language changes and sync to user profile
    const unsubscribe = languageService.subscribe(async (newLanguage) => {
      try {
        if (user.preferred_language !== newLanguage) {
          await updateProfile({ preferred_language: newLanguage })
        }
      } catch (error) {
        console.error('Error updating language preference:', error)
      }
    })

    return unsubscribe
  }, [user, updateProfile])

  return {
    currentLanguage: languageService.getCurrentLanguage(),
    supportedLanguages: languageService.getSupportedLanguages(),
    setLanguage: languageService.setLanguage.bind(languageService)
  }
}