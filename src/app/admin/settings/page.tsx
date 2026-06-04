'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Globe, Bell, Shield, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)
  const [branchName, setBranchName] = useState('Gurgaon HQ')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [leadAssignment, setLeadAssignment] = useState('round_robin')
  const [autoFollowup, setAutoFollowup] = useState(true)

  const supabase = createClient()
  const qc = useQueryClient()

  const { data: settings } = useQuery({
    queryKey: ['admin-integration-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('integration_settings').select('*').single()
      if (error) throw error
      return data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: orgs } = await supabase.from('organizations').select('id').limit(1)
      const orgId = orgs?.[0]?.id
      if (!orgId) throw new Error('No organization found')

      const { error } = await supabase.from('integration_settings').upsert({
        org_id: orgId,
        lead_assignment_mode: leadAssignment,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-integration-settings'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  return (
    <div>
      <PageHeader title="Settings" description="Branch settings and integrations" />

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">Branch Info</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Branch Name</label>
                <Input value={branchName} onChange={(e) => setBranchName(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">Regional</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Timezone</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">Lead Management</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Lead Assignment Mode</label>
                <select value={leadAssignment} onChange={(e) => setLeadAssignment(e.target.value)}
                  className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                  <option value="round_robin">Round Robin</option>
                  <option value="manual">Manual</option>
                  <option value="least_busy">Least Busy</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">How new leads are distributed to callers</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={autoFollowup} onChange={(e) => setAutoFollowup(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                <label className="text-sm text-foreground">Auto-create follow-up tasks on missed calls</label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell size={18} className="text-primary" />
              <h3 className="font-semibold text-foreground">Integration Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Twilio Voice</p>
                  <p className="text-xs text-muted-foreground">Call bridge and WhatsApp</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-badge ${settings?.twilio_sid ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {settings?.twilio_sid ? 'Connected' : 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">OpenAI</p>
                  <p className="text-xs text-muted-foreground">Lead scoring and captions</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-badge ${settings?.openai_key ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {settings?.openai_key ? 'Connected' : 'Not configured'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Resend Email</p>
                  <p className="text-xs text-muted-foreground">Transactional emails</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-badge ${settings?.resend_key ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {settings?.resend_key ? 'Connected' : 'Not configured'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save size={16} className="mr-1.5" />
            {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
          {saved && <span className="text-sm text-success">Settings saved!</span>}
        </div>
      </div>
    </div>
  )
}
