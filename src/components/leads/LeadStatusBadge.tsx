import { Badge } from '@/components/ui/badge'
import type { LeadStatus, LeadTemperature } from '@/types/lead.types'

const STATUS_VARIANTS: Record<LeadStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  'New': 'default',
  'Contacted': 'info',
  'Interested': 'warning',
  'Site Visit Scheduled': 'info',
  'Negotiation': 'warning',
  'Won': 'success',
  'Lost': 'danger',
  'Not Responding': 'danger',
}

const TEMP_VARIANTS: Record<LeadTemperature, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  'Cold': 'info',
  'Warm': 'warning',
  'Hot': 'danger',
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{status}</Badge>
}

export function LeadTemperatureBadge({ temperature }: { temperature: LeadTemperature }) {
  return <Badge variant={TEMP_VARIANTS[temperature]}>{temperature}</Badge>
}
