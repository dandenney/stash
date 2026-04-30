import { NextRequest, NextResponse } from 'next/server'
import { supabase, createSessionClient } from '@/lib/supabase'
import { scrapeMetadata } from '@/lib/metadata'
import { generateTags } from '@/lib/tagging'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const client = await createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: link, error: fetchError } = await supabase
    .from('links')
    .select('url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !link) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let meta: Awaited<ReturnType<typeof scrapeMetadata>>
  try {
    meta = await scrapeMetadata(link.url)
  } catch (e) {
    console.error('scrapeMetadata failed:', e)
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 422 })
  }

  let tags: string[] = []
  try {
    tags = await generateTags(meta.title, meta.description)
  } catch (e) {
    console.error('generateTags failed:', e)
  }

  const { data, error } = await supabase
    .from('links')
    .update({
      title: meta.title,
      description: meta.description,
      image: meta.image,
      site_name: meta.site_name,
      author: meta.author,
      tags,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
