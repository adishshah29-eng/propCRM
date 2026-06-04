import { createClient } from '@/lib/supabase/client'
import type { SocialPost } from '@/types/common.types'

export async function createSocialPost(post: Omit<SocialPost, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient()
  const { data, error } = await supabase.from('social_posts').insert(post).select().single()
  if (error) throw error
  return data
}

export async function updatePostStatus(id: string, status: SocialPost['status']) {
  const supabase = createClient()
  const { data, error } = await supabase.from('social_posts').update({ status }).eq('id', id).select().single()
  if (error) throw error
  return data
}
