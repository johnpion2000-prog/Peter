import { useAuthContext } from '../../context/AuthContext';
import { useAdmin } from '../../hooks/useAdmin';
import { formatCurrency } from '../../utils/formatCurrency';
import { ORDER_STATUS_COLORS } from '../../config/constants';
import Spinner from '../../components/ui/Spinner';
import CompanyDashboardHome from './CompanyDashboardHome';
import {
  CubeIcon, ShoppingBagIcon, UsersIcon, CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

export default function DashboardHome() {
  const { appUser } = useAuthContext();

  // Company admins get their own vendor-scoped dashboard
  if (appUser?.role === 'companyAdmin') return <CompanyDashboardHome />;

  const { stats, recentOrders, loading } = useAdmin();

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const cards = [
    { label: 'Total Products', value: stats?.products ?? 0,                   icon: CubeIcon,           color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Orders',   value: stats?.orders ?? 0,                     icon: ShoppingBagIcon,    color: 'bg-orange-50 text-orange-600' },
    { label: 'Total Users',    value: stats?.users ?? 0,                      icon: UsersIcon,          color: 'bg-green-50 text-green-600' },
    { label: 'Revenue',        value: formatCurrency(stats?.revenue ?? 0),    icon: CurrencyDollarIcon, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${c.color}`}>
              <c.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-xl font-bold text-gray-900">{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{o.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{o.userName}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {o.createdAt?.toDate?.()?.toLocaleDateString() ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
