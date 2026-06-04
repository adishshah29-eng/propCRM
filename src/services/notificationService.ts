import { createClient } from '@/lib/supabase/client'

export async function createNotification(userId: string, type: string, title: string, message?: string, link?: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    link,
    read: false,
  }).select().single()

  if (error) throw error
  return data
}

export async function markNotificationRead(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
  if (error) throw error
}
