import { z } from 'zod';

export const productSchema = z.object({
  productName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  category: z.enum(['fashion', 'shoes', 'automotive', 'electronics', 'home', 'sports', 'beauty', 'food', 'other']),
  price: z.coerce.number().positive('Price must be positive').max(9999),
  discountPercent: z.coerce.number().min(0).max(99),
  description: z.string().max(1000).optional().default(''),
  stock: z.coerce.number().int().min(0),
});

export type ProductSchema = z.infer<typeof productSchema>;

export const companySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  ownerEmail: z.string().email(),
  description: z.string().max(500).optional().default(''),
  maxProducts: z.coerce.number().int().min(1).max(10000),
  discountLimit: z.coerce.number().int().min(0).max(99),
  canManageOrders: z.boolean().default(true),
  expiresAt: z.string().optional(),
});

export const orderSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  email: z.string().email(),
  phone: z.string().min(6, 'Valid phone required'),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(2),
  zip: z.string().min(3),
});
