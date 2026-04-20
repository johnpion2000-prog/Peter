import { useCartStore } from '../stores/cartStore';
import type { Product } from '../types/product.types';

export function useCart() {
  const { items, addItem, removeItem, updateQuantity, clearCart } = useCartStore();

  const subtotal = items.reduce(
    (sum, i) => sum + (i.product.discountedPrice || i.product.price) * i.quantity, 0
  );

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  function addProduct(product: Product, qty = 1) {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantity + qty);
    } else {
      addItem({ productId: product.id, quantity: qty, product });
    }
  }

  return { items, subtotal, itemCount, addProduct, removeItem, updateQuantity, clearCart };
}
