'use client'

import { useQuery } from '@tanstack/react-query'
import { Share2, Calendar, Instagram, Facebook, Linkedin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { DataTable } from '@/components/common/DataTable'
import { Badge } from '@/components/ui/badge'
import type { SocialPost } from '@/types/common.types'

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  'Instagram Reel': <Instagram size={14} />,
  'Instagram Post': <Instagram size={14} />,
  'Facebook Post': <Facebook size={14} />,
  'LinkedIn Post': <Linkedin size={14} />,
  'Story': <Share2 size={14} />,
}

export default function AdminSocialPage() {
  const supabase = createClient()

  const { data: posts, isLoading } = useQuery({
    queryKey: ['admin-social-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as (SocialPost & { profiles: { full_name: string } | null })[]
    },
  })

  return (
    <div>
      <PageHeader title="Social" description="Social media posts overview for the branch" />

      <DataTable
        columns={[
          {
            key: 'platform',
            header: 'Platform',
            render: (row) => (
              <span className="flex items-center gap-1.5 text-sm">
                {PLATFORM_ICONS[row.platform] || <Share2 size={14} />}
                {row.platform}
              </span>
            ),
          },
          {
            key: 'caption',
            header: 'Caption',
            render: (row) => (
              <span className="text-xs text-muted-foreground truncate max-w-[250px] block">{row.caption?.slice(0, 60) || 'No caption'}</span>
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
            render: (row) => row.scheduled_at ? new Date(row.scheduled_at).toLocaleDateString() : '-',
          },
          {
            key: 'creator',
            header: 'Created By',
            render: (row) => row.profiles?.full_name || '-',
          },
        ]}
        data={posts ?? []}
        searchKey="caption"
        searchPlaceholder="Search posts..."
        emptyMessage="No social posts found."
        loading={isLoading}
      />
    </div>
  )
}
