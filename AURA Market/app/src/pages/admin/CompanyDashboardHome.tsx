import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuthContext } from '../../context/AuthContext';
import { useCompanyDashboard } from '../../hooks/useCompanyDashboard';
import { updateOrderStatus } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';
import { ORDER_STATUSES, ORDER_STATUS_COLORS } from '../../config/constants';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import type { Company } from '../../types/company.types';
import type { Order, OrderStatus } from '../../types/order.types';
import {
  CubeIcon, ShoppingBagIcon, CurrencyDollarIcon, ClockIcon,
  ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon,
  PhoneIcon, EnvelopeIcon, MapPinIcon, PlusIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/* ── Company status banner ─────────────────────────────────────── */
function StatusBanner({ company }: { company: Company }) {
  if (company.status === 'active') {
    const used = company.productCount ?? 0;
    const max  = company.permissions.maxProducts;
    return (
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
        <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">{company.name}</span> is active — you can list and sell products.
          {max > 0 && (
            <span className="ml-2 text-green-600 text-xs font-medium bg-green-100 px-2 py-0.5 rounded-full">
              {used} / {max} products used
            </span>
          )}
        </div>
      </div>
    );
  }
  if (company.status === 'pending') {
    return (
      <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
        <ClockIcon className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">{company.name}</span> is{' '}
          <strong>pending review</strong> — you cannot list products yet. You'll be notified once approved.
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
      <XCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold">{company.name}</span> is{' '}
        <strong>suspended</strong>. Contact support to reinstate your account.
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */
export default function CompanyDashboardHome() {
  const { appUser } = useAuthContext();
  const { stats, recentOrders, products, loading } = useCompanyDashboard(appUser?.companyId);
  const [company, setCompany] = useState<Company | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    if (!appUser?.companyId) return;
    const unsub = onSnapshot(doc(db, 'companies', appUser.companyId), snap => {
      if (snap.exists()) setCompany({ id: snap.id, ...snap.data() } as Company);
    });
    return unsub;
  }, [appUser?.companyId]);

  async function changeStatus(orderId: string, status: OrderStatus) {
    try {
      await updateOrderStatus(orderId, status);
      if (selected?.id === orderId) setSelected(o => o ? { ...o, status } : null);
      toast.success('Order updated');
    } catch {
      toast.error('Could not update order');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const statCards = [
    { label: 'My Products',   value: stats.products,               icon: CubeIcon,           color: 'bg-blue-50   text-blue-600' },
    { label: 'Total Orders',  value: stats.orders,                 icon: ShoppingBagIcon,    color: 'bg-orange-50 text-orange-600' },
    { label: 'Revenue',       value: formatCurrency(stats.revenue), icon: CurrencyDollarIcon, color: 'bg-purple-50 text-purple-600' },
    { label: 'Pending',       value: stats.pendingOrders,          icon: ClockIcon,          color: 'bg-yellow-50 text-yellow-600' },
  ];

  const lowStock = products.filter(p => p.stock <= 5);

  /* ── Items visible to THIS company in a given order ── */
  function myItems(o: Order) {
    const mine = o.items.filter(i => !i.companyId || i.companyId === appUser?.companyId);
    return mine.length > 0 ? mine : o.items; // fallback: show all (legacy orders)
  }
  function myTotal(o: Order) {
    return myItems(o).reduce((s, i) => s + i.price * i.quantity, 0);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your products and track your customer orders in real time</p>
      </div>

      {/* Company status banner */}
      {company && <StatusBanner company={company} />}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(c => (
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

      {/* Two-column: orders + products */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Customer Orders Table  (2/3 width) ── */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Customer Orders</h2>
              <p className="text-xs text-gray-400 mt-0.5">Only orders containing your products</p>
            </div>
            <Link to="/admin/orders" className="text-xs text-orange-500 hover:text-orange-700 font-medium">
              View all →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-20 text-center text-gray-400 px-4">
              <ShoppingBagIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No orders yet</p>
              <p className="text-sm mt-1">Share your products to start receiving orders.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Customer', 'Ordered Products', 'Your Total', 'Status', 'Date', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                      {/* Customer */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 whitespace-nowrap">{o.userName}</p>
                        <p className="text-xs text-gray-400">{o.userEmail}</p>
                      </td>
                      {/* Products ordered (only this vendor's) */}
                      <td className="px-4 py-3 text-gray-600 text-xs max-w-[180px]">
                        <span className="line-clamp-2">
                          {myItems(o).map(i => `${i.productName} ×${i.quantity}`).join(', ')}
                        </span>
                      </td>
                      {/* Total for this vendor */}
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                        {formatCurrency(myTotal(o))}
                      </td>
                      {/* Status badge */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[o.status]}`}>
                          {o.status}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {o.createdAt?.toDate?.()?.toLocaleDateString() ?? '—'}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelected(o)}
                          className="text-xs text-orange-500 hover:text-orange-700 font-medium whitespace-nowrap"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── My Products sidebar (1/3 width) ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">My Products</h2>
            <Link to="/admin/products" className="text-xs text-orange-500 hover:text-orange-700 font-medium">Manage →</Link>
          </div>

          {products.length === 0 ? (
            <div className="py-14 text-center text-gray-400 px-4">
              <CubeIcon className="w-9 h-9 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No products yet</p>
              <Link
                to="/admin/products"
                className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 mt-2 font-medium"
              >
                <PlusIcon className="w-3 h-3" /> Add your first product
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {products.slice(0, 9).map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <img
                    src={p.imageURL}
                    alt={p.productName}
                    className="w-10 h-10 object-cover rounded-lg bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.productName}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(p.discountedPrice)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`text-xs font-bold ${
                      p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {p.stock === 0 ? 'Out' : `${p.stock}`}
                    </span>
                    <p className="text-xs text-gray-300">left</p>
                  </div>
                </div>
              ))}
              {products.length > 9 && (
                <div className="px-4 py-3 text-center border-t border-gray-100">
                  <Link to="/admin/products" className="text-xs text-orange-500 hover:text-orange-600 font-medium">
                    +{products.length - 9} more products
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Low stock warning banner */}
      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-0.5">Low stock alert</p>
            <p className="text-yellow-700">
              {lowStock.map(p =>
                p.stock === 0
                  ? `${p.productName} (out of stock)`
                  : `${p.productName} (${p.stock} left)`,
              ).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* ── Order detail modal ── */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Order Details" size="lg">
        {selected && (() => {
          const items    = myItems(selected);
          const total    = myTotal(selected);
          return (
            <div className="space-y-5">
              {/* Customer details */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Customer Details</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Name</p>
                    <p className="font-semibold text-gray-900">{selected.userName}</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Email</p>
                      <p className="font-medium break-all">{selected.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <PhoneIcon className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Phone</p>
                      <p className="font-medium">{selected.userPhone || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPinIcon className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Delivery Address</p>
                      <p className="font-medium">{selected.userAddress || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items (only this vendor's) */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Your Items in This Order
                </p>
                <div className="space-y-2">
                  {items.map((i, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm py-1">
                      <div>
                        <span className="font-medium text-gray-900">{i.productName}</span>
                        <span className="text-gray-400 ml-2 text-xs">× {i.quantity}</span>
                      </div>
                      <span className="font-medium text-gray-900">{formatCurrency(i.price * i.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-sm border-t border-gray-100 mt-3 pt-3">
                  <span>Your Total</span>
                  <span className="text-orange-600">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Status update */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-sm text-gray-500 whitespace-nowrap">Update Status:</span>
                <select
                  value={selected.status}
                  onChange={e => changeStatus(selected.id, e.target.value as OrderStatus)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
