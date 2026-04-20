import type { Timestamp } from 'firebase/firestore';

export type ProductCategory = 'fashion' | 'shoes' | 'automotive' | 'electronics' | 'home' | 'sports' | 'beauty' | 'food' | 'other';

export interface Product {
  id: string;
  productName: string;
  category: ProductCategory;
  price: number;
  discountPercent: number;
  discountedPrice: number;
  imageURL: string;
  description: string;
  stock: number;
  companyId?: string;
  createdAt: Timestamp;
}

export interface ProductFormData {
  productName: string;
  category: ProductCategory;
  price: number;
  discountPercent: number;
  description: string;
  stock: number;
  imageFile?: FileList;
}
