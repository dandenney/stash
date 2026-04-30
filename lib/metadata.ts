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

function isYouTubeUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return hostname === 'youtube.com' || hostname === 'youtu.be'
  } catch {
    return false
  }
}

function isXUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return hostname === 'x.com' || hostname === 'twitter.com'
  } catch {
    return false
  }
}

async function scrapeYouTubeMetadata(url: string) {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  console.log('[metadata] YouTube oEmbed request:', oembedUrl)
  const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(8000) })
  console.log('[metadata] YouTube oEmbed status:', res.status)
  if (!res.ok) return null

  const data = await res.json()
  console.log('[metadata] YouTube oEmbed data:', data)
  return {
    title: data.title ?? url,
    description: null,
    image: data.thumbnail_url ?? null,
    site_name: 'YouTube',
    author: data.author_name ?? null,
  }
}

async function scrapeXMetadata(url: string) {
  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`
  console.log('[metadata] X oEmbed request:', oembedUrl)
  const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(8000) })
  console.log('[metadata] X oEmbed status:', res.status)
  if (!res.ok) return null

  const data = await res.json()
  console.log('[metadata] X oEmbed data:', data)

  const $ = cheerio.load(data.html ?? '')
  const p = $('blockquote p').first()

  // Profile oEmbed (and other non-tweet pages) have no blockquote p
  if (!p.length) return null

  const tweetText = p.text().trim()

  // Follow any t.co link in the tweet to get the real article title
  const tcoHref = p.find('a[href^="https://t.co/"]').first().attr('href')
  if (tcoHref) {
    console.log('[metadata] X following t.co link:', tcoHref)
    try {
      const linkedRes = await fetch(tcoHref, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Stash/1.0)' },
        signal: AbortSignal.timeout(8000),
      })
      const linkedHtml = await linkedRes.text()
      const $l = cheerio.load(linkedHtml)
      const linkedTitle =
        $l('meta[property="og:title"]').attr('content') ||
        $l('meta[name="twitter:title"]').attr('content') ||
        $l('title').text() ||
        null
      const linkedDescription =
        $l('meta[property="og:description"]').attr('content') ||
        $l('meta[name="description"]').attr('content') ||
        null
      const linkedImage =
        $l('meta[property="og:image"]').attr('content') ||
        $l('meta[name="twitter:image"]').attr('content') ||
        null
      console.log('[metadata] X linked title:', linkedTitle)
      if (linkedTitle) {
        const cleanTweet = tweetText.replace(/https?:\/\/t\.co\/\S+/g, '').replace(/\s+/g, ' ').trim()
        return {
          title: linkedTitle.trim(),
          description: (linkedDescription?.trim() ?? cleanTweet) || null,
          image: linkedImage?.trim() ?? null,
          site_name: 'X',
          author: data.author_name ?? null,
        }
      }
    } catch (e) {
      console.error('[metadata] X linked page fetch failed:', e)
    }
  }

  return {
    title: tweetText || url,
    description: null,
    image: data.thumbnail_url ?? null,
    site_name: 'X',
    author: data.author_name ?? null,
  }
}

export async function scrapeMetadata(url: string) {
  console.log('[metadata] scrapeMetadata:', url)

  if (isYouTubeUrl(url)) {
    const data = await scrapeYouTubeMetadata(url)
    if (data) return data
  }

  if (isXUrl(url)) {
    const data = await scrapeXMetadata(url)
    if (data) return data
  }

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

  const image =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    null

  const site_name =
    $('meta[property="og:site_name"]').attr('content') ||
    null

  const author =
    $('meta[name="author"]').attr('content') ||
    $('meta[property="article:author"]').attr('content') ||
    null

  return {
    title: title.trim(),
    description: description?.trim() ?? null,
    image: image?.trim() ?? null,
    site_name: site_name?.trim() ?? null,
    author: author?.trim() ?? null,
  }
}
