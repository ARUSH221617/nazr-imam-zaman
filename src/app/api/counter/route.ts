import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { salawatRateLimiter, duaRateLimiter, getIdentifier } from '@/lib/rate-limit'

// In-memory cache for counter values to reduce database load
// TTL of 1 second is enough to deduplicate requests from multiple users
// while keeping the counter reasonably fresh.
const counterCache = new Map<string, { count: number; timestamp: number }>()
const CACHE_TTL = 1000 // 1 second

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    // Validate counter type
    const validTypes = ['salawat', 'dua_faraj', 'dua_khasa']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid counter type' },
        { status: 400 }
      )
    }

    // Get identifier for rate limiting
    const identifier = getIdentifier(request)

    // Check rate limit based on type
    const limiter = type === 'salawat' ? salawatRateLimiter : duaRateLimiter
    const rateLimit = limiter.check(identifier)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': type === 'salawat' ? '5' : '3',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      )
    }

    // Increment counter in database
    const counter = await db.counter.update({
      where: { name: type },
      data: { count: { increment: 1 } },
    })

    // Update cache with the new value
    counterCache.set(type, { count: counter.count, timestamp: Date.now() })

    // Record user action (optional, for analytics)
    await db.userAction.create({
      data: {
        userId: identifier,
        counterId: counter.id,
        action: type,
      },
    })

    return NextResponse.json({
      success: true,
      count: counter.count,
      remaining: rateLimit.remaining,
      resetTime: rateLimit.resetTime,
    })
  } catch (error) {
    console.error('Error incrementing counter:', error)
    return NextResponse.json(
      { error: 'Failed to increment counter' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // Validate counter type
    const validTypes = ['salawat', 'dua_faraj', 'dua_khasa']
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid or missing counter type' },
        { status: 400 }
      )
    }

    // Check cache first
    const now = Date.now()
    const cached = counterCache.get(type)
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        count: cached.count,
      })
    }

    // Get counter value from database
    const counter = await db.counter.findUnique({
      where: { name: type },
    })

    if (!counter) {
      return NextResponse.json(
        { error: 'Counter not found' },
        { status: 404 }
      )
    }

    // Update cache
    counterCache.set(type, { count: counter.count, timestamp: now })

    return NextResponse.json({
      success: true,
      count: counter.count,
    })
  } catch (error) {
    console.error('Error getting counter:', error)
    return NextResponse.json(
      { error: 'Failed to get counter' },
      { status: 500 }
    )
  }
}
