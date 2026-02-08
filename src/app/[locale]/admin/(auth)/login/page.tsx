'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/i18n/routing'
import { useLanguage } from '@/hooks/use-language'

export default function AdminLoginPage() {
  const { dir, t } = useLanguage()

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

        <form className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">
              {t('admin.login.emailLabel')}
            </Label>
            <Input id="email" type="email" placeholder={t('admin.login.emailPlaceholder')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">
              {t('admin.login.passwordLabel')}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={t('admin.login.passwordPlaceholder')}
            />
          </div>
          <Button className="w-full" type="submit">
            {t('admin.login.submit')}
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
