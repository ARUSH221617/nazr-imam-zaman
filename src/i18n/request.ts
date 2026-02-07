import { getRequestConfig } from 'next-intl/server'

import { translations, type Language } from '@/lib/translations'

import { routing } from './routing'

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = routing.locales.includes(locale as Language)
    ? (locale as Language)
    : routing.defaultLocale

  return {
    locale: resolvedLocale,
    messages: translations[resolvedLocale],
  }
})
