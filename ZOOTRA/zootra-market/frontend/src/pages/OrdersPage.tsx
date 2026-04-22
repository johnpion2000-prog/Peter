import React from 'react';
import { useOrders } from '../hooks/useOrders';
import { formatCurrency } from '../utils/formatCurrency';
import Spinner from '../components/ui/Spinner';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const OrdersPage: React.FC = () => {
  const { orders, loading } = useOrders();

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No orders yet. <a href="/products" className="text-green-600 hover:underline">Start shopping →</a></div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8)}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                </div>
                <div className="space-y-1 mb-3">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm text-gray-600">
                      <span>{item.product.productName} × {item.quantity}</span>
                      <span>{formatCurrency(item.product.discountedPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-sm text-gray-500">{order.shippingAddress}</span>
                  <span className="font-bold text-green-700">{formatCurrency(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
