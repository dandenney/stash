'use client'

import { useState } from 'react'
import type { Link } from '@/lib/supabase'

function TriageCard({ link: initial, onRemove }: { link: Link; onRemove: (id: string) => void }) {
  const [link, setLink] = useState(initial)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(initial.title)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesDraft, setNotesDraft] = useState(initial.notes ?? '')
  const [newTag, setNewTag] = useState('')
  const [scraping, setScraping] = useState(false)

  async function patch(body: Record<string, unknown>): Promise<Link | null> {
    const res = await fetch(`/api/links/${link.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) return res.json()
    return null
  }

  async function saveTitle() {
    setEditingTitle(false)
    if (titleDraft.trim() && titleDraft !== link.title) {
      const updated = await patch({ title: titleDraft.trim() })
      if (updated) setLink(updated)
    }
  }

  async function saveNotes() {
    setEditingNotes(false)
    const notes = notesDraft.trim() || null
    if (notes !== link.notes) {
      const updated = await patch({ notes })
      if (updated) setLink(updated)
    }
  }

  async function removeTag(tag: string) {
    const tags = link.tags.filter((t) => t !== tag)
    setLink({ ...link, tags })
    const updated = await patch({ tags })
    if (updated) setLink(updated)
  }

  async function addTag() {
    const tag = newTag.trim().toLowerCase().replace(/,/g, '')
    setNewTag('')
    if (!tag || link.tags.includes(tag)) return
    const tags = [...link.tags, tag]
    setLink({ ...link, tags })
    const updated = await patch({ tags })
    if (updated) setLink(updated)
  }

  async function rescrape() {
    setScraping(true)
    const res = await fetch(`/api/links/${link.id}/rescrape`, { method: 'POST' })
    if (res.ok) {
      const updated: Link = await res.json()
      setLink(updated)
      setTitleDraft(updated.title)
      setNotesDraft(updated.notes ?? '')
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
    <li className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="grid grid-cols-[80px_1fr] gap-3 p-3">
        {link.image ? (
          <img src={link.image} alt="" className="w-20 h-16 object-cover rounded-lg shrink-0" />
        ) : (
          <div className="w-20 h-16 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center">
            <span className="text-xs text-gray-300">{link.media_type === 'video' ? '▶' : '📄'}</span>
          </div>
        )}

        <div className="min-w-0 space-y-1.5">
          {editingTitle ? (
            <input
              autoFocus
              className="text-sm font-medium text-gray-900 w-full border-b border-gray-400 outline-none bg-transparent pb-0.5"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => { if (e.key === 'Enter') saveTitle() }}
            />
          ) : (
            <div className="flex items-start gap-1 group">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 hover:underline line-clamp-2 flex-1"
              >
                {link.title}
              </a>
              <button
                onClick={() => { setTitleDraft(link.title); setEditingTitle(true) }}
                className="text-gray-200 group-hover:text-gray-400 hover:!text-gray-600 shrink-0 mt-0.5 transition-colors text-xs"
                title="Edit title"
              >
                ✎
              </button>
            </div>
          )}

          {(link.site_name || link.author) && (
            <p className="text-xs text-gray-400">
              {[link.site_name, link.author].filter(Boolean).join(' · ')}
            </p>
          )}

          <div className="flex flex-wrap gap-1 items-center">
            {link.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-0.5 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-gray-300 hover:text-gray-600 ml-0.5 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              className="text-xs outline-none bg-transparent w-14 placeholder-gray-300 text-gray-600"
              placeholder="+ tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addTag()
                }
              }}
              onBlur={addTag}
            />
          </div>

          {editingNotes ? (
            <textarea
              autoFocus
              rows={2}
              className="text-xs text-gray-500 w-full border border-gray-200 rounded p-1.5 outline-none resize-none"
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={saveNotes}
            />
          ) : (
            <p
              className="text-xs cursor-pointer"
              onClick={() => setEditingNotes(true)}
            >
              {link.notes
                ? <span className="text-gray-500">{link.notes}</span>
                : <span className="text-gray-300 hover:text-gray-400">+ add note</span>
              }
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-3 py-2 border-t border-gray-100 bg-gray-50">
        <button
          onClick={rescrape}
          disabled={scraping}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
        >
          {scraping ? 'Scraping…' : 'Re-scrape'}
        </button>
        <button
          onClick={deleteSelf}
          className="text-xs text-red-400 hover:text-red-600 transition-colors"
        >
          Delete
        </button>
        <button
          onClick={stash}
          className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Stash
        </button>
      </div>
    </li>
  )
}

export default function LinkQueue({ links: initial }: { links: Link[] }) {
  const [links, setLinks] = useState(initial)

  function remove(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  if (links.length === 0) {
    return <p className="text-sm text-gray-400">The Score is empty. Drop a link in Discord or use the extension.</p>
  }

  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <TriageCard key={link.id} link={link} onRemove={remove} />
      ))}
    </ul>
  )
}
