import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { SourceBreakdownChart } from '@/components/charts/SourceBreakdownChart'
import { RoleDistributionChart } from '@/components/charts/RoleDistributionChart'
import { LeadFunnelChart } from '@/components/charts/LeadFunnelChart'

export default async function ReportsPage() {
  try {
    const supabase = await createClient()

    const [{ data: leads }, { data: users }, { data: deals }] =
      await Promise.all([
        supabase.from('leads').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('deals').select('*'),
      ])

    return (
      <div>
        <PageHeader
          title="Reports"
          description="Organization-wide analytics and forecasting"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
                User Role Distribution
              </h3>
              <RoleDistributionChart users={users ?? []} />
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
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Deal Performance Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-card bg-primary/5 border border-primary/10 p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {deals?.filter((d) => d.stage === 'Won').length ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Won Deals</p>
              </div>
              <div className="rounded-card bg-warning/5 border border-warning/10 p-4 text-center">
                <p className="text-2xl font-bold text-warning">
                  {deals?.filter((d) => d.stage === 'Closing').length ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Closing</p>
              </div>
              <div className="rounded-card bg-info/5 border border-info/10 p-4 text-center">
                <p className="text-2xl font-bold text-info">
                  {deals?.filter(
                    (d) =>
                      d.stage === 'Interested' ||
                      d.stage === 'Viewing Scheduled'
                  ).length ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  In Progress
                </p>
              </div>
              <div className="rounded-card bg-danger/5 border border-danger/10 p-4 text-center">
                <p className="text-2xl font-bold text-danger">
                  {deals?.filter((d) => d.stage === 'Lost').length ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Lost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('[SuperAdminReports] Failed to load data:', error)
    return (
      <div>
        <PageHeader
          title="Reports"
          description="Organization-wide analytics and forecasting"
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
