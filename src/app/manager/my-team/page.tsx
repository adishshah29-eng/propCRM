'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Phone, MessageSquare, AlertTriangle, ArrowRightLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LeadStatusBadge, LeadTemperatureBadge } from '@/components/leads/LeadStatusBadge'
import type { Profile } from '@/types/user.types'
import type { Lead } from '@/types/lead.types'

export default function MyTeamPage() {
  const [reassignModal, setReassignModal] = useState(false)
  const [selectedCaller, setSelectedCaller] = useState<Profile | null>(null)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [newAssignee, setNewAssignee] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  const { data: callers } = useQuery({
    queryKey: ['manager-callers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('role', 'caller').eq('is_active', true)
      if (error) throw error
      return data as Profile[]
    },
  })

  const { data: leads } = useQuery({
    queryKey: ['manager-leads-team'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as Lead[]
    },
  })

  const { data: calls } = useQuery({
    queryKey: ['manager-calls-team'],
    queryFn: async () => {
      const { data, error } = await supabase.from('calls').select('agent_id, duration, created_at')
      if (error) throw error
      return data
    },
  })

  const reassignMutation = useMutation({
    mutationFn: async () => {
      if (!newAssignee || selectedLeads.length === 0) throw new Error('Select leads and a new assignee')
      for (const leadId of selectedLeads) {
        const { error } = await supabase.from('leads').update({ assigned_to: newAssignee }).eq('id', leadId)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manager-leads-team'] })
      setReassignModal(false)
      setSelectedLeads([])
      setNewAssignee('')
      setSelectedCaller(null)
    },
  })

  const getStats = (callerId: string) => {
    const callerLeads = leads?.filter((l) => l.assigned_to === callerId) ?? []
    const callerCalls = calls?.filter((c) => c.agent_id === callerId) ?? []
    const overdue = callerLeads.filter((l) => {
      if (!l.next_followup_at) return false
      return new Date(l.next_followup_at) < new Date()
    }).length
    const totalDuration = callerCalls.reduce((s, c) => s + (c.duration || 0), 0)
    return { leads: callerLeads.length, calls: callerCalls.length, overdue, duration: totalDuration }
  }

  const openReassign = (caller: Profile) => {
    setSelectedCaller(caller)
    const callerLeads = leads?.filter((l) => l.assigned_to === caller.id && l.status !== 'Won' && l.status !== 'Lost') ?? []
    setSelectedLeads(callerLeads.map((l) => l.id))
    setReassignModal(true)
  }

  return (
    <div>
      <PageHeader title="My Team" description="Caller stats, workload, and lead reassignment" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(callers ?? []).map((caller) => {
          const stats = getStats(caller.id)
          return (
            <Card key={caller.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {caller.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{caller.full_name}</p>
                    <p className="text-xs text-muted-foreground">{caller.phone || 'No phone'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center rounded-card bg-muted/50 p-2">
                    <p className="text-lg font-bold text-foreground">{stats.leads}</p>
                    <p className="text-[10px] text-muted-foreground">Leads</p>
                  </div>
                  <div className="text-center rounded-card bg-muted/50 p-2">
                    <p className="text-lg font-bold text-foreground">{stats.calls}</p>
                    <p className="text-[10px] text-muted-foreground">Calls</p>
                  </div>
                  <div className="text-center rounded-card bg-muted/50 p-2">
                    <p className="text-lg font-bold text-foreground">{Math.round(stats.duration / 60)}m</p>
                    <p className="text-[10px] text-muted-foreground">Talk Time</p>
                  </div>
                </div>
                {stats.overdue > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-danger mb-3">
                    <AlertTriangle size={12} /> {stats.overdue} overdue follow-ups
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full" onClick={() => openReassign(caller)}>
                  <ArrowRightLeft size={14} className="mr-1.5" /> Reassign Leads
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Modal open={reassignModal} onClose={() => setReassignModal(false)} title={`Reassign Leads from ${selectedCaller?.full_name}`}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {selectedLeads.length} leads selected for reassignment
          </p>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Reassign To</label>
            <select
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="">Select caller...</option>
              {callers?.filter((c) => c.id !== selectedCaller?.id).map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReassignModal(false)}>Cancel</Button>
            <Button onClick={() => reassignMutation.mutate()} disabled={reassignMutation.isPending || !newAssignee}>
              {reassignMutation.isPending ? 'Reassigning...' : 'Reassign'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
