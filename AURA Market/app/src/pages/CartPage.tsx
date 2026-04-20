import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { formatCurrency } from '../utils/formatCurrency';
import Button from '../components/ui/Button';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);

  async function applyPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    try {
      const snap = await getDoc(doc(db, 'discounts', promoCode.trim().toUpperCase()));
      if (!snap.exists()) { toast.error('Invalid promo code'); return; }
      const d = snap.data();
      if (d.active === false) { toast.error('This code has expired'); return; }
      setDiscount(d.percent ?? 0);
      toast.success(`${d.percent}% discount applied!`);
    } catch {
      toast.error('Could not apply code');
    } finally {
      setPromoLoading(false);
    }
  }

  const sub = subtotal();
  const discountAmt = sub * (discount / 100);
  const total = sub - discountAmt;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-6">🛒</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some products and come back!</p>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button onClick={() => clearCart()} className="text-sm text-red-500 hover:text-red-700">Clear all</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {items.map(item => (
            <div key={item.productId} className="flex gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <Link to={`/products/${item.productId}`}>
                <img
                  src={item.product.imageURL}
                  alt={item.product.productName}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-50"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productId}`} className="font-semibold text-gray-900 hover:text-orange-500 line-clamp-2 text-sm">
                  {item.product.productName}
                </Link>
                <p className="text-orange-500 font-bold mt-1">{formatCurrency(item.product.discountedPrice)}</p>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 text-gray-500 hover:bg-gray-50"
                    ><MinusIcon className="w-4 h-4" /></button>
                    <span className="px-3 text-sm font-medium border-x border-gray-200">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 text-gray-500 hover:bg-gray-50"
                    ><PlusIcon className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 p-1">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-gray-900">{formatCurrency(item.product.discountedPrice * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-80">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Order Summary</h2>

            {/* Promo */}
            <div className="flex gap-2 mb-5">
              <input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <Button size="sm" variant="outline" onClick={applyPromo} loading={promoLoading}>Apply</Button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatCurrency(sub)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({discount}%)</span><span>-{formatCurrency(discountAmt)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2 mt-2">
                <span>Total</span><span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Button className="w-full mt-6" size="lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
            <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
