import { createSessionClient, supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions'
import TokenManager from './TokenManager'
import LinkQueue from './LinkQueue'

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
          {stashed?.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing stashed yet.</p>
          ) : (
            <ul className="space-y-2">
              {stashed?.map((link) => (
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
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {link.is_shared && (
                        <span className="text-xs text-green-600 font-medium">Shared</span>
                      )}
                      {link.tags?.map((tag: string) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
