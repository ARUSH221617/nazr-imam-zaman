import { getRequestConfig } from 'next-intl/server'

import { translations, type Language } from '@/lib/translations'

import { defaultLocale, locales } from './routing'

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locales.includes(locale as Language)
    ? (locale as Language)
    : defaultLocale

  return {
    locale: resolvedLocale,
    messages: translations[resolvedLocale],
  }
})
