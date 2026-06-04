'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Task, TaskPriority, TaskStatus } from '@/types/common.types'

const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent']
const STATUSES: TaskStatus[] = ['Pending', 'In Progress', 'Done', 'Snoozed']

export default function ManagerTasksPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('Medium')
  const [status, setStatus] = useState<TaskStatus>('Pending')
  const [error, setError] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['manager-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles!tasks_assigned_to_fkey(full_name)')
        .order('due_date', { ascending: true })
      if (error) throw error
      return data as (Task & { profiles: { full_name: string } | null })[]
    },
  })

  const { data: callers } = useQuery({
    queryKey: ['manager-task-callers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name').eq('role', 'caller').eq('is_active', true)
      if (error) throw error
      return data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error('Title is required')
      const payload = {
        title,
        description: description || null,
        assigned_to: assignedTo || null,
        due_date: dueDate || null,
        priority,
        status,
      }
      if (editingTask) {
        const { error } = await supabase.from('tasks').update(payload).eq('id', editingTask.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('tasks').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manager-tasks'] })
      setModalOpen(false)
      resetForm()
    },
    onError: (err: Error) => setError(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deletingTask) return
      const { error } = await supabase.from('tasks').delete().eq('id', deletingTask.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manager-tasks'] })
      setConfirmOpen(false)
      setDeletingTask(null)
    },
  })

  const resetForm = () => {
    setTitle(''); setDescription(''); setAssignedTo(''); setDueDate('')
    setPriority('Medium'); setStatus('Pending'); setError(''); setEditingTask(null)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setTitle(task.title); setDescription(task.description || '')
    setAssignedTo(task.assigned_to || ''); setDueDate(task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '')
    setPriority(task.priority); setStatus(task.status)
    setModalOpen(true)
  }

  const openDelete = (task: Task) => {
    setDeletingTask(task)
    setConfirmOpen(true)
  }

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'Done') return false
    return new Date(task.due_date) < new Date()
  }

  return (
    <div>
      <PageHeader title="Tasks" description="Assign and manage team tasks">
        <Button onClick={() => { resetForm(); setModalOpen(true) }}>
          <Plus size={16} className="mr-1.5" /> Add Task
        </Button>
      </PageHeader>

      <DataTable
        columns={[
          { key: 'title', header: 'Title', sortable: true },
          {
            key: 'priority',
            header: 'Priority',
            render: (row) => (
              <Badge variant={
                row.priority === 'Urgent' ? 'danger' :
                row.priority === 'High' ? 'warning' :
                row.priority === 'Medium' ? 'info' : 'default'
              }>
                {row.priority}
              </Badge>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => (
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                row.status === 'Done' ? 'text-success' :
                row.status === 'In Progress' ? 'text-info' :
                isOverdue(row) ? 'text-danger' : 'text-muted-foreground'
              }`}>
                {row.status === 'Done' ? <CheckCircle size={12} /> :
                 isOverdue(row) ? <AlertTriangle size={12} /> : <Clock size={12} />}
                {row.status}
              </span>
            ),
          },
          {
            key: 'assigned',
            header: 'Assigned',
            render: (row) => row.profiles?.full_name || <span className="text-muted-foreground text-xs">Unassigned</span>,
          },
          {
            key: 'due',
            header: 'Due',
            render: (row) => (
              <span className={`text-xs ${isOverdue(row) ? 'text-danger font-medium' : 'text-muted-foreground'}`}>
                <Calendar size={12} className="inline mr-1" />
                {row.due_date ? new Date(row.due_date).toLocaleDateString() : '-'}
              </span>
            ),
          },
        ]}
        data={tasks ?? []}
        searchKey="title"
        searchPlaceholder="Search tasks..."
        emptyMessage="No tasks found. Create your first task above."
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? 'Edit Task' : 'Add Task'}>
        <div className="space-y-4">
          {error && <div className="rounded-button bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Call 5 hot leads before EOD" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Assign To</label>
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                <option value="">Unassigned</option>
                {callers?.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Due Date</label>
              <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingTask ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Task"
        description={`Delete "${deletingTask?.title}"? This cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
