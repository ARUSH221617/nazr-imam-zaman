'use client'

import { useLocale, useTranslations } from 'next-intl'

interface UseLanguageResult {
  dir: 'ltr' | 'rtl'
  isRtl: boolean
  locale: string
  t: ReturnType<typeof useTranslations>
}

export const useLanguage = (): UseLanguageResult => {
  const locale = useLocale()
  const t = useTranslations()
  const isRtl = ['fa', 'ar'].includes(locale)

  return {
    dir: isRtl ? 'rtl' : 'ltr',
    isRtl,
    locale,
    t
  }
}
