import { create } from 'zustand';
import type { Product, ProductCategory } from '../types/product.types';

interface Filters {
  category: ProductCategory | '';
  maxPrice: number;
  onlyDiscount: boolean;
  searchTerm: string;
}

interface ProductStore {
  products: Product[];
  filters: Filters;
  setProducts: (p: Product[]) => void;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  filtered: () => Product[];
}

const DEFAULT_FILTERS: Filters = {
  category: '',
  maxPrice: 9999,
  onlyDiscount: false,
  searchTerm: '',
};

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  filters: { ...DEFAULT_FILTERS },

  setProducts: (products) => set({ products }),

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  filtered: () => {
    const { products, filters } = get();
    return products
      .filter(p => !filters.category || p.category === filters.category)
      .filter(p => p.price <= filters.maxPrice)
      .filter(p => !filters.onlyDiscount || p.discountPercent > 0)
      .filter(p =>
        !filters.searchTerm ||
        p.productName.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
  },
}));
