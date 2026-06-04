'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, UserPlus, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LeadStatusBadge, LeadTemperatureBadge } from '@/components/leads/LeadStatusBadge'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import type { Lead, LeadSource, LeadStatus, LeadTemperature, PropertyType } from '@/types/lead.types'

const SOURCES: LeadSource[] = ['36Acre', 'MagicBricks', 'Housing', 'Facebook', 'Instagram', 'Website', 'WhatsApp', 'Referral', 'Manual', 'Other']
const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Site Visit Scheduled', 'Negotiation', 'Won', 'Lost', 'Not Responding']
const TEMPS: LeadTemperature[] = ['Cold', 'Warm', 'Hot']
const TYPES: PropertyType[] = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Rental']

export default function AdminLeadsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [source, setSource] = useState<LeadSource>('Manual')
  const [propertyType, setPropertyType] = useState<PropertyType>('Apartment')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState<LeadStatus>('New')
  const [temperature, setTemperature] = useState<LeadTemperature>('Cold')
  const [notes, setNotes] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  const { data: leads, isLoading } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('*, profiles(full_name)')
      if (error) throw error
      return data as (Lead & { profiles: { full_name: string } | null })[]
    },
  })

  const { data: callers } = useQuery({
    queryKey: ['admin-callers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name').eq('role', 'caller').eq('is_active', true)
      if (error) throw error
      return data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!fullName.trim() || !phone.trim()) throw new Error('Name and phone are required')
      const payload = {
        full_name: fullName,
        phone,
        email: email || null,
        source,
        property_type: propertyType,
        budget_min: budgetMin ? Number(budgetMin) : null,
        budget_max: budgetMax ? Number(budgetMax) : null,
        preferred_location: location || null,
        status,
        temperature,
        notes: notes || null,
        assigned_to: assignedTo || null,
      }
      if (editingLead) {
        const { error } = await supabase.from('leads').update(payload).eq('id', editingLead.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('leads').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-leads'] })
      setModalOpen(false)
      resetForm()
    },
    onError: (err: Error) => setError(err.message),
  })

  const resetForm = () => {
    setFullName(''); setPhone(''); setEmail(''); setSource('Manual')
    setPropertyType('Apartment'); setBudgetMin(''); setBudgetMax('')
    setLocation(''); setStatus('New'); setTemperature('Cold')
    setNotes(''); setAssignedTo(''); setError('')
    setEditingLead(null)
  }

  const openEdit = (lead: Lead) => {
    setEditingLead(lead)
    setFullName(lead.full_name)
    setPhone(lead.phone)
    setEmail(lead.email || '')
    setSource(lead.source)
    setPropertyType(lead.property_type || 'Apartment')
    setBudgetMin(lead.budget_min?.toString() || '')
    setBudgetMax(lead.budget_max?.toString() || '')
    setLocation(lead.preferred_location || '')
    setStatus(lead.status)
    setTemperature(lead.temperature)
    setNotes(lead.notes || '')
    setAssignedTo(lead.assigned_to || '')
    setModalOpen(true)
  }

  let filtered = leads ?? []
  if (statusFilter) filtered = filtered.filter((l) => l.status === statusFilter)
  if (sourceFilter) filtered = filtered.filter((l) => l.source === sourceFilter)

  return (
    <div>
      <PageHeader title="Leads" description="All branch leads — add, assign, and track">
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
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
          <option value="">All Sources</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <DataTable
        columns={[
          { key: 'full_name', header: 'Name', sortable: true },
          { key: 'phone', header: 'Phone', sortable: true },
          { key: 'source', header: 'Source', sortable: true },
          {
            key: 'status',
            header: 'Status',
            render: (row) => <LeadStatusBadge status={row.status} />,
          },
          {
            key: 'temperature',
            header: 'Temp',
            render: (row) => <LeadTemperatureBadge temperature={row.temperature} />,
          },
          {
            key: 'budget',
            header: 'Budget',
            render: (row) => row.budget_max ? formatCurrency(row.budget_max) : '-',
          },
          {
            key: 'assigned',
            header: 'Assigned',
            render: (row) => row.profiles?.full_name || <span className="text-muted-foreground text-xs">Unassigned</span>,
          },
          {
            key: 'score',
            header: 'Score',
            render: (row) => (
              <span className={`text-xs font-bold ${row.score >= 80 ? 'text-success' : row.score >= 50 ? 'text-warning' : 'text-muted-foreground'}`}>
                {row.score}
              </span>
            ),
          },
        ]}
        data={filtered}
        searchKey="full_name"
        searchPlaceholder="Search leads..."
        emptyMessage="No leads found. Add your first lead above."
        loading={isLoading}
        actions={(row) => (
          <button onClick={() => openEdit(row)} className="rounded-button p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
            <Pencil size={14} />
          </button>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingLead ? 'Edit Lead' : 'Add Lead'} maxWidth="max-w-lg">
        <div className="space-y-4">
          {error && <div className="rounded-button bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Rahul Sharma" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone *</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91-98765-43210" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Property Type</label>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Budget Min</label>
              <Input value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="5000000" type="number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Budget Max</label>
              <Input value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="10000000" type="number" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Temperature</label>
              <select value={temperature} onChange={(e) => setTemperature(e.target.value as LeadTemperature)}
                className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                {TEMPS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Preferred Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Gurgaon Sector 45" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Assign To</label>
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
              <option value="">Unassigned</option>
              {callers?.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
