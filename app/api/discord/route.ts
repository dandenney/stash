import { NextRequest, NextResponse } from 'next/server'

const URL_REGEX = /https?:\/\/[^\s<>)"]+/g

// Discord sends a ping verification on first setup
export async function POST(req: NextRequest) {
  const body = await req.json()

  if (body.type === 1) {
    return NextResponse.json({ type: 1 })
  }

  const content: string = body.content ?? ''
  const urls = content.match(URL_REGEX)

  if (!urls?.length) {
    return NextResponse.json({ ok: true })
  }

  const notes = content.replace(URL_REGEX, '').trim() || null

  await Promise.all(
    urls.map((url) =>
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.STASH_API_KEY!,
        },
        body: JSON.stringify({ url, notes }),
      })
    )
  )

  return NextResponse.json({ ok: true })
}
