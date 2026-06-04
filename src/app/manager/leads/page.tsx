'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Flag, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LeadStatusBadge, LeadTemperatureBadge } from '@/components/leads/LeadStatusBadge'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import type { Lead, LeadStatus, LeadTemperature, LeadSource, PropertyType } from '@/types/lead.types'

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Site Visit Scheduled', 'Negotiation', 'Won', 'Lost', 'Not Responding']
const TEMPS: LeadTemperature[] = ['Cold', 'Warm', 'Hot']
const SOURCES: LeadSource[] = ['36Acre', 'MagicBricks', 'Housing', 'Facebook', 'Instagram', 'Website', 'WhatsApp', 'Referral', 'Manual', 'Other']

export default function ManagerLeadsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [tempFilter, setTempFilter] = useState('')

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<LeadStatus>('New')
  const [temperature, setTemperature] = useState<LeadTemperature>('Cold')
  const [assignedTo, setAssignedTo] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  const { data: leads, isLoading } = useQuery({
    queryKey: ['manager-leads'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('*, profiles(full_name)').order('created_at', { ascending: false })
      if (error) throw error
      return data as (Lead & { profiles: { full_name: string } | null })[]
    },
  })

  const { data: callers } = useQuery({
    queryKey: ['manager-callers-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name').eq('role', 'caller').eq('is_active', true)
      if (error) throw error
      return data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!fullName.trim() || !phone.trim()) throw new Error('Name and phone required')
      const payload = { full_name: fullName, phone, status, temperature, assigned_to: assignedTo || null, notes: notes || null }
      if (editingLead) {
        const { error } = await supabase.from('leads').update(payload).eq('id', editingLead.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('leads').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manager-leads'] })
      setModalOpen(false)
      resetForm()
    },
    onError: (err: Error) => setError(err.message),
  })

  const flagMutation = useMutation({
    mutationFn: async (leadId: string) => {
      const { error } = await supabase.from('tasks').insert({
        title: 'Urgent: Follow up on lead',
        description: 'Manager flagged this lead for immediate attention',
        lead_id: leadId,
        priority: 'Urgent',
        status: 'Pending',
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['manager-tasks'] }),
  })

  const resetForm = () => {
    setFullName(''); setPhone(''); setStatus('New'); setTemperature('Cold')
    setAssignedTo(''); setNotes(''); setError(''); setEditingLead(null)
  }

  const openEdit = (lead: Lead) => {
    setEditingLead(lead)
    setFullName(lead.full_name); setPhone(lead.phone)
    setStatus(lead.status); setTemperature(lead.temperature)
    setAssignedTo(lead.assigned_to || ''); setNotes(lead.notes || '')
    setModalOpen(true)
  }

  let filtered = leads ?? []
  if (statusFilter) filtered = filtered.filter((l) => l.status === statusFilter)
  if (tempFilter) filtered = filtered.filter((l) => l.temperature === tempFilter)

  return (
    <div>
      <PageHeader title="Leads" description="Team lead queue — filter, assign, flag">
        <Button onClick={() => { resetForm(); setModalOpen(true) }}>
          <Plus size={16} className="mr-1.5" /> Add Lead
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-2 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={tempFilter} onChange={(e) => setTempFilter(e.target.value)}
          className="rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
          <option value="">All Temperatures</option>
          {TEMPS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <DataTable
        columns={[
          { key: 'full_name', header: 'Name', sortable: true },
          { key: 'phone', header: 'Phone' },
          { key: 'source', header: 'Source', sortable: true },
          { key: 'status', header: 'Status', render: (row) => <LeadStatusBadge status={row.status} /> },
          { key: 'temperature', header: 'Temp', render: (row) => <LeadTemperatureBadge temperature={row.temperature} /> },
          { key: 'budget', header: 'Budget', render: (row) => row.budget_max ? formatCurrency(row.budget_max) : '-' },
          { key: 'assigned', header: 'Assigned', render: (row) => row.profiles?.full_name || <span className="text-muted-foreground text-xs">Unassigned</span> },
          { key: 'score', header: 'Score', render: (row) => <span className={`text-xs font-bold ${row.score >= 80 ? 'text-success' : row.score >= 50 ? 'text-warning' : 'text-muted-foreground'}`}>{row.score}</span> },
        ]}
        data={filtered}
        searchKey="full_name"
        searchPlaceholder="Search leads..."
        emptyMessage="No leads found."
        loading={isLoading}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => openEdit(row)} className="rounded-button p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
              <Pencil size={14} />
            </button>
            <button onClick={() => flagMutation.mutate(row.id)} className="rounded-button p-1.5 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors" title="Flag for urgent follow-up">
              <Flag size={14} />
            </button>
          </div>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingLead ? 'Edit Lead' : 'Add Lead'}>
        <div className="space-y-4">
          {error && <div className="rounded-button bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-1">Name *</label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-foreground mb-1">Phone *</label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Temperature</label>
              <select value={temperature} onChange={(e) => setTemperature(e.target.value as LeadTemperature)} className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                {TEMPS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Assign To</label>
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
              <option value="">Unassigned</option>
              {callers?.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingLead ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
