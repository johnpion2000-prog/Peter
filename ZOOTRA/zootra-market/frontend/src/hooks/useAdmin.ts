import { useEffect, useCallback } from 'react';
import { useAdminStore } from '../stores/adminStore';
import { getAllProducts } from '../services/productService';
import { getAllOrders } from '../services/orderService';
import { getAllUsers } from '../services/userService';

export const useAdmin = () => {
  const { products, orders, users, stats, loading, setProducts, setOrders, setUsers, setLoading } = useAdminStore();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, o, u] = await Promise.all([getAllProducts(), getAllOrders(), getAllUsers()]);
      setProducts(p);
      setOrders(o);
      setUsers(u);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  return { products, orders, users, stats, loading, refetch: load };
};
