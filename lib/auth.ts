import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!
const COOKIE_NAME = 'invoice_session'

export type SessionPayload = {
  userId: string
  gstin: string
  businessName: string
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload
  } catch {
    return null
  }
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME
