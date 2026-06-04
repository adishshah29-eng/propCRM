import { z } from 'zod'

export const propertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  location: z.string().optional(),
  address: z.string().optional(),
  type: z.string().optional(),
  price: z.number().min(0).optional(),
  size: z.string().optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  floor: z.number().min(0).optional(),
  furnishing: z.string().optional(),
  availability: z.enum(['Available', 'Hold', 'Sold', 'Rented']).default('Available'),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
})

export type PropertyFormData = z.infer<typeof propertySchema>
