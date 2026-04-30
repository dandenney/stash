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

async function fetchLinkedMeta(targetUrl: string, tweetText: string, author: string | null) {
  const res = await fetch(targetUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Stash/1.0)' },
    signal: AbortSignal.timeout(8000),
  })
  const html = await res.text()
  const $l = cheerio.load(html)
  const title =
    $l('meta[property="og:title"]').attr('content') ||
    $l('meta[name="twitter:title"]').attr('content') ||
    $l('title').text() ||
    null
  if (!title) return null
  const description =
    $l('meta[property="og:description"]').attr('content') ||
    $l('meta[name="description"]').attr('content') ||
    null
  const image =
    $l('meta[property="og:image"]').attr('content') ||
    $l('meta[name="twitter:image"]').attr('content') ||
    null
  return {
    title: title.trim(),
    description: (description?.trim() ?? tweetText) || null,
    image: image?.trim() ?? null,
    site_name: 'X',
    author,
  }
}

async function scrapeXMetadata(url: string) {
  // Only tweet status URLs work with the APIs below
  const match = url.match(/(?:x\.com|twitter\.com)\/([^/?#]+)\/status\/(\d+)/)
  if (!match) return null

  const [, username, statusId] = match

  // fxtwitter API handles X Articles, tweets with links, and plain tweets
  console.log('[metadata] X fxtwitter API:', username, statusId)
  try {
    const res = await fetch(`https://api.fxtwitter.com/${username}/status/${statusId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Stash/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const data = await res.json()
      const tweet = data.tweet
      if (tweet) {
        const author: string | null = tweet.author?.name ?? null

        // X Article (long-form post hosted on x.com/i/article/...)
        if (tweet.article) {
          return {
            title: tweet.article.title ?? url,
            description: tweet.article.preview_text ?? null,
            image: tweet.article.cover_media?.media_info?.original_img_url ?? null,
            site_name: 'X',
            author,
          }
        }

        // Tweet with external links — follow the first non-X expanded URL
        const externalLinks: Array<{ expanded_url?: string }> = (tweet.links ?? []).filter(
          (l: { expanded_url?: string }) => {
            const u = l.expanded_url ?? ''
            return u && !u.includes('//x.com') && !u.includes('//twitter.com')
          }
        )
        if (externalLinks.length > 0) {
          const targetUrl = externalLinks[0].expanded_url!
          console.log('[metadata] X following expanded link:', targetUrl)
          try {
            const cleanTweet = (tweet.text ?? '').replace(/https?:\/\/t\.co\/\S+/g, '').replace(/\s+/g, ' ').trim()
            const linked = await fetchLinkedMeta(targetUrl, cleanTweet, author)
            if (linked) return linked
          } catch (e) {
            console.error('[metadata] X linked page fetch failed:', e)
          }
        }

        // Plain tweet — use cleaned text
        const cleanText = (tweet.text ?? '').replace(/https?:\/\/t\.co\/\S+/g, '').replace(/\s+/g, ' ').trim()
        const tweetImage: string | null = tweet.media?.photos?.[0]?.url ?? tweet.media?.all?.[0]?.url ?? null
        return {
          title: cleanText || url,
          description: null,
          image: tweetImage,
          site_name: 'X',
          author,
        }
      }
    }
  } catch (e) {
    console.error('[metadata] fxtwitter API failed:', e)
  }

  // Fallback: oEmbed (handles regular tweets when fxtwitter is unavailable)
  console.log('[metadata] X falling back to oEmbed')
  try {
    const oembedRes = await fetch(
      `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (oembedRes.ok) {
      const data = await oembedRes.json()
      const $ = cheerio.load(data.html ?? '')
      const p = $('blockquote p').first()
      if (p.length) {
        const tweetText = p.text().trim()
        const tcoHref = p.find('a[href^="https://t.co/"]').first().attr('href')
        if (tcoHref) {
          try {
            const cleanTweet = tweetText.replace(/https?:\/\/t\.co\/\S+/g, '').replace(/\s+/g, ' ').trim()
            const linked = await fetchLinkedMeta(tcoHref, cleanTweet, data.author_name ?? null)
            if (linked) return linked
          } catch (e) {
            console.error('[metadata] X oEmbed link fetch failed:', e)
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
    }
  } catch (e) {
    console.error('[metadata] X oEmbed failed:', e)
  }

  return null
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
