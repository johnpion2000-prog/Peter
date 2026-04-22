import { Timestamp } from 'firebase/firestore';
import { CartItem } from './cart.types';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  shippingAddress: string;
  promoCode?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
