import { create } from 'zustand';
import type { Order } from '../types/order.types';
import type { Company } from '../types/company.types';

interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

interface AdminStore {
  stats: AdminStats;
  recentOrders: Order[];
  companies: Company[];
  setStats: (s: AdminStats) => void;
  setRecentOrders: (orders: Order[]) => void;
  setCompanies: (companies: Company[]) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  stats: { totalProducts: 0, totalOrders: 0, totalUsers: 0, totalRevenue: 0 },
  recentOrders: [],
  companies: [],
  setStats: (stats) => set({ stats }),
  setRecentOrders: (recentOrders) => set({ recentOrders }),
  setCompanies: (companies) => set({ companies }),
}));
