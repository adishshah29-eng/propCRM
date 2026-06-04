'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, FolderOpen, Image } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import type { Asset, AssetStatus } from '@/types/property.types'

const STATUSES: AssetStatus[] = ['Launching', 'Under Construction', 'Ready', 'Sold Out']

export default function AssetsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null)

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [status, setStatus] = useState<AssetStatus>('Launching')
  const [description, setDescription] = useState('')
  const [brochureUrl, setBrochureUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [whatsappTemplate, setWhatsappTemplate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  const { data: assets, isLoading } = useQuery({
    queryKey: ['admin-assets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as Asset[]
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Name is required')
      const payload = {
        name,
        location: location || null,
        type: type || null,
        price_min: priceMin ? Number(priceMin) : null,
        price_max: priceMax ? Number(priceMax) : null,
        status,
        description: description || null,
        brochure_url: brochureUrl || null,
        images: imageUrl ? [imageUrl] : [],
        whatsapp_template: whatsappTemplate || null,
        is_active: isActive,
      }
      if (editingAsset) {
        const { error } = await supabase.from('assets').update(payload).eq('id', editingAsset.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('assets').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-assets'] })
      setModalOpen(false)
      resetForm()
    },
    onError: (err: Error) => setError(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deletingAsset) return
      const { error } = await supabase.from('assets').delete().eq('id', deletingAsset.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-assets'] })
      setConfirmOpen(false)
      setDeletingAsset(null)
    },
  })

  const resetForm = () => {
    setName(''); setLocation(''); setType(''); setPriceMin(''); setPriceMax('')
    setStatus('Launching'); setDescription(''); setBrochureUrl(''); setImageUrl('')
    setWhatsappTemplate(''); setIsActive(true); setError(''); setEditingAsset(null)
  }

  const openEdit = (asset: Asset) => {
    setEditingAsset(asset)
    setName(asset.name)
    setLocation(asset.location || '')
    setType(asset.type || '')
    setPriceMin(asset.price_min?.toString() || '')
    setPriceMax(asset.price_max?.toString() || '')
    setStatus(asset.status)
    setDescription(asset.description || '')
    setBrochureUrl(asset.brochure_url || '')
    setImageUrl(asset.images?.[0] || '')
    setWhatsappTemplate(asset.whatsapp_template || '')
    setIsActive(asset.is_active)
    setModalOpen(true)
  }

  const openDelete = (asset: Asset) => {
    setDeletingAsset(asset)
    setConfirmOpen(true)
  }

  return (
    <div>
      <PageHeader title="Assets" description="Project catalogue for WhatsApp sharing">
        <Button onClick={() => { resetForm(); setModalOpen(true) }}>
          <Plus size={16} className="mr-1.5" /> Add Asset
        </Button>
      </PageHeader>

      <DataTable
        columns={[
          {
            key: 'image',
            header: '',
            render: (row) => row.images?.[0] ? (
              <img src={row.images[0]} alt={row.name} className="h-10 w-10 rounded-card object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-card bg-muted flex items-center justify-center">
                <Image size={16} className="text-muted-foreground" />
              </div>
            ),
          },
          { key: 'name', header: 'Name', sortable: true },
          { key: 'location', header: 'Location', sortable: true },
          { key: 'type', header: 'Type', sortable: true },
          {
            key: 'price',
            header: 'Price Range',
            render: (row) => {
              const min = row.price_min ? formatCurrency(row.price_min) : '-'
              const max = row.price_max ? formatCurrency(row.price_max) : '-'
              return <span className="text-xs">{min} - {max}</span>
            },
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => (
              <Badge variant={row.status === 'Ready' ? 'success' : row.status === 'Sold Out' ? 'danger' : 'warning'}>
                {row.status}
              </Badge>
            ),
          },
          {
            key: 'active',
            header: 'Active',
            render: (row) => (
              <span className={`text-xs font-medium ${row.is_active ? 'text-success' : 'text-muted-foreground'}`}>
                {row.is_active ? 'Yes' : 'No'}
              </span>
            ),
          },
        ]}
        data={assets ?? []}
        searchKey="name"
        searchPlaceholder="Search assets..."
        emptyMessage="No assets found. Add your first project above."
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingAsset ? 'Edit Asset' : 'Add Asset'} maxWidth="max-w-lg">
        <div className="space-y-4">
          {error && <div className="rounded-button bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Project Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sunset Villas Phase 2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Gurgaon Sector 62" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type</label>
              <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Villa, Apartment" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Min Price</label>
              <Input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="12000000" type="number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Max Price</label>
              <Input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="18000000" type="number" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as AssetStatus)}
                className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
              <label className="text-sm text-foreground">Active for sharing</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Brochure URL</label>
            <Input value={brochureUrl} onChange={(e) => setBrochureUrl(e.target.value)} placeholder="https://storage.../brochure.pdf" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Image URL</label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." />
            {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 h-24 w-full rounded-card object-cover" />}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">WhatsApp Template</label>
            <textarea value={whatsappTemplate} onChange={(e) => setWhatsappTemplate(e.target.value)} rows={4}
              className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
              placeholder="Hi {clientName}, I'd like to share details about *{projectName}*..." />
            <p className="text-xs text-muted-foreground mt-1">Use {'{clientName}'}, {'{projectName}'}, {'{location}'}, {'{price}'}, {'{agentName}'} as variables</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingAsset ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Asset"
        description={`Are you sure you want to delete "${deletingAsset?.name}"? This cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
