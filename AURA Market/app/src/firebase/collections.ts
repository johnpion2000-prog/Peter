import { collection, type CollectionReference, type DocumentData } from 'firebase/firestore';
import { db } from './config';
import type { Product } from '../types/product.types';
import type { AppUser } from '../types/user.types';
import type { Order } from '../types/order.types';
import type { Company } from '../types/company.types';

function col<T = DocumentData>(name: string): CollectionReference<T> {
  return collection(db, name) as CollectionReference<T>;
}

export const productsCol   = col<Product>('products');
export const usersCol      = col<AppUser>('users');
export const ordersCol     = col<Order>('orders');
export const companiesCol  = col<Company>('companies');
export const discountsCol  = col('discounts');
export const categoriesCol = col('categories');
