'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface BranchComparisonChartProps {
  branches: Array<{ id: string; name: string; org_id: string }>
  leads: Array<{ branch_id: string | null; status: string }>
}

export function BranchComparisonChart({ branches, leads }: BranchComparisonChartProps) {
  const data = branches.map((branch) => {
    const branchLeads = leads.filter((l) => l.branch_id === branch.id)
    return {
      name: branch.name,
      leads: branchLeads.length,
      contacted: branchLeads.filter((l) => l.status === 'Contacted').length,
      interested: branchLeads.filter((l) => l.status === 'Interested').length,
      won: branchLeads.filter((l) => l.status === 'Won').length,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="leads" fill="#6C63FF" radius={[4, 4, 0, 0]} />
        <Bar dataKey="interested" fill="#F59E0B" radius={[4, 4, 0, 0]} />
        <Bar dataKey="won" fill="#22C55E" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
