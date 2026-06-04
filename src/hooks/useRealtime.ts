'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useNotificationStore } from '@/store/notificationStore'
import type { Notification } from '@/types/common.types'

export function useRealtime(channelName: string, table: string, callback?: (payload: unknown) => void) {
  const addNotification = useNotificationStore((state) => state.addNotification)

  useEffect(() => {
    const supabase = createClient()

    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          // Auto-add notifications for relevant events
          if (table === 'notifications' && payload.eventType === 'INSERT') {
            addNotification(payload.new as Notification)
          }
          // Call custom callback if provided
          callback?.(payload)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [channelName, table, callback, addNotification])
}

export function useLeadRealtime(leadId?: string) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!leadId) return

    const supabase = createClient()
    const subscription = supabase
      .channel(`lead-${leadId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities', filter: `lead_id=eq.${leadId}` },
        () => {
          qc.invalidateQueries({ queryKey: ['caller-activities', leadId] })
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [leadId, qc])
}
