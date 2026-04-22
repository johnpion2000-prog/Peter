import { useCartStore } from '../stores/cartStore';

export const useCart = () => {
  const { items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal } = useCartStore();
  return { items, addItem, removeItem, updateQuantity, clearCart, totalItems: totalItems(), subtotal: subtotal() };
};
