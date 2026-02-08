'use client'

import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link } from '@/i18n/routing'
import { useLanguage } from '@/hooks/use-language'

export default function AdminResetPasswordTokenPage() {
  const { dir, t } = useLanguage()
  const params = useParams()
  const token = typeof params?.token === 'string' ? params.token : ''
  const tokenPreview = token ? `${token.slice(0, 6)}…` : t('admin.resetToken.missingToken')

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12" dir={dir}>
      <Card className="w-full max-w-md border-border/60 bg-background/95 p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-foreground" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
            {t('admin.resetToken.title')}
          </h1>
          <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-vazirmatn)' }}>
            {t('admin.resetToken.subtitle')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('admin.resetToken.tokenLabel')}: {tokenPreview}
          </p>
        </div>

        <form className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">
              {t('admin.resetToken.passwordLabel')}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={t('admin.resetToken.passwordPlaceholder')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm">
              {t('admin.resetToken.confirmLabel')}
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t('admin.resetToken.confirmPlaceholder')}
            />
          </div>
          <Button className="w-full" type="submit">
            {t('admin.resetToken.submit')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link className="font-medium text-primary hover:text-primary/80" href="/admin/login">
            {t('admin.resetToken.backToLogin')}
          </Link>
        </div>
      </Card>
    </div>
  )
}
