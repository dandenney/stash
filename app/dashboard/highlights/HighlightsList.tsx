'use client'

import { useState } from 'react'
import type { Highlight } from '@/lib/supabase'

function localDateKey(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-CA') // YYYY-MM-DD
}

function formatDateHeading(key: string) {
  return new Date(`${key}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function groupByDate(highlights: Highlight[]): [string, Highlight[]][] {
  const groups = new Map<string, Highlight[]>()
  for (const h of highlights) {
    const key = localDateKey(h.created_at)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(h)
  }
  return Array.from(groups.entries())
}

export default function HighlightsList({ highlights: initial }: { highlights: Highlight[] }) {
  const [highlights, setHighlights] = useState(initial)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const filtered = highlights.filter((h) => {
    const q = search.toLowerCase()
    return !q || h.text.toLowerCase().includes(q) || h.title.toLowerCase().includes(q)
  })

  const groups = groupByDate(filtered)

  async function deleteHighlight(id: string) {
    setDeleting(id)
    const res = await fetch(`/api/highlights/${id}`, { method: 'DELETE' })
    if (res.ok) setHighlights((prev) => prev.filter((h) => h.id !== id))
    setDeleting(null)
  }

  if (highlights.length === 0) {
    return (
      <div className="px-4 py-16 text-center text-xs text-zinc-400 font-mono">
        // no highlights yet — select text on any page and click save highlight
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <input
          type="search"
          placeholder="Search highlights…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-white border border-zinc-200 rounded px-2.5 py-1.5 outline-none focus-visible:border-orange-400 placeholder-zinc-400"
        />
      </div>
      {filtered.length === 0 && (
        <div className="text-center text-xs text-zinc-400 font-mono py-8">no matches</div>
      )}
      <div className="space-y-8">
        {groups.map(([date, items]) => (
          <div key={date}>
            <h2 className="text-[0.6875rem] font-mono font-medium text-zinc-400 uppercase tracking-widest mb-3">
              {formatDateHeading(date)}
            </h2>
            <div className="space-y-3">
              {items.map((h) => (
                <div key={h.id} className="group relative bg-white border border-zinc-100 rounded-lg p-4">
                  <blockquote className="text-sm text-zinc-800 leading-relaxed border-l-2 border-orange-300 pl-3 mb-3">
                    {h.text}
                  </blockquote>
                  {h.note && (
                    <p className="text-xs text-zinc-500 italic mb-3">{h.note}</p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-500 hover:text-orange-600 truncate"
                      title={h.url}
                    >
                      {h.title}
                    </a>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[0.625rem] font-mono text-zinc-400">{formatTime(h.created_at)}</span>
                      <button
                        onClick={() => deleteHighlight(h.id)}
                        disabled={deleting === h.id}
                        className="text-[0.6875rem] text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-50"
                      >
                        {deleting === h.id ? '…' : 'delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
