'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Language, languageNames } from '@/lib/translations'
import { Languages } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage, dir } = useLanguage()
  const languages: Language[] = ['fa', 'ar', 'en']

  return (
    <div className="relative" dir={dir === 'rtl' ? 'rtl' : 'ltr'}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
          >
            <Languages className="h-4 w-4" />
            <span className="text-sm font-medium">
              {languageNames[language].nativeName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`cursor-pointer ${language === lang ? 'bg-teal-100 font-bold' : ''}`}
            >
              <div className="flex flex-col w-full text-left">
                <span className="text-sm font-medium">
                  {languageNames[lang].nativeName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {languageNames[lang].name}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
