export type Availability = 'Available' | 'Hold' | 'Sold' | 'Rented'
export type AssetStatus = 'Launching' | 'Under Construction' | 'Ready' | 'Sold Out'
export type DealStage = 'New' | 'Contacted' | 'Interested' | 'Viewing Scheduled' | 'Offer Made' | 'Closing' | 'Won' | 'Lost'

export interface Property {
  id: string
  org_id: string
  branch_id: string | null
  title: string
  location: string | null
  address: string | null
  type: string | null
  price: number | null
  size: string | null
  bedrooms: number | null
  bathrooms: number | null
  floor: number | null
  furnishing: string | null
  availability: Availability
  description: string | null
  amenities: string[] | null
  images: string[] | null
  documents: string[] | null
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  org_id: string
  branch_id: string | null
  name: string
  location: string | null
  type: string | null
  price_min: number | null
  price_max: number | null
  status: AssetStatus
  description: string | null
  brochure_url: string | null
  floor_plan_url: string | null
  images: string[] | null
  whatsapp_template: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  lead_id: string
  property_id: string | null
  agent_id: string | null
  stage: DealStage
  value: number | null
  probability: number | null
  expected_close: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
