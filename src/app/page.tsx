'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Heart, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { prayerTextClassName, prayerTextStyle } from '@/lib/typography'

export default function Home() {
  const { t, language, dir } = useLanguage()
  const [currentPrayer, setCurrentPrayer] = useState(0)

  const prayerTypes = useMemo(() => [
    {
      id: 'salawat',
      title: t.home.salawat.title,
      icon: Sparkles,
      description: t.home.salawat.description,
      color: 'bg-gradient-to-br from-cyan-600 to-teal-600',
      route: '/salawat'
    },
    {
      id: 'dua-faraj',
      title: t.home.duaFaraj.title,
      icon: Heart,
      description: t.home.duaFaraj.description,
      color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      route: '/dua-faraj'
    },
    {
      id: 'dua-salamati',
      title: t.home.duaSalamati.title,
      icon: BookOpen,
      description: t.home.duaSalamati.description,
      color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      route: '/dua-salamati'
    }
  ], [t])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrayer((prev) => (prev + 1) % prayerTypes.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [prayerTypes.length])

  const replaceVariables = (text: string, variables: Record<string, string | number>): string => {
    let result = text
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    })
    return result
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-cyan-800 to-teal-900">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        {/* Bismillah - In name of GOD */}
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
          <div className="flex items-center justify-between mb-4">
            <LanguageSwitcher />
          </div>
          <div className="text-center space-y-8">
            <div className="inline-block">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-kitab)' }}>
                {t.common.bismillah}
              </h1>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                {t.common.siteName}
              </h2>
              <p className="text-lg md:text-xl text-teal-100" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                {t.common.siteSubtitle}
              </p>
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
            </div>

            {/* Animated Prayer Preview */}
            <div className="max-w-md mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-2 border-yellow-400/30 p-6 text-center">
                <div className="text-yellow-300 mb-3">
                  {(() => {
                    const CurrentIcon = prayerTypes[currentPrayer].icon
                    return CurrentIcon ? <CurrentIcon className="h-12 w-12 mx-auto" /> : null
                  })()}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                  {prayerTypes[currentPrayer].title}
                </h3>
                <p className="text-teal-100 text-sm md:text-base">
                  {prayerTypes[currentPrayer].description}
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-24 fill-background">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.11,140.83,94.17,208.18,70.36,246.94,57,285.58,67.24,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      {/* Menu Section */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              {t.home.selectPrayer}
            </h3>
            <p className="text-muted-foreground text-lg" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              {t.home.selectSubtitle}
            </p>
            <div className="flex items-center justify-center gap-4 py-4">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>
          </div>

          {/* Menu Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {prayerTypes.map((prayer, index) => {
              const Icon = prayer.icon
              return (
                <Link key={prayer.id} href={prayer.route}>
                  <Card className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border-2 hover:border-yellow-400/50 ${prayer.color}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/20 transition-opacity group-hover:from-black/5 group-hover:to-black/30" />
                    <div className="relative p-8 md:p-10 text-center space-y-6">
                      {/* Icon */}
                      <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                        <Icon className="h-10 w-10 md:h-12 md:w-12 text-white" />
                      </div>

                      {/* Title */}
                      <h4 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                        {prayer.title}
                      </h4>

                      {/* Description */}
                      <p className="text-white/80 text-sm md:text-base">
                        {prayer.description}
                      </p>

                      {/* Button */}
                      <Button
                        variant="outline"
                        className="w-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 backdrop-blur-sm"
                      >
                        <span className="font-semibold" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                          {t.common.enter}
                        </span>
                      </Button>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-gradient-to-br from-teal-900 to-cyan-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
            </div>
            <p className={prayerTextClassName} style={prayerTextStyle}>
              {t.common.footer.prayer}
            </p>
            <p className="text-xs md:text-sm text-teal-200" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              {replaceVariables(t.common.footer.copyright, { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
