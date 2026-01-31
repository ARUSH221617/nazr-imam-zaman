'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const { language, dir } = useLanguage()

  useEffect(() => {
    const html = document.documentElement
    html.lang = language
    html.dir = dir
  }, [language, dir])

  return <>{children}</>
}
