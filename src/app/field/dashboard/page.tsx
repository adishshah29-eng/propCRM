'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Clock, CheckCircle, AlertTriangle, ClipboardList, Navigation } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils/formatDate'
import type { Attendance } from '@/types/common.types'

export default function FieldDashboardPage() {
  const [checkedIn, setCheckedIn] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['field-attendance-today'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .gte('check_in_time', today)
        .order('check_in_time', { ascending: false })
        .limit(1)
      if (error) throw error
      return data?.[0] as Attendance | undefined
    },
  })

  const { data: visits } = useQuery({
    queryKey: ['field-visits-today'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('tasks')
        .select('*, leads(full_name, preferred_location)')
        .eq('assigned_to', user.id)
        .ilike('title', '%visit%')
        .order('due_date', { ascending: true })
        .limit(5)
      if (error) throw error
      return data
    },
  })

  useEffect(() => {
    if (attendance?.check_in_time && !attendance?.check_out_time) {
      setCheckedIn(true)
    }
  }, [attendance])

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      return new Promise<void>((resolve, reject) => {
        if (!navigator.geolocation) {
          setLocationError('Geolocation is not supported by your browser')
          reject(new Error('Geolocation not supported'))
          return
        }
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            setLocation({ lat: latitude, lng: longitude })

            const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()

            const { error } = await supabase.from('attendance').insert({
              user_id: user.id,
              org_id: profile?.org_id,
              check_in_time: new Date().toISOString(),
              check_in_lat: latitude,
              check_in_lng: longitude,
              status: 'Present',
            })
            if (error) reject(error)
            else resolve()
          },
          (err) => {
            setLocationError('Location access required for check-in. Please allow in browser settings.')
            reject(err)
          },
          { enableHighAccuracy: true, timeout: 10000 }
        )
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['field-attendance-today'] })
      setCheckedIn(true)
      setLocationError('')
    },
  })

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: todayRecord } = await supabase
        .from('attendance')
        .select('id')
        .eq('user_id', user.id)
        .is('check_out_time', null)
        .order('check_in_time', { ascending: false })
        .limit(1)
        .single()

      if (!todayRecord) throw new Error('No active check-in found')

      return new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            const { error } = await supabase.from('attendance').update({
              check_out_time: new Date().toISOString(),
              check_out_lat: latitude,
              check_out_lng: longitude,
            }).eq('id', todayRecord.id)
            if (error) reject(error)
            else resolve()
          },
          async () => {
            // Allow checkout without GPS if check-in was successful
            const { error } = await supabase.from('attendance').update({
              check_out_time: new Date().toISOString(),
            }).eq('id', todayRecord.id)
            if (error) reject(error)
            else resolve()
          }
        )
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['field-attendance-today'] })
      setCheckedIn(false)
    },
  })

  return (
    <div>
      <PageHeader title="Field Dashboard" description="Today's visits and attendance" />

      {/* Attendance Card */}
      <Card className="mb-6 overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${checkedIn ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                <MapPin size={20} />
              </div>
              <div>
                <p className="font-semibold text-foreground">{checkedIn ? 'Checked In' : 'Not Checked In'}</p>
                <p className="text-xs text-muted-foreground">
                  {attendance?.check_in_time
                    ? formatDateTime(attendance.check_in_time)
                    : 'Tap below to check in'}
                </p>
              </div>
            </div>
            <Badge variant={checkedIn ? 'success' : 'default'}>
              {checkedIn ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <Navigation size={12} />
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}

          {locationError && (
            <div className="rounded-card bg-danger/10 border border-danger/20 p-3 mb-3">
              <p className="text-xs text-danger">{locationError}</p>
            </div>
          )}

          <Button
            className="w-full"
            variant={checkedIn ? 'outline' : 'default'}
            onClick={() => checkedIn ? checkOutMutation.mutate() : checkInMutation.mutate()}
            disabled={checkInMutation.isPending || checkOutMutation.isPending}
          >
            {checkInMutation.isPending || checkOutMutation.isPending ? (
              <Clock size={16} className="mr-1.5 animate-spin" />
            ) : checkedIn ? (
              <CheckCircle size={16} className="mr-1.5" />
            ) : (
              <MapPin size={16} className="mr-1.5" />
            )}
            {checkInMutation.isPending ? 'Checking In...' : checkOutMutation.isPending ? 'Checking Out...' : checkedIn ? 'Check Out' : 'Check In'}
          </Button>
        </CardContent>
      </Card>

      {/* Today's Visits */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Today's Visits</h2>
        <Link href="/field/site-visits" className="text-sm text-primary hover:underline">View all →</Link>
      </div>

      {(visits ?? []).length === 0 ? (
        <div className="rounded-card border border-border bg-card p-6 text-center">
          <ClipboardList size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No visits scheduled for today.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(visits ?? []).map((visit: Record<string, unknown>) => (
            <Card key={visit.id as string} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{(visit.leads as Record<string, unknown>)?.full_name as string || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin size={12} />
                      {(visit.leads as Record<string, unknown>)?.preferred_location as string || 'Location not specified'}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      {visit.due_date ? formatDateTime(visit.due_date as string) : 'No time set'}
                    </p>
                  </div>
                  <Badge variant={visit.status === 'Done' ? 'success' : 'warning'}>
                    {visit.status as string}
                  </Badge>
                </div>
                {visit.description && (
                  <p className="text-xs text-muted-foreground mt-2 bg-muted/30 rounded p-2">{visit.description as string}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
