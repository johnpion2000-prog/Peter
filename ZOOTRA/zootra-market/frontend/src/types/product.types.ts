import { Timestamp } from 'firebase/firestore';

export type ProductCategory =
  | 'cattle'
  | 'goat'
  | 'sheep'
  | 'pig'
  | 'dog'
  | 'cat'
  | 'bird'
  | 'rabbit'
  | 'other';

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
  sellerId: string;
  location: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface ProductFilter {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  location?: string;
  inStock?: boolean;
}
