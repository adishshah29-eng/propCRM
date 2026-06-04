import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { StatCard } from '@/components/charts/StatCard'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { Users, Phone, Target, TrendingUp, BarChart3 } from 'lucide-react'
import { SourceBreakdownChart } from '@/components/charts/SourceBreakdownChart'
import { LeadFunnelChart } from '@/components/charts/LeadFunnelChart'

export default async function ManagerReportsPage() {
  try {
    const supabase = await createClient()
    const [
      { data: leads },
      { data: calls },
      { data: deals },
      { data: users },
    ] = await Promise.all([
      supabase.from('leads').select('*'),
      supabase.from('calls').select('*'),
      supabase.from('deals').select('*'),
      supabase.from('profiles').select('*'),
    ])

    const totalLeads = leads?.length ?? 0
    const totalCalls = calls?.length ?? 0
    const avgDuration =
      totalCalls > 0
        ? Math.round(
            (calls?.reduce((s, c) => s + (c.duration || 0), 0) ?? 0) /
              totalCalls
          )
        : 0
    const converted = deals?.filter((d) => d.stage === 'Won').length ?? 0
    const conversionRate =
      totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0
    const pipelineValue =
      deals?.reduce((sum, d) => sum + (d.value || 0), 0) ?? 0

    const callers = users?.filter((u) => u.role === 'caller') ?? []
    const callerStats = callers.map((caller) => {
      const callerLeads =
        leads?.filter((l) => l.assigned_to === caller.id).length ?? 0
      const callerCalls = calls?.filter((c) => c.agent_id === caller.id) ?? []
      const callerDeals =
        deals?.filter((d) => d.agent_id === caller.id && d.stage === 'Won')
          .length ?? 0
      const totalTalkTime = callerCalls.reduce(
        (s, c) => s + (c.duration || 0),
        0
      )
      return {
        name: caller.full_name || 'Unknown',
        leads: callerLeads,
        calls: callerCalls.length,
        deals: callerDeals,
        talkTime: Math.round(totalTalkTime / 60),
        conversion:
          callerLeads > 0 ? Math.round((callerDeals / callerLeads) * 100) : 0,
      }
    })

    return (
      <div>
        <PageHeader
          title="Reports"
          description="Team conversion and call performance"
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
            change={`${avgDuration}s avg`}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-primary" /> Caller Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Caller
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      Leads
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      Calls
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      Deals Won
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      Talk Time
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      Conversion
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {callerStats.map((stat) => (
                    <tr
                      key={stat.name}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {stat.name}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {stat.leads}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {stat.calls}
                      </td>
                      <td className="px-4 py-3 text-center text-success font-medium">
                        {stat.deals}
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {stat.talkTime}m
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs font-medium ${
                            stat.conversion >= 20
                              ? 'text-success'
                              : stat.conversion >= 10
                                ? 'text-warning'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {stat.conversion}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {callerStats.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No caller data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('[ManagerReports] Failed to load data:', error)
    return (
      <div>
        <PageHeader
          title="Reports"
          description="Team conversion and call performance"
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
