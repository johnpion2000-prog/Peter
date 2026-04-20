import type { Timestamp } from 'firebase/firestore';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  companyId?: string; // which vendor this item belongs to
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userAddress: string;
  userPhone: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  companyId?: string;      // legacy single-vendor compat
  companyIds?: string[];   // all vendor IDs in this order (for multi-vendor queries)
  createdAt: Timestamp;
}
