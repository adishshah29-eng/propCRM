'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface RevenueTrendChartProps {
  deals: Array<{ value: number | null; created_at: string; stage: string }>
}

export function RevenueTrendChart({ deals }: RevenueTrendChartProps) {
  const monthly: Record<string, number> = {}
  deals.forEach((d) => {
    if (!d.value) return
    const month = format(new Date(d.created_at), 'MMM yyyy')
    monthly[month] = (monthly[month] || 0) + d.value
  })

  const data = Object.entries(monthly).map(([month, value]) => ({ month, value }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000000).toFixed(1)}M`} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
        />
        <Line type="monotone" dataKey="value" stroke="#6C63FF" strokeWidth={2} dot={{ fill: '#6C63FF', r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
