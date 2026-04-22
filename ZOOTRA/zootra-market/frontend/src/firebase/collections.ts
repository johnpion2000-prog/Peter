import { collection, CollectionReference, DocumentData } from 'firebase/firestore';
import { db } from './config';
import { Product } from '../types/product.types';
import { AppUser } from '../types/user.types';
import { Order } from '../types/order.types';
import { Booking } from '../types/booking.types';

function typedCollection<T = DocumentData>(path: string) {
  return collection(db, path) as CollectionReference<T>;
}

export const productsCol = typedCollection<Product>('products');
export const usersCol = typedCollection<AppUser>('users');
export const ordersCol = typedCollection<Order>('orders');
export const bookingsCol = typedCollection<Booking>('bookings');
export const categoriesCol = typedCollection<{ name: string; icon: string; slug: string }>('categories');
export const promoCodesCol = typedCollection<{ code: string; discount: number; active: boolean; expiresAt: string }>('promoCodes');

// Re-export db for use in services
export { db };
