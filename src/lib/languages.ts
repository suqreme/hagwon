export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  rtl?: boolean
  regions: string[] // Common country codes for this language
}

export const supportedLanguages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    regions: ['US', 'GB', 'CA', 'AU', 'NZ', 'IE']
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    regions: ['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'GT', 'EC', 'BO', 'CU', 'DO', 'HN', 'PY', 'NI', 'CR', 'PA', 'UY', 'SV']
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    regions: ['FR', 'CA', 'BE', 'CH', 'LU', 'MC', 'SN', 'ML', 'BF', 'NE', 'TD', 'MG', 'CI', 'CM', 'CD', 'CF', 'CG', 'GA', 'DJ', 'KM']
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    regions: ['SA', 'EG', 'AE', 'JO', 'LB', 'SY', 'IQ', 'KW', 'QA', 'BH', 'OM', 'YE', 'MA', 'TN', 'DZ', 'LY', 'SD', 'SO']
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    regions: ['IN']
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    regions: ['BR', 'PT', 'AO', 'MZ', 'GW', 'ST', 'TL', 'CV']
  },
  {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    flag: '🇰🇪',
    regions: ['KE', 'TZ', 'UG', 'RW', 'BI', 'CD', 'MZ']
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    regions: ['CN', 'SG']
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    regions: ['RU', 'BY', 'KZ', 'KG', 'TJ', 'UZ', 'TM', 'MD']
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    regions: ['DE', 'AT', 'CH', 'LI', 'LU']
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    regions: ['KR']
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    regions: ['JP']
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    regions: ['VN']
  },
  {
    code: 'fil',
    name: 'Filipino',
    nativeName: 'Filipino',
    flag: '🇵🇭',
    regions: ['PH']
  },
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ภาษาไทย',
    flag: '🇹🇭',
    regions: ['TH']
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    regions: ['ID']
  },
  {
    code: 'ms',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    flag: '🇲🇾',
    regions: ['MY', 'SG', 'BN']
  }
]

export const defaultLanguage = 'en'

export function getLanguageByCode(code: string): Language | undefined {
  return supportedLanguages.find(lang => lang.code === code)
}

export function getLanguageByRegion(countryCode: string): Language | undefined {
  return supportedLanguages.find(lang => 
    lang.regions.includes(countryCode.toUpperCase())
  )
}

export function detectBrowserLanguage(): string {
  if (typeof window === 'undefined') return defaultLanguage
  
  const browserLang = navigator.language.split('-')[0]
  const supported = supportedLanguages.find(lang => lang.code === browserLang)
  return supported ? browserLang : defaultLanguage
}