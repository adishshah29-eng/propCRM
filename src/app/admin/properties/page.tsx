'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Home, Image } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Modal } from '@/components/common/Modal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import type { Property, Availability } from '@/types/property.types'

const AVAILABILITY_OPTS: Availability[] = ['Available', 'Hold', 'Sold', 'Rented']

export default function PropertiesPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null)

  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [address, setAddress] = useState('')
  const [type, setType] = useState('')
  const [price, setPrice] = useState('')
  const [size, setSize] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [floor, setFloor] = useState('')
  const [furnishing, setFurnishing] = useState('')
  const [availability, setAvailability] = useState<Availability>('Available')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')

  const supabase = createClient()
  const qc = useQueryClient()

  const { data: properties, isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data as Property[]
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error('Title is required')
      const payload = {
        title,
        location: location || null,
        address: address || null,
        type: type || null,
        price: price ? Number(price) : null,
        size: size || null,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        floor: floor ? Number(floor) : null,
        furnishing: furnishing || null,
        availability,
        description: description || null,
        images: imageUrl ? [imageUrl] : [],
      }
      if (editingProperty) {
        const { error } = await supabase.from('properties').update(payload).eq('id', editingProperty.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('properties').insert(payload)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-properties'] })
      setModalOpen(false)
      resetForm()
    },
    onError: (err: Error) => setError(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deletingProperty) return
      const { error } = await supabase.from('properties').delete().eq('id', deletingProperty.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-properties'] })
      setConfirmOpen(false)
      setDeletingProperty(null)
    },
  })

  const resetForm = () => {
    setTitle(''); setLocation(''); setAddress(''); setType(''); setPrice('')
    setSize(''); setBedrooms(''); setBathrooms(''); setFloor('')
    setFurnishing(''); setAvailability('Available'); setDescription('')
    setImageUrl(''); setError(''); setEditingProperty(null)
  }

  const openEdit = (prop: Property) => {
    setEditingProperty(prop)
    setTitle(prop.title)
    setLocation(prop.location || '')
    setAddress(prop.address || '')
    setType(prop.type || '')
    setPrice(prop.price?.toString() || '')
    setSize(prop.size || '')
    setBedrooms(prop.bedrooms?.toString() || '')
    setBathrooms(prop.bathrooms?.toString() || '')
    setFloor(prop.floor?.toString() || '')
    setFurnishing(prop.furnishing || '')
    setAvailability(prop.availability)
    setDescription(prop.description || '')
    setImageUrl(prop.images?.[0] || '')
    setModalOpen(true)
  }

  const openDelete = (prop: Property) => {
    setDeletingProperty(prop)
    setConfirmOpen(true)
  }

  return (
    <div>
      <PageHeader title="Properties" description="Property listings with photos">
        <Button onClick={() => { resetForm(); setModalOpen(true) }}>
          <Plus size={16} className="mr-1.5" /> Add Property
        </Button>
      </PageHeader>

      <DataTable
        columns={[
          {
            key: 'image',
            header: '',
            render: (row) => row.images?.[0] ? (
              <img src={row.images[0]} alt={row.title} className="h-10 w-10 rounded-card object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-card bg-muted flex items-center justify-center">
                <Image size={16} className="text-muted-foreground" />
              </div>
            ),
          },
          { key: 'title', header: 'Title', sortable: true },
          { key: 'location', header: 'Location', sortable: true },
          { key: 'type', header: 'Type', sortable: true },
          {
            key: 'price',
            header: 'Price',
            render: (row) => formatCurrency(row.price),
          },
          {
            key: 'availability',
            header: 'Status',
            render: (row) => (
              <Badge variant={row.availability === 'Available' ? 'success' : row.availability === 'Sold' ? 'danger' : 'warning'}>
                {row.availability}
              </Badge>
            ),
          },
          {
            key: 'details',
            header: 'Details',
            render: (row) => (
              <span className="text-xs text-muted-foreground">
                {row.bedrooms ? `${row.bedrooms}BHK` : ''} {row.size ? `· ${row.size}` : ''}
              </span>
            ),
          },
        ]}
        data={properties ?? []}
        searchKey="title"
        searchPlaceholder="Search properties..."
        emptyMessage="No properties found. Add your first property above."
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingProperty ? 'Edit Property' : 'Add Property'} maxWidth="max-w-lg">
        <div className="space-y-4">
          {error && <div className="rounded-button bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sunset Villas Phase 2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Gurgaon Sector 62" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Address</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full address" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type</label>
              <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Villa, Apartment, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Price</label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="15000000" type="number" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Size</label>
              <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="3000 sqft" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Bedrooms</label>
              <Input value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="4" type="number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Bathrooms</label>
              <Input value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="4" type="number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Floor</label>
              <Input value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="2" type="number" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Furnishing</label>
              <Input value={furnishing} onChange={(e) => setFurnishing(e.target.value)} placeholder="Fully Furnished" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Availability</label>
              <select value={availability} onChange={(e) => setAvailability(e.target.value as Availability)}
                className="w-full rounded-button border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary">
                {AVAILABILITY_OPTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Image URL</label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." />
            {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 h-24 w-full rounded-card object-cover" />}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingProperty ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Property"
        description={`Are you sure you want to delete "${deletingProperty?.title}"? This cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
