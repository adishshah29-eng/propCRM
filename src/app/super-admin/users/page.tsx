'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, UserCheck, UserX } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Profile, Role } from '@/types/user.types'

const ROLES: Role[] = ['super_admin', 'admin', 'manager', 'caller', 'field_exec', 'social_manager']
const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  caller: 'Caller',
  field_exec: 'Field Exec',
  social_manager: 'Social Manager',
}

export default function UsersPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<Role>('caller')
  const [error, setError] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['profiles-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*, branches(name)')
      if (error) throw error
      return data as (Profile & { branches: { name: string } | null })[]
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!fullName.trim()) throw new Error('Name is required')
      if (editingUser) {
        const { error } = await supabase.from('profiles').update({ full_name: fullName, phone, role }).eq('id', editingUser.id)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profiles-all'] })
      setModalOpen(false)
      resetForm()
    },
    onError: (err: Error) => setError(err.message),
  })

  const toggleActive = useMutation({
    mutationFn: async (user: Profile) => {
      const { error } = await supabase.from('profiles').update({ is_active: !user.is_active }).eq('id', user.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profiles-all'] }),
  })

  const resetForm = () => {
    setFullName('')
    setEmail('')
    setPhone('')
    setRole('caller')
    setError('')
    setEditingUser(null)
  }

  const openEdit = (user: Profile) => {
    setEditingUser(user)
    setFullName(user.full_name || '')
    setEmail(user.email || '')
    setPhone(user.phone || '')
    setRole(user.role || 'caller')
    setModalOpen(true)
  }

  return (
    <div>
      <PageHeader title="Users" description="All users across the organization">
        <Button onClick={() => { resetForm(); setModalOpen(true) }}>
          <Plus size={16} className="mr-1.5" /> Add User
        </Button>
      </PageHeader>

      <DataTable
        columns={[
          { key: 'full_name', header: 'Name', sortable: true },
          { key: 'email', header: 'Email', sortable: true },
          {
            key: 'role',
            header: 'Role',
            render: (row) => (
              <span className="inline-flex items-center rounded-badge bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary uppercase">
                {ROLE_LABELS[row.role as Role] || row.role}
              </span>
            ),
          },
          {
            key: 'branch',
            header: 'Branch',
            render: (row) => row.branches?.name || '-',
          },
          {
            key: 'is_active',
            header: 'Status',
            render: (row) => (
              <span className={`text-xs font-medium ${row.is_active ? 'text-success' : 'text-danger'}`}>
                {row.is_active ? 'Active' : 'Inactive'}
              </span>
            ),
          },
        ]}
        data={users ?? []}
        searchKey="full_name"
        searchPlaceholder="Search users..."
        emptyMessage="No users found."
        loading={isLoading}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => openEdit(row)} className="rounded-button p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
              <Pencil size={14} />
            </button>
            <button
              onClick={() => toggleActive.mutate(row)}
              className={`rounded-button p-1.5 transition-colors ${
                row.is_active
                  ? 'text-success hover:bg-success/10'
                  : 'text-danger hover:bg-danger/10'
              }`}
              title={row.is_active ? 'Deactivate' : 'Activate'}
            >
              {row.is_active ? <UserCheck size={14} /> : <UserX size={14} />}
            </button>
          </div>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingUser ? 'Edit User' : 'Add User'}>
        <div className="space-y-4">
          {error && <div className="rounded-button bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
          </div>
          {editingUser && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <Input value={email} disabled className="opacity-50" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91-98765-43210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
