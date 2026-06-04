import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/charts/StatCard'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { Users, AlertTriangle, TrendingUp } from 'lucide-react'
import { SourceBreakdownChart } from '@/components/charts/SourceBreakdownChart'
import { LeadFunnelChart } from '@/components/charts/LeadFunnelChart'

export default async function AdminDashboardPage() {
  try {
    const supabase = await createClient()

    const [
      { data: leads },
      { data: users },
      { data: deals },
      { data: tasks },
      { data: attendance },
    ] = await Promise.all([
      supabase.from('leads').select('*'),
      supabase.from('profiles').select('*'),
      supabase.from('deals').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('attendance').select('*'),
    ])

    const totalLeads = leads?.length ?? 0
    const newLeads = leads?.filter((l) => l.status === 'New').length ?? 0
    const overdueFollowups =
      leads?.filter((l) => {
        if (!l.next_followup_at) return false
        return new Date(l.next_followup_at) < new Date()
      }).length ?? 0
    const activeDeals =
      deals?.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost').length ?? 0
    const pipelineValue =
      deals?.reduce((sum, d) => sum + (d.value || 0), 0) ?? 0
    const teamSize =
      users?.filter((u) => u.role !== 'super_admin').length ?? 0
    const todayAttendance =
      attendance?.filter((a) => {
        if (!a.check_in_time) return false
        return (
          new Date(a.check_in_time).toDateString() === new Date().toDateString()
        )
      }).length ?? 0

    return (
      <div>
        <PageHeader
          title="Branch Dashboard"
          description="Overview of your branch performance"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Leads"
            value={totalLeads}
            icon={Users}
            change={`${newLeads} new`}
            changeType="positive"
          />
          <StatCard
            title="Pipeline Value"
            value={formatCurrency(pipelineValue)}
            icon={TrendingUp}
            change={`${activeDeals} active deals`}
            changeType="positive"
          />
          <StatCard
            title="Team Size"
            value={teamSize}
            icon={Users}
            change={`${todayAttendance} checked in today`}
            changeType="neutral"
          />
          <StatCard
            title="Overdue Follow-ups"
            value={overdueFollowups}
            icon={AlertTriangle}
            change="Needs attention"
            changeType={overdueFollowups > 0 ? 'negative' : 'positive'}
          />
        </div>

        {overdueFollowups > 0 && (
          <div className="mb-6 rounded-card bg-danger/10 border border-danger/20 p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-danger shrink-0" />
            <div>
              <p className="text-sm font-medium text-danger">
                {overdueFollowups} leads have overdue follow-ups
              </p>
              <p className="text-xs text-muted-foreground">
                Reassign or set new follow-up dates to keep leads warm
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-card border border-border bg-card p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Leads by Source
            </h3>
            <SourceBreakdownChart leads={leads ?? []} />
          </div>
          <div className="rounded-card border border-border bg-card p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Lead Funnel
            </h3>
            <LeadFunnelChart leads={leads ?? []} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('[AdminDashboard] Failed to load data:', error)
    return (
      <div>
        <PageHeader
          title="Branch Dashboard"
          description="Overview of your branch performance"
        />
        <div className="rounded-card border border-danger/20 bg-danger/10 p-6 text-center">
          <p className="text-sm font-medium text-danger">
            Failed to load dashboard data. Please refresh the page.
          </p>
        </div>
      </div>
    )
  }
}
