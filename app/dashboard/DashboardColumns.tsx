'use client'

import { useEffect, useState } from 'react'
import { signOut } from '@/app/actions'
import type { Link, ApiToken } from '@/lib/supabase'
import TokenManager from './TokenManager'
import LinkQueue from './LinkQueue'
import StashedList from './StashedList'

const COOKIE_KEY = 'layout-inverted'

function persistCookie(value: boolean) {
  document.cookie = `${COOKIE_KEY}=${value}; path=/; max-age=31536000; samesite=strict`
}

export default function DashboardColumns({
  scoreLinks,
  stashedLinks,
  apiTokens,
  userEmail,
  userId,
  initialInverted,
}: {
  scoreLinks: Link[]
  stashedLinks: Link[]
  apiTokens: ApiToken[]
  userEmail: string
  userId: string
  initialInverted: boolean
}) {
  const [inverted, setInverted] = useState(initialInverted)

  useEffect(() => {
    persistCookie(initialInverted)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function toggle() {
    const next = !inverted
    setInverted(next)
    persistCookie(next)
    fetch('/api/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layout_inverted: next }),
    })
  }

  const stashedContent = (
    <>
      <div className="shrink-0 px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
        <h2 className="text-[0.6875rem] font-mono font-medium text-zinc-500 uppercase tracking-widest">
          <span className="text-orange-500">// </span>stashed
        </h2>
        <span className="text-[0.6875rem] font-mono text-zinc-400 tabular-nums">
          {stashedLinks.length}
        </span>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <StashedList links={stashedLinks} />
      </div>
      <details className="shrink-0 border-t border-zinc-200">
        <summary className="px-4 py-2 text-[0.6875rem] font-mono font-medium text-zinc-400 uppercase tracking-widest cursor-pointer hover:text-zinc-600 list-none flex items-center gap-2">
          <span className="text-orange-500">// </span>api tokens
        </summary>
        <div className="px-4 pb-4 pt-2">
          <TokenManager tokens={apiTokens} userId={userId} />
        </div>
      </details>
    </>
  )

  const scoreContent = (
    <>
      <div className="shrink-0 px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
        <h2 className="text-[0.6875rem] font-mono font-medium text-zinc-500 uppercase tracking-widest">
          <span className="text-orange-500">// </span>the score
        </h2>
        <span className="text-[0.6875rem] font-mono text-zinc-400 tabular-nums">
          {scoreLinks.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-1">
        <LinkQueue links={scoreLinks} />
      </div>
    </>
  )

  return (
    <div className="flex flex-col h-dvh bg-zinc-50 isolate">
      <header className="shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-zinc-900 tracking-tight">stash</span>
          {scoreLinks.length > 0 && (
            <span className="text-[0.6875rem] font-mono text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded tabular-nums">
              {scoreLinks.length} in the score
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            title={inverted ? 'Default layout' : 'Flip layout'}
            className="text-sm text-zinc-400 hover:text-zinc-700 leading-none"
          >
            ⇄
          </button>
          <span className="text-xs text-zinc-400 font-mono">{userEmail}</span>
          <form action={signOut}>
            <button type="submit" className="text-xs text-zinc-400 hover:text-zinc-700">
              sign out
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {inverted ? (
          <>
            <div className="flex flex-col w-3/5 border-r border-zinc-200 min-h-0 bg-white">
              {scoreContent}
            </div>
            <div className="flex flex-col w-2/5 min-h-0 bg-white">
              {stashedContent}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col w-2/5 border-r border-zinc-200 min-h-0 bg-white">
              {stashedContent}
            </div>
            <div className="flex flex-col w-3/5 min-h-0 bg-white">
              {scoreContent}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
