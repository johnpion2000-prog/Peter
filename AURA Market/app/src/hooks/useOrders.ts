import { useState, useEffect } from 'react';
import { getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { ordersCol } from '../firebase/collections';
import type { Order, OrderStatus } from '../types/order.types';

export function useOrders(userId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const q = query(ordersCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    getDocs(q).then(snap => {
      setOrders(snap.docs.map(d => ({ ...d.data(), id: d.id } as Order)));
      setLoading(false);
    });
  }, [userId]);

  return { orders, loading };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(import_db(), 'orders', orderId), { status });
}

// Lazy import to avoid circular deps
function import_db() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('../firebase/config').db;
}
