'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Clock, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Badge } from '@/components/ui/badge'

export default function AdminAttendancePage() {
  const [dateFilter, setDateFilter] = useState('')
  const supabase = createClient()

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['admin-attendance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*, profiles(full_name, role)')
        .order('check_in_time', { ascending: false })
      if (error) throw error
      return data
    },
  })

  let filtered = attendance ?? []
  if (dateFilter) {
    filtered = filtered.filter((a) => {
      if (!a.check_in_time) return false
      return new Date(a.check_in_time).toISOString().startsWith(dateFilter)
    })
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
      <PageHeader title="Attendance" description="Branch attendance overview" />

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
            key: 'user',
            header: 'Employee',
            render: (row) => (
              <div>
                <p className="text-sm font-medium text-foreground">{row.profiles?.full_name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground capitalize">{row.profiles?.role?.replace('_', ' ') || ''}</p>
              </div>
            ),
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
            key: 'check_in',
            header: 'Check In',
            render: (row) => row.check_in_time ? new Date(row.check_in_time).toLocaleTimeString() : '-',
          },
          {
            key: 'check_out',
            header: 'Check Out',
            render: (row) => row.check_out_time ? new Date(row.check_out_time).toLocaleTimeString() : '-',
          },
          {
            key: 'duration',
            header: 'Duration',
            render: (row) => getDuration(row.check_in_time, row.check_out_time),
          },
          {
            key: 'location',
            header: 'Location',
            render: (row) => (
              row.check_in_lat ? (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={12} /> {row.check_in_lat.toFixed(4)}, {row.check_in_lng?.toFixed(4)}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Office</span>
              )
            ),
          },
          {
            key: 'notes',
            header: 'Notes',
            render: (row) => <span className="text-xs text-muted-foreground">{row.notes || '-'}</span>,
          },
        ]}
        data={filtered}
        emptyMessage="No attendance records for the selected date."
        loading={isLoading}
      />
    </div>
  )
}
