'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function DuaKhasaPage() {
  const { t, language, dir } = useLanguage()
  const [count, setCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [incrementing, setIncrementing] = useState(false)
  const [remaining, setRemaining] = useState<number>(3)
  const [cooldown, setCooldown] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  const locale = useMemo(() => {
    if (language === 'fa') return 'fa-IR'
    if (language === 'ar') return 'ar-SA'
    return 'en-US'
  }, [language])

  const replaceVariables = (text: string, variables: Record<string, string | number>): string => {
    let result = text
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    })
    return result
  }

  const fetchCount = async () => {
    try {
      const response = await fetch('/api/counter?type=dua_khasa')
      const data = await response.json()
      if (data.success) {
        setCount(data.count)
      }
    } catch (error) {
      console.error('Error fetching count:', error)
    } finally {
      setLoading(false)
    }
  }

  const increment = async () => {
    if (cooldown > 0) {
      setError(t.common.error.rateLimit)
      setTimeout(() => setError(null), 2000)
      return
    }

    setIncrementing(true)
    setError(null)

    try {
      const response = await fetch('/api/counter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'dua_khasa' }),
      })

      const data = await response.json()

      if (response.status === 429) {
        setError(t.common.error.rateLimit)
        setRemaining(data.remaining)
        setCooldown(Math.ceil((data.resetTime - Date.now()) / 1000))
      } else if (data.success) {
        setCount(data.count)
        setRemaining(data.remaining)
        if (data.remaining === 0) {
          setCooldown(Math.ceil((data.resetTime - Date.now()) / 1000))
        }
      } else {
        setError(data.error || t.common.error.increment)
      }
    } catch (error) {
      setError(t.common.error.connection)
      console.error('Error incrementing counter:', error)
    } finally {
      setIncrementing(false)
    }
  }

  useEffect(() => {
    fetchCount()
  }, [])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setRemaining(3)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldown])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCount()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number): string => {
    return num.toLocaleString(locale)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-br from-teal-900 via-cyan-800 to-teal-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                <ArrowRight className={`h-4 w-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                <span className="font-semibold">{t.common.back}</span>
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                {t.common.siteName}
              </h1>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="inline-block">
              <h2 className="text-3xl md:text-5xl font-bold text-white" style={{ fontFamily: 'var(--font-kitab)' }}>
                {t.common.bismillah}
              </h2>
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
            </div>

            <h3 className="text-4xl md:text-6xl font-bold text-white" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              {t.duaKhasa.title}
            </h3>
            <p className="text-lg text-teal-100" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
              {t.duaKhasa.subtitle}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 p-8 md:p-12">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-teal-600 mb-4">
                  <TrendingUp className="h-6 w-6" />
                  <span className="font-semibold" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                    {t.common.total}
                  </span>
                </div>

                {loading ? (
                  <div className="text-6xl md:text-8xl font-bold text-teal-700">
                    <span className="animate-pulse">...</span>
                  </div>
                ) : (
                  <div className="text-6xl md:text-8xl font-bold text-teal-700 transition-all duration-300">
                    {formatNumber(count)}
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span className="font-semibold" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                    {cooldown > 0
                      ? replaceVariables(t.common.cooldown, { seconds: cooldown })
                      : replaceVariables(t.common.remainingRequests, { count: remaining })
                    }
                  </span>
                  <span>|</span>
                  <span>Cooldown: {cooldown > 0 ? `${cooldown}s` : t.common.ready}</span>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={increment}
                  disabled={incrementing || cooldown > 0}
                  size="lg"
                  className="w-full md:w-auto px-12 py-6 text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white border-0 shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                >
                  <BookOpen className={`h-6 w-6 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                  <span style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                    {t.duaKhasa.reciteDua}
                  </span>
                  <BookOpen className={`h-6 w-6 ${dir === 'rtl' ? 'mr-3' : 'ml-3'}`} />
                </Button>

                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-center" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                    {error}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>
                <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-2 border-yellow-200 p-6 md:p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 mb-6">
                <BookOpen className="h-6 w-6 text-teal-600" />
                <h4 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                  {t.duaKhasa.title}
                </h4>
                <BookOpen className="h-6 w-6 text-teal-600" />
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-lg p-6 md:p-8">
                <p className="text-xl md:text-2xl font-bold text-foreground leading-loose text-right mb-6 whitespace-pre-line" style={{ fontFamily: 'var(--font-kitab)', direction: 'rtl' }}>
                  {t.duaKhasa.arabicText}
                </p>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-400 to-transparent my-6"></div>

                <div className="text-muted-foreground leading-relaxed">
                  <p className="mb-4 font-semibold text-sm">Translation | ترجمه:</p>
                  <p className="text-base md:text-lg whitespace-pre-line">{t.duaKhasa.translation}</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
                  {t.duaKhasa.description}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

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
