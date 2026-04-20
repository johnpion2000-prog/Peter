import { useState, useEffect } from 'react';
import { onSnapshot, query, where } from 'firebase/firestore';
import { ordersCol, productsCol } from '../firebase/collections';
import type { Order } from '../types/order.types';
import type { Product } from '../types/product.types';

export interface CompanyStats {
  products: number;
  orders: number;
  revenue: number;
  pendingOrders: number;
}

export function useCompanyDashboard(companyId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ordersReady, setOrdersReady] = useState(false);
  const [productsReady, setProductsReady] = useState(false);

  useEffect(() => {
    if (!companyId) {
      setOrdersReady(true);
      setProductsReady(true);
      return;
    }

    // Orders where this vendor has at least one product (multi-vendor support)
    const unsubOrders = onSnapshot(
      query(ordersCol, where('companyIds', 'array-contains', companyId)),
      snap => {
        setOrders(
          snap.docs
            .map(d => ({ ...d.data(), id: d.id } as Order))
            .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)),
        );
        setOrdersReady(true);
      },
      () => setOrdersReady(true),
    );

    // Only this vendor's products
    const unsubProducts = onSnapshot(
      query(productsCol, where('companyId', '==', companyId)),
      snap => {
        setProducts(
          snap.docs
            .map(d => ({ ...d.data(), id: d.id } as Product))
            .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)),
        );
        setProductsReady(true);
      },
      () => setProductsReady(true),
    );

    return () => { unsubOrders(); unsubProducts(); };
  }, [companyId]);

  const loading = !ordersReady || !productsReady;

  const stats: CompanyStats = {
    products: products.length,
    orders: orders.length,
    revenue: orders.reduce((s, o) => {
      // Only count this vendor's items, not the full order total
      const mine = o.items.filter(i => !i.companyId || i.companyId === companyId);
      const items = mine.length > 0 ? mine : o.items;
      return s + items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    }, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
  };

  return { stats, recentOrders: orders.slice(0, 15), orders, products, loading };
}
