/**
 * Next.js instrumentation hook — runs once at server startup.
 * Validates required environment variables and warns about optional ones.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const required = ['POSTGRES_URL', 'JWT_SECRET']
  const optional = ['RESEND_API_KEY', 'NEXT_PUBLIC_APP_URL']

  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    console.error(
      `\n❌ [env] Missing required environment variables: ${missing.join(', ')}\n` +
      `   The app will not work correctly without these.\n` +
      `   Copy .env.local.example → .env.local and fill in the values.\n`
    )
  }

  const missingOptional = optional.filter((key) => !process.env[key])
  if (missingOptional.length > 0) {
    console.warn(
      `\n⚠️  [env] Optional environment variables not set: ${missingOptional.join(', ')}\n` +
      `   - RESEND_API_KEY: required for sending invoice emails\n` +
      `   - NEXT_PUBLIC_APP_URL: required for clickable share links in emails (e.g. https://app.example.com)\n`
    )
  }

  if (process.env.NEXT_PUBLIC_APP_URL === 'http://localhost:3000') {
    console.warn(
      '\n⚠️  [env] NEXT_PUBLIC_APP_URL is still set to localhost.\n' +
      '   Share links in emails will not work outside your machine.\n' +
      '   Set it to your production domain before deploying.\n'
    )
  }
}
