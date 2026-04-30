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
      .limit(20),
    supabase
      .from('api_tokens')
      .select('id, label, token, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">stash</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-10">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            The Score ({score?.length ?? 0})
          </h2>
          <LinkQueue links={score ?? []} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Stashed
          </h2>
          <StashedList links={stashed ?? []} />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            API Tokens
          </h2>
          <TokenManager tokens={tokens ?? []} userId={user.id} />
        </section>
      </div>
    </main>
  )
}
