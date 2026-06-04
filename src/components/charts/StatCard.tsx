import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  className?: string
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden animate-fade-in-up', className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change && (
              <p className={cn('text-xs font-medium', {
                'text-success': changeType === 'positive',
                'text-danger': changeType === 'negative',
                'text-muted-foreground': changeType === 'neutral',
              })}>
                {change}
              </p>
            )}
          </div>
          <div className="rounded-button bg-primary/10 p-2.5 text-primary">
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
