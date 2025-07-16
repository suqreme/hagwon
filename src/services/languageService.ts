import { supportedLanguages, defaultLanguage, getLanguageByCode, getLanguageByRegion, detectBrowserLanguage } from '@/lib/languages'

class LanguageService {
  private storageKey = 'selected_language'
  private currentLanguage = defaultLanguage
  private listeners: ((language: string) => void)[] = []

  async detectUserLanguage(): Promise<string> {
    // 1. Check if user has manually selected a language
    const savedLanguage = this.getSavedLanguage()
    if (savedLanguage) {
      return savedLanguage
    }

    // 2. Try to detect by IP location
    try {
      const ipLanguage = await this.detectByIP()
      if (ipLanguage) {
        return ipLanguage
      }
    } catch (error) {
      console.log('IP detection failed, falling back to browser language')
    }

    // 3. Fallback to browser language
    return detectBrowserLanguage()
  }

  private async detectByIP(): Promise<string | null> {
    try {
      // Using a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      if (data.country_code) {
        const language = getLanguageByRegion(data.country_code)
        return language ? language.code : null
      }
    } catch (error) {
      console.error('IP geolocation failed:', error)
    }
    
    return null
  }

  private getSavedLanguage(): string | null {
    try {
      return localStorage.getItem(this.storageKey)
    } catch (error) {
      return null
    }
  }

  setLanguage(languageCode: string): void {
    if (!this.isSupported(languageCode)) {
      console.warn(`Language ${languageCode} is not supported`)
      return
    }

    this.currentLanguage = languageCode
    
    try {
      localStorage.setItem(this.storageKey, languageCode)
    } catch (error) {
      console.error('Failed to save language preference:', error)
    }

    // Update document direction for RTL languages
    this.updateDocumentDirection(languageCode)
    
    // Notify listeners
    this.listeners.forEach(listener => listener(languageCode))
  }

  getCurrentLanguage(): string {
    return this.currentLanguage
  }

  async initializeLanguage(): Promise<void> {
    const detectedLanguage = await this.detectUserLanguage()
    this.setLanguage(detectedLanguage)
  }

  private updateDocumentDirection(languageCode: string): void {
    const language = getLanguageByCode(languageCode)
    if (language && typeof document !== 'undefined') {
      document.documentElement.dir = language.rtl ? 'rtl' : 'ltr'
      document.documentElement.lang = languageCode
    }
  }

  private isSupported(languageCode: string): boolean {
    return supportedLanguages.some(lang => lang.code === languageCode)
  }

  getSupportedLanguages() {
    return supportedLanguages
  }

  subscribe(listener: (language: string) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Get user's location info for debugging
  async getUserLocationInfo(): Promise<any> {
    try {
      const response = await fetch('https://ipapi.co/json/')
      return await response.json()
    } catch (error) {
      return null
    }
  }
}

export const languageService = new LanguageService()