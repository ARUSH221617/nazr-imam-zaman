'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Language, languageNames } from '@/lib/translations'
import { Languages } from 'lucide-react'
import { useState } from 'react'

export function LanguageSwitcher() {
  const { language, setLanguage, dir } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages: Language[] = ['fa', 'ar', 'en']

  return (
    <div className="relative" dir={dir === 'rtl' ? 'rtl' : 'ltr'}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
      >
        <Languages className="h-4 w-4" />
        <span className="text-sm font-medium">
          {languageNames[language].nativeName}
        </span>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 z-50 min-w-[160px] rounded-lg bg-white border-2 border-primary shadow-xl overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-teal-50 transition-colors ${
                  language === lang ? 'bg-teal-100 font-bold' : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {languageNames[lang].nativeName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {languageNames[lang].name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
