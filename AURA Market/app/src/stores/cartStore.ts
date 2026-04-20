import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types/cart.types';
import type { Product } from '../types/product.types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const idx = state.items.findIndex(i => i.productId === item.productId);
          if (idx > -1) {
            const updated = [...state.items];
            updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + item.quantity };
            return { items: updated };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter(i => i.productId !== productId) })),

      updateQuantity: (productId, qty) =>
        set((state) => ({
          items: qty <= 0
            ? state.items.filter(i => i.productId !== productId)
            : state.items.map(i => i.productId === productId ? { ...i, quantity: qty } : i),
        })),

      clearCart: () => set({ items: [] }),

      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + (i.product.discountedPrice || i.product.price) * i.quantity,
          0
        ),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'aura_cart' }
  )
);

// Helper used outside React components
export function addProductToCart(product: Product, qty = 1) {
  useCartStore.getState().addItem({ productId: product.id, quantity: qty, product });
}
