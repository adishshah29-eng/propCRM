'use client'

import { useState } from 'react'
import { Shield, Check, X } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import type { Role } from '@/types/user.types'

const ROLES: Role[] = ['super_admin', 'admin', 'manager', 'caller', 'field_exec', 'social_manager']
const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin', admin: 'Admin', manager: 'Manager',
  caller: 'Caller', field_exec: 'Field Exec', social_manager: 'Social Manager',
}

const PERMISSIONS = [
  { key: 'manage_orgs', label: 'Manage Organizations', desc: 'Create and manage orgs' },
  { key: 'manage_branches', label: 'Manage Branches', desc: 'Add/edit/delete branches' },
  { key: 'manage_users', label: 'Manage Users', desc: 'Add/edit users and roles' },
  { key: 'manage_leads', label: 'Manage Leads', desc: 'Full lead CRUD across org' },
  { key: 'manage_properties', label: 'Manage Properties', desc: 'Add/edit property listings' },
  { key: 'manage_assets', label: 'Manage Assets', desc: 'Add/edit project catalogue' },
  { key: 'view_reports', label: 'View Reports', desc: 'Access analytics and reports' },
  { key: 'manage_billing', label: 'Manage Billing', desc: 'Plans, seats, invoices' },
  { key: 'view_audit', label: 'View Audit Logs', desc: 'User action history' },
  { key: 'api_access', label: 'API Access', desc: 'Webhooks and integrations' },
]

const DEFAULT_MATRIX: Record<Role, string[]> = {
  super_admin: PERMISSIONS.map((p) => p.key),
  admin: ['manage_branches', 'manage_users', 'manage_leads', 'manage_properties', 'manage_assets', 'view_reports'],
  manager: ['manage_leads', 'view_reports'],
  caller: ['manage_leads'],
  field_exec: [],
  social_manager: ['manage_assets'],
}

export default function PermissionsPage() {
  const [matrix, setMatrix] = useState(DEFAULT_MATRIX)

  const toggle = (role: Role, perm: string) => {
    setMatrix((prev) => {
      const has = prev[role].includes(perm)
      return {
        ...prev,
        [role]: has ? prev[role].filter((p) => p !== perm) : [...prev[role], perm],
      }
    })
  }

  return (
    <div>
      <PageHeader title="Permissions" description="Configure role-based access control" />

      <div className="space-y-4">
        {ROLES.map((role) => (
          <Card key={role}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={18} className="text-primary" />
                <h3 className="font-semibold text-foreground">{ROLE_LABELS[role]}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PERMISSIONS.map((perm) => {
                  const active = matrix[role].includes(perm.key)
                  return (
                    <button
                      key={perm.key}
                      onClick={() => toggle(role, perm.key)}
                      className={`flex items-start gap-3 rounded-card border p-3 text-left transition-colors ${
                        active
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card hover:bg-muted/30'
                      }`}
                    >
                      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        active ? 'border-primary bg-primary text-white' : 'border-border'
                      }`}>
                        {active ? <Check size={12} /> : <X size={12} className="text-muted-foreground" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{perm.label}</p>
                        <p className="text-xs text-muted-foreground">{perm.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 rounded-card bg-warning/10 border border-warning/20 p-4">
        <p className="text-sm text-warning">
          <strong>Note:</strong> Permission changes take effect immediately. In v1, this is a UI preview. Full enforcement is handled by Supabase RLS policies.
        </p>
      </div>
    </div>
  )
}
