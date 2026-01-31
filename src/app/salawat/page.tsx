'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { Sparkles, Heart, BookOpen, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

// Target counts for each prayer
const targets = {
  salawat: 1000,
  dua_faraj: 1000,
  dua_khasa: 1000,
}

// Countdown to Ramadan target date (adjust as needed)
const ramadanTarget = new Date('2025-02-28T00:00:00').getTime()

export default function SalawatPage() {
  const { dir, t } = useLanguage()
  const [count, setCount] = useState(0)
  const [localCount, setLocalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [incrementing, setIncrementing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [remaining, setRemaining] = useState(5)
  const [scrolled, setScrolled] = useState(false)
  const [substantialScroll, setSubstantialScroll] = useState(false)

  const fetchCount = async () => {
    try {
      const response = await fetch('/api/counters/salawat')
      if (!response.ok) throw new Error('Failed to fetch count')
      
      const data = await response.json()
      setCount(data.count)
      setLocalCount(data.count)
      setError(null)
    } catch (error) {
      console.error('Error fetching count:', error)
      setError('Failed to load count')
    } finally {
      setIsLoading(false)
    }
  }

  const increment = async () => {
    if (incrementing || cooldown > 0 || localCount >= targets.salawat) return

    setIncrementing(true)
    setError(null)

    try {
      const response = await fetch('/api/counters/salawat/increment', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        const newCount = data.count
        setLocalCount(newCount)
        setCount(newCount)

        if (data.rateLimitRemaining !== undefined) {
          setRemaining(data.rateLimitRemaining)
        }

        // Show toast for rate limit
        if (data.rateLimited) {
          setCooldown(data.cooldown)
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
        }
      } else {
        setError(data.error || 'Failed to increment counter')
      }
    } catch (error) {
      setError('Connection error')
      console.error('Error incrementing counter:', error)
    } finally {
      setIncrementing(false)
    }
  }

  useEffect(() => {
    fetchCount()
  }, [])

  // Enhanced scroll detection with 50% threshold
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercentage = documentHeight > 0 ? scrollY / documentHeight : 0
      
      // Activate floating counter after scrolling 50% down the page
      setSubstantialScroll(scrollPercentage > 0.5)
      setScrolled(scrollY > 200)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setRemaining(5)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldown])

  // Auto refresh count every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCount()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number): string => {
    return num.toLocaleString('fa-IR')
  }

  const replaceVariables = (text: string, variables: Record<string, string | number>) => {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key]?.toString() || match
    })
  }

  const getTimeUntilRamadan = () => {
    const now = new Date().getTime()
    const distance = ramadanTarget - now

    if (distance < 0) return null

    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)

    return { days, hours, minutes, seconds }
  }

  const timeUntilRamadan = getTimeUntilRamadan()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-br from-teal-900 via-cyan-800 to-teal-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-8 w-8 animate-pulse" />
              <h1 className="text-4xl md:text-5xl font-bold">{t.salawat.title}</h1>
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>
            <p className="text-lg text-teal-100 max-w-2xl mx-auto">
              {t.salawat.subtitle}
            </p>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <span className="font-semibold" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              {replaceVariables(t.salawat.rateLimitToast, { seconds: cooldown, remaining })}
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Ramadan Countdown */}
          {timeUntilRamadan && (
            <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 p-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-teal-800">{t.salawat.countdown}</h3>
                <div className="flex justify-center gap-4 md:gap-8">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-teal-600">{timeUntilRamadan.days}</div>
                    <div className="text-sm text-teal-600">{t.common.days}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-teal-600">{timeUntilRamadan.hours}</div>
                    <div className="text-sm text-teal-600">{t.common.hours}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-teal-600">{timeUntilRamadan.minutes}</div>
                    <div className="text-sm text-teal-600">{t.common.minutes}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-teal-600">{timeUntilRamadan.seconds}</div>
                    <div className="text-sm text-teal-600">{t.common.seconds}</div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Main Salawat Counter */}
          <Card className="bg-gradient-to-br from-white to-teal-50 border-2 border-teal200 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400"></div>
            
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-8 w-8 text-teal-600 animate-pulse" />
                <h2 className="text-3xl md:text-4xl font-bold text-teal-800">{t.salawat.title}</h2>
                <Sparkles className="h-8 w-8 text-teal-600 animate-pulse" />
              </div>

              {/* Current Count Display */}
              <div className="space-y-2">
                <div className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                  {formatNumber(localCount)}
                </div>
                <div className="text-xl text-muted-foreground" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                  {t.salawat.of} {formatNumber(targets.salawat)} {t.salawat.target}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-teal-100 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min((localCount / targets.salawat) * 100, 100)}%` }}
                ></div>
              </div>

              {/* Increment Button */}
              {!isLoading && (
                <div className="flex flex-col items-center space-y-4">
                  <Button
                    onClick={increment}
                    disabled={incrementing || cooldown > 0}
                    size="lg"
                    className="w-full md:w-auto px-12 py-6 text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white border-0 shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  >
                    <Sparkles className={`h-6 w-6 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                    <span style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                      {t.salawat.sendSalawat}
                    </span>
                    <Sparkles className={`h-6 w-6 ${dir === 'rtl' ? 'mr-3' : 'ml-3'}`} />
                  </Button>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-center" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                      {error}
                    </div>
                  )}
                </div>
              )}

              {/* Decorative Divider */}
              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>
                <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>
              </div>

              {/* Arabic Text - Enhanced Visibility */}
              <div className="text-center space-y-6">
                <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-50 dark:from-teal-950/30 dark:via-cyan-950/30 dark:to-teal-950/30 p-8 md:p-10 rounded-2xl border-2 border-teal-200 dark:border-teal-700 shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="h-px w-12 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>
                      <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                      <div className="h-px w-12 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>
                    </div>
                    <p className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-teal-800 dark:text-teal-200 leading-relaxed tracking-wide" style={{ fontFamily: 'var(--font-kitab)' }}>
                      {t.salawat.arabicText}
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-2">
                      <div className="h-px w-12 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>
                      <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                      <div className="h-px w-12 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Floating Counter */}
          {substantialScroll && (
            <div className={cn(
              "fixed z-50 transition-all duration-300 ease-out",
              substantialScroll ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              "bottom-4 left-1/2 translate-x-[-50%] md:bottom-4 md:left-auto md:right-4 md:translate-x-0"
            )}>
              {/* Glass morphism design */}
              <div className="bg-gradient-to-r from-teal-600/90 via-cyan-600/90 to-teal-600/90 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-2xl p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Counter display */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white">{formatNumber(count)}</span>
                    <span className="text-sm text-white/80">{t.common.total}</span>
                  </div>
                  {/* Action button */}
                  <Button
                    onClick={increment}
                    disabled={incrementing || cooldown > 0}
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                      {t.salawat.sendSalawat}
                    </span>
                  </Button>
                </div>
                {/* Cooldown indicator */}
                {cooldown > 0 && (
                  <div className="text-center text-xs text-orange-200 mt-2 animate-pulse">
                    <span className="font-semibold" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                      {replaceVariables(t.common.cooldown, { seconds: cooldown })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Card */}
          <Card className="bg-white border-2 border-yellow-200 p-6">
            <div className="text-center space-y-4">
              <h4 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                {t.salawat.about}
              </h4>
              <p className="text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                {t.salawat.description}
              </p>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-teal-900 to-cyan-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-2">
            <p className="text-sm" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              {t.common.footer.prayer}
            </p>
            <p className="text-xs text-teal-200" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              {replaceVariables(t.common.footer.copyright, { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}