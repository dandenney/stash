@AGENTS.md

# Stash — AI context

## Domain language

All domain terms are defined in `CONTEXT.md`. Always use those terms in code, comments, and conversation. Key ones:

- **The Score** — links awaiting triage (`status = 'score'`)
- **Stashed** — links that have been triaged and kept (`status = 'stashed'`)
- **Shared** — a flag on Stashed links that makes them public (`is_shared = true`, `shared_at` set)
- **Triage** — the daily workflow of processing The Score

Architectural decisions are in `docs/adr/`.

## Tech stack

- **Next.js 16 (App Router)** — see AGENTS.md warning about breaking changes
- **Supabase** — Postgres + Auth (Google OAuth)
- **Tailwind CSS v4**
- **Claude Haiku** (`@anthropic-ai/sdk`) — auto-generates tags on link save

## Data model

One table: `links`

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK to auth.users |
| url | text | |
| title | text | scraped, editable |
| description | text? | scraped |
| image | text? | scraped |
| site_name | text? | scraped |
| author | text? | scraped |
| notes | text? | user-provided |
| tags | text[] | AI-generated, editable. GIN index. |
| media_type | article\|video | auto-detected from URL |
| status | score\|stashed | lifecycle state |
| is_shared | boolean | default false — explicit sharing only |
| shared_at | timestamptz? | set when is_shared first becomes true |
| created_at | timestamptz | |

Support table: `api_tokens` (id, user_id, token, label, created_at)

Migrations live in `migrations/`. Run them manually in the Supabase SQL editor in order.

## Auth

- Google OAuth via Supabase
- Email allowlist: `ALLOWED_EMAILS=a@b.com,c@d.com` in env — checked at `/auth/callback`
- If `ALLOWED_EMAILS` is empty, the check is skipped (safe for local dev)
- Session auth (cookies) for dashboard routes
- API token (`x-api-key` header) for programmatic write access (Discord bot, Chrome extension)

## API surface

### Public read (CORS enabled, no auth)
- `GET /api/links?user_id=<uuid>` — current month's Shared links, sorted by `shared_at` asc
- `GET /api/links?user_id=<uuid>&month=YYYY-MM` — specific month's Shared links
- `GET /api/links/months?user_id=<uuid>` — array of months with Shared links, e.g. `["2026-04","2026-03"]`

### Authenticated write (x-api-key header)
- `POST /api/links` — save a link; auto-scrapes metadata + generates tags; lands in The Score

### Dashboard (session auth)
- `PATCH /api/links/[id]` — update status, is_shared, title, description, notes, tags
- `POST /api/links/[id]/rescrape` — re-scrape metadata + regenerate tags
- `DELETE /api/links/[id]` — hard delete
- `GET/POST/DELETE /api/tokens` — manage API tokens

## Key conventions

- The Score is always sorted **oldest-first** (ascending `created_at`) — intentional, see triage design
- Monthly feed is sorted **chronologically by `shared_at`** (ascending)
- `shared_at` is set automatically by the API when `is_shared` is set to true — never set it manually
- Tags are lowercase strings; AI generates 3–5 on save; user can add/remove during triage
- Re-scrape returns 422 if metadata fetch fails — it never overwrites existing metadata with nulls
- `status = 'score'` items are never returned by the public API
