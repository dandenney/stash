'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Link } from '@/lib/supabase'

export default function StashedList({ links: initial }: { links: Link[] }) {
  const [links, setLinks] = useState(initial)
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setLinks(initial)
  }, [initial])

  const allTags = Array.from(new Set(links.flatMap((l) => l.tags))).sort()

  const filtered = links.filter((link) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      link.title.toLowerCase().includes(q) ||
      (link.notes?.toLowerCase().includes(q) ?? false) ||
      (link.description?.toLowerCase().includes(q) ?? false) ||
      (link.site_name?.toLowerCase().includes(q) ?? false) ||
      link.tags.some((t) => t.toLowerCase().includes(q))
    const matchesTag = !activeTag || link.tags.includes(activeTag)
    return matchesSearch && matchesTag
  })

  async function toggleShared(link: Link) {
    const is_shared = !link.is_shared
    const res = await fetch(`/api/links/${link.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_shared }),
    })
    if (res.ok) {
      const updated: Link = await res.json()
      setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
      router.refresh()
    }
  }

  if (links.length === 0) {
    return <div className="px-3 py-8 text-center text-xs text-zinc-400 font-mono">// nothing stashed yet</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 p-3 border-b border-zinc-100">
        <input
          type="search"
          placeholder="Search stashed…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded px-2.5 py-1.5 outline-none focus-visible:border-orange-400 placeholder-zinc-400"
        />
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {allTags.slice(0, 15).map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`text-[0.625rem] px-1.5 py-0.5 rounded ${
                  activeTag === tag
                    ? 'bg-orange-400 text-zinc-900'
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
      <ul role="list" className="flex-1 overflow-y-auto divide-y divide-zinc-100">
        {filtered.length === 0 && (
          <li className="px-3 py-8 text-center text-xs text-zinc-400 font-mono">no matches</li>
        )}
        {filtered.map((link) => (
          <li key={link.id} className="group flex items-start gap-2.5 px-3 py-2.5 hover:bg-zinc-50">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-zinc-800 hover:text-orange-600 truncate"
                >
                  {link.title}
                </a>
                {link.is_shared && (
                  <span className="shrink-0 size-1.5 rounded-full bg-green-400" title="Shared" />
                )}
              </div>
              {(link.site_name || link.media_type === 'video') && (
                <p className="text-[0.625rem] font-mono text-zinc-400 mt-0.5 truncate">
                  {[link.site_name, link.media_type === 'video' ? '▶ video' : null].filter(Boolean).join(' · ')}
                </p>
              )}
              {link.notes && (
                <p className="text-[0.6875rem] text-zinc-600 mt-0.5 truncate">{link.notes}</p>
              )}
              {link.description && (
                <p className="text-[0.6875rem] text-zinc-400 italic mt-0.5 truncate">{link.description}</p>
              )}
              {link.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {link.tags.map((tag) => (
                    <span key={tag} className="text-[0.625rem] bg-zinc-100 text-zinc-400 px-1 py-px rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => toggleShared(link)}
              className={`shrink-0 text-[0.6875rem] px-2 py-0.5 rounded border mt-0.5 focus-visible:outline-2 focus-visible:outline-offset-1 opacity-0 group-hover:opacity-100 ${
                link.is_shared
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'text-zinc-500 border-zinc-200 hover:text-zinc-800 hover:border-zinc-400'
              }`}
            >
              {link.is_shared ? 'Unshare' : 'Share'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
