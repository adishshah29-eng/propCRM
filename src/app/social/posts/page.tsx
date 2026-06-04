'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Instagram, Facebook, Linkedin, Share2, Pencil, Trash2, Eye, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils/formatDate'
import type { SocialPost, PostStatus, SocialPlatform } from '@/types/common.types'

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  'Instagram Reel': <Instagram size={16} />,
  'Instagram Post': <Instagram size={16} />,
  'Facebook Post': <Facebook size={16} />,
  'LinkedIn Post': <Linkedin size={16} />,
  'Story': <Share2 size={16} />,
}

const STATUSES: PostStatus[] = ['Idea', 'Draft', 'Scheduled', 'Published']

export default function PostsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [editModal, setEditModal] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null)
  const [deletingPost, setDeletingPost] = useState<SocialPost | null>(null)

  const [caption, setCaption] = useState('')
  const [platform, setPlatform] = useState<SocialPlatform>('Instagram Post')
  const [scheduledAt, setScheduledAt] = useState('')
  const [status, setStatus] = useState<PostStatus>('Draft')
  const [notes, setNotes] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  const { data: posts, isLoading } = useQuery({
    queryKey: ['social-posts-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as (SocialPost & { profiles: { full_name: string } | null })[]
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!caption.trim()) throw new Error('Caption is required')
      const payload = {
        caption,
        platform,
        scheduled_at: scheduledAt || null,
        status,
        notes: notes || null,
      }
      if (editingPost) {
        const { error } = await supabase.from('social_posts').update(payload).eq('id', editingPost.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('social_posts').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-posts-list'] })
      qc.invalidateQueries({ queryKey: ['social-posts-calendar'] })
      setEditModal(false)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deletingPost) return
      const { error } = await supabase.from('social_posts').delete().eq('id', deletingPost.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['social-posts-list'] })
      qc.invalidateQueries({ queryKey: ['social-posts-calendar'] })
      setConfirmOpen(false)
      setDeletingPost(null)
    },
  })

  const resetForm = () => {
    setCaption(''); setPlatform('Instagram Post'); setScheduledAt('')
    setStatus('Draft'); setNotes(''); setEditingPost(null)
  }

  const openEdit = (post: SocialPost) => {
    setEditingPost(post)
    setCaption(post.caption || '')
    setPlatform(post.platform)
    setScheduledAt(post.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : '')
    setStatus(post.status)
    setNotes(post.notes || '')
    setEditModal(true)
  }

  let filtered = posts ?? []
  if (statusFilter) filtered = filtered.filter((p) => p.status === statusFilter)

  return (
    <div>
      <PageHeader title="Posts" description="All posts with status">
        <Button onClick={() => { resetForm(); setEditModal(true) }}>
          <Plus size={16} className="mr-1.5" /> New Post
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-2 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <DataTable
        columns={[
          {
            key: 'platform',
            header: 'Platform',
            render: (row) => (
              <span className="flex items-center gap-1.5 text-sm">
                {PLATFORM_ICONS[row.platform] || <Share2 size={16} />}
                {row.platform}
              </span>
            ),
          },
          {
            key: 'caption',
            header: 'Caption',
            render: (row) => (
              <span className="text-sm text-foreground line-clamp-2 max-w-[300px]">{row.caption || 'No caption'}</span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => (
              <Badge variant={
                row.status === 'Published' ? 'success' :
                row.status === 'Scheduled' ? 'info' :
                row.status === 'Draft' ? 'warning' : 'default'
              }>
                {row.status}
              </Badge>
            ),
          },
          {
            key: 'scheduled',
            header: 'Scheduled',
            render: (row) => row.scheduled_at ? formatDateTime(row.scheduled_at) : '-',
          },
          {
            key: 'creator',
            header: 'Created By',
            render: (row) => row.profiles?.full_name || '-',
          },
        ]}
        data={filtered}
        searchKey="caption"
        searchPlaceholder="Search posts..."
        emptyMessage="No posts found. Create your first post above."
        loading={isLoading}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => openEdit(row)} className="rounded-button p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
              <Pencil size={14} />
            </button>
            <button onClick={() => { setDeletingPost(row); setConfirmOpen(true) }} className="rounded-button p-1.5 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      />

      <Modal open={editModal} onClose={() => setEditModal(false)} title={editingPost ? 'Edit Post' : 'New Post'} maxWidth="max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
              className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
              {(['Instagram Reel', 'Instagram Post', 'Facebook Post', 'LinkedIn Post', 'Story'] as SocialPlatform[]).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Caption *</label>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4}
              placeholder="Write your caption here..."
              className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Scheduled For</label>
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Internal notes, hashtags, etc."
              className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingPost ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Post"
        description="Are you sure you want to delete this post?"
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
