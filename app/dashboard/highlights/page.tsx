import { createSessionClient, supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import HighlightsList from './HighlightsList'

export default async function HighlightsPage() {
  const client = await createSessionClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) redirect('/login')

  const { data: highlights } = await supabase
    .from('highlights')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col h-dvh bg-zinc-50">
      <header className="shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b border-zinc-200">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-sm font-semibold text-zinc-900 tracking-tight hover:text-orange-600">
            stash
          </a>
          <span className="text-zinc-300">/</span>
          <span className="text-[0.6875rem] font-mono font-medium text-zinc-500 uppercase tracking-widest">
            <span className="text-orange-500">// </span>highlights
          </span>
        </div>
        <span className="text-[0.6875rem] font-mono text-zinc-400 tabular-nums">
          {highlights?.length ?? 0}
        </span>
      </header>
      <main className="flex-1 min-h-0 overflow-y-auto">
        <HighlightsList highlights={highlights ?? []} />
      </main>
    </div>
  )
}
