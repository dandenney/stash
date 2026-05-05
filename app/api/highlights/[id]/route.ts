import { NextRequest, NextResponse } from 'next/server'
import { supabase, createSessionClient } from '@/lib/supabase'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = await createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { error } = await supabase
    .from('highlights')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}
