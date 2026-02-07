'use client'

import { useLocale } from 'next-intl'
import { Languages } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePathname, useRouter } from '@/i18n/navigation'
import { isRTL, type Language, languageNames } from '@/lib/translations'

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const dir = isRTL(locale as Language) ? 'rtl' : 'ltr'
  const languages: Language[] = ['fa', 'ar', 'en']

  const handleLanguageChange = (language: Language) => {
    router.replace(pathname, { locale: language })
  }

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
              {languageNames[locale as Language].nativeName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`cursor-pointer ${locale === lang ? 'bg-teal-100 font-bold' : ''}`}
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
