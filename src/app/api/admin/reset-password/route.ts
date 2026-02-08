import { NextResponse } from 'next/server'
import { z } from 'zod'

import { createAdminResetToken } from '@/lib/auth/admin-reset-token'
import { sendAdminResetEmail } from '@/lib/email/resend'
import { routing } from '@/i18n/routing'

const resetRequestSchema = z.object({
  email: z.string().email(),
  locale: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const payload = resetRequestSchema.parse(await request.json())
    const email = payload.email.toLowerCase()
    const locale = routing.locales.includes(payload.locale ?? '')
      ? payload.locale
      : routing.defaultLocale

    const { token } = await createAdminResetToken(email)
    const origin = new URL(request.url).origin
    const resetUrl = new URL(`/${locale}/admin/reset-password/${token}`, origin).toString()

    await sendAdminResetEmail({ to: email, resetUrl })

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Unable to send reset email.' }, { status: 500 })
  }
}
