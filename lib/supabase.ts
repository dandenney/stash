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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — session refresh cookies
            // will be handled by the next Route Handler or Server Action
          }
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
  image: string | null
  site_name: string | null
  author: string | null
  notes: string | null
  tags: string[]
  media_type: 'article' | 'video'
  status: 'pending' | 'read' | 'watched'
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
