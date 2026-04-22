import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/formatCurrency';
import { useDiscounts } from '../hooks/useDiscounts';
import Button from '../components/ui/Button';

const ShoppingCartPage: React.FC = () => {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const { promoDiscount, promoCode, promoError, promoLoading, applyPromoCode, clearPromo } = useDiscounts();
  const [promoInput, setPromoInput] = React.useState('');
  const navigate = useNavigate();

  const discountAmount = Math.round(subtotal * (promoDiscount / 100));
  const total = subtotal - discountAmount;

  if (items.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <span className="text-6xl">🛒</span>
      <h2 className="text-xl font-semibold text-gray-700">Your cart is empty</h2>
      <Link to="/products" className="text-green-600 hover:underline">Browse Animals</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart ({items.length})</h1>
        <div className="lg:flex gap-6">
          <div className="flex-1 space-y-3">
            {items.map(({ productId, product, quantity }) => (
              <div key={productId} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 items-center">
                <img src={product.imageURL || '/placeholder.jpg'} alt={product.productName} className="w-20 h-16 object-cover rounded-lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 truncate">{product.productName}</h3>
                  <p className="text-sm text-green-600 font-semibold">{formatCurrency(product.discountedPrice)}</p>
                </div>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button onClick={() => updateQuantity(productId, quantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 text-sm">−</button>
                  <span className="px-3 py-1 text-sm">{quantity}</span>
                  <button onClick={() => updateQuantity(productId, quantity + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100 text-sm">+</button>
                </div>
                <button onClick={() => removeItem(productId)} className="text-red-400 hover:text-red-600 ml-2">✕</button>
              </div>
            ))}
            <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear cart</button>
          </div>
          <div className="lg:w-80 mt-6 lg:mt-0">
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Order Summary</h2>
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              {promoDiscount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Promo ({promoCode})</span><span>-{formatCurrency(discountAmount)}</span></div>}
              <div className="border-t pt-3 flex justify-between font-bold"><span>Total</span><span>{formatCurrency(total)}</span></div>
              <div className="flex gap-2">
                <input value={promoCode || promoInput} onChange={(e) => setPromoInput(e.target.value)}
                  disabled={!!promoCode}
                  placeholder="Promo code"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                {promoCode
                  ? <button onClick={clearPromo} className="text-sm text-red-500 hover:underline px-2">Remove</button>
                  : <Button size="sm" variant="secondary" loading={promoLoading} onClick={() => applyPromoCode(promoInput)}>Apply</Button>
                }
              </div>
              {promoError && <p className="text-xs text-red-500">{promoError}</p>}
              <Button className="w-full" onClick={() => navigate('/checkout', { state: { subtotal, discount: discountAmount, total, promoCode } })}>
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPage;
