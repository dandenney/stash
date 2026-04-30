'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Link } from '@/lib/supabase'

function TriageCard({
  link: initial,
  onRemove,
}: {
  link: Link
  onRemove: (id: string) => void
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

  async function stash() {
    const res = await fetch(`/api/links/${link.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'stashed' }),
    })
    if (res.ok) onRemove(link.id)
  }

  async function deleteSelf() {
    const res = await fetch(`/api/links/${link.id}`, { method: 'DELETE' })
    if (res.ok) onRemove(link.id)
  }

  return (
    <li className="group flex items-start gap-3 py-3 border-b border-zinc-100 last:border-0">
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
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-zinc-900 hover:text-orange-600 truncate block"
        >
          {link.title}
        </a>
        {link.description && (
          <p className="text-[0.6875rem] text-zinc-600 truncate mt-0.5">
            {link.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {(link.site_name || link.author) && (
            <span className="text-[0.625rem] font-mono text-zinc-600 truncate">
              {[link.site_name, link.author].filter(Boolean).join(' · ')}
            </span>
          )}
          {link.media_type === 'video' && !link.image && (
            <span className="text-[0.625rem] text-zinc-600 shrink-0">▶ video</span>
          )}
          {link.tags.length > 0 && (
            <div className="flex gap-1 overflow-hidden">
              {link.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[0.625rem] bg-zinc-100 text-zinc-700 px-1.5 py-px rounded shrink-0">
                  {tag}
                </span>
              ))}
              {link.tags.length > 2 && (
                <span className="text-[0.625rem] text-zinc-600 shrink-0">+{link.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1.5 mt-0.5 opacity-0 group-hover:opacity-100">
        <button
          onClick={rescrape}
          disabled={scraping}
          className="h-7 px-2 text-[0.6875rem] font-mono text-zinc-400 hover:text-zinc-700 disabled:opacity-40"
          title="Re-scrape metadata"
        >
          {scraping ? '…' : '↺'}
        </button>
        <button
          onClick={deleteSelf}
          className="size-7 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded text-base leading-none"
          title="Delete"
        >
          <span className="relative">
            ×
            <span className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden" aria-hidden="true" />
          </span>
        </button>
        <button
          onClick={stash}
          className="h-7 px-2.5 text-[0.6875rem] font-medium bg-orange-400 text-zinc-900 hover:bg-orange-500 rounded focus-visible:outline-2 focus-visible:outline-orange-500 focus-visible:outline-offset-2"
        >
          Stash
        </button>
      </div>
    </li>
  )
}

export default function LinkQueue({ links: initial }: { links: Link[] }) {
  const [links, setLinks] = useState(initial)
  const router = useRouter()

  useEffect(() => {
    setLinks(initial)
  }, [initial])

  function remove(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id))
    router.refresh()
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
        <TriageCard key={link.id} link={link} onRemove={remove} />
      ))}
    </ul>
  )
}
