'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, MessageSquare, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Template {
  id: string
  name: string
  channel: 'whatsapp' | 'email' | 'sms'
  subject?: string
  body: string
  created_at: string
}

export default function TemplatesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null)
  const [name, setName] = useState('')
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  // Using integration_settings table to store templates (simplified for v1)
  // In production, you'd have a dedicated templates table
  const { data: templates, isLoading } = useQuery({
    queryKey: ['admin-templates'],
    queryFn: async () => {
      // For v1, we'll fetch from assets.whatsapp_template as a proxy
      // In real implementation, create a templates table
      const { data, error } = await supabase.from('assets').select('id, name, whatsapp_template, created_at')
      if (error) throw error
      return (data ?? []).map((d) => ({
        id: d.id,
        name: d.name,
        channel: 'whatsapp' as const,
        body: d.whatsapp_template || '',
        created_at: d.created_at,
      })) as Template[]
    },
  })

  return (
    <div>
      <PageHeader title="Templates" description="Email and WhatsApp message templates" />

      <div className="rounded-card border border-border bg-card p-8 text-center mb-6">
        <MessageSquare size={32} className="mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground mb-2">Templates are stored per asset in the Assets page.</p>
        <p className="text-xs text-muted-foreground">Go to Assets → Edit any project → WhatsApp Template field to manage templates.</p>
        <Button className="mt-4" onClick={() => window.location.href = '/admin/assets'}>
          Manage in Assets
        </Button>
      </div>

      <DataTable
        columns={[
          { key: 'name', header: 'Template Name', sortable: true },
          {
            key: 'channel',
            header: 'Channel',
            render: (row) => (
              <span className="inline-flex items-center gap-1 text-xs">
                <MessageSquare size={12} /> {row.channel}
              </span>
            ),
          },
          {
            key: 'preview',
            header: 'Preview',
            render: (row) => (
              <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{row.body?.slice(0, 60)}...</span>
            ),
          },
        ]}
        data={templates ?? []}
        searchKey="name"
        searchPlaceholder="Search templates..."
        emptyMessage="No templates found. Create templates in the Assets page."
        loading={isLoading}
      />
    </div>
  )
}
