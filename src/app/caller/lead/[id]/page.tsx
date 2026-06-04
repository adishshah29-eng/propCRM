'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Phone, MessageCircle, ArrowLeft, Clock, Calendar, MapPin,
  User, Building2, Banknote, Thermometer, Tag, FileText,
  CheckCircle, XCircle, MessageSquare, Share2, ChevronRight,
  Loader2, Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/common/Modal'
import { LeadStatusBadge, LeadTemperatureBadge } from '@/components/leads/LeadStatusBadge'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { formatDateTime, timeAgo } from '@/lib/utils/formatDate'
import type { Lead, LeadStatus, LeadTemperature } from '@/types/lead.types'
import type { Call, CallOutcome } from '@/types/common.types'
import type { Activity, Message, Task } from '@/types/common.types'
import type { Asset } from '@/types/property.types'

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string
  const supabase = createClient()
  const qc = useQueryClient()

  const [callModal, setCallModal] = useState(false)
  const [outcomeModal, setOutcomeModal] = useState(false)
  const [shareDrawer, setShareDrawer] = useState(false)
  const [activeCallSid, setActiveCallSid] = useState('')
  const [callOutcome, setCallOutcome] = useState<CallOutcome>('Answered')
  const [callNotes, setCallNotes] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [shareMessage, setShareMessage] = useState('')
  const [statusModal, setStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState<LeadStatus>('New')
  const [newTemp, setNewTemp] = useState<LeadTemperature>('Cold')
  const [followupDate, setFollowupDate] = useState('')

  const { data: lead, isLoading } = useQuery({
    queryKey: ['caller-lead', leadId],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('*').eq('id', leadId).single()
      if (error) throw error
      return data as Lead
    },
    enabled: !!leadId,
  })

  const { data: activities } = useQuery({
    queryKey: ['caller-activities', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*, profiles(full_name)')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as (Activity & { profiles: { full_name: string } | null })[]
    },
    enabled: !!leadId,
  })

  const { data: calls } = useQuery({
    queryKey: ['caller-calls', leadId],
    queryFn: async () => {
      const { data, error } = await supabase.from('calls').select('*').eq('lead_id', leadId).order('created_at', { ascending: false })
      if (error) throw error
      return data as Call[]
    },
    enabled: !!leadId,
  })

  const { data: messages } = useQuery({
    queryKey: ['caller-messages', leadId],
    queryFn: async () => {
      const { data, error } = await supabase.from('messages').select('*').eq('lead_id', leadId).order('created_at', { ascending: false })
      if (error) throw error
      return data as Message[]
    },
    enabled: !!leadId,
  })

  const { data: assets } = useQuery({
    queryKey: ['caller-assets-share'],
    queryFn: async () => {
      const { data, error } = await supabase.from('assets').select('*').eq('is_active', true).order('created_at', { ascending: false })
      if (error) throw error
      return data as Asset[]
    },
  })

  // Call bridge mutation
  const callMutation = useMutation({
    mutationFn: async () => {
      if (process.env.NEXT_PUBLIC_DRY_RUN === 'true' || true) {
        console.log('[DRY RUN] Call bridge for lead:', leadId)
        return { success: true, dryRun: true, callSid: 'dry-run-' + Date.now() }
      }
      const res = await fetch('/api/twilio/call-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, leadPhone: lead?.phone }),
      })
      if (!res.ok) throw new Error('Call failed')
      return res.json()
    },
    onSuccess: (data) => {
      setActiveCallSid(data.callSid || '')
      setCallModal(true)
      // Auto-open outcome modal after "call" (simulated)
      setTimeout(() => {
        setCallModal(false)
        setOutcomeModal(true)
      }, 2000)
    },
  })

  // Save call outcome
  const outcomeMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('calls').insert({
        lead_id: leadId,
        agent_id: user?.id,
        status: 'completed',
        outcome: callOutcome,
        notes: callNotes,
        duration: Math.floor(Math.random() * 300) + 30, // Simulated duration
      })
      if (error) throw error

      // Update lead status and last contacted
      await supabase.from('leads').update({
        status: callOutcome === 'Interested' ? 'Interested' : callOutcome === 'Callback Requested' ? 'Contacted' : lead?.status,
        last_contacted_at: new Date().toISOString(),
        next_followup_at: followupDate || null,
      }).eq('id', leadId)

      // Log activity
      await supabase.from('activities').insert({
        lead_id: leadId,
        type: 'call',
        description: `Call outcome: ${callOutcome}. ${callNotes}`,
        created_by: user?.id,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['caller-lead', leadId] })
      qc.invalidateQueries({ queryKey: ['caller-activities', leadId] })
      qc.invalidateQueries({ queryKey: ['caller-calls', leadId] })
      setOutcomeModal(false)
      setCallNotes('')
      setFollowupDate('')
    },
  })

  // WhatsApp share
  const shareMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const msg = shareMessage || selectedAsset?.whatsapp_template || ''

      // Log message
      await supabase.from('messages').insert({
        lead_id: leadId,
        sender_id: user?.id,
        channel: 'whatsapp',
        body: msg,
        asset_id: selectedAsset?.id || null,
        status: 'sent',
      })

      // Log activity
      await supabase.from('activities').insert({
        lead_id: leadId,
        type: 'property-share',
        description: `Shared ${selectedAsset?.name || 'project'} via WhatsApp`,
        created_by: user?.id,
      })

      // Open WhatsApp
      const text = encodeURIComponent(msg)
      window.open(`https://wa.me/${lead?.phone?.replace(/\D/g, '')}?text=${text}`, '_blank')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['caller-activities', leadId] })
      qc.invalidateQueries({ queryKey: ['caller-messages', leadId] })
      setShareDrawer(false)
      setSelectedAsset(null)
      setShareMessage('')
    },
  })

  // Update status
  const statusMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('leads').update({
        status: newStatus,
        temperature: newTemp,
      }).eq('id', leadId)
      if (error) throw error

      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('activities').insert({
        lead_id: leadId,
        type: 'status-change',
        description: `Status updated to ${newStatus}, temperature to ${newTemp}`,
        created_by: user?.id,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['caller-lead', leadId] })
      qc.invalidateQueries({ queryKey: ['caller-activities', leadId] })
      setStatusModal(false)
    },
  })

  if (isLoading || !lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const openShare = (asset: Asset) => {
    setSelectedAsset(asset)
    const template = asset.whatsapp_template || `Hi ${lead.full_name} 👋,

I'd like to share details about *${asset.name}* in ${asset.location}.

📌 Starting from: ${asset.price_min ? formatCurrency(asset.price_min) : 'N/A'}
📅 Status: ${asset.status}

Please find the brochure attached. Feel free to reach out for a free consultation!`
    setShareMessage(template)
    setShareDrawer(true)
  }

  return (
    <div>
      {/* Header */}
      <button onClick={() => router.push('/caller/my-leads')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft size={16} /> Back to leads
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{lead.full_name}</h1>
            <LeadTemperatureBadge temperature={lead.temperature} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Phone size={14} /> {lead.phone}</span>
            {lead.email && <span className="flex items-center gap-1"><MessageSquare size={14} /> {lead.email}</span>}
            {lead.preferred_location && <span className="flex items-center gap-1"><MapPin size={14} /> {lead.preferred_location}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-card bg-primary/10 px-3 py-1.5">
            <Star size={14} className="text-primary" />
            <span className="text-sm font-semibold text-primary">{lead.score}</span>
          </div>
          <LeadStatusBadge status={lead.status} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card><CardContent className="p-3 text-center">
          <Banknote size={16} className="mx-auto text-primary mb-1" />
          <p className="text-xs text-muted-foreground">Budget</p>
          <p className="text-sm font-semibold text-foreground">{lead.budget_max ? formatCurrency(lead.budget_max) : '-'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Building2 size={16} className="mx-auto text-primary mb-1" />
          <p className="text-xs text-muted-foreground">Type</p>
          <p className="text-sm font-semibold text-foreground">{lead.property_type || '-'}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Tag size={16} className="mx-auto text-primary mb-1" />
          <p className="text-xs text-muted-foreground">Source</p>
          <p className="text-sm font-semibold text-foreground">{lead.source}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Clock size={16} className="mx-auto text-primary mb-1" />
          <p className="text-xs text-muted-foreground">Last Contact</p>
          <p className="text-sm font-semibold text-foreground">{lead.last_contacted_at ? timeAgo(lead.last_contacted_at) : 'Never'}</p>
        </CardContent></Card>
      </div>

      {/* Action Buttons - Sticky on mobile */}
      <div className="sticky bottom-20 lg:static z-30 bg-background/95 backdrop-blur-sm lg:bg-transparent p-2 lg:p-0 -mx-2 lg:mx-0 mb-6 rounded-card border border-border lg:border-0">
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => callMutation.mutate()} disabled={callMutation.isPending}>
            {callMutation.isPending ? <Loader2 size={16} className="animate-spin mr-1.5" /> : <Phone size={16} className="mr-1.5" />}
            {callMutation.isPending ? 'Calling...' : 'Call Lead'}
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setShareDrawer(true)}>
            <Share2 size={16} className="mr-1.5" /> Share Project
          </Button>
          <Button variant="outline" onClick={() => { setNewStatus(lead.status); setNewTemp(lead.temperature); setStatusModal(true) }}>
            <Tag size={16} />
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Activity Timeline</h2>

        {(activities ?? []).length === 0 && (calls ?? []).length === 0 && (messages ?? []).length === 0 ? (
          <div className="rounded-card border border-border bg-card p-6 text-center">
            <p className="text-muted-foreground">No activity yet. Make your first call or send a WhatsApp message.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(activities ?? []).map((activity) => (
              <div key={activity.id} className="flex gap-3 p-3 rounded-card border border-border bg-card">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  activity.type === 'call' ? 'bg-primary/10 text-primary' :
                  activity.type === 'message' ? 'bg-success/10 text-success' :
                  activity.type === 'property-share' ? 'bg-warning/10 text-warning' :
                  activity.type === 'status-change' ? 'bg-info/10 text-info' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {activity.type === 'call' ? <Phone size={14} /> :
                   activity.type === 'message' ? <MessageCircle size={14} /> :
                   activity.type === 'property-share' ? <Share2 size={14} /> :
                   activity.type === 'status-change' ? <Tag size={14} /> :
                   <FileText size={14} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">{activity.profiles?.full_name || 'System'}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(activity.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call Modal */}
      <Modal open={callModal} onClose={() => setCallModal(false)} title="Calling...">
        <div className="text-center py-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-pulse">
            <Phone size={32} className="text-primary" />
          </div>
          <p className="text-lg font-semibold text-foreground">Connecting to {lead.full_name}</p>
          <p className="text-sm text-muted-foreground mt-1">{lead.phone}</p>
          <p className="text-xs text-muted-foreground mt-4">DRY RUN: Simulating call bridge</p>
        </div>
      </Modal>

      {/* Outcome Modal */}
      <Modal open={outcomeModal} onClose={() => setOutcomeModal(false)} title="Call Outcome" maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['Answered', 'Interested', 'Callback Requested', 'Not Interested', 'No Answer', 'Busy'] as CallOutcome[]).map((outcome) => (
              <button
                key={outcome}
                onClick={() => setCallOutcome(outcome)}
                className={`rounded-button border p-2.5 text-sm font-medium transition-colors ${
                  callOutcome === outcome
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                {outcome}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              rows={3}
              placeholder="What did the lead say? Budget, timeline, preferences..."
              className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Next Follow-up</label>
            <input
              type="datetime-local"
              value={followupDate}
              onChange={(e) => setFollowupDate(e.target.value)}
              className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOutcomeModal(false)}>Skip</Button>
            <Button onClick={() => outcomeMutation.mutate()} disabled={outcomeMutation.isPending}>
              {outcomeMutation.isPending ? 'Saving...' : 'Save Outcome'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Drawer */}
      <Modal open={shareDrawer} onClose={() => setShareDrawer(false)} title="Share Project" maxWidth="max-w-lg">
        {!selectedAsset ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-2">Select a project to share:</p>
            {(assets ?? []).map((asset) => (
              <button
                key={asset.id}
                onClick={() => openShare(asset)}
                className="w-full flex items-center gap-3 p-3 rounded-card border border-border bg-card hover:border-primary/30 transition-colors text-left"
              >
                {asset.images?.[0] ? (
                  <img src={asset.images[0]} alt={asset.name} className="h-12 w-12 rounded-card object-cover shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-card bg-muted flex items-center justify-center shrink-0">
                    <Share2 size={16} className="text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">{asset.location} · {asset.price_min ? formatCurrency(asset.price_min) : 'N/A'}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </button>
            ))}
            {(assets ?? []).length === 0 && (
              <p className="text-center text-muted-foreground py-4">No active assets available.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {selectedAsset.images?.[0] && (
                <img src={selectedAsset.images[0]} alt={selectedAsset.name} className="h-16 w-16 rounded-card object-cover" />
              )}
              <div>
                <h3 className="font-semibold text-foreground">{selectedAsset.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedAsset.location}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Message</label>
              <textarea
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows={6}
                className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
              />
            </div>
            {selectedAsset.brochure_url && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <FileText size={14} />
                <span>Brochure: {selectedAsset.brochure_url}</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setSelectedAsset(null); setShareMessage('') }}>Back</Button>
              <Button onClick={() => shareMutation.mutate()} disabled={shareMutation.isPending}>
                <MessageCircle size={16} className="mr-1.5" />
                {shareMutation.isPending ? 'Opening...' : 'Open WhatsApp'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Update Status" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
              className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            >
              {['New', 'Contacted', 'Interested', 'Site Visit Scheduled', 'Negotiation', 'Won', 'Lost', 'Not Responding'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Temperature</label>
            <select
              value={newTemp}
              onChange={(e) => setNewTemp(e.target.value as LeadTemperature)}
              className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="Cold">Cold</option>
              <option value="Warm">Warm</option>
              <option value="Hot">Hot</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStatusModal(false)}>Cancel</Button>
            <Button onClick={() => statusMutation.mutate()} disabled={statusMutation.isPending}>
              {statusMutation.isPending ? 'Saving...' : 'Update'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
