import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/charts/StatCard'
import { Phone, Clock, AlertTriangle, Target, CheckCircle } from 'lucide-react'
import { LeadCard } from '@/components/leads/LeadCard'
import type { Lead } from '@/types/lead.types'

export default async function CallerDashboardPage() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return (
        <div className="p-6 text-sm text-muted-foreground">
          Not authenticated
        </div>
      )

    const [{ data: leads }, { data: calls }, { data: tasks }] =
      await Promise.all([
        supabase
          .from('leads')
          .select('*')
          .eq('assigned_to', user.id)
          .order('score', { ascending: false }),
        supabase.from('calls').select('*').eq('agent_id', user.id),
        supabase.from('tasks').select('*').eq('assigned_to', user.id),
      ])

    const myLeads = leads ?? []
    const myCalls = calls ?? []
    const myTasks = tasks ?? []

    const todayCalls = myCalls.filter((c) => {
      if (!c.created_at) return false
      return (
        new Date(c.created_at).toDateString() === new Date().toDateString()
      )
    }).length

    const overdueFollowups = myLeads.filter((l) => {
      if (!l.next_followup_at) return false
      return new Date(l.next_followup_at) < new Date()
    }).length

    const hotLeads = myLeads.filter((l) => l.temperature === 'Hot').length
    const totalTalkTime = myCalls.reduce((s, c) => s + (c.duration || 0), 0)
    const pendingTasks = myTasks.filter((t) => t.status !== 'Done').length
    const topLeads = myLeads.slice(0, 3)

    return (
      <div>
        <PageHeader
          title="Today's Queue"
          description="Your prioritized leads and daily stats"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="My Leads"
            value={myLeads.length}
            icon={Target}
            change={`${hotLeads} hot`}
            changeType="positive"
          />
          <StatCard
            title="Today's Calls"
            value={todayCalls}
            icon={Phone}
            change="Keep it up!"
            changeType="positive"
          />
          <StatCard
            title="Talk Time"
            value={`${Math.round(totalTalkTime / 60)}m`}
            icon={Clock}
            change="Total today"
            changeType="neutral"
          />
          <StatCard
            title="Pending Tasks"
            value={pendingTasks}
            icon={CheckCircle}
            change={`${overdueFollowups} overdue leads`}
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
                Check your Follow-ups page to catch up
              </p>
            </div>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Top Priority Leads
          </h2>
          {/* Use Next.js Link for client-side navigation, not <a> */}
          <Link
            href="/caller/my-leads"
            className="text-sm text-primary hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {topLeads.length === 0 ? (
            <div className="rounded-card border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                No leads assigned yet. Your manager will assign leads shortly.
              </p>
            </div>
          ) : (
            topLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                href={`/caller/lead/${lead.id}`}
              />
            ))
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('[CallerDashboard] Failed to load data:', error)
    return (
      <div>
        <PageHeader
          title="Today's Queue"
          description="Your prioritized leads and daily stats"
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
