'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type Profile, type Role } from '@/types/user.types'

interface AuthState {
  user: Profile | null
  role: Role | null
  isLoading: boolean
  setUser: (user: Profile | null) => void
  setRole: (role: Role | null) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => set({ user: null, role: null, isLoading: false }),
    }),
    {
      name: 'estateflow-auth',
      partialize: (state) => ({ user: state.user, role: state.role }),
    }
  )
)
