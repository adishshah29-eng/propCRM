import { z } from 'zod'

export const assetSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  location: z.string().optional(),
  type: z.string().optional(),
  price_min: z.number().min(0).optional(),
  price_max: z.number().min(0).optional(),
  status: z.enum(['Launching', 'Under Construction', 'Ready', 'Sold Out']).default('Launching'),
  description: z.string().optional(),
  whatsapp_template: z.string().optional(),
  is_active: z.boolean().default(true),
})

export type AssetFormData = z.infer<typeof assetSchema>
