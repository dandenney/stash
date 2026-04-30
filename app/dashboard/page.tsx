import { createSessionClient, supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions'
import TokenManager from './TokenManager'
import LinkQueue from './LinkQueue'
import StashedList from './StashedList'

export default async function DashboardPage() {
  const client = await createSessionClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: score }, { data: stashed }, { data: tokens }] = await Promise.all([
    supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'score')
      .order('created_at', { ascending: true }),
    supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'stashed')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('api_tokens')
      .select('id, label, token, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const scoreLinks = score ?? []
  const stashedLinks = stashed ?? []
  const apiTokens = tokens ?? []

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
          <span className="text-xs text-zinc-400 font-mono">{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-xs text-zinc-400 hover:text-zinc-700">
              sign out
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Stashed panel */}
        <div className="flex flex-col w-2/5 border-r border-zinc-200 min-h-0 bg-white">
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
              <TokenManager tokens={apiTokens} userId={user.id} />
            </div>
          </details>
        </div>

        {/* Score panel */}
        <div className="flex flex-col w-3/5 min-h-0 bg-white">
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
        </div>
      </div>

    </div>
  )
}
