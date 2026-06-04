'use client'

import { useQuery } from '@tanstack/react-query'
import { Phone, Clock, Calendar, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils/formatDate'
import type { Call } from '@/types/common.types'

export default function CallLogPage() {
  const supabase = createClient()

  const { data: calls, isLoading } = useQuery({
    queryKey: ['caller-call-log'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('calls')
        .select('*, leads(full_name, phone)')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as (Call & { leads: { full_name: string; phone: string } | null })[]
    },
  })

  const totalCalls = calls?.length ?? 0
  const totalDuration = calls?.reduce((s, c) => s + (c.duration || 0), 0) ?? 0
  const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0
  const interested = calls?.filter((c) => c.outcome === 'Interested').length ?? 0

  return (
    <div>
      <PageHeader title="Call Log" description="History of all calls made" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card><CardContent className="p-3 text-center">
          <Phone size={16} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{totalCalls}</p>
          <p className="text-[10px] text-muted-foreground">Total Calls</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Clock size={16} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{Math.round(totalDuration / 60)}m</p>
          <p className="text-[10px] text-muted-foreground">Total Talk Time</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Clock size={16} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{avgDuration}s</p>
          <p className="text-[10px] text-muted-foreground">Avg Duration</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <ArrowUpRight size={16} className="mx-auto text-success mb-1" />
          <p className="text-lg font-bold text-foreground">{interested}</p>
          <p className="text-[10px] text-muted-foreground">Interested</p>
        </CardContent></Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : totalCalls === 0 ? (
        <div className="rounded-card border border-border bg-card p-8 text-center">
          <Phone size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No calls made yet. Your call history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(calls ?? []).map((call) => (
            <div key={call.id} className="flex items-start gap-3 p-4 rounded-card border border-border bg-card">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                call.outcome === 'Interested' ? 'bg-success/10 text-success' :
                call.outcome === 'Not Interested' ? 'bg-danger/10 text-danger' :
                call.outcome === 'Callback Requested' ? 'bg-warning/10 text-warning' :
                'bg-primary/10 text-primary'
              }`}>
                {call.outcome === 'Interested' ? <ArrowUpRight size={18} /> :
                 call.outcome === 'Not Interested' ? <ArrowDownRight size={18} /> :
                 call.outcome === 'Callback Requested' ? <Calendar size={18} /> :
                 <Phone size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{call.leads?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{call.leads?.phone || ''}</p>
                  </div>
                  <Badge variant={
                    call.outcome === 'Interested' ? 'success' :
                    call.outcome === 'Not Interested' ? 'danger' :
                    call.outcome === 'Callback Requested' ? 'warning' : 'default'
                  }>
                    {call.outcome || call.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock size={12} /> {call.duration ? `${call.duration}s` : 'N/A'}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {formatDateTime(call.created_at)}</span>
                </div>
                {call.notes && (
                  <p className="text-xs text-muted-foreground mt-2 bg-muted/30 rounded p-2">{call.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
