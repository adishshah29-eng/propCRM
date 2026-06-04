'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Calendar, Clock, MapPin, Phone, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Appointment {
  id: string
  lead_id: string
  lead_name: string
  agent_id: string
  agent_name: string
  scheduled_at: string
  location: string
  notes: string
  status: 'Scheduled' | 'Completed' | 'Cancelled'
}

export default function AppointmentsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null)
  const [deletingAppt, setDeletingAppt] = useState<Appointment | null>(null)

  const [leadId, setLeadId] = useState('')
  const [agentId, setAgentId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  // For v1, we'll use tasks with "Site Visit" in title as appointments proxy
  // In production, create a dedicated appointments table
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['manager-appointments'],
    queryFn: async () => {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*, leads(full_name), profiles!tasks_assigned_to_fkey(full_name)')
        .ilike('title', '%visit%')
        .order('due_date', { ascending: true })
      if (error) throw error
      return (tasks ?? []).map((t: Record<string, unknown>) => ({
        id: t.id,
        lead_id: t.lead_id,
        lead_name: t.leads?.full_name || 'Unknown',
        agent_id: t.assigned_to,
        agent_name: t.profiles?.full_name || 'Unknown',
        scheduled_at: t.due_date,
        location: t.description || 'Not specified',
        notes: t.description || '',
        status: t.status === 'Done' ? 'Completed' : t.status === 'Pending' ? 'Scheduled' : 'Cancelled',
      })) as Appointment[]
    },
  })

  const { data: leads } = useQuery({
    queryKey: ['manager-appt-leads'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('id, full_name').eq('status', 'Site Visit Scheduled')
      if (error) throw error
      return data
    },
  })

  const { data: callers } = useQuery({
    queryKey: ['manager-appt-callers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name').eq('role', 'caller').eq('is_active', true)
      if (error) throw error
      return data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!leadId || !scheduledAt) throw new Error('Lead and date/time are required')
      const payload = {
        title: 'Site Visit',
        description: `Location: ${location || 'Not specified'}
Notes: ${notes || ''}`,
        lead_id: leadId,
        assigned_to: agentId || null,
        due_date: scheduledAt,
        priority: 'High',
        status: 'Pending',
      }
      if (editingAppt) {
        const { error } = await supabase.from('tasks').update(payload).eq('id', editingAppt.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('tasks').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manager-appointments'] })
      setModalOpen(false)
      resetForm()
    },
    onError: (err: Error) => setError(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deletingAppt) return
      const { error } = await supabase.from('tasks').delete().eq('id', deletingAppt.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manager-appointments'] })
      setConfirmOpen(false)
      setDeletingAppt(null)
    },
  })

  const resetForm = () => {
    setLeadId(''); setAgentId(''); setScheduledAt(''); setLocation(''); setNotes('')
    setError(''); setEditingAppt(null)
  }

  const openEdit = (appt: Appointment) => {
    setEditingAppt(appt)
    setLeadId(appt.lead_id)
    setAgentId(appt.agent_id)
    setScheduledAt(appt.scheduled_at ? new Date(appt.scheduled_at).toISOString().slice(0, 16) : '')
    setLocation(appt.location)
    setNotes(appt.notes)
    setModalOpen(true)
  }

  const openDelete = (appt: Appointment) => {
    setDeletingAppt(appt)
    setConfirmOpen(true)
  }

  return (
    <div>
      <PageHeader title="Appointments" description="All team viewings calendar">
        <Button onClick={() => { resetForm(); setModalOpen(true) }}>
          <Plus size={16} className="mr-1.5" /> Schedule Visit
        </Button>
      </PageHeader>

      <DataTable
        columns={[
          {
            key: 'lead',
            header: 'Client',
            render: (row) => (
              <div>
                <p className="text-sm font-medium text-foreground">{row.lead_name}</p>
                <p className="text-xs text-muted-foreground">{row.location}</p>
              </div>
            ),
          },
          {
            key: 'agent',
            header: 'Agent',
            render: (row) => <span className="text-sm text-foreground">{row.agent_name}</span>,
          },
          {
            key: 'scheduled',
            header: 'Scheduled',
            render: (row) => (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar size={12} /> {row.scheduled_at ? new Date(row.scheduled_at).toLocaleString() : '-'}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => (
              <span className={`inline-flex items-center rounded-badge px-2 py-0.5 text-xs font-medium uppercase ${
                row.status === 'Completed' ? 'bg-success/10 text-success' :
                row.status === 'Scheduled' ? 'bg-info/10 text-info' :
                'bg-danger/10 text-danger'
              }`}>
                {row.status}
              </span>
            ),
          },
        ]}
        data={appointments ?? []}
        searchKey="lead_name"
        searchPlaceholder="Search appointments..."
        emptyMessage="No appointments scheduled. Create your first site visit above."
        loading={isLoading}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => openEdit(row)} className="rounded-button p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
              <Pencil size={14} />
            </button>
            <button onClick={() => openDelete(row)} className="rounded-button p-1.5 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingAppt ? 'Edit Appointment' : 'Schedule Site Visit'}>
        <div className="space-y-4">
          {error && <div className="rounded-button bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Lead *</label>
            <select value={leadId} onChange={(e) => setLeadId(e.target.value)}
              className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
              <option value="">Select lead...</option>
              {leads?.map((l) => <option key={l.id} value={l.id}>{l.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Assign To</label>
            <select value={agentId} onChange={(e) => setAgentId(e.target.value)}
              className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
              <option value="">Select agent...</option>
              {callers?.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Date & Time *</label>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Property address or landmark" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingAppt ? 'Update' : 'Schedule'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Cancel Appointment"
        description={`Cancel site visit for ${deletingAppt?.lead_name}?`}
        confirmText="Cancel Visit"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
