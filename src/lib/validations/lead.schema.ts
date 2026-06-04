import { z } from 'zod'

export const leadSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  source: z.enum(['36Acre', 'MagicBricks', 'Housing', 'Facebook', 'Instagram', 'Website', 'WhatsApp', 'Referral', 'Manual', 'Other']),
  property_type: z.enum(['Apartment', 'Villa', 'Plot', 'Commercial', 'Rental']).optional().or(z.literal('')),
  budget_min: z.number().min(0).optional(),
  budget_max: z.number().min(0).optional(),
  preferred_location: z.string().optional(),
  status: z.enum(['New', 'Contacted', 'Interested', 'Site Visit Scheduled', 'Negotiation', 'Won', 'Lost', 'Not Responding']).default('New'),
  temperature: z.enum(['Cold', 'Warm', 'Hot']).default('Cold'),
  notes: z.string().optional(),
})

export type LeadFormData = z.infer<typeof leadSchema>
