import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/charts/StatCard'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { Building2, Users, CreditCard } from 'lucide-react'
import { BranchComparisonChart } from '@/components/charts/BranchComparisonChart'
import { RevenueTrendChart } from '@/components/charts/RevenueTrendChart'

export default async function SuperAdminDashboardPage() {
  try {
    const supabase = await createClient()

    const [
      { data: orgs },
      { data: branches },
      { data: users },
      { data: leads },
      { data: deals },
    ] = await Promise.all([
      supabase.from('organizations').select('*'),
      supabase.from('branches').select('*, organizations(name)'),
      supabase.from('profiles').select('*'),
      supabase.from('leads').select('*'),
      supabase.from('deals').select('*'),
    ])

    const totalOrgs = orgs?.length ?? 0
    const totalBranches = branches?.length ?? 0
    const totalUsers = users?.length ?? 0
    const totalRevenue = deals?.reduce((sum, d) => sum + (d.value || 0), 0) ?? 0
    const activeDeals =
      deals?.filter((d) => d.stage !== 'Won' && d.stage !== 'Lost').length ?? 0

    return (
      <div>
        <PageHeader
          title="Super Admin Dashboard"
          description="Organization-wide overview and performance"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Organizations"
            value={totalOrgs}
            icon={Building2}
            change="All active"
            changeType="neutral"
          />
          <StatCard
            title="Branches"
            value={totalBranches}
            icon={Building2}
            change={`${branches?.filter((b) => b.org_id).length ?? 0} with org`}
            changeType="positive"
          />
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            change={`${users?.filter((u) => u.is_active).length ?? 0} active`}
            changeType="positive"
          />
          <StatCard
            title="Pipeline Value"
            value={formatCurrency(totalRevenue)}
            icon={CreditCard}
            change={`${activeDeals} active deals`}
            changeType="positive"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-card border border-border bg-card p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Branch Comparison
            </h3>
            <BranchComparisonChart
              branches={branches ?? []}
              leads={leads ?? []}
            />
          </div>
          <div className="rounded-card border border-border bg-card p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Revenue Trend
            </h3>
            <RevenueTrendChart deals={deals ?? []} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('[SuperAdminDashboard] Failed to load data:', error)
    return (
      <div>
        <PageHeader
          title="Super Admin Dashboard"
          description="Organization-wide overview and performance"
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
