export type LeadSource = '36Acre' | 'MagicBricks' | 'Housing' | 'Facebook' | 'Instagram' | 'Website' | 'WhatsApp' | 'Referral' | 'Manual' | 'Other'
export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Site Visit Scheduled' | 'Negotiation' | 'Won' | 'Lost' | 'Not Responding'
export type LeadTemperature = 'Cold' | 'Warm' | 'Hot'
export type PropertyType = 'Apartment' | 'Villa' | 'Plot' | 'Commercial' | 'Rental'

export interface Lead {
  id: string
  org_id: string
  branch_id: string | null
  assigned_to: string | null
  full_name: string
  phone: string
  email: string | null
  source: LeadSource
  property_type: PropertyType | null
  budget_min: number | null
  budget_max: number | null
  preferred_location: string | null
  status: LeadStatus
  temperature: LeadTemperature
  score: number
  notes: string | null
  next_followup_at: string | null
  last_contacted_at: string | null
  created_at: string
  updated_at: string
}
