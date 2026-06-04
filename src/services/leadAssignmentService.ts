import { createClient } from '@/lib/supabase/client'

export async function assignLeadRoundRobin(leadId: string, branchId: string) {
  const supabase = createClient()

  // Get callers in branch ordered by last assignment
  const { data: callers } = await supabase
    .from('profiles')
    .select('id')
    .eq('branch_id', branchId)
    .eq('role', 'caller')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (!callers || callers.length === 0) return null

  // Simple round-robin: pick first caller (improve with assignment tracking later)
  const assignedTo = callers[0].id

  await supabase.from('leads').update({ assigned_to: assignedTo }).eq('id', leadId)

  // Create notification
  await supabase.from('notifications').insert({
    user_id: assignedTo,
    type: 'lead_assigned',
    title: 'New Lead Assigned',
    message: 'A new lead has been assigned to you',
    read: false,
  })

  return assignedTo
}
