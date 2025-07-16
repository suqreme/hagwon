import { en } from './en'
import { es } from './es'

// Add more languages as they're translated
export const translations = {
  en,
  es,
  // fr: {},  // TODO: Add French translations
  // ar: {},  // TODO: Add Arabic translations
  // hi: {},  // TODO: Add Hindi translations
  // pt: {},  // TODO: Add Portuguese translations
  // sw: {},  // TODO: Add Swahili translations
  // zh: {},  // TODO: Add Chinese translations
  // ru: {},  // TODO: Add Russian translations
  // de: {},  // TODO: Add German translations
}

export type SupportedLocale = keyof typeof translations
export type TranslationKey = keyof typeof en

export function getTranslation(locale: SupportedLocale, key: TranslationKey): string {
  const translation = translations[locale]?.[key] || translations.en[key]
  return translation || key
}

export function isLocaleSupported(locale: string): locale is SupportedLocale {
  return locale in translations
}