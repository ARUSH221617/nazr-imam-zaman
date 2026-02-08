import crypto from 'crypto'

import { db } from '@/lib/db'

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex')

export const createAdminResetToken = async (email: string) => {
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS)

  await db.adminResetToken.deleteMany({ where: { email } })
  await db.adminResetToken.create({
    data: {
      email,
      tokenHash,
      expiresAt,
    },
  })

  return { token, expiresAt }
}

export const validateAdminResetToken = async (token: string) => {
  const tokenHash = hashToken(token)

  return db.adminResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  })
}

export const consumeAdminResetToken = async (token: string) => {
  const record = await validateAdminResetToken(token)

  if (!record) {
    return null
  }

  return db.adminResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  })
}
