import { randomBytes, scryptSync } from 'node:crypto'

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { routing } from '@/i18n/routing'
import { db } from '@/lib/db'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  locale: z.string().optional()
})

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json())
    const email = payload.email.toLowerCase()
    const locale = routing.locales.includes(payload.locale ?? '')
      ? payload.locale
      : routing.defaultLocale

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, isAdmin: true, passwordHash: true }
    })

    if (!user?.passwordHash) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
    }

    if (!user.isAdmin) {
      return NextResponse.json({ error: 'not_admin' }, { status: 403 })
    }

    const [salt, storedHash] = user.passwordHash.split(':')
    if (!salt || !storedHash) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
    }

    const computedHash = scryptSync(payload.password, salt, 64).toString('hex')
    if (computedHash !== storedHash) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 })
    }

    const authToken = randomBytes(32).toString('hex')
    const response = NextResponse.json({
      status: 'ok',
      redirect: `/${locale}/admin`
    })

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    }

    response.cookies.set('auth-token', authToken, cookieOptions)
    response.cookies.set('role', 'admin', cookieOptions)

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }

    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
