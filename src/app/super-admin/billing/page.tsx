import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { StatCard } from '@/components/charts/StatCard'
import { Users, Calendar, Zap } from 'lucide-react'

export default async function BillingPage() {
  try {
    const supabase = await createClient()

    const [{ data: orgs }, { data: users }] = await Promise.all([
      supabase.from('organizations').select('*'),
      supabase.from('profiles').select('*'),
    ])

    const totalSeats = users?.length ?? 0

    return (
      <div>
        <PageHeader
          title="Billing"
          description="Plan information and seat management"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Plan"
            value="Pro"
            icon={Zap}
            change="Annual billing"
            changeType="positive"
          />
          <StatCard
            title="Active Seats"
            value={totalSeats}
            icon={Users}
            change="10 included"
            changeType="neutral"
          />
          <StatCard
            title="Next Invoice"
            value="Jul 1, 2026"
            icon={Calendar}
            change="$149/month"
            changeType="neutral"
          />
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Invoice History (UI Preview)
            </h3>
            <div className="rounded-card border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: 'Jun 1, 2026' },
                    { date: 'May 1, 2026' },
                    { date: 'Apr 1, 2026' },
                  ].map((inv) => (
                    <tr key={inv.date} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">{inv.date}</td>
                      <td className="px-4 py-3">Pro Plan — Monthly</td>
                      <td className="px-4 py-3">$149.00</td>
                      <td className="px-4 py-3">
                        <span className="text-success text-xs font-medium">
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('[Billing] Failed to load data:', error)
    return (
      <div>
        <PageHeader
          title="Billing"
          description="Plan information and seat management"
        />
        <div className="rounded-card border border-danger/20 bg-danger/10 p-6 text-center">
          <p className="text-sm font-medium text-danger">
            Failed to load billing data. Please refresh the page.
          </p>
        </div>
      </div>
    )
  }
}
