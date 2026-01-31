import { fa, type FaTranslations } from './fa'
import { ar, type ArTranslations } from './ar'
import { en, type EnTranslations } from './en'

export type Language = 'fa' | 'ar' | 'en'

export type Translations = FaTranslations | ArTranslations | EnTranslations

export const translations: Record<Language, Translations> = {
  fa,
  ar,
  en,
}

export const languageNames: Record<Language, { name: string; nativeName: string }> = {
  fa: { name: 'Persian', nativeName: 'فارسی' },
  ar: { name: 'Arabic', nativeName: 'العربية' },
  en: { name: 'English', nativeName: 'English' },
}

export const rtlLanguages: Language[] = ['fa', 'ar']

export const isRTL = (lang: Language): boolean => {
  return rtlLanguages.includes(lang)
}
