export const DEAL_STAGES = [
  'New',
  'Contacted',
  'Interested',
  'Viewing Scheduled',
  'Offer Made',
  'Closing',
  'Won',
  'Lost',
] as const

export const KANBAN_COLORS: Record<string, string> = {
  'New': '#6C63FF',
  'Contacted': '#06B6D4',
  'Interested': '#F59E0B',
  'Viewing Scheduled': '#8B5CF6',
  'Offer Made': '#EF4444',
  'Closing': '#22C55E',
  'Won': '#22C55E',
  'Lost': '#6B7280',
}
