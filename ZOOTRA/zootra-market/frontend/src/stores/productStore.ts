import { create } from 'zustand';
import { Product, ProductCategory, ProductFilter } from '../types/product.types';

interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  filters: ProductFilter;
  loading: boolean;
  error: string | null;
  setProducts: (products: Product[]) => void;
  setFilters: (filters: ProductFilter) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  applyFilters: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  filteredProducts: [],
  filters: {},
  loading: false,
  error: null,
  setProducts: (products) => {
    set({ products, filteredProducts: products });
    get().applyFilters();
  },
  setFilters: (filters) => {
    set({ filters });
    get().applyFilters();
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  applyFilters: () => {
    const { products, filters } = get();
    let result = [...products];
    if (filters.category) result = result.filter((p) => p.category === filters.category);
    if (filters.minPrice !== undefined) result = result.filter((p) => p.discountedPrice >= filters.minPrice!);
    if (filters.maxPrice !== undefined) result = result.filter((p) => p.discountedPrice <= filters.maxPrice!);
    if (filters.minDiscount !== undefined) result = result.filter((p) => p.discountPercent >= filters.minDiscount!);
    if (filters.inStock) result = result.filter((p) => p.stock > 0);
    if (filters.location) result = result.filter((p) => p.location.toLowerCase().includes(filters.location!.toLowerCase()));
    set({ filteredProducts: result });
  },
}));
