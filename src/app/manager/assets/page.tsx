'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Share2, FileText, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { Modal } from '@/components/common/Modal'
import type { Asset } from '@/types/property.types'

export default function ManagerAssetsPage() {
  const [shareModal, setShareModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const supabase = createClient()

  const { data: assets, isLoading } = useQuery({
    queryKey: ['manager-assets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('assets').select('*').eq('is_active', true).order('created_at', { ascending: false })
      if (error) throw error
      return data as Asset[]
    },
  })

  return (
    <div>
      <PageHeader title="Assets" description="Browse and share projects" />

      {isLoading ? (
        <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(assets ?? []).map((asset) => (
            <Card key={asset.id} className="overflow-hidden hover:border-primary/30 transition-colors">
              <div className="h-40 bg-muted relative">
                {asset.images?.[0] ? (
                  <img src={asset.images[0]} alt={asset.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><ImageIcon size={32} className="text-muted-foreground" /></div>
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
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-medium text-foreground">
                    {asset.price_min ? formatCurrency(asset.price_min) : '-'} - {asset.price_max ? formatCurrency(asset.price_max) : '-'}
                  </span>
                  <button
                    onClick={() => { setSelectedAsset(asset); setShareModal(true) }}
                    className="rounded-button p-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Share2 size={14} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={shareModal} onClose={() => setShareModal(false)} title="Share Asset">
        {selectedAsset && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">{selectedAsset.name}</h4>
              <p className="text-xs text-muted-foreground">{selectedAsset.location}</p>
            </div>
            <div className="rounded-card bg-muted/50 border border-border p-3">
              <p className="text-xs text-muted-foreground mb-1">WhatsApp Template Preview:</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{selectedAsset.whatsapp_template || 'No template configured'}</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedAsset.brochure_url && (
                <a href={selectedAsset.brochure_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                  <FileText size={14} /> View Brochure
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Share functionality is available to callers from their lead detail page.</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
