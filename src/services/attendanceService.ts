import { createClient } from '@/lib/supabase/client'

interface GPSCoords {
  lat: number
  lng: number
}

export async function checkIn(coords?: GPSCoords) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()

  const { data, error } = await supabase.from('attendance').insert({
    user_id: user.id,
    org_id: profile?.org_id,
    check_in_time: new Date().toISOString(),
    check_in_lat: coords?.lat || null,
    check_in_lng: coords?.lng || null,
    status: 'Present',
  }).select().single()

  if (error) throw error
  return data
}

export async function checkOut(attendanceId: string, coords?: GPSCoords) {
  const supabase = createClient()

  const { data, error } = await supabase.from('attendance').update({
    check_out_time: new Date().toISOString(),
    check_out_lat: coords?.lat || null,
    check_out_lng: coords?.lng || null,
  }).eq('id', attendanceId).select().single()

  if (error) throw error
  return data
}
