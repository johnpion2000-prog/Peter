import React, { useState } from 'react';
import {
  CalendarCheck, Clock, MapPin, Phone, ChevronDown,
  Trash2, Search, CheckCircle2, XCircle, Flag,
} from 'lucide-react';
import { useAdminBookings } from '../../hooks/useBookings';
import { BookingStatus, SERVICE_LABELS, ServiceType } from '../../types/booking.types';
import { useUIStore } from '../../stores/uiStore';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const STATUSES: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

const statusStyles: Record<BookingStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100  text-blue-700  border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100   text-red-600   border-red-200',
};

const statusLabel: Record<BookingStatus, string> = {
  pending: 'Pending', confirmed: 'Confirmed',
  completed: 'Completed', cancelled: 'Cancelled',
};

const BookingManagement: React.FC = () => {
  const { bookings, loading, changeStatus, remove } = useAdminBookings();
  const showToast = useUIStore((s) => s.showToast);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
  const [filterService, setFilterService] = useState<ServiceType | 'all'>('all');

  const [moreModal, setMoreModal] = useState<{ id: string; current: BookingStatus } | null>(null);
  const [moreStatus, setMoreStatus] = useState<BookingStatus>('pending');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const act = async (id: string, action: BookingStatus) => {
    setBusy(id);
    try {
      await changeStatus(id, action);
      showToast(`Booking ${statusLabel[action].toLowerCase()}`, 'success');
    } catch (err: any) {
      showToast(err.message ?? 'Failed to update', 'error');
    } finally { setBusy(null); }
  };

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      b.userName.toLowerCase().includes(q) ||
      b.userEmail.toLowerCase().includes(q) ||
      b.animalDescription.toLowerCase().includes(q) ||
      b.location.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchService = filterService === 'all' || b.serviceType === filterService;
    return matchSearch && matchStatus && matchService;
  });

  const handleMoreSave = async () => {
    if (!moreModal) return;
    setBusy(moreModal.id);
    try {
      await changeStatus(moreModal.id, moreStatus);
      showToast(`Status → ${statusLabel[moreStatus]}`, 'success');
      setMoreModal(null);
    } catch (err: any) {
      showToast(err.message ?? 'Failed to update', 'error');
    } finally { setBusy(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(deleteTarget);
    try {
      await remove(deleteTarget);
      showToast('Booking deleted', 'success');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err.message ?? 'Failed to delete', 'error');
    } finally { setBusy(null); }
  };

  // Stats
  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = bookings.filter((b) => b.status === s).length;
    return acc;
  }, {} as Record<BookingStatus, number>);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {bookings.length} total appointment{bookings.length !== 1 ? 's' : ''} — live updates
        </p>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
            className={`rounded-xl border px-4 py-3 text-left transition ${filterStatus === s ? 'border-green-400 bg-green-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
          >
            <div className="text-xl font-bold text-gray-800">{counts[s]}</div>
            <div className={`text-xs font-semibold mt-0.5 ${statusStyles[s].split(' ')[1]}`}>{statusLabel[s]}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, animal, location…"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value as ServiceType | 'all')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="all">All Services</option>
          {(Object.entries(SERVICE_LABELS) as [ServiceType, string][]).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as BookingStatus | 'all')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">No bookings found</p>
          <p className="text-sm text-gray-400 mt-1">Bookings submitted by customers will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-left">Animal</th>
                  <th className="px-4 py-3 text-left">Date & Time</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b) => {
                    const isBusy = busy === b.id;
                    return (
                      <tr key={b.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs flex-shrink-0">
                              {(b.userName?.[0] ?? b.userEmail?.[0] ?? 'U').toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 truncate max-w-[120px]">{b.userName || '—'}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[120px]">{b.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{SERVICE_LABELS[b.serviceType]}</td>
                        <td className="px-4 py-3 text-gray-500 max-w-[140px]">
                          <p className="truncate" title={b.animalDescription}>{b.animalDescription}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="flex items-center gap-1 text-gray-700 text-xs font-medium">
                            <CalendarCheck className="w-3 h-3 flex-shrink-0 text-green-500" />{b.preferredDate}
                          </p>
                          <p className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                            <Clock className="w-3 h-3 flex-shrink-0" />{b.preferredTime}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          <span className="flex items-center gap-1 text-xs"><MapPin className="w-3 h-3 flex-shrink-0" />{b.location}</span>
                          {b.userPhone && <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><Phone className="w-3 h-3 flex-shrink-0" />{b.userPhone}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusStyles[b.status]}`}>
                            {statusLabel[b.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 justify-end flex-wrap">
                            {(b.status === 'pending' || b.status === 'cancelled') && (
                              <button
                                disabled={isBusy}
                                onClick={() => act(b.id, 'confirmed')}
                                className="inline-flex items-center gap-1 text-xs text-white bg-green-500 hover:bg-green-600 disabled:opacity-50 px-2.5 py-1 rounded-lg font-semibold transition"
                              >
                                {isBusy ? <Spinner size="sm" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Confirm
                              </button>
                            )}
                            {(b.status === 'pending' || b.status === 'confirmed') && (
                              <button
                                disabled={isBusy}
                                onClick={() => act(b.id, 'cancelled')}
                                className="inline-flex items-center gap-1 text-xs text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 px-2.5 py-1 rounded-lg font-semibold transition"
                              >
                                {isBusy ? <Spinner size="sm" /> : <XCircle className="w-3.5 h-3.5" />} Cancel
                              </button>
                            )}
                            {b.status === 'confirmed' && (
                              <button
                                disabled={isBusy}
                                onClick={() => act(b.id, 'completed')}
                                className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 px-2.5 py-1 rounded-lg font-semibold transition"
                              >
                                {isBusy ? <Spinner size="sm" /> : <Flag className="w-3.5 h-3.5" />} Done
                              </button>
                            )}
                            <button
                              onClick={() => { setMoreModal({ id: b.id, current: b.status }); setMoreStatus(b.status); }}
                              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:bg-gray-100 px-2 py-1 rounded-lg transition"
                              title="More options"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(b.id)}
                              className="inline-flex items-center gap-1 text-xs text-red-400 hover:bg-red-50 px-2 py-1 rounded-lg transition"
                              title="Delete booking"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      <Modal isOpen={!!moreModal} onClose={() => setMoreModal(null)} title="Change Booking Status">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Select a status for this appointment:</p>
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setMoreStatus(s)}
                className={`flex items-center gap-2 border-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  moreStatus === s ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  s === 'pending' ? 'bg-yellow-400' : s === 'confirmed' ? 'bg-blue-500' : s === 'completed' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {statusLabel[s]}
              </button>
            ))}
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="secondary" onClick={() => setMoreModal(null)}>Cancel</Button>
            <Button loading={busy === moreModal?.id} onClick={handleMoreSave}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Booking">
        <div className="text-center py-2">
          <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">Delete this booking?</p>
          <p className="text-sm text-gray-400 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Keep it</Button>
            <Button variant="danger" loading={busy === deleteTarget} onClick={handleDelete}>Yes, Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingManagement;
