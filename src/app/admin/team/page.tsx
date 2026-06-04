'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Badge } from '@/components/ui/badge'
import { Phone, MessageSquare, Calendar } from 'lucide-react'

export default function TeamPage() {
  const supabase = createClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-team'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*, branches(name)')
      if (error) throw error
      return data
    },
  })

  const { data: leads } = useQuery({
    queryKey: ['admin-leads-count'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leads').select('assigned_to, status')
      if (error) throw error
      return data
    },
  })

  const { data: calls } = useQuery({
    queryKey: ['admin-calls-count'],
    queryFn: async () => {
      const { data, error } = await supabase.from('calls').select('agent_id')
      if (error) throw error
      return data
    },
  })

  const getWorkload = (userId: string) => {
    const userLeads = leads?.filter((l) => l.assigned_to === userId).length ?? 0
    const userCalls = calls?.filter((c) => c.agent_id === userId).length ?? 0
    return { leads: userLeads, calls: userCalls }
  }

  return (
    <div>
      <PageHeader title="Team" description="Managers and callers with workload" />

      <DataTable
        columns={[
          { key: 'full_name', header: 'Name', sortable: true },
          { key: 'email', header: 'Email', sortable: true },
          {
            key: 'role',
            header: 'Role',
            render: (row) => (
              <Badge variant={row.role === 'manager' ? 'warning' : row.role === 'admin' ? 'danger' : 'default'}>
                {row.role?.replace('_', ' ')}
              </Badge>
            ),
          },
          {
            key: 'branch',
            header: 'Branch',
            render: (row) => row.branches?.name || '-',
          },
          {
            key: 'workload',
            header: 'Workload',
            render: (row) => {
              const w = getWorkload(row.id)
              return (
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Phone size={12} /> {w.calls}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <MessageSquare size={12} /> {w.leads}
                  </span>
                </div>
              )
            },
          },
          {
            key: 'is_active',
            header: 'Status',
            render: (row) => (
              <span className={`text-xs font-medium ${row.is_active ? 'text-success' : 'text-danger'}`}>
                {row.is_active ? 'Active' : 'Inactive'}
              </span>
            ),
          },
        ]}
        data={users ?? []}
        searchKey="full_name"
        searchPlaceholder="Search team members..."
        emptyMessage="No team members found."
        loading={isLoading}
      />
    </div>
  )
}
