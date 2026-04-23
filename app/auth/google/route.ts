import { NextRequest, NextResponse } from 'next/server'
import { createSessionClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin
  const client = await createSessionClient()

  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

  return NextResponse.redirect(data.url)
}
