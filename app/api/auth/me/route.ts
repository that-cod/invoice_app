import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME_EXPORT } from '@/lib/auth'
import { createDbClient } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME_EXPORT)?.value
  if (!token) return NextResponse.json({ user: null })

  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ user: null })

  const db = createDbClient()
  const { data: profile } = await db
    .from('business_profile')
    .select('id, gstin, business_name, owner_name, email, phone, address, city, state, state_code, pincode, logo_url, selected_theme, onboarding_complete')
    .eq('id', payload.userId)
    .single()

  return NextResponse.json({ user: profile })
}
