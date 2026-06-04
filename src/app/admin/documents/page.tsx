'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Download, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Card, CardContent } from '@/components/ui/card'

export default function DocumentsPage() {
  const supabase = createClient()

  const { data: deals, isLoading } = useQuery({
    queryKey: ['admin-deals-docs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('deals').select('*, leads(full_name), properties(title)')
      if (error) throw error
      return data
    },
  })

  // Generate mock document rows from deal data
  const documents = deals?.flatMap((deal) => [
    {
      id: `${deal.id}-agreement`,
      name: `Agreement - ${deal.leads?.full_name || 'Unknown'}`,
      type: 'Agreement',
      deal: deal.leads?.full_name || 'Unknown',
      property: deal.properties?.title || '-',
      date: deal.created_at,
      url: '#',
    },
    {
      id: `${deal.id}-invoice`,
      name: `Invoice - ${deal.leads?.full_name || 'Unknown'}`,
      type: 'Invoice',
      deal: deal.leads?.full_name || 'Unknown',
      property: deal.properties?.title || '-',
      date: deal.created_at,
      url: '#',
    },
  ]) ?? []

  return (
    <div>
      <PageHeader title="Documents" description="Transaction documents per deal" />

      <DataTable
        columns={[
          {
            key: 'type',
            header: 'Type',
            render: (row) => (
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <span className="text-sm">{row.type}</span>
              </div>
            ),
          },
          { key: 'name', header: 'Document', sortable: true },
          { key: 'deal', header: 'Client', sortable: true },
          { key: 'property', header: 'Property', sortable: true },
          {
            key: 'date',
            header: 'Date',
            render: (row) => new Date(row.date).toLocaleDateString(),
          },
        ]}
        data={documents}
        searchKey="name"
        searchPlaceholder="Search documents..."
        emptyMessage="No documents found. Documents are generated per deal."
        loading={isLoading}
        actions={() => (
          <div className="flex items-center justify-end gap-1">
            <button className="rounded-button p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
              <Download size={14} />
            </button>
            <button className="rounded-button p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
              <ExternalLink size={14} />
            </button>
          </div>
        )}
      />
    </div>
  )
}
