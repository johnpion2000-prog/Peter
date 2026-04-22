import {
  getDocs, getDoc, addDoc, updateDoc, doc, query,
  where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { ordersCol, db } from '../firebase/collections';
import { Order, OrderStatus } from '../types/order.types';
import { CartItem } from '../types/cart.types';

export const createOrder = async (
  userId: string,
  items: CartItem[],
  subtotal: number,
  discount: number,
  shippingAddress: string,
  promoCode?: string
): Promise<string> => {
  const ref = await addDoc(ordersCol, {
    userId,
    items,
    subtotal,
    discount,
    total: subtotal - discount,
    status: 'pending' as OrderStatus,
    shippingAddress,
    promoCode: promoCode ?? null,
    createdAt: serverTimestamp(),
  } as any);
  return ref.id;
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const snap = await getDocs(
    query(ordersCol, where('userId', '==', userId), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Order);
};

export const getAllOrders = async (): Promise<Order[]> => {
  const snap = await getDocs(query(ordersCol, orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Order);
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
  await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() });
};
