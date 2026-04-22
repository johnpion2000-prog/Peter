import React, { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { formatCurrency } from '../../utils/formatCurrency';
import { OrderStatus } from '../../types/order.types';
import { useUIStore } from '../../stores/uiStore';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const statuses: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700', paid: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const OrderManagement: React.FC = () => {
  const { orders, loading, changeOrderStatus } = useOrders();
  const showToast = useUIStore((s) => s.showToast);
  const [selected, setSelected] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');

  const handleUpdate = async () => {
    if (!selected) return;
    try { await changeOrderStatus(selected, newStatus); showToast('Order status updated', 'success'); setSelected(null); }
    catch (err: any) { showToast(err.message, 'error'); }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 font-medium">
              <tr><th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">Address</th><th className="px-4 py-3 text-left">Items</th><th className="px-4 py-3 text-left">Total</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[120px] truncate">{o.shippingAddress}</td>
                  <td className="px-4 py-3 text-gray-500">{o.items.length} item(s)</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(o.total)}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[o.status]}`}>{o.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setSelected(o.id); setNewStatus(o.status); }} className="text-blue-500 hover:underline text-xs">Update</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Update Order Status">
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
          className="w-full border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-green-500">
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
          <Button onClick={handleUpdate}>Save</Button>
        </div>
      </Modal>
    </div>
  );
};

export default OrderManagement;
