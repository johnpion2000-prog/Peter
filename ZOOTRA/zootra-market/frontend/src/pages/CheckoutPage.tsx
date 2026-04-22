import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutFormData } from '../utils/validateProduct';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import { useUIStore } from '../stores/uiStore';
import { formatCurrency } from '../utils/formatCurrency';
import Button from '../components/ui/Button';

const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { subtotal = 0, discount = 0, total = 0, promoCode } = location.state ?? {};
  const { items, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const showToast = useUIStore((s) => s.showToast);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      await placeOrder(items, subtotal, discount, `${data.address}, ${data.city}`, promoCode);
      clearCart();
      showToast('Order placed successfully!', 'success');
      navigate('/orders');
    } catch (err: any) {
      showToast(err.message ?? 'Failed to place order', 'error');
    }
  };

  const field = (label: string, name: keyof CheckoutFormData, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input {...register(name)} type={type} placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]?.message}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="lg:flex gap-6">
          <div className="flex-1 bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-800 text-lg">Shipping Details</h2>
            {field('Full Name', 'fullName', 'text', 'John Doe')}
            {field('Email', 'email', 'email', 'john@example.com')}
            {field('Phone Number', 'phone', 'tel', '+250 7XX XXX XXX')}
            {field('Address', 'address', 'text', 'Street / Village')}
            {field('City / District', 'city', 'text', 'Kigali')}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea {...register('notes')} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="lg:w-80 mt-6 lg:mt-0">
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Order Summary</h2>
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm text-gray-600">
                  <span className="truncate max-w-[160px]">{item.product.productName} × {item.quantity}</span>
                  <span>{formatCurrency(item.product.discountedPrice * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
                <div className="flex justify-between font-bold pt-1"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>
              <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg">
                💳 Payment via Mobile Money (MTN / Airtel) will be coordinated by the seller after order confirmation.
              </div>
              <Button type="submit" loading={isSubmitting} className="w-full">Place Order</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
