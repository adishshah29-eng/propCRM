'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { getDashboardPath } from '@/lib/utils/roleGuard'

export function useAuth() {
  const router = useRouter()
  const { user, role, setUser, setRole, setLoading, clearAuth } = useAuthStore()

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      setLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profile) {
          setUser(profile)
          setRole(profile.role)
        } else {
          clearAuth()
        }
      } else {
        clearAuth()
      }
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        clearAuth()
        router.push('/login')
      } else if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          setUser(profile)
          setRole(profile.role)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router, setUser, setRole, setLoading, clearAuth])

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    clearAuth()
    router.push('/login')
  }

  return { user, role, logout, isLoading: useAuthStore.getState().isLoading }
}
