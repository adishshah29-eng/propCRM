import Link from 'next/link'
import { Phone, MessageCircle, Calendar, Banknote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { LeadStatusBadge, LeadTemperatureBadge } from './LeadStatusBadge'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { formatDate, timeAgo } from '@/lib/utils/formatDate'
import type { Lead } from '@/types/lead.types'

interface LeadCardProps {
  lead: Lead
  href?: string
}

export function LeadCard({ lead, href }: LeadCardProps) {
  const content = (
    <Card className="hover:border-primary/30 transition-colors cursor-pointer animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">{lead.full_name}</h3>
            <p className="text-sm text-muted-foreground">{lead.phone}</p>
            {lead.preferred_location && (
              <p className="text-xs text-muted-foreground mt-0.5">{lead.preferred_location}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <LeadStatusBadge status={lead.status} />
            <LeadTemperatureBadge temperature={lead.temperature} />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          {lead.budget_max && (
            <span className="flex items-center gap-1">
              <Banknote size={12} />
              {formatCurrency(lead.budget_max)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {timeAgo(lead.created_at)}
          </span>
          <span>Score: {lead.score}</span>
        </div>

        {href && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `tel:${lead.phone}` }}
              className="flex-1 flex items-center justify-center gap-1 rounded-button bg-primary/10 text-primary py-2 text-xs font-medium hover:bg-primary/20 transition-colors btn-press"
            >
              <Phone size={14} /> Call
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank') }}
              className="flex-1 flex items-center justify-center gap-1 rounded-button bg-success/10 text-success py-2 text-xs font-medium hover:bg-success/20 transition-colors btn-press"
            >
              <MessageCircle size={14} /> WhatsApp
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href} className="block">{content}</Link>
  }
  return content
}
