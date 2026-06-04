'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Instagram, Facebook, Linkedin, Share2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns'
import type { SocialPost } from '@/types/common.types'

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  'Instagram Reel': <Instagram size={14} />,
  'Instagram Post': <Instagram size={14} />,
  'Facebook Post': <Facebook size={14} />,
  'LinkedIn Post': <Linkedin size={14} />,
  'Story': <Share2 size={14} />,
}

const PLATFORM_COLORS: Record<string, string> = {
  'Instagram Reel': '#E4405F',
  'Instagram Post': '#E4405F',
  'Facebook Post': '#1877F2',
  'LinkedIn Post': '#0A66C2',
  'Story': '#8B5CF6',
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const supabase = createClient()

  const { data: posts, isLoading } = useQuery({
    queryKey: ['social-posts-calendar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('scheduled_at', { ascending: true })
      if (error) throw error
      return data as SocialPost[]
    },
  })

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getPostsForDay = (day: Date) => {
    return (posts ?? []).filter((post) => {
      if (!post.scheduled_at) return false
      return isSameDay(new Date(post.scheduled_at), day)
    })
  }

  const prevMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))
  const nextMonth = () => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))

  return (
    <div>
      <PageHeader title="Content Calendar" description="Plan and schedule social media posts">
        <Button onClick={() => window.location.href = '/social/create'}>
          <Plus size={16} className="mr-1.5" /> New Post
        </Button>
      </PageHeader>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="rounded-button p-2 text-muted-foreground hover:bg-muted transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold text-foreground">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={nextMonth} className="rounded-button p-2 text-muted-foreground hover:bg-muted transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dayPosts = getPostsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isTodayDate = isToday(day)

          return (
            <div
              key={idx}
              className={`min-h-[80px] sm:min-h-[100px] rounded-card border p-1.5 transition-colors ${
                isCurrentMonth ? 'bg-card border-border' : 'bg-muted/30 border-transparent'
              } ${isTodayDate ? 'ring-1 ring-primary' : ''}`}
            >
              <div className={`text-xs font-medium mb-1 ${isTodayDate ? 'text-primary' : 'text-muted-foreground'}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] truncate cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${PLATFORM_COLORS[post.platform]}20`, color: PLATFORM_COLORS[post.platform] }}
                    onClick={() => window.location.href = '/social/posts'}
                  >
                    {PLATFORM_ICONS[post.platform]}
                    <span className="truncate">{post.caption?.slice(0, 15)}...</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {Object.entries(PLATFORM_COLORS).map(([platform, color]) => (
          <div key={platform} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground">{platform}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
