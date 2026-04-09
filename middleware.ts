import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'invoice_session'

const PUBLIC_PATHS = ['/', '/login', '/signup', '/api/auth/login', '/api/auth/signup']
const INVOICE_SHARE_PATTERN = /^\/invoice\/[a-z0-9-]+$/
const COMING_SOON_PATHS = ['/products', '/transactions', '/journal', '/accounts', '/reports']

async function verifyJWT(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE_NAME)?.value

  // Always allow public invoice share links
  if (INVOICE_SHARE_PATTERN.test(pathname)) return NextResponse.next()

  // Redirect coming-soon routes to dashboard
  if (COMING_SOON_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith('/api/auth/'))) {
    // If logged in and hitting login/signup, redirect to dashboard
    if (token && (pathname === '/login' || pathname === '/signup')) {
      const valid = await verifyJWT(token)
      if (valid) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
    return NextResponse.next()
  }

  // All other paths require auth
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const valid = await verifyJWT(token)
  if (!valid) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
