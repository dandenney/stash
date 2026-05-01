import { NextRequest, NextResponse } from 'next/server'
import { supabase, createSessionClient } from '@/lib/supabase'

async function getUser() {
  const client = await createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  return user
}

export async function PATCH(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { layout_inverted } = await req.json()

  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: user.id,
      layout_inverted: Boolean(layout_inverted),
      updated_at: new Date().toISOString(),
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
