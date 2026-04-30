import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400, headers: corsHeaders })
  }

  const { data, error } = await supabase
    .from('links')
    .select('shared_at')
    .eq('user_id', userId)
    .eq('is_shared', true)
    .eq('status', 'stashed')
    .not('shared_at', 'is', null)
    .order('shared_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })

  const months = [...new Set(data.map((r) => r.shared_at!.slice(0, 7)))].sort().reverse()

  return NextResponse.json(months, { headers: corsHeaders })
}
