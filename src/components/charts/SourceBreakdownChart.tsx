'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { Lead } from '@/types/lead.types'

const COLORS = ['#6C63FF', '#06B6D4', '#F59E0B', '#EF4444', '#22C55E', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#64748B']

export function SourceBreakdownChart({ leads }: { leads: Lead[] }) {
  const counts: Record<string, number> = {}
  leads.forEach((l) => { counts[l.source] = (counts[l.source] || 0) + 1 })
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
