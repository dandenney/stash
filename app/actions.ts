'use server'

import { createSessionClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export async function sendMagicLink(formData: FormData) {
  const email = formData.get('email') as string
  const client = await createSessionClient()

  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function signOut() {
  const client = await createSessionClient()
  await client.auth.signOut()
  redirect('/login')
}
