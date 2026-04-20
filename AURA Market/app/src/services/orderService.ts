import {
  getDocs, addDoc, updateDoc, doc, getDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { ordersCol } from '../firebase/collections';
import { db } from '../firebase/config';
import type { Order, OrderStatus } from '../types/order.types';

export async function fetchOrders(userId?: string): Promise<Order[]> {
  const q = userId
    ? query(ordersCol, where('userId', '==', userId), orderBy('createdAt', 'desc'))
    : query(ordersCol, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
}

export async function fetchCompanyOrders(companyId: string): Promise<Order[]> {
  // Use array-contains so every order containing this vendor's products is returned
  const q = query(ordersCol, where('companyIds', 'array-contains', companyId));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ ...d.data(), id: d.id } as Order))
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, 'orders', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null;
}

export async function placeOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = await addDoc(ordersCol, {
    ...order,
    createdAt: serverTimestamp(),
  } as any);
  return ref.id;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, 'orders', id), { status });
}
