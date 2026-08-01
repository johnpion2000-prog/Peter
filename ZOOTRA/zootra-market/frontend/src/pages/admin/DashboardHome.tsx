import React, { useState } from 'react';
import { Package, ShoppingBag, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { updateOrderStatus } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';
import { useUIStore } from '../../stores/uiStore';
import Spinner from '../../components/ui/Spinner';

const DashboardHome: React.FC = () => {
  const { stats, orders, products, loading, refetch } = useAdmin();
  const showToast = useUIStore((s) => s.showToast);
  const [busy, setBusy] = useState<string | null>(null);
  const lowStock = products.filter((p) => p.stock <= 2 && p.stock > 0);
  // Only show active (not yet completed or cancelled) orders in Recent Orders
  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const recent = activeOrders.slice(0, 5);

  const handleOrderStatus = async (orderId: string, status: 'delivered' | 'cancelled') => {
    setBusy(orderId + status);
    try {
      await updateOrderStatus(orderId, status);
      showToast(`Order marked as ${status}`, 'success');
      await refetch();
    } catch (err: any) {
      showToast(err.message ?? 'Failed to update order', 'error');
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Products', value: stats.totalProducts, Icon: Package, color: 'bg-green-50 text-green-700' },
          { label: 'Total Orders', value: stats.totalOrders, Icon: ShoppingBag, color: 'bg-blue-50 text-blue-700' },
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), Icon: DollarSign, color: 'bg-yellow-50 text-yellow-700' },
        ].map(({ label, value, Icon, color }) => (
          <div key={label} className={`rounded-xl p-5 ${color} border`}>
            <Icon className="w-7 h-7 mb-1" />
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm font-medium opacity-80">{label}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Active Orders</h2>
            {activeOrders.length > 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">
                {activeOrders.length} pending
              </span>
            )}
          </div>
          {recent.length === 0 ? <p className="text-gray-400 text-sm">No active orders — all caught up! ✅</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs font-medium border-b pb-2">
                    <th className="text-left pb-2">Order ID</th>
                    <th className="text-left pb-2">Product</th>
                    <th className="text-left pb-2">Image</th>
                    <th className="text-left pb-2">Total</th>
                    <th className="text-left pb-2">Status</th>
                    <th className="text-left pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recent.map((o) => (
                    <tr key={o.id} className="py-2">
                      <td className="py-2 font-mono text-xs text-gray-500">#{o.id.slice(0, 8)}</td>
                      <td className="py-2">
                        {o.items.map((item) => (
                          <div key={item.productId} className="font-medium text-gray-800">
                            {item.product?.productName || '—'}
                          </div>
                        ))}
                      </td>
                      <td className="py-2">
                        {o.items.map((item) => (
                          <img
                            key={item.productId}
                            src={item.product?.imageURL || ''}
                            alt={item.product?.productName || ''}
                            className="w-10 h-10 object-cover rounded border mb-1"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ))}
                      </td>
                      <td className="py-2 font-medium">{formatCurrency(o.total)}</td>
                      <td className="py-2"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs capitalize">{o.status}</span></td>
                      <td className="py-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {o.status !== 'delivered' && o.status !== 'cancelled' && (
                            <button
                              disabled={!!busy}
                              onClick={() => handleOrderStatus(o.id, 'delivered')}
                              className="inline-flex items-center gap-1 text-xs text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 px-2.5 py-1 rounded-lg font-semibold transition"
                            >
                              {busy === o.id + 'delivered' ? <Spinner size="sm" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              Complete
                            </button>
                          )}
                          {o.status !== 'cancelled' && o.status !== 'delivered' && (
                            <button
                              disabled={!!busy}
                              onClick={() => handleOrderStatus(o.id, 'cancelled')}
                              className="inline-flex items-center gap-1 text-xs text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 px-2.5 py-1 rounded-lg font-semibold transition"
                            >
                              {busy === o.id + 'cancelled' ? <Spinner size="sm" /> : <XCircle className="w-3.5 h-3.5" />}
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Low Stock Alerts</h2>
          {lowStock.length === 0 ? <p className="text-gray-400 text-sm">All products have sufficient stock.</p> : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{p.productName}</span>
                  <span className="text-xs text-red-600 font-semibold">{p.stock} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* <div className="mt-6">
        <SeedDataPanel />
      </div> */}
    </div>
  );
};

export default DashboardHome;
