import { db } from '../config/database.config';

export interface IProduct {
  id?: string;
  userId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  createdAt: Date;
}

export const productsCollection = db.collection('products');