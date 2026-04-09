import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createDbClient } from '@/lib/db'
import { signToken, COOKIE_NAME_EXPORT } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

const STATE_CODES: Record<string, string> = {
  "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab",
  "04": "Chandigarh", "05": "Uttarakhand", "06": "Haryana",
  "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh",
  "10": "Bihar", "11": "Sikkim", "12": "Arunachal Pradesh",
  "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
  "16": "Tripura", "17": "Meghalaya", "18": "Assam",
  "19": "West Bengal", "20": "Jharkhand", "21": "Odisha",
  "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat",
  "26": "Dadra & Nagar Haveli", "27": "Maharashtra",
  "29": "Karnataka", "30": "Goa", "32": "Kerala",
  "33": "Tamil Nadu", "34": "Puducherry", "36": "Telangana",
  "37": "Andhra Pradesh", "38": "Ladakh"
}

type NewUser = { id: string; gstin: string; business_name: string }

export async function POST(req: NextRequest) {
  // Rate limit: 3 attempts per IP per hour
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const { allowed } = rateLimit(`signup:${ip}`, 3, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many signup attempts. Please try again in an hour.' },
      { status: 429 }
    )
  }

  if (!process.env.POSTGRES_URL || !process.env.JWT_SECRET) {
    console.error('[signup] Missing POSTGRES_URL or JWT_SECRET in .env.local')
    return NextResponse.json({
      error: 'Server not configured. Please set up your .env.local file.',
    }, { status: 503 })
  }

  const { gstin, password, businessName } = await req.json()

  if (!gstin || !password || !businessName) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const gstinUpper = gstin.toUpperCase().trim()
  if (!GSTIN_REGEX.test(gstinUpper)) {
    return NextResponse.json({ error: 'Invalid GSTIN format' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const db = createDbClient()

  // Check if GSTIN already registered
  const { data: existing } = await db
    .from('business_profile')
    .select('id')
    .eq('gstin', gstinUpper)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'This GSTIN is already registered' }, { status: 409 })
  }

  const stateCode = gstinUpper.substring(0, 2)
  const state = STATE_CODES[stateCode] || 'Unknown'
  const passwordHash = await bcrypt.hash(password, 12)

  const { data: user, error } = await db
    .from('business_profile')
    .insert([{
      gstin: gstinUpper,
      password_hash: passwordHash,
      business_name: businessName,
      state_code: stateCode,
      state: state,
      onboarding_complete: false,
    }])
    .select()
    .single() as { data: NewUser | null; error: { message: string } | null }

  if (error || !user) {
    const devMessage = process.env.NODE_ENV === 'development' && error?.message
      ? `DB error: ${error.message}`
      : 'Failed to create account.'
    console.error('[signup] insert error:', error?.message)
    return NextResponse.json({ error: devMessage }, { status: 500 })
  }

  const token = signToken({ userId: user.id, gstin: user.gstin, businessName: user.business_name })

  const res = NextResponse.json({ success: true, redirectTo: '/onboarding/profile' })
  res.cookies.set(COOKIE_NAME_EXPORT, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
