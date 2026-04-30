import { NextRequest, NextResponse } from 'next/server'
import { createSessionClient } from '@/lib/supabase'

const allowedEmails = (process.env.ALLOWED_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')

  if (code) {
    const client = await createSessionClient()
    await client.auth.exchangeCodeForSession(code)

    const { data: { user } } = await client.auth.getUser()
    if (user?.email && allowedEmails.length > 0 && !allowedEmails.includes(user.email.toLowerCase())) {
      await client.auth.signOut()
      return NextResponse.redirect(`${origin}/login?error=not_allowed`)
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
