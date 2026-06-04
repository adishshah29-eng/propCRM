'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Clock, AlertTriangle, Calendar, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/common/Modal'
import { formatDateTime } from '@/lib/utils/formatDate'
import type { Task, TaskStatus } from '@/types/common.types'

export default function CallerTasksPage() {
  const [editModal, setEditModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [newStatus, setNewStatus] = useState<TaskStatus>('Pending')
  const [notes, setNotes] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['caller-tasks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .order('due_date', { ascending: true })
      if (error) throw error
      return data as Task[]
    },
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTask) return
      const { error } = await supabase.from('tasks').update({
        status: newStatus,
      }).eq('id', selectedTask.id)
      if (error) throw error

      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('activities').insert({
        lead_id: selectedTask.lead_id,
        type: 'note',
        description: `Task "${selectedTask.title}" marked as ${newStatus}. ${notes}`,
        created_by: user?.id,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['caller-tasks'] })
      setEditModal(false)
      setSelectedTask(null)
      setNotes('')
    },
  })

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'Done') return false
    return new Date(task.due_date) < new Date()
  }

  const pending = tasks?.filter((t) => t.status !== 'Done') ?? []
  const done = tasks?.filter((t) => t.status === 'Done') ?? []
  const overdueCount = pending.filter(isOverdue).length

  return (
    <div>
      <PageHeader title="Tasks" description="Your personal task list" />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card><CardContent className="p-3 text-center">
          <Clock size={16} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{pending.length}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <AlertTriangle size={16} className="mx-auto text-danger mb-1" />
          <p className="text-lg font-bold text-foreground">{overdueCount}</p>
          <p className="text-[10px] text-muted-foreground">Overdue</p>
        </CardContent></Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : pending.length === 0 && done.length === 0 ? (
        <div className="rounded-card border border-border bg-card p-8 text-center">
          <CheckCircle size={32} className="mx-auto text-success mb-3" />
          <p className="text-muted-foreground">No tasks assigned. Your manager will assign tasks shortly.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">Pending ({pending.length})</h2>
              <div className="space-y-3">
                {pending.map((task) => (
                  <div key={task.id} className={`flex items-start gap-3 p-4 rounded-card border bg-card ${
                    isOverdue(task) ? 'border-danger/30 bg-danger/5' : 'border-border'
                  }`}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      task.priority === 'Urgent' ? 'bg-danger/10 text-danger' :
                      task.priority === 'High' ? 'bg-warning/10 text-warning' :
                      'bg-primary/10 text-primary'
                    }`}>
                      <Clock size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{task.title}</p>
                          {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                        </div>
                        <Badge variant={
                          task.priority === 'Urgent' ? 'danger' :
                          task.priority === 'High' ? 'warning' :
                          task.priority === 'Medium' ? 'info' : 'default'
                        }>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {task.due_date ? formatDateTime(task.due_date) : 'No due date'}
                        </span>
                        {isOverdue(task) && (
                          <span className="text-danger font-medium">Overdue!</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={() => { setSelectedTask(task); setNewStatus('Done'); setEditModal(true) }}>
                          <CheckCircle size={14} className="mr-1" /> Mark Done
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setSelectedTask(task); setNewStatus('In Progress'); setEditModal(true) }}>
                          <Pencil size={14} className="mr-1" /> Update
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">Completed ({done.length})</h2>
              <div className="space-y-2 opacity-60">
                {done.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-card border border-border bg-card">
                    <CheckCircle size={16} className="text-success shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground line-through">{task.title}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={editModal} onClose={() => setEditModal(false)} title="Update Task" maxWidth="max-w-sm">
        {selectedTask && (
          <div className="space-y-4">
            <p className="text-sm text-foreground">{selectedTask.title}</p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
                <option value="Snoozed">Snoozed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any notes about this update..."
                className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditModal(false)}>Cancel</Button>
              <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Update'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
