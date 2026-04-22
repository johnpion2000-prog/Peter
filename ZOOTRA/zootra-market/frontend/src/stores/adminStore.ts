import { create } from 'zustand';
import { Product } from '../types/product.types';
import { Order } from '../types/order.types';
import { AppUser } from '../types/user.types';

interface AdminState {
  products: Product[];
  orders: Order[];
  users: AppUser[];
  stats: { totalProducts: number; totalOrders: number; totalRevenue: number };
  loading: boolean;
  setProducts: (products: Product[]) => void;
  setOrders: (orders: Order[]) => void;
  setUsers: (users: AppUser[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  products: [],
  orders: [],
  users: [],
  stats: { totalProducts: 0, totalOrders: 0, totalRevenue: 0 },
  loading: false,
  setProducts: (products) =>
    set((state) => ({
      products,
      stats: { ...state.stats, totalProducts: products.length },
    })),
  setOrders: (orders) =>
    set((state) => ({
      orders,
      stats: {
        ...state.stats,
        totalOrders: orders.length,
        totalRevenue: orders
          .filter((o) => o.status !== 'cancelled')
          .reduce((sum, o) => sum + o.total, 0),
      },
    })),
  setUsers: (users) => set({ users }),
  setLoading: (loading) => set({ loading }),
}));
