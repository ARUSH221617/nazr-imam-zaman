import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['fa', 'ar', 'en'],
  defaultLocale: 'fa',
  localePrefix: 'as-needed',
})

export type AppLocale = (typeof routing.locales)[number]
