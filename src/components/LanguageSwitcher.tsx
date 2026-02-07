'use client'

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

const languageNames = {
  fa: { name: 'Persian', nativeName: 'فارسی' },
  ar: { name: 'Arabic', nativeName: 'العربية' },
  en: { name: 'English', nativeName: 'English' },
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, {locale: newLocale});
  };

  const isRtl = ['fa', 'ar'].includes(locale);

  return (
    <div className="relative" dir={isRtl ? 'rtl' : 'ltr'}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
          >
            <Languages className="h-4 w-4" />
            <span className="text-sm font-medium">
              {languageNames[locale as keyof typeof languageNames].nativeName}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[160px]">
          {Object.keys(languageNames).map((lang) => (
            <DropdownMenuItem
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`cursor-pointer ${locale === lang ? 'bg-teal-100 font-bold' : ''}`}
            >
              <div className="flex flex-col w-full text-left">
                <span className="text-sm font-medium">
                  {languageNames[lang as keyof typeof languageNames].nativeName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {languageNames[lang as keyof typeof languageNames].name}
                </span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
