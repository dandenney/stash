'use client'

import { useState } from 'react'
import type { Link } from '@/lib/supabase'

export default function LinkQueue({ links: initial }: { links: Link[] }) {
  const [links, setLinks] = useState(initial)

  async function markDone(link: Link) {
    const status = link.media_type === 'video' ? 'watched' : 'read'
    const res = await fetch(`/api/links/${link.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setLinks((prev) => prev.filter((l) => l.id !== link.id))
  }

  if (links.length === 0) {
    return <p className="text-sm text-gray-400">Queue is empty. Drop a link in Discord to get started.</p>
  }

  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-3">
            {link.image ? (
              <img
                src={link.image}
                alt=""
                className="w-20 h-16 object-cover rounded-lg shrink-0"
              />
            ) : (
              <div className="w-20 h-16 bg-gray-100 rounded-lg shrink-0" />
            )}
            <div className="min-w-0">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 hover:underline line-clamp-2 block"
              >
                {link.title}
              </a>
              {(link.site_name || link.author) && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {[link.site_name, link.author].filter(Boolean).join(' · ')}
                </p>
              )}
              {link.notes && <p className="text-xs text-gray-500 mt-0.5">{link.notes}</p>}
              <div className="flex gap-1 mt-1.5">
                {link.tags?.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => markDone(link)}
              className="shrink-0 text-xs text-gray-400 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              {link.media_type === 'video' ? 'Mark watched' : 'Mark read'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
