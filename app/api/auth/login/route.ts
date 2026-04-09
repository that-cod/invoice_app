import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createDbClient } from '@/lib/db'
import { signToken, COOKIE_NAME_EXPORT } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

type BusinessProfile = {
  id: string
  gstin: string
  business_name: string
  password_hash: string
  onboarding_complete: boolean
}

export async function POST(req: NextRequest) {
  // Rate limit: 5 attempts per IP per 15 minutes
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const { allowed } = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in 15 minutes.' },
      { status: 429 }
    )
  }

  if (!process.env.POSTGRES_URL || !process.env.JWT_SECRET) {
    console.error('[login] Missing POSTGRES_URL or JWT_SECRET in .env.local')
    return NextResponse.json({
      error: 'Server not configured. Please set up your .env.local file.',
    }, { status: 503 })
  }

  const { gstin, password } = await req.json()

  if (!gstin || !password) {
    return NextResponse.json({ error: 'GSTIN and password are required' }, { status: 400 })
  }

  const db = createDbClient()
  const { data: user, error: dbError } = await db
    .from('business_profile')
    .select('id, gstin, business_name, password_hash, onboarding_complete')
    .eq('gstin', gstin.toUpperCase().trim())
    .single() as { data: BusinessProfile | null; error: { message: string } | null }

  if (dbError) {
    console.error('[login] DB error looking up GSTIN:', dbError.message)
    return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 })
  }

  if (!user) {
    console.error('[login] No user found for GSTIN:', gstin.toUpperCase().trim())
    return NextResponse.json({ error: 'Invalid GSTIN or password' }, { status: 401 })
  }

  if (!user.password_hash) {
    console.error('[login] User found but password_hash is missing for GSTIN:', user.gstin)
    return NextResponse.json({ error: 'Account setup incomplete. Please contact support.' }, { status: 401 })
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash)
  if (!passwordMatch) {
    console.error('[login] Password mismatch for GSTIN:', user.gstin)
    return NextResponse.json({ error: 'Invalid GSTIN or password' }, { status: 401 })
  }

  const token = signToken({ userId: user.id, gstin: user.gstin, businessName: user.business_name })

  const redirectTo = user.onboarding_complete ? '/dashboard' : '/onboarding/profile'
  const res = NextResponse.json({ success: true, redirectTo })
  res.cookies.set(COOKIE_NAME_EXPORT, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
