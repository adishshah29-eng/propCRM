import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { StatCard } from '@/components/charts/StatCard'
import { SourceBreakdownChart } from '@/components/charts/SourceBreakdownChart'
import { LeadFunnelChart } from '@/components/charts/LeadFunnelChart'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { Users, TrendingUp, Phone, Target } from 'lucide-react'

export default async function AdminReportsPage() {
  try {
    const supabase = await createClient()
    const [
      { data: leads },
      { data: deals },
      { data: calls },
      { data: users },
    ] = await Promise.all([
      supabase.from('leads').select('*'),
      supabase.from('deals').select('*'),
      supabase.from('calls').select('*'),
      supabase.from('profiles').select('*'),
    ])

    const totalLeads = leads?.length ?? 0
    const converted = deals?.filter((d) => d.stage === 'Won').length ?? 0
    const conversionRate =
      totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0
    const totalCalls = calls?.length ?? 0
    const avgDuration =
      totalCalls > 0
        ? Math.round(
            (calls?.reduce((s, c) => s + (c.duration || 0), 0) ?? 0) /
              totalCalls
          )
        : 0
    const pipelineValue =
      deals?.reduce((sum, d) => sum + (d.value || 0), 0) ?? 0

    return (
      <div>
        <PageHeader
          title="Reports"
          description="Branch performance and analytics"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Leads"
            value={totalLeads}
            icon={Users}
            change={`${converted} converted`}
            changeType="positive"
          />
          <StatCard
            title="Conversion Rate"
            value={`${conversionRate}%`}
            icon={Target}
            change="vs last month"
            changeType="neutral"
          />
          <StatCard
            title="Total Calls"
            value={totalCalls}
            icon={Phone}
            change={`${avgDuration}s avg duration`}
            changeType="neutral"
          />
          <StatCard
            title="Pipeline Value"
            value={formatCurrency(pipelineValue)}
            icon={TrendingUp}
            change={`${deals?.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost').length ?? 0} active`}
            changeType="positive"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Leads by Source
              </h3>
              <SourceBreakdownChart leads={leads ?? []} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Lead Funnel
              </h3>
              <LeadFunnelChart leads={leads ?? []} />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Caller Performance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {users
                ?.filter((u) => u.role === 'caller')
                .map((caller) => {
                  const callerLeads =
                    leads?.filter((l) => l.assigned_to === caller.id).length ??
                    0
                  const callerCalls =
                    calls?.filter((c) => c.agent_id === caller.id).length ?? 0
                  return (
                    <div
                      key={caller.id}
                      className="rounded-card border border-border p-4 text-center"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {caller.full_name}
                      </p>
                      <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{callerLeads} leads</span>
                        <span>{callerCalls} calls</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('[AdminReports] Failed to load data:', error)
    return (
      <div>
        <PageHeader
          title="Reports"
          description="Branch performance and analytics"
        />
        <div className="rounded-card border border-danger/20 bg-danger/10 p-6 text-center">
          <p className="text-sm font-medium text-danger">
            Failed to load report data. Please refresh the page.
          </p>
        </div>
      </div>
    )
  }
}
