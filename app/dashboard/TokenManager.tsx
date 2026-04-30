'use client'

import { useState } from 'react'
import type { ApiToken } from '@/lib/supabase'

interface Props {
  tokens: ApiToken[]
  userId: string
}

export default function TokenManager({ tokens: initial }: Props) {
  const [tokens, setTokens] = useState(initial)
  const [label, setLabel] = useState('')
  const [creating, setCreating] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)

  async function createToken() {
    setCreating(true)
    const res = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: label || 'default' }),
    })
    const token = await res.json()
    setTokens((prev) => [token, ...prev])
    setNewToken(token.token)
    setLabel('')
    setCreating(false)
  }

  async function deleteToken(id: string) {
    await fetch('/api/tokens', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setTokens((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-3">
      {newToken && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p className="text-xs font-medium text-green-700 mb-1">New token — copy it now, it won't be shown again</p>
          <code className="text-xs break-all text-green-900">{newToken}</code>
          <button onClick={() => setNewToken(null)} className="block text-xs text-green-600 hover:text-green-800 mt-2">
            Dismiss
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Token label (e.g. discord-bot)"
          className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus-visible:border-sky-400"
        />
        <button
          onClick={createToken}
          disabled={creating}
          className="px-3 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-zinc-900 focus-visible:outline-offset-2"
        >
          {creating ? 'Creating…' : 'Create token'}
        </button>
      </div>
      {tokens.length === 0 ? (
        <p className="text-sm text-stone-400">No tokens yet.</p>
      ) : (
        <ul role="list" className="space-y-2">
          {tokens.map((token) => (
            <li key={token.id} className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-900">{token.label}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  Created {new Date(token.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => deleteToken(token.id)}
                className="text-xs text-stone-400 hover:text-red-500"
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
