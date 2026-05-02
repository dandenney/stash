import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { scrapeMetadata, getMediaType } from '@/lib/metadata'
import { generateTags } from '@/lib/tagging'

export const maxDuration = 30

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')
  const monthParam = searchParams.get('month')

  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400, headers: corsHeaders })
  }

  if (monthParam && !/^\d{4}-\d{2}$/.test(monthParam)) {
    return NextResponse.json({ error: 'Invalid month format. Use YYYY-MM' }, { status: 400, headers: corsHeaders })
  }

  const month = monthParam ?? new Date().toISOString().slice(0, 7)
  const [year, mon] = month.split('-').map(Number)
  const nextYear = mon === 12 ? year + 1 : year
  const nextMon = mon === 12 ? 1 : mon + 1
  const rangeStart = `${month}-01T00:00:00.000Z`
  const rangeEnd = `${nextYear}-${String(nextMon).padStart(2, '0')}-01T00:00:00.000Z`

  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .eq('is_shared', true)
    .eq('status', 'stashed')
    .gte('shared_at', rangeStart)
    .lt('shared_at', rangeEnd)
    .order('shared_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })

  return NextResponse.json(data, { headers: corsHeaders })
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  if (!apiKey) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: tokenRow, error: tokenError } = await supabase
    .from('api_tokens')
    .select('user_id')
    .eq('token', apiKey)
    .single()

  if (tokenError || !tokenRow) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
  }

  const body = await req.json()
  const { url, notes } = body

  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

  let title = url
  let description: string | null = null
  let image: string | null = null
  let site_name: string | null = null
  let author: string | null = null
  try {
    const meta = await scrapeMetadata(url)
    title = meta.title
    description = meta.description
    image = meta.image
    site_name = meta.site_name
    author = meta.author
  } catch (e) {
    console.error('scrapeMetadata failed:', e)
  }

  const media_type = getMediaType(url)

  let tags: string[] = []
  try {
    tags = await generateTags(title, description)
  } catch (e) {
    console.error('generateTags failed:', e)
  }

  const { data, error } = await supabase
    .from('links')
    .insert({
      user_id: tokenRow.user_id,
      url,
      title,
      description,
      image,
      site_name,
      author,
      notes: notes ?? null,
      tags,
      media_type,
      status: 'score',
      is_shared: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })

  return NextResponse.json(data, { status: 201, headers: corsHeaders })
}
