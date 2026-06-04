'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Clock, Calendar, Navigation } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils/formatDate'

export default function FieldAttendancePage() {
  const [dateFilter, setDateFilter] = useState('')
  const supabase = createClient()

  const { data: records, isLoading } = useQuery({
    queryKey: ['field-attendance-history'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .order('check_in_time', { ascending: false })
      if (error) throw error
      return data
    },
  })

  let filtered = records ?? []
  if (dateFilter) {
    filtered = filtered.filter((r) =>
      r.check_in_time?.startsWith(dateFilter)
    )
  }

  const getDuration = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return '-'
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
    const hours = Math.floor(diff / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    return `${hours}h ${mins}m`
  }

  return (
    <div>
      <PageHeader title="Attendance" description="GPS check-in history" />

      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        />
        {dateFilter && (
          <button onClick={() => setDateFilter('')} className="rounded-button px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
            Clear
          </button>
        )}
      </div>

      <DataTable
        columns={[
          {
            key: 'date',
            header: 'Date',
            render: (row) => row.check_in_time ? new Date(row.check_in_time).toLocaleDateString() : '-',
          },
          {
            key: 'check_in',
            header: 'Check In',
            render: (row) => (
              <div>
                <p className="text-sm">{row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString() : '-'}</p>
                {row.check_in_lat && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Navigation size={8} />
                    {row.check_in_lat.toFixed(4)}, {row.check_in_lng?.toFixed(4)}
                  </p>
                )}
              </div>
            ),
          },
          {
            key: 'check_out',
            header: 'Check Out',
            render: (row) => (
              <div>
                <p className="text-sm">{row.check_out_time ? new Date(row.check_out_time).toLocaleTimeString() : '-'}</p>
                {row.check_out_lat && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Navigation size={8} />
                    {row.check_out_lat.toFixed(4)}, {row.check_out_lng?.toFixed(4)}
                  </p>
                )}
              </div>
            ),
          },
          {
            key: 'duration',
            header: 'Duration',
            render: (row) => <span className="text-sm font-medium">{getDuration(row.check_in_time, row.check_out_time)}</span>,
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => (
              <Badge variant={row.status === 'Present' ? 'success' : row.status === 'Late' ? 'warning' : 'danger'}>
                {row.status}
              </Badge>
            ),
          },
          {
            key: 'notes',
            header: 'Notes',
            render: (row) => <span className="text-xs text-muted-foreground">{row.notes || '-'}</span>,
          },
        ]}
        data={filtered}
        emptyMessage="No attendance records found for this period."
        loading={isLoading}
      />
    </div>
  )
}
