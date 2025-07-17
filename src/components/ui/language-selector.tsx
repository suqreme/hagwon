'use client'

import { Globe } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguageSync } from '@/hooks/useLanguageSync'
import { getLanguageByCode } from '@/lib/languages'

export function LanguageSelector() {
  const { currentLanguage, supportedLanguages, setLanguage } = useLanguageSync()
  const currentLang = getLanguageByCode(currentLanguage)

  return (
    <Select value={currentLanguage} onValueChange={setLanguage}>
      <SelectTrigger className="w-auto h-8 px-2 text-sm">
        <div className="flex items-center">
          <Globe className="h-4 w-4 mr-1" />
          <span className="mr-1">{currentLang?.flag}</span>
          <span className="hidden sm:inline">{currentLang?.name}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        {supportedLanguages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center">
              <span className="mr-2">{language.flag}</span>
              <span>{language.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {language.nativeName}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}