# Stash

A personal link management system. Save links you want to go through, triage them daily, and share a curated public feed for your site. Think jewel thief: you score the goods, stash what's worth keeping, and fence a few pieces to the world.

## What it does

- **Save links** from a Chrome extension, Discord, or any HTTP client
- **Triage daily** — work through The Score (your inbox), stash what you're keeping, delete the rest
- **Share selectively** — mark individual stashed links as shared; they appear in your public feed
- **Power your site** — pull monthly reading lists via the public API on every build

## Stack

- Next.js 16 (App Router) + TypeScript
- Supabase (Postgres + Google OAuth)
- Tailwind CSS v4
- Claude Haiku for auto-generated tags

## Setup

### 1. Supabase

Create a Supabase project. Run the SQL files in order in the SQL editor:

```
schema.sql
migrations/001_add_status.sql
migrations/002_add_enriched_metadata.sql
migrations/003_score_stashed_is_shared.sql
```

Enable Google OAuth in Supabase Auth → Providers. Add your callback URL:
`https://your-domain.com/auth/callback`

### 2. Environment variables

Create `.env.local`:

```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
ALLOWED_EMAILS=you@example.com,partner@example.com
```

`ALLOWED_EMAILS` is a comma-separated list of Google accounts allowed to sign in. Leave it empty to allow all (local dev only).

### 3. Run

```bash
npm install
npm run dev
```

## Intake

### Chrome extension

Load `chrome-extension/` as an unpacked extension. Set your API URL and an API token (create one in the dashboard under API Tokens).

### Discord

Create a Discord bot and point its webhook at `POST /api/discord`. Any URL in a message is saved to The Score. Non-URL text in the message becomes the note.

### Direct API

```bash
curl -X POST https://your-domain.com/api/links \
  -H "x-api-key: your-token" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "notes": "optional note"}'
```

## Daily triage

Open the dashboard. You'll see The Score — links saved since your last triage, sorted oldest-first.

For each card:
- **Stash** — moves it to your collection
- **Delete** — gone for good
- **Re-scrape** — re-fetches metadata if the title or image came in wrong
- Edit the title, notes, or tags inline before stashing

After stashing, find links in the Stashed section. Toggle the Shared flag to add them to your public feed.

## Public API

All endpoints are CORS-enabled and require no auth. Pass your `user_id` (find it in Supabase Auth → Users).

### Current month's shared links

```
GET /api/links?user_id=<uuid>
```

Returns this month's shared links, sorted chronologically by when they were shared.

### Specific month

```
GET /api/links?user_id=<uuid>&month=2026-03
```

### Available months

```
GET /api/links/months?user_id=<uuid>
```

Returns `["2026-04", "2026-03"]` — useful for generating archive pages in a static site builder.

### Example: Astro site build

```js
const BASE = process.env.STASH_URL
const USER = process.env.STASH_USER_ID

// All months with data (for generating archive pages)
const months = await fetch(`${BASE}/api/links/months?user_id=${USER}`).then(r => r.json())

// Current month (live reading list)
const latest = await fetch(`${BASE}/api/links?user_id=${USER}`).then(r => r.json())

// Specific archive
const links = await fetch(`${BASE}/api/links?user_id=${USER}&month=2026-03`).then(r => r.json())
```

### Link shape

```ts
{
  id: string
  url: string
  title: string
  description: string | null
  image: string | null
  site_name: string | null
  author: string | null
  notes: string | null
  tags: string[]
  media_type: 'article' | 'video'
  is_shared: true
  shared_at: string        // ISO timestamp — use this for month grouping
  created_at: string
}
```

## Domain language

See `CONTEXT.md` for the full glossary. Key terms: **The Score** (inbox), **Stashed** (collection), **Shared** (public flag), **Triage** (daily processing workflow).
