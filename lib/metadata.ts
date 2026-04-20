import * as cheerio from 'cheerio'

const VIDEO_DOMAINS = ['youtube.com', 'youtu.be', 'vimeo.com', 'loom.com', 'wistia.com']

export function getMediaType(url: string): 'article' | 'video' {
  return VIDEO_DOMAINS.some((d) => {
    try {
      const hostname = new URL(url).hostname.replace('www.', '')
      return hostname === d || hostname.endsWith(`.${d}`)
    } catch {
      return false
    }
  }) ? 'video' : 'article'
}

export function isVideoUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return VIDEO_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`))
  } catch {
    return false
  }
}

export async function scrapeMetadata(url: string) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Stash/1.0)' },
    signal: AbortSignal.timeout(8000),
  })

  const html = await res.text()
  const $ = cheerio.load(html)

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text() ||
    url

  const description =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    null

  return { title: title.trim(), description: description?.trim() ?? null }
}
