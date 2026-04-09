import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const token = req.cookies.get('invoice_session')?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { to, clientName, businessName, invoiceNumber, shareLink, pdfBase64 } = await req.json()

  if (!to || !invoiceNumber) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Ensure share link is always an absolute URL — never a bare path in the email
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? ''
  const absoluteShareLink = shareLink
    ? shareLink.startsWith('http')
      ? shareLink
      : `${baseUrl}${shareLink}`
    : null

  try {
    await resend.emails.send({
      from: `${businessName} <invoices@resend.dev>`,
      to: [to],
      subject: `Invoice ${invoiceNumber} from ${businessName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #111827;">Invoice from ${businessName}</h2>
          <p>Dear ${clientName},</p>
          <p>Please find your invoice <strong>${invoiceNumber}</strong> below.</p>
          ${absoluteShareLink ? `<p><a href="${absoluteShareLink}" style="background:#111827;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">View Invoice Online</a></p>` : ''}
          <p style="color:#6b7280;font-size:14px;margin-top:32px;">Thank you for your business.</p>
          <p style="color:#6b7280;font-size:14px;">${businessName}</p>
        </div>
      `,
      attachments: pdfBase64 ? [{
        filename: `${invoiceNumber}.pdf`,
        content: pdfBase64,
      }] : [],
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
