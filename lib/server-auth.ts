import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function getUserIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('invoice_session')?.value
  if (!token) return null
  const payload = verifyToken(token)
  return payload?.userId ?? null
}
