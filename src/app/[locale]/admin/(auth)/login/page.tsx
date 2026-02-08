'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/i18n/routing'
import { useLanguage } from '@/hooks/use-language'

export default function AdminLoginPage() {
  const { dir, locale, t } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          locale
        })
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        const messageMap: Record<string, string> = {
          invalid_credentials: t('admin.login.errorInvalid'),
          not_admin: t('admin.login.errorNotAdmin')
        }
        setErrorMessage(messageMap[payload.error] ?? t('admin.login.errorDefault'))
        return
      }

      setSuccessMessage(t('admin.login.success'))
      const redirectTarget = payload.redirect ?? `/${locale}/admin`
      router.push(redirectTarget)
    } catch (error) {
      setErrorMessage(t('admin.login.errorNetwork'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" dir={dir}>
      <Card className="w-full max-w-md border-border/60 bg-background/95 p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-foreground" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
            {t('admin.login.title')}
          </h1>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
            {t('admin.login.subtitle')}
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">
              {t('admin.login.emailLabel')}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('admin.login.emailPlaceholder')}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">
              {t('admin.login.passwordLabel')}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={t('admin.login.passwordPlaceholder')}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {errorMessage ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}
          {successMessage ? (
            <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
              {successMessage}
            </p>
          ) : null}
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('admin.login.submitting') : t('admin.login.submit')}
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
          <p>{t('admin.login.helper')}</p>
          <Link className="font-medium text-primary hover:text-primary/80" href="/admin/reset-password">
            {t('admin.login.forgot')}
          </Link>
        </div>
      </Card>
    </div>
  )
}
