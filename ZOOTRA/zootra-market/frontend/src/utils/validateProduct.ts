import { z } from 'zod';

export const productSchema = z.object({
  productName: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.enum(['livestock', 'feed', 'pet', 'health', 'other']),
  price: z.number().min(1, 'Price must be greater than 0'),
  discountPercent: z.number().min(0).max(99),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  stock: z.number().int().min(1, 'Stock must be at least 1'),
  location: z.string().min(2, 'Location is required'),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  notes: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
