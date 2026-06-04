'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Branch } from '@/types/user.types'

export default function BranchesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('branches').select('*, organizations(name)')
      if (error) throw error
      return data as (Branch & { organizations: { name: string } | null })[]
    },
  })

  const { data: orgs } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase.from('organizations').select('*')
      if (error) throw error
      return data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Branch name is required')
      const orgId = orgs?.[0]?.id
      if (!orgId) throw new Error('No organization found')

      if (editingBranch) {
        const { error } = await supabase.from('branches').update({ name, location }).eq('id', editingBranch.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('branches').insert({ name, location, org_id: orgId })
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] })
      setModalOpen(false)
      resetForm()
    },
    onError: (err: Error) => setError(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deletingBranch) return
      const { error } = await supabase.from('branches').delete().eq('id', deletingBranch.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['branches'] })
      setConfirmOpen(false)
      setDeletingBranch(null)
    },
  })

  const resetForm = () => {
    setName('')
    setLocation('')
    setError('')
    setEditingBranch(null)
  }

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setName(branch.name)
    setLocation(branch.location || '')
    setModalOpen(true)
  }

  const openDelete = (branch: Branch) => {
    setDeletingBranch(branch)
    setConfirmOpen(true)
  }

  return (
    <div>
      <PageHeader title="Branches" description="Manage all organization branches">
        <Button onClick={() => { resetForm(); setModalOpen(true) }}>
          <Plus size={16} className="mr-1.5" /> Add Branch
        </Button>
      </PageHeader>

      <DataTable
        columns={[
          { key: 'name', header: 'Name', sortable: true },
          { key: 'location', header: 'Location', sortable: true },
          {
            key: 'org',
            header: 'Organization',
            render: (row) => row.organizations?.name || '-',
          },
          {
            key: 'created_at',
            header: 'Created',
            render: (row) => new Date(row.created_at).toLocaleDateString(),
          },
        ]}
        data={branches ?? []}
        searchKey="name"
        searchPlaceholder="Search branches..."
        emptyMessage="No branches found. Add your first branch above."
        loading={isLoading}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => openEdit(row)} className="rounded-button p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
              <Pencil size={14} />
            </button>
            <button onClick={() => openDelete(row)} className="rounded-button p-1.5 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingBranch ? 'Edit Branch' : 'Add Branch'}>
        <div className="space-y-4">
          {error && <div className="rounded-button bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Branch Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gurgaon HQ" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Gurgaon, Haryana" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingBranch ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Branch"
        description={`Are you sure you want to delete "${deletingBranch?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
