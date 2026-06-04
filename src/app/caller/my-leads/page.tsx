'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { LeadCard } from '@/components/leads/LeadCard'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import type { Lead } from '@/types/lead.types'

export default function MyLeadsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [tempFilter, setTempFilter] = useState('')

  const supabase = createClient()

  const { data: leads, isLoading } = useQuery({
    queryKey: ['caller-leads'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('assigned_to', user.id)
        .order('score', { ascending: false })
      if (error) throw error
      return data as Lead[]
    },
  })

  let filtered = leads ?? []
  if (search) filtered = filtered.filter((l) => l.full_name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search))
  if (statusFilter) filtered = filtered.filter((l) => l.status === statusFilter)
  if (tempFilter) filtered = filtered.filter((l) => l.temperature === tempFilter)

  return (
    <div>
      <PageHeader title="My Leads" description="Prioritised lead queue by score" />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
            <option value="">All Statuses</option>
            {['New', 'Contacted', 'Interested', 'Site Visit Scheduled', 'Negotiation', 'Won', 'Lost', 'Not Responding'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={tempFilter} onChange={(e) => setTempFilter(e.target.value)}
            className="rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
            <option value="">All Temps</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-card border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No leads match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} href={`/caller/lead/${lead.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}
