import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
  const dateParam = searchParams.get('date')
  const monthParam = searchParams.get('month')

  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400, headers: corsHeaders })
  }

  let rangeStart: string
  let rangeEnd: string

  if (dateParam) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400, headers: corsHeaders })
    }
    const next = new Date(dateParam)
    next.setUTCDate(next.getUTCDate() + 1)
    rangeStart = `${dateParam}T00:00:00.000Z`
    rangeEnd = next.toISOString()
  } else {
    const month = monthParam ?? new Date().toISOString().slice(0, 7)
    if (monthParam && !/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json({ error: 'Invalid month format. Use YYYY-MM' }, { status: 400, headers: corsHeaders })
    }
    const [year, mon] = month.split('-').map(Number)
    const nextYear = mon === 12 ? year + 1 : year
    const nextMon = mon === 12 ? 1 : mon + 1
    rangeStart = `${month}-01T00:00:00.000Z`
    rangeEnd = `${nextYear}-${String(nextMon).padStart(2, '0')}-01T00:00:00.000Z`
  }

  const { data, error } = await supabase
    .from('highlights')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', rangeStart)
    .lt('created_at', rangeEnd)
    .order('created_at', { ascending: true })

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
  const { url, title, text, note } = body

  if (!url || !title || !text) {
    return NextResponse.json({ error: 'url, title, and text are required' }, { status: 400, headers: corsHeaders })
  }

  const { data, error } = await supabase
    .from('highlights')
    .insert({
      user_id: tokenRow.user_id,
      url,
      title,
      text,
      note: note ?? null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })

  return NextResponse.json(data, { status: 201, headers: corsHeaders })
}
