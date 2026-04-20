import { useState, useEffect } from 'react';
import { getDocs, query, orderBy, getCountFromServer } from 'firebase/firestore';
import { ordersCol, productsCol, usersCol } from '../firebase/collections';
import type { Order } from '../types/order.types';

export interface AdminStats {
  products: number;
  orders: number;
  users: number;
  revenue: number;
}

export function useAdmin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pCount, oCount, uCount, orderSnap] = await Promise.all([
        getCountFromServer(productsCol),
        getCountFromServer(ordersCol),
        getCountFromServer(usersCol),
        getDocs(query(ordersCol, orderBy('createdAt', 'desc'))),
      ]);
      const orders = orderSnap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
      const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
      setStats({
        products: pCount.data().count,
        orders: oCount.data().count,
        users: uCount.data().count,
        revenue,
      });
      setRecentOrders(orders.slice(0, 10));
      setLoading(false);
    }
    load();
  }, []);

  return { stats, recentOrders, loading };
}
