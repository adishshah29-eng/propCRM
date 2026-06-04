'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, MapPin, Clock, CheckCircle, Plus, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/common/Modal'
import { formatDateTime } from '@/lib/utils/formatDate'

export default function SiteVisitsPage() {
  const [noteModal, setNoteModal] = useState(false)
  const [selectedVisit, setSelectedVisit] = useState<Record<string, unknown> | null>(null)
  const [siteNotes, setSiteNotes] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  const { data: visits, isLoading } = useQuery({
    queryKey: ['field-site-visits'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('tasks')
        .select('*, leads(full_name, preferred_location, phone)')
        .eq('assigned_to', user.id)
        .ilike('title', '%visit%')
        .order('due_date', { ascending: true })
      if (error) throw error
      return data
    },
  })

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVisit) return
      const { error } = await supabase.from('tasks').update({
        status: 'Done',
      }).eq('id', selectedVisit.id as string)
      if (error) throw error

      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('activities').insert({
        lead_id: selectedVisit.lead_id as string,
        type: 'viewing',
        description: `Site visit completed. Notes: ${siteNotes}`,
        created_by: user?.id,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['field-site-visits'] })
      setNoteModal(false)
      setSelectedVisit(null)
      setSiteNotes('')
    },
  })

  return (
    <div>
      <PageHeader title="Site Visits" description="Assigned visits and notes" />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (visits ?? []).length === 0 ? (
        <div className="rounded-card border border-border bg-card p-8 text-center">
          <ClipboardList size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No site visits assigned. Your manager will schedule visits.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(visits ?? []).map((visit: Record<string, unknown>) => (
            <Card key={visit.id as string} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{(visit.leads as Record<string, unknown>)?.full_name as string || 'Unknown'}</h3>
                      <Badge variant={visit.status === 'Done' ? 'success' : 'warning'}>
                        {visit.status as string}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin size={12} />
                        {(visit.leads as Record<string, unknown>)?.preferred_location as string || 'Location not specified'}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        {visit.due_date ? formatDateTime(visit.due_date as string) : 'No time set'}
                      </p>
                      {(visit.leads as Record<string, unknown>)?.phone && (
                        <p className="text-xs text-muted-foreground">
                          {(visit.leads as Record<string, unknown>)?.phone as string}
                        </p>
                      )}
                    </div>
                    {visit.description && (
                      <p className="text-xs text-muted-foreground mt-2 bg-muted/30 rounded p-2">{visit.description as string}</p>
                    )}
                  </div>
                  {visit.status !== 'Done' && (
                    <Button
                      size="sm"
                      onClick={() => { setSelectedVisit(visit); setNoteModal(true) }}
                    >
                      <CheckCircle size={14} className="mr-1" /> Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={noteModal} onClose={() => setNoteModal(false)} title="Log Site Visit Notes" maxWidth="max-w-md">
        {selectedVisit && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-foreground">Client: {(selectedVisit.leads as Record<string, unknown>)?.full_name as string || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">
                Location: {(selectedVisit.leads as Record<string, unknown>)?.preferred_location as string || 'Not specified'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Visit Notes</label>
              <textarea
                value={siteNotes}
                onChange={(e) => setSiteNotes(e.target.value)}
                rows={4}
                placeholder="What happened during the site visit? Client feedback, property condition, next steps..."
                className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNoteModal(false)}>Cancel</Button>
              <Button onClick={() => completeMutation.mutate()} disabled={completeMutation.isPending}>
                {completeMutation.isPending ? 'Saving...' : 'Complete Visit'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
