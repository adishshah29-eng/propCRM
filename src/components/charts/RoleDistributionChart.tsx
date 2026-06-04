'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { Profile } from '@/types/user.types'

const COLORS = ['#6C63FF', '#06B6D4', '#F59E0B', '#EF4444', '#22C55E', '#8B5CF6']

export function RoleDistributionChart({ users }: { users: Profile[] }) {
  const counts: Record<string, number> = {}
  users.forEach((u) => { if (u.role) counts[u.role] = (counts[u.role] || 0) + 1 })
  const data = Object.entries(counts).map(([name, value]) => ({ name: name.replace('_', ' '), value }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value">
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
