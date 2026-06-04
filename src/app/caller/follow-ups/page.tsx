'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Clock, Calendar, Phone, MessageCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/common/Modal'
import { formatDateTime, timeAgo } from '@/lib/utils/formatDate'
import type { FollowUp } from '@/types/common.types'

export default function FollowUpsPage() {
  const [completeModal, setCompleteModal] = useState(false)
  const [selectedFollowup, setSelectedFollowup] = useState<FollowUp | null>(null)
  const [notes, setNotes] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  const { data: followups, isLoading } = useQuery({
    queryKey: ['caller-followups'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*, leads(full_name, phone)')
        .eq('assigned_to', user.id)
        .order('scheduled_at', { ascending: true })
      if (error) throw error
      return data as (FollowUp & { leads: { full_name: string; phone: string } | null })[]
    },
  })

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFollowup) return
      const { error } = await supabase.from('follow_ups').update({
        status: 'Done',
        snoozed_until: null,
      }).eq('id', selectedFollowup.id)
      if (error) throw error

      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('activities').insert({
        lead_id: selectedFollowup.lead_id,
        type: 'follow-up',
        description: `Follow-up completed: ${notes}`,
        created_by: user?.id,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['caller-followups'] })
      setCompleteModal(false)
      setSelectedFollowup(null)
      setNotes('')
    },
  })

  const isOverdue = (fu: FollowUp) => {
    if (fu.status === 'Done') return false
    if (!fu.scheduled_at) return false
    return new Date(fu.scheduled_at) < new Date()
  }

  const pending = followups?.filter((f) => f.status !== 'Done') ?? []
  const completed = followups?.filter((f) => f.status === 'Done') ?? []
  const overdueCount = pending.filter(isOverdue).length

  return (
    <div>
      <PageHeader title="Follow-ups" description="Scheduled follow-ups list" />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card><CardContent className="p-3 text-center">
          <Clock size={16} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{pending.length}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <AlertTriangle size={16} className="mx-auto text-danger mb-1" />
          <p className="text-lg font-bold text-foreground">{overdueCount}</p>
          <p className="text-[10px] text-muted-foreground">Overdue</p>
        </CardContent></Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : pending.length === 0 ? (
        <div className="rounded-card border border-border bg-card p-8 text-center">
          <CheckCircle size={32} className="mx-auto text-success mb-3" />
          <p className="text-muted-foreground">You're all caught up! No pending follow-ups.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((fu) => (
            <div key={fu.id} className={`flex items-start gap-3 p-4 rounded-card border bg-card ${
              isOverdue(fu) ? 'border-danger/30 bg-danger/5' : 'border-border'
            }`}>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                fu.channel === 'call' ? 'bg-primary/10 text-primary' :
                fu.channel === 'whatsapp' ? 'bg-success/10 text-success' :
                'bg-info/10 text-info'
              }`}>
                {fu.channel === 'call' ? <Phone size={18} /> :
                 fu.channel === 'whatsapp' ? <MessageCircle size={18} /> :
                 <Clock size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{fu.leads?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{fu.leads?.phone || ''}</p>
                  </div>
                  <Badge variant={isOverdue(fu) ? 'danger' : fu.status === 'Sent' ? 'success' : 'warning'}>
                    {isOverdue(fu) ? 'Overdue' : fu.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {fu.scheduled_at ? formatDateTime(fu.scheduled_at) : 'No date'}
                  </span>
                  {isOverdue(fu) && (
                    <span className="text-danger font-medium">{timeAgo(fu.scheduled_at)}</span>
                  )}
                </div>
                {fu.message_template && (
                  <p className="text-xs text-muted-foreground mt-2 bg-muted/30 rounded p-2">{fu.message_template}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => { setSelectedFollowup(fu); setCompleteModal(true) }}>
                    <CheckCircle size={14} className="mr-1" /> Complete
                  </Button>
                  <Button size="sm" variant="outline">
                    <Clock size={14} className="mr-1" /> Snooze
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={completeModal} onClose={() => setCompleteModal(false)} title="Complete Follow-up" maxWidth="max-w-sm">
        {selectedFollowup && (
          <div className="space-y-4">
            <p className="text-sm text-foreground">Mark follow-up with {selectedFollowup.leads?.full_name} as complete?</p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Outcome Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="What happened during the follow-up?"
                className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCompleteModal(false)}>Cancel</Button>
              <Button onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>
                {completeMutation.isPending ? 'Saving...' : 'Complete'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
