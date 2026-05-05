'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Link } from '@/lib/supabase'

function TriageCard({
  link: initial,
  exiting,
  onStash,
  onDelete,
}: {
  link: Link
  exiting: boolean
  onStash: (link: Link) => void
  onDelete: (link: Link) => void
}) {
  const [link, setLink] = useState(initial)
  const [scraping, setScraping] = useState(false)

  async function rescrape() {
    setScraping(true)
    const res = await fetch(`/api/links/${link.id}/rescrape`, { method: 'POST' })
    if (res.ok) {
      const updated: Link = await res.json()
      setLink(updated)
    }
    setScraping(false)
  }

  const exitClasses = exiting ? 'opacity-0 -translate-x-2 pointer-events-none' : ''

  return (
    <div data-uidotsh-pick="Score card style" className="contents">

      {/* Compact (current) */}
      <li data-uidotsh-option="Compact (current)" className={['group flex items-start gap-3 py-3 border-b border-zinc-100 last:border-0 transition-all duration-200', exitClasses].join(' ')}>
        <div className="shrink-0 size-9 rounded bg-zinc-100 overflow-hidden mt-0.5">
          {link.image ? (
            <img src={link.image} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full flex items-center justify-center text-zinc-300 text-[0.625rem]">
              {link.media_type === 'video' ? '▶' : '◻'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-900 hover:text-orange-600 truncate block">{link.title}</a>
          {link.description && <p className="text-[0.6875rem] text-zinc-600 truncate mt-0.5">{link.description}</p>}
          <div className="flex items-center gap-2 mt-1">
            {(link.site_name || link.author) && <span className="text-[0.625rem] font-mono text-zinc-600 truncate">{[link.site_name, link.author].filter(Boolean).join(' · ')}</span>}
            {link.media_type === 'video' && !link.image && <span className="text-[0.625rem] text-zinc-600 shrink-0">▶ video</span>}
            {link.tags.length > 0 && (
              <div className="flex gap-1 overflow-hidden">
                {link.tags.slice(0, 2).map((tag) => <span key={tag} className="text-[0.625rem] bg-zinc-100 text-zinc-700 px-1.5 py-px rounded shrink-0">{tag}</span>)}
                {link.tags.length > 2 && <span className="text-[0.625rem] text-zinc-600 shrink-0">+{link.tags.length - 2}</span>}
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 mt-0.5 opacity-0 group-hover:opacity-100">
          <button onClick={rescrape} disabled={scraping} className="h-7 px-2 text-[0.6875rem] font-mono text-zinc-400 hover:text-zinc-700 disabled:opacity-40" title="Re-scrape metadata">{scraping ? '…' : '↺'}</button>
          <button onClick={() => onDelete(link)} className="size-7 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded text-base leading-none" title="Delete">
            <span className="relative">×<span className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden" aria-hidden="true" /></span>
          </button>
          <button onClick={() => onStash(link)} className="h-7 px-2.5 text-[0.6875rem] font-medium bg-orange-400 text-zinc-900 hover:bg-orange-500 rounded focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2">Stash</button>
        </div>
      </li>

      {/* Bigger thumbnails */}
      <li data-uidotsh-option="Bigger thumbnails" className={['group flex items-start gap-3 py-3 border-b border-zinc-100 last:border-0 transition-all duration-200', exitClasses].join(' ')} hidden>
        <div className="shrink-0 size-14 rounded-md bg-zinc-100 overflow-hidden mt-0.5">
          {link.image ? (
            <img src={link.image} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full flex items-center justify-center text-zinc-300 text-base">
              {link.media_type === 'video' ? '▶' : '◻'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-900 hover:text-orange-600 truncate block">{link.title}</a>
          {link.description && <p className="text-[0.6875rem] text-zinc-500 line-clamp-2 mt-0.5">{link.description}</p>}
          <div className="flex items-center gap-2 mt-1">
            {(link.site_name || link.author) && <span className="text-[0.625rem] font-mono text-zinc-500 truncate">{[link.site_name, link.author].filter(Boolean).join(' · ')}</span>}
            {link.tags.length > 0 && (
              <div className="flex gap-1 overflow-hidden">
                {link.tags.slice(0, 3).map((tag) => <span key={tag} className="text-[0.625rem] bg-zinc-100 text-zinc-600 px-1.5 py-px rounded shrink-0">{tag}</span>)}
                {link.tags.length > 3 && <span className="text-[0.625rem] text-zinc-500 shrink-0">+{link.tags.length - 3}</span>}
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 mt-0.5 opacity-0 group-hover:opacity-100">
          <button onClick={rescrape} disabled={scraping} className="h-7 px-2 text-[0.6875rem] font-mono text-zinc-400 hover:text-zinc-700 disabled:opacity-40" title="Re-scrape metadata">{scraping ? '…' : '↺'}</button>
          <button onClick={() => onDelete(link)} className="size-7 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded text-base leading-none" title="Delete">
            <span className="relative">×<span className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden" aria-hidden="true" /></span>
          </button>
          <button onClick={() => onStash(link)} className="h-7 px-2.5 text-[0.6875rem] font-medium bg-orange-400 text-zinc-900 hover:bg-orange-500 rounded focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2">Stash</button>
        </div>
      </li>

      {/* Rich preview */}
      <li data-uidotsh-option="Rich preview" className={['group flex items-start gap-3 py-3.5 border-b border-zinc-100 last:border-0 transition-all duration-200', exitClasses].join(' ')} hidden>
        <div className="shrink-0 w-20 h-14 rounded-md bg-zinc-100 overflow-hidden mt-0.5">
          {link.image ? (
            <img src={link.image} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full flex items-center justify-center text-zinc-300 text-lg">
              {link.media_type === 'video' ? '▶' : '◻'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-900 hover:text-orange-600 block">{link.title}</a>
          {link.description && <p className="text-[0.6875rem] text-zinc-500 line-clamp-2 mt-1 text-pretty">{link.description}</p>}
          <div className="flex items-center gap-2 mt-1.5">
            {(link.site_name || link.author) && <span className="text-[0.625rem] font-mono text-zinc-400 truncate">{[link.site_name, link.author].filter(Boolean).join(' · ')}</span>}
            {link.tags.length > 0 && (
              <div className="flex gap-1 overflow-hidden">
                {link.tags.slice(0, 3).map((tag) => <span key={tag} className="text-[0.625rem] bg-orange-50 text-orange-700 border border-orange-100 px-1.5 py-px rounded-full shrink-0">{tag}</span>)}
                {link.tags.length > 3 && <span className="text-[0.625rem] text-zinc-400 shrink-0">+{link.tags.length - 3}</span>}
              </div>
            )}
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5 mt-0.5">
          <button onClick={() => onStash(link)} className="h-7 px-2.5 text-[0.6875rem] font-medium bg-orange-400 text-zinc-900 hover:bg-orange-500 rounded focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2 opacity-30 group-hover:opacity-100 transition-opacity">Stash</button>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
            <button onClick={rescrape} disabled={scraping} className="h-6 px-1.5 text-[0.625rem] font-mono text-zinc-400 hover:text-zinc-700 disabled:opacity-40" title="Re-scrape">{scraping ? '…' : '↺'}</button>
            <button onClick={() => onDelete(link)} className="size-6 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded text-sm leading-none" title="Delete">×</button>
          </div>
        </div>
      </li>

    </div>
  )
}

export default function LinkQueue({ links: initial }: { links: Link[] }) {
  const [links, setLinks] = useState(initial)
  const [exiting, setExiting] = useState<Set<string>>(new Set())
  const router = useRouter()
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLinks(initial)
  }, [initial])

  function scheduleRefresh() {
    if (refreshTimer.current) clearTimeout(refreshTimer.current)
    refreshTimer.current = setTimeout(() => router.refresh(), 1500)
  }

  function startExit(link: Link, apiCall: () => Promise<Response>) {
    setExiting(prev => new Set([...prev, link.id]))

    const timer = setTimeout(() => {
      setLinks(prev => prev.filter(l => l.id !== link.id))
      setExiting(prev => { const s = new Set(prev); s.delete(link.id); return s })
    }, 200)

    apiCall().then(res => {
      if (!res.ok) {
        clearTimeout(timer)
        setExiting(prev => { const s = new Set(prev); s.delete(link.id); return s })
        setLinks(prev => {
          if (prev.some(l => l.id === link.id)) return prev
          return [...prev, link].sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        })
      } else {
        scheduleRefresh()
      }
    })
  }

  function handleStash(link: Link) {
    startExit(link, () =>
      fetch(`/api/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'stashed', is_shared: true }),
      })
    )
  }

  function handleDelete(link: Link) {
    startExit(link, () =>
      fetch(`/api/links/${link.id}`, { method: 'DELETE' })
    )
  }

  if (links.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-xs text-zinc-400 font-mono">// score is clear</p>
      </div>
    )
  }

  return (
    <ul role="list">
      {links.map((link) => (
        <TriageCard
          key={link.id}
          link={link}
          exiting={exiting.has(link.id)}
          onStash={handleStash}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  )
}
