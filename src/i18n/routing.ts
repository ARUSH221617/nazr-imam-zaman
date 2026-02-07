import type { Language } from '@/lib/translations'

export const locales = ['fa', 'ar', 'en'] as const

export const defaultLocale: Language = 'fa'

export type AppLocale = (typeof locales)[number]
