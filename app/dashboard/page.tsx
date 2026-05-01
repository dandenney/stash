import { createSessionClient, supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import DashboardColumns from './DashboardColumns'

export default async function DashboardPage() {
  const client = await createSessionClient()
  const { data: { user } } = await client.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: score }, { data: stashed }, { data: tokens }, { data: prefs }] = await Promise.all([
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
    supabase
      .from('user_preferences')
      .select('layout_inverted')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  return (
    <DashboardColumns
      scoreLinks={score ?? []}
      stashedLinks={stashed ?? []}
      apiTokens={tokens ?? []}
      userEmail={user.email!}
      userId={user.id}
      initialInverted={prefs?.layout_inverted ?? false}
    />
  )
}
