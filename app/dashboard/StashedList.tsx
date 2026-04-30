'use client'

import { useState } from 'react'
import type { Link } from '@/lib/supabase'

export default function StashedList({ links: initial }: { links: Link[] }) {
  const [links, setLinks] = useState(initial)

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
    }
  }

  if (links.length === 0) {
    return <p className="text-sm text-gray-400">Nothing stashed yet.</p>
  }

  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 hover:underline truncate block"
              >
                {link.title}
              </a>
              {link.notes && <p className="text-xs text-gray-500 mt-0.5">{link.notes}</p>}
              {link.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {link.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => toggleShared(link)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                link.is_shared
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  : 'text-gray-400 border-gray-200 hover:text-gray-900 hover:border-gray-400'
              }`}
            >
              {link.is_shared ? 'Shared' : 'Share'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
