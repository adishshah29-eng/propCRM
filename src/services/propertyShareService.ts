import { createClient } from '@/lib/supabase/client'

export async function logPropertyShare(leadId: string, assetId: string, senderId: string) {
  const supabase = createClient()

  await supabase.from('messages').insert({
    lead_id: leadId,
    sender_id: senderId,
    channel: 'whatsapp',
    asset_id: assetId,
    status: 'sent',
  })

  await supabase.from('activities').insert({
    lead_id: leadId,
    type: 'property-share',
    description: 'Property brochure shared via WhatsApp',
    created_by: senderId,
  })
}
