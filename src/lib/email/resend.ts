import 'server-only'

import { Resend } from 'resend'

const resendApiKey = process.env.RESEND_API_KEY
const resendFromEmail = process.env.RESEND_FROM_EMAIL

const getResendClient = () => {
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }

  return new Resend(resendApiKey)
}

export const sendAdminResetEmail = async ({
  to,
  resetUrl,
}: {
  to: string
  resetUrl: string
}) => {
  if (!resendFromEmail) {
    throw new Error('RESEND_FROM_EMAIL is not set')
  }

  const resend = getResendClient()

  return resend.emails.send({
    from: resendFromEmail,
    to,
    subject: 'Reset your admin password',
    html: `
      <div>
        <p>We received a request to reset your admin password.</p>
        <p>
          <a href="${resetUrl}">Reset your password</a>
        </p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
    text: `We received a request to reset your admin password.\n\nReset your password: ${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
  })
}
