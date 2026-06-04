import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/charts/StatCard'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { Users, Phone, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import { LeadFunnelChart } from '@/components/charts/LeadFunnelChart'
import { SourceBreakdownChart } from '@/components/charts/SourceBreakdownChart'

export default async function ManagerDashboardPage() {
  try {
    const supabase = await createClient()

    const [
      { data: leads },
      { data: calls },
      { data: tasks },
      { data: users },
      { data: deals },
    ] = await Promise.all([
      supabase.from('leads').select('*'),
      supabase.from('calls').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('profiles').select('*'),
      supabase.from('deals').select('*'),
    ])

    const teamCallers = users?.filter((u) => u.role === 'caller') ?? []
    const overdueTasks =
      tasks?.filter((t) => {
        if (!t.due_date || t.status === 'Done') return false
        return new Date(t.due_date) < new Date()
      }).length ?? 0
    const todayCalls =
      calls?.filter((c) => {
        if (!c.created_at) return false
        return (
          new Date(c.created_at).toDateString() === new Date().toDateString()
        )
      }).length ?? 0
    const pipelineValue =
      deals?.reduce((sum, d) => sum + (d.value || 0), 0) ?? 0

    const recentCalls =
      calls?.slice(0, 10).map((c) => ({
        ...c,
        agent: users?.find((u) => u.id === c.agent_id),
        lead: leads?.find((l) => l.id === c.lead_id),
      })) ?? []

    return (
      <div>
        <PageHeader
          title="Team Dashboard"
          description="Live caller activity and team performance"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Team Callers"
            value={teamCallers.length}
            icon={Users}
            change={`${teamCallers.filter((c) => c.is_active).length} active`}
            changeType="positive"
          />
          <StatCard
            title="Today's Calls"
            value={todayCalls}
            icon={Phone}
            change="Across all callers"
            changeType="neutral"
          />
          <StatCard
            title="Overdue Tasks"
            value={overdueTasks}
            icon={AlertTriangle}
            change="Needs attention"
            changeType={overdueTasks > 0 ? 'negative' : 'positive'}
          />
          <StatCard
            title="Pipeline Value"
            value={formatCurrency(pipelineValue)}
            icon={TrendingUp}
            change={`${deals?.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost').length ?? 0} active deals`}
            changeType="positive"
          />
        </div>

        {overdueTasks > 0 && (
          <div className="mb-6 rounded-card bg-danger/10 border border-danger/20 p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-danger shrink-0" />
            <div>
              <p className="text-sm font-medium text-danger">
                {overdueTasks} overdue tasks across your team
              </p>
              <p className="text-xs text-muted-foreground">
                Review and reassign on the Tasks page
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 rounded-card border border-border bg-card p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity size={16} className="text-primary" /> Live Activity Feed
            </h3>
            <div className="space-y-3">
              {recentCalls.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              ) : (
                recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-start gap-3 p-3 rounded-card bg-muted/30 border border-border"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {call.agent?.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {call.agent?.full_name || 'Unknown'} called{' '}
                        {call.lead?.full_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {call.outcome || call.status} ·{' '}
                        {call.duration ? `${call.duration}s` : 'N/A'} ·{' '}
                        {new Date(call.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-badge ${
                        call.outcome === 'Interested'
                          ? 'bg-success/10 text-success'
                          : call.outcome === 'Not Interested'
                            ? 'bg-danger/10 text-danger'
                            : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {call.outcome || 'Pending'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-card border border-border bg-card p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Lead Funnel
            </h3>
            <LeadFunnelChart leads={leads ?? []} />
          </div>
        </div>

        <div className="rounded-card border border-border bg-card p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Leads by Source
          </h3>
          <SourceBreakdownChart leads={leads ?? []} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('[ManagerDashboard] Failed to load data:', error)
    return (
      <div>
        <PageHeader
          title="Team Dashboard"
          description="Live caller activity and team performance"
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
