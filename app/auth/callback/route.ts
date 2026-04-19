import { NextRequest, NextResponse } from 'next/server'
import { createSessionClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')

  if (code) {
    const client = await createSessionClient()
    await client.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}
