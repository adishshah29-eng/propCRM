import { createClient } from '@/lib/supabase/server'

export async function getOrgWideMetrics() {
  const supabase = await createClient()

  const [{ data: leads }, { data: deals }, { data: calls }, { data: users }] = await Promise.all([
    supabase.from('leads').select('*'),
    supabase.from('deals').select('*'),
    supabase.from('calls').select('*'),
    supabase.from('profiles').select('*'),
  ])

  const totalLeads = leads?.length ?? 0
  const totalDeals = deals?.length ?? 0
  const totalCalls = calls?.length ?? 0
  const totalUsers = users?.length ?? 0

  const wonDeals = deals?.filter((d) => d.stage === 'Won').length ?? 0
  const conversionRate = totalLeads > 0 ? Math.round((wonDeals / totalLeads) * 100) : 0

  const pipelineValue = deals?.reduce((sum, d) => sum + (d.value || 0), 0) ?? 0
  const wonValue = deals?.filter((d) => d.stage === 'Won').reduce((sum, d) => sum + (d.value || 0), 0) ?? 0

  const avgCallDuration = totalCalls > 0
    ? Math.round((calls?.reduce((s, c) => s + (c.duration || 0), 0) ?? 0) / totalCalls)
    : 0

  // Source breakdown
  const sourceCounts: Record<string, number> = {}
  leads?.forEach((l) => { sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1 })

  // Status breakdown
  const statusCounts: Record<string, number> = {}
  leads?.forEach((l) => { statusCounts[l.status] = (statusCounts[l.status] || 0) + 1 })

  // Monthly trend (last 6 months)
  const monthlyData: Record<string, { leads: number; deals: number; calls: number }> = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toLocaleString('default', { month: 'short', year: 'numeric' })
    monthlyData[key] = { leads: 0, deals: 0, calls: 0 }
  }

  leads?.forEach((l) => {
    const d = new Date(l.created_at)
    const key = d.toLocaleString('default', { month: 'short', year: 'numeric' })
    if (monthlyData[key]) monthlyData[key].leads++
  })

  deals?.forEach((d) => {
    const date = new Date(d.created_at)
    const key = date.toLocaleString('default', { month: 'short', year: 'numeric' })
    if (monthlyData[key]) monthlyData[key].deals++
  })

  calls?.forEach((c) => {
    const d = new Date(c.created_at)
    const key = d.toLocaleString('default', { month: 'short', year: 'numeric' })
    if (monthlyData[key]) monthlyData[key].calls++
  })

  return {
    totalLeads,
    totalDeals,
    totalCalls,
    totalUsers,
    wonDeals,
    conversionRate,
    pipelineValue,
    wonValue,
    avgCallDuration,
    sourceBreakdown: sourceCounts,
    statusBreakdown: statusCounts,
    monthlyTrend: Object.entries(monthlyData).map(([month, data]) => ({ month, ...data })),
  }
}
