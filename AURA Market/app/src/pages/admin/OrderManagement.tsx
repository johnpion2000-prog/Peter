import { useEffect, useState } from 'react';
import { onSnapshot, query, where } from 'firebase/firestore';
import { ordersCol } from '../../firebase/collections';
import { updateOrderStatus } from '../../services/orderService';
import type { Order, OrderStatus } from '../../types/order.types';
import { useAuthContext } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { ORDER_STATUSES } from '../../config/constants';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export default function OrderManagement() {
  const { appUser } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  // Real-time: company admins see only orders containing their products
  useEffect(() => {
    const q = appUser?.role === 'companyAdmin' && appUser.companyId
      ? query(ordersCol, where('companyIds', 'array-contains', appUser.companyId))
      : ordersCol;
    const unsub = onSnapshot(q, snap => {
      setOrders(
        snap.docs
          .map(d => ({ ...d.data(), id: d.id } as Order))
          .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)),
      );
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [appUser?.companyId, appUser?.role]);

  async function changeStatus(orderId: string, status: OrderStatus) {
    try {
      await updateOrderStatus(orderId, status);
      // onSnapshot auto-updates the list; only update modal state manually
      if (selected?.id === orderId) setSelected(o => o ? { ...o, status } : null);
      toast.success('Status updated');
    } catch {
      toast.error('Could not update status');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Order ID', 'Customer', 'Email', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No orders found.</td></tr>
                )}
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{o.id.slice(0, 8)}…</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{o.userName}</td>
                    <td className="px-4 py-3 text-gray-500">{o.userEmail}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={e => changeStatus(o.id, e.target.value as OrderStatus)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs"
                      >
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{o.createdAt?.toDate?.()?.toLocaleDateString() ?? '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(o)} className="text-xs text-orange-500 hover:text-orange-700 font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order ${selected?.id.slice(0, 8)}…`} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-500">Customer</p><p className="font-medium">{selected.userName}</p></div>
              <div><p className="text-gray-500">Email</p><p className="font-medium">{selected.userEmail}</p></div>
              <div><p className="text-gray-500">Phone</p><p className="font-medium">{selected.userPhone}</p></div>
              <div><p className="text-gray-500">Address</p><p className="font-medium">{selected.userAddress}</p></div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Items</p>
              <div className="space-y-2">
                {selected.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-700">{i.productName} × {i.quantity}</span>
                    <span className="font-medium">{formatCurrency(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold">
                <span>Total</span><span>{formatCurrency(selected.total)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-sm text-gray-500">Status:</span>
              <select
                value={selected.status}
                onChange={e => changeStatus(selected.id, e.target.value as OrderStatus)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
