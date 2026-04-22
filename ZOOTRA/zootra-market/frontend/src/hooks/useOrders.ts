import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserOrders, getAllOrders, createOrder, updateOrderStatus } from '../services/orderService';
import { Order, OrderStatus } from '../types/order.types';
import { CartItem } from '../types/cart.types';

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = user.role === 'admin' ? await getAllOrders() : await getUserOrders(user.uid);
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const placeOrder = async (items: CartItem[], subtotal: number, discount: number, address: string, promoCode?: string) => {
    if (!user) throw new Error('Must be logged in to place an order');
    return createOrder(user.uid, items, subtotal, discount, address, promoCode);
  };

  const changeOrderStatus = async (id: string, status: OrderStatus) => {
    await updateOrderStatus(id, status);
    await fetchOrders();
  };

  return { orders, loading, error, placeOrder, changeOrderStatus, refetch: fetchOrders };
};
