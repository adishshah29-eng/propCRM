'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Property, Asset } from '@/types/property.types'

export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as Property[]
    },
  })
}

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('assets').select('*').eq('is_active', true).order('created_at', { ascending: false })
      if (error) throw error
      return data as Asset[]
    },
  })
}
