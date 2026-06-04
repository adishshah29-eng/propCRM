'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Input } from '@/components/ui/input'

const ACTIVITY_TYPES: Record<string, string> = {
  call: 'Phone Call',
  message: 'Message Sent',
  note: 'Note Added',
  'follow-up': 'Follow-up Scheduled',
  'status-change': 'Status Changed',
  'property-share': 'Property Shared',
  viewing: 'Site Visit',
  'deal-update': 'Deal Updated',
}

export default function AuditLogsPage() {
  const [typeFilter, setTypeFilter] = useState('')
  const supabase = createClient()

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select('*, leads(full_name), profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      return data as Array<{
        id: string
        type: string
        description: string | null
        created_by: string | null
        created_at: string
        leads: { full_name: string } | null
        profiles: { full_name: string } | null
      }>
    },
  })

  const filtered = typeFilter
    ? activities?.filter((a) => a.type === typeFilter)
    : activities

  return (
    <div>
      <PageHeader title="Audit Logs" description="Every action by every user across the organization" />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Search audit logs..." className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">All Types</option>
            {Object.entries(ACTIVITY_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={[
          {
            key: 'created_at',
            header: 'Timestamp',
            render: (row) => new Date(row.created_at).toLocaleString(),
          },
          {
            key: 'user',
            header: 'User',
            render: (row) => row.profiles?.full_name || 'System',
          },
          {
            key: 'type',
            header: 'Action',
            render: (row) => (
              <span className="inline-flex items-center rounded-badge bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary uppercase">
                {ACTIVITY_TYPES[row.type] || row.type}
              </span>
            ),
          },
          {
            key: 'lead',
            header: 'Lead',
            render: (row) => row.leads?.full_name || '-',
          },
          { key: 'description', header: 'Details' },
        ]}
        data={filtered ?? []}
        emptyMessage="No audit logs found."
        loading={isLoading}
      />
    </div>
  )
}
