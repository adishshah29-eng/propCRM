'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { KANBAN_COLORS } from '@/constants/dealStages'
import type { Deal, DealStage } from '@/types/property.types'

const STAGES: DealStage[] = ['New', 'Contacted', 'Interested', 'Viewing Scheduled', 'Offer Made', 'Closing', 'Won', 'Lost']

export default function PipelinePage() {
  const [draggingDeal, setDraggingDeal] = useState<string | null>(null)
  const supabase = createClient()
  const qc = useQueryClient()

  const { data: deals, isLoading } = useQuery({
    queryKey: ['admin-deals'],
    queryFn: async () => {
      const { data, error } = await supabase.from('deals').select('*, leads(full_name, phone), properties(title)')
      if (error) throw error
      return data as (Deal & { leads: { full_name: string; phone: string } | null; properties: { title: string } | null })[]
    },
  })

  const updateStage = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: DealStage }) => {
      const { error } = await supabase.from('deals').update({ stage }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-deals'] }),
  })

  const handleDragStart = (dealId: string) => setDraggingDeal(dealId)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (e: React.DragEvent, stage: DealStage) => {
    e.preventDefault()
    if (draggingDeal) {
      updateStage.mutate({ id: draggingDeal, stage })
      setDraggingDeal(null)
    }
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Pipeline" description="Kanban board of all branch deals" />
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Pipeline" description="Drag deals between stages to update status" />

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {STAGES.map((stage) => {
          const stageDeals = deals?.filter((d) => d.stage === stage) ?? []
          const stageValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0)
          return (
            <div
              key={stage}
              className="flex-shrink-0 w-72"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: KANBAN_COLORS[stage] }} />
                  <h3 className="text-sm font-semibold text-foreground">{stage}</h3>
                </div>
                <span className="text-xs text-muted-foreground">{stageDeals.length} · {formatCurrency(stageValue)}</span>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal.id)}
                    className="rounded-card border border-border bg-card p-3 cursor-grab active:cursor-grabbing hover:shadow-light transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{deal.leads?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{deal.leads?.phone || ''}</p>
                      </div>
                      <Badge variant={deal.probability && deal.probability >= 70 ? 'success' : deal.probability && deal.probability >= 40 ? 'warning' : 'default'}>
                        {deal.probability ?? 0}%
                      </Badge>
                    </div>
                    {deal.properties?.title && (
                      <p className="text-xs text-muted-foreground mt-1.5 truncate">{deal.properties.title}</p>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <span className="text-xs font-semibold text-foreground">{formatCurrency(deal.value)}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {deal.expected_close ? new Date(deal.expected_close).toLocaleDateString() : 'No date'}
                      </span>
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <div className="rounded-card border border-dashed border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground">Drop deals here</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
