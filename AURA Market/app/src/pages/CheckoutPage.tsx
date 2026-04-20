import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '../stores/cartStore';
import { useAuthContext } from '../context/AuthContext';
import { placeOrder } from '../services/orderService';
import { formatCurrency } from '../utils/formatCurrency';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const schema = z.object({
  fullName:  z.string().min(2, 'Enter full name'),
  email:     z.string().email('Invalid email'),
  phone:     z.string().min(7, 'Enter valid phone'),
  address:   z.string().min(5, 'Enter street address'),
  city:      z.string().min(2, 'Enter city'),
});
type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const { currentUser, appUser } = useAuthContext();
  const { items, subtotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: appUser?.displayName ?? '',
      email:    currentUser?.email ?? '',
    },
  });

  const sub = subtotal();
  const total = sub; // promo code handled on CartPage; extend if needed

  async function onSubmit(data: FormData) {
    if (!currentUser || items.length === 0) return;
    setLoading(true);
    try {
      // Collect all unique vendor IDs present in this cart
      const companyIds = [...new Set(
        items.map(i => i.product.companyId).filter((id): id is string => !!id),
      )];

      const id = await placeOrder({
        userId:      currentUser.uid,
        userName:    data.fullName,
        userAddress: `${data.address}, ${data.city}`,
        userPhone:   data.phone,
        userEmail:   data.email,
        items: items.map(i => ({
          productId:   i.productId,
          productName: i.product.productName,
          quantity:    i.quantity,
          price:       i.product.discountedPrice,
          companyId:   i.product.companyId, // per-item vendor tag
        })),
        subtotal: sub,
        discount: 0,
        total,
        status:     'pending',
        companyId:  companyIds[0],  // legacy compat: first vendor
        companyIds,                 // all vendors in this order
      });
      clearCart();
      toast.success('Order placed! 🎉');
      navigate(`/order-success?orderId=${id}`);
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">Delivery Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
              <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
              <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
              <Input label="City" error={errors.city?.message} {...register('city')} />
            </div>
            <Input label="Street Address" error={errors.address?.message} {...register('address')} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 text-lg mb-3">Payment</h2>
            <p className="text-sm text-gray-500">Cash on delivery — payment collected at your door.</p>
          </div>

          <Button type="submit" size="lg" loading={loading} className="w-full">
            Place Order · {formatCurrency(total)}
          </Button>
        </form>

        {/* Summary */}
        <div className="lg:w-80">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order items</h2>
            <div className="space-y-3">
              {items.map(i => (
                <div key={i.productId} className="flex justify-between text-sm">
                  <span className="text-gray-700 line-clamp-1 flex-1 pr-2">{i.product.productName} × {i.quantity}</span>
                  <span className="font-medium text-gray-900 shrink-0">{formatCurrency(i.product.discountedPrice * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900">
              <span>Total</span><span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
