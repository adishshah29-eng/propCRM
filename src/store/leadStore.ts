'use client'

import { create } from 'zustand'
import { type Lead } from '@/types/lead.types'

interface LeadState {
  selectedLead: Lead | null
  leadFilter: string
  setSelectedLead: (lead: Lead | null) => void
  setLeadFilter: (filter: string) => void
}

export const useLeadStore = create<LeadState>((set) => ({
  selectedLead: null,
  leadFilter: '',
  setSelectedLead: (lead) => set({ selectedLead: lead }),
  setLeadFilter: (filter) => set({ leadFilter: filter }),
}))
