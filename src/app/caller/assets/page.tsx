'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Share2, FileText, ImageIcon, ChevronRight, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import type { Asset } from '@/types/property.types'

export default function CallerAssetsPage() {
  const [shareModal, setShareModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [shareMessage, setShareMessage] = useState('')
  const [search, setSearch] = useState('')

  const supabase = createClient()

  const { data: assets, isLoading } = useQuery({
    queryKey: ['caller-assets-browse'],
    queryFn: async () => {
      const { data, error } = await supabase.from('assets').select('*').eq('is_active', true).order('created_at', { ascending: false })
      if (error) throw error
      return data as Asset[]
    },
  })

  const filtered = assets?.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.location?.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const openShare = (asset: Asset) => {
    setSelectedAsset(asset)
    setShareMessage(asset.whatsapp_template || `Hi! I'd like to share details about *${asset.name}*.`)
    setShareModal(true)
  }

  return (
    <div>
      <PageHeader title="Assets" description="Browse projects to share with leads" />

      <div className="relative mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full rounded-button border border-border bg-background px-3 py-2.5 pl-9 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-card border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No projects found. Ask your admin to add assets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((asset) => (
            <Card key={asset.id} className="overflow-hidden hover:border-primary/30 transition-colors">
              <div className="h-40 bg-muted relative">
                {asset.images?.[0] ? (
                  <img src={asset.images[0]} alt={asset.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon size={32} className="text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={asset.status === 'Ready' ? 'success' : asset.status === 'Sold Out' ? 'danger' : 'warning'}>
                    {asset.status}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground">{asset.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{asset.location}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{asset.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-medium text-foreground">
                    {asset.price_min ? formatCurrency(asset.price_min) : '-'} - {asset.price_max ? formatCurrency(asset.price_max) : '-'}
                  </span>
                  <Button size="sm" onClick={() => openShare(asset)}>
                    <Share2 size={14} className="mr-1" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={shareModal} onClose={() => setShareModal(false)} title="Share Project" maxWidth="max-w-md">
        {selectedAsset && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {selectedAsset.images?.[0] && (
                <img src={selectedAsset.images[0]} alt={selectedAsset.name} className="h-16 w-16 rounded-card object-cover" />
              )}
              <div>
                <h3 className="font-semibold text-foreground">{selectedAsset.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedAsset.location}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Message</label>
              <textarea
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                rows={5}
                className="w-full rounded-button border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none"
              />
            </div>
            {selectedAsset.brochure_url && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <FileText size={14} />
                <span>Brochure attached</span>
              </div>
            )}
            <Button className="w-full" onClick={() => {
              const text = encodeURIComponent(shareMessage)
              window.open(`https://wa.me/?text=${text}`, '_blank')
              setShareModal(false)
            }}>
              <Share2 size={16} className="mr-1.5" /> Open WhatsApp
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
