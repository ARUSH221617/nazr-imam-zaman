// Simple in-memory rate limiter
const rateLimits = new Map<string, { count: number; lastReset: number }>()

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

export class RateLimiter {
  private windowMs: number
  private maxRequests: number

  constructor(config: RateLimitConfig) {
    this.windowMs = config.windowMs
    this.maxRequests = config.maxRequests
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const record = rateLimits.get(identifier)

    if (!record) {
      // First request
      rateLimits.set(identifier, {
        count: 1,
        lastReset: now,
      })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      }
    }

    // Check if window has expired
    if (now - record.lastReset > this.windowMs) {
      // Reset window
      rateLimits.set(identifier, {
        count: 1,
        lastReset: now,
      })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      }
    }

    // Check if limit exceeded
    if (record.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.lastReset + this.windowMs,
      }
    }

    // Increment count
    record.count++
    return {
      allowed: true,
      remaining: this.maxRequests - record.count,
      resetTime: record.lastReset + this.windowMs,
    }
  }

  // Clean up old entries periodically
  static cleanup(): void {
    const now = Date.now()
    for (const [key, record] of rateLimits.entries()) {
      if (now - record.lastReset > 3600000) { // Remove entries older than 1 hour
        rateLimits.delete(key)
      }
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => RateLimiter.cleanup(), 300000)
}

// Create specific rate limiters
export const salawatRateLimiter = new RateLimiter({
  windowMs: 1000, // 1 second window
  maxRequests: 5, // max 5 requests per second
})

export const duaRateLimiter = new RateLimiter({
  windowMs: 2000, // 2 second window
  maxRequests: 3, // max 3 requests per 2 seconds
})

export const getIdentifier = (request: Request): string => {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfIp = request.headers.get('cf-connecting-ip')

  const ip = forwarded?.split(',')[0] || realIp || cfIp || 'unknown'

  // Add user agent to make identifier more specific
  const userAgent = request.headers.get('user-agent') || 'unknown'

  return `${ip}-${userAgent}`
}
