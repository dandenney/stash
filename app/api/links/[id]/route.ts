import { NextRequest, NextResponse } from 'next/server'
import { supabase, createSessionClient } from '@/lib/supabase'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = await createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { status, is_shared, title, description, notes, tags } = body

  if (status !== undefined && !['score', 'stashed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (status !== undefined) updates.status = status
  if (is_shared !== undefined) {
    updates.is_shared = is_shared
    updates.shared_at = is_shared ? new Date().toISOString() : null
  }
  if (title !== undefined) updates.title = title
  if (description !== undefined) updates.description = description
  if (notes !== undefined) updates.notes = notes
  if (tags !== undefined) updates.tags = tags

  const { data, error } = await supabase
    .from('links')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = await createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}
