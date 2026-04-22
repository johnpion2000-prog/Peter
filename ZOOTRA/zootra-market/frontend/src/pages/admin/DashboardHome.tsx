import React from 'react';
import { Package, ShoppingBag, DollarSign, type LucideIcon } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { formatCurrency } from '../../utils/formatCurrency';
import Spinner from '../../components/ui/Spinner';
import SeedDataPanel from '../../components/admin/SeedDataPanel';

const DashboardHome: React.FC = () => {
  const { stats, orders, products, loading } = useAdmin();
  const lowStock = products.filter((p) => p.stock <= 2 && p.stock > 0);
  const recent = orders.slice(0, 5);

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
          <h2 className="font-semibold text-gray-900 mb-4">Recent Orders</h2>
          {recent.length === 0 ? <p className="text-gray-400 text-sm">No orders yet.</p> : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-400 text-xs font-medium border-b pb-2">
                <th className="text-left pb-2">Order ID</th><th className="text-left pb-2">Total</th><th className="text-left pb-2">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((o) => (
                  <tr key={o.id} className="py-2">
                    <td className="py-2 font-mono text-xs text-gray-500">#{o.id.slice(0, 8)}</td>
                    <td className="py-2 font-medium">{formatCurrency(o.total)}</td>
                    <td className="py-2"><span className="bg-gray-100 px-2 py-0.5 rounded text-xs capitalize">{o.status}</span></td>
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
      <div className="mt-6">
        <SeedDataPanel />
      </div>
    </div>
  );
};

export default DashboardHome;
