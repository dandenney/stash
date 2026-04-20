import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function createSessionClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export interface Link {
  id: string
  user_id: string
  url: string
  title: string
  description: string | null
  notes: string | null
  tags: string[]
  type: 'read' | 'watched'
  is_private: boolean
  created_at: string
}

export interface ApiToken {
  id: string
  user_id?: string
  token: string
  label: string
  created_at: string
}
