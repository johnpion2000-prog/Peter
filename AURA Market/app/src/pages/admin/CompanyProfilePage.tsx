import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuthContext } from '../../context/AuthContext';
import { uploadImage } from '../../firebase/storage';
import { formatCurrency } from '../../utils/formatCurrency';
import { fetchCompanyOrders } from '../../services/orderService';
import { ORDER_STATUS_COLORS } from '../../config/constants';
import type { Company } from '../../types/company.types';
import type { Order } from '../../types/order.types';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  CameraIcon, LinkIcon, BuildingStorefrontIcon, CheckCircleIcon,
  ClockIcon, XCircleIcon, ChevronDownIcon, ChevronUpIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const schema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  phone:   z.string().optional(),
  address: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function CompanyProfilePage() {
  const { appUser, currentUser, updateUserProfile } = useAuthContext();

  const [company, setCompany]         = useState<Company | null>(null);
  const [orders, setOrders]           = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [saving, setSaving]           = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [expandedOrder, setExpandedOrder]   = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // Prefill form
  useEffect(() => {
    reset({
      displayName: appUser?.displayName ?? '',
      phone:   appUser?.phone   ?? '',
      address: appUser?.address ?? '',
    });
  }, [appUser, reset]);

  // Live-listen to company doc
  useEffect(() => {
    if (!appUser?.companyId) return;
    const unsub = onSnapshot(doc(db, 'companies', appUser.companyId), snap => {
      if (snap.exists()) setCompany({ id: snap.id, ...snap.data() } as Company);
    });
    return unsub;
  }, [appUser?.companyId]);

  // Load this company's orders
  useEffect(() => {
    if (!appUser?.companyId) { setOrdersLoading(false); return; }
    fetchCompanyOrders(appUser.companyId)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [appUser?.companyId]);

  async function onSubmit(data: FormValues) {
    setSaving(true);
    try {
      await updateUserProfile(data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadImage(file, `avatars/${currentUser.uid}/${Date.now()}_${file.name}`);
      await updateUserProfile({ photoURL: url });
      toast.success('Photo updated!');
    } catch {
      toast.error('Could not upload photo.');
    } finally {
      setUploadingPhoto(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const photoURL  = appUser?.photoURL ?? currentUser?.photoURL;
  const initials  = appUser?.displayName
    ?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  const storeSlug = company?.slug || company?.id;
  const storeUrl  = storeSlug ? `${window.location.origin}/store/${storeSlug}` : null;

  /* ── Status badge ── */
  function StatusBadge({ status }: { status: Company['status'] }) {
    if (status === 'active')
      return (
        <span className="flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
          <CheckCircleIcon className="w-3.5 h-3.5" /> Active
        </span>
      );
    if (status === 'pending')
      return (
        <span className="flex items-center gap-1 text-xs font-semibold bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full">
          <ClockIcon className="w-3.5 h-3.5" /> Pending Approval
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
        <XCircleIcon className="w-3.5 h-3.5" /> Suspended
      </span>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Page title ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and share your store link with customers</p>
      </div>

      {/* ── Store Link card (most important — shown first) ── */}
      {company && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-xl">
              <BuildingStorefrontIcon className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{company.name}</h2>
              <StatusBadge status={company.status} />
            </div>
          </div>

          {company.status === 'active' && storeUrl ? (
            <>
              <p className="text-sm text-gray-600 mb-3">
                Share this link with your customers. When they open it they will see
                <span className="font-semibold text-gray-900"> only your products</span>, not other stores.
              </p>

              {/* Link display + copy */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 min-w-0">
                  <LinkIcon className="w-4 h-4 text-orange-400 shrink-0" />
                  <span className="text-sm text-orange-700 font-medium truncate">{storeUrl}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => navigator.clipboard.writeText(storeUrl).then(() => toast.success('Link copied!'))}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Copy
                  </button>
                  <a
                    href={storeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    Preview
                  </a>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                You can post this link on social media, WhatsApp, or anywhere to drive customers directly to your store.
              </p>
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
              {company.status === 'pending'
                ? 'Your store link will be available once your account is approved by AURA Market.'
                : 'Your store is currently suspended. Contact AURA Market support to reinstate your account.'}
            </div>
          )}
        </div>
      )}

      {/* ── Avatar + identity ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          {photoURL ? (
            <img src={photoURL} alt="avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-orange-100 shadow-sm" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-2xl font-bold border-4 border-orange-100 shadow-sm">
              {initials}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-60"
          >
            {uploadingPhoto ? <Spinner size="sm" /> : <CameraIcon className="w-4 h-4" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        <div className="text-center sm:text-left">
          <p className="text-xl font-bold text-gray-900">{appUser?.displayName || '—'}</p>
          <p className="text-sm text-gray-500 mt-0.5">{appUser?.email}</p>
          <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="text-xs font-semibold bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full">
              Company Admin
            </span>
            {appUser?.phone && (
              <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-0.5 rounded-full">{appUser.phone}</span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-gray-400 cursor-pointer hover:text-orange-500 transition-colors"
            onClick={() => fileRef.current?.click()}>
            Change photo
          </p>
        </div>
      </div>

      {/* ── Edit account details ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Account Details</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Display Name" error={errors.displayName?.message} {...register('displayName')} />
            <Input label="Phone" type="tel" placeholder="+1 555 000 0000" error={errors.phone?.message} {...register('phone')} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <textarea rows={2}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              {...register('address')} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input type="email" readOnly value={appUser?.email ?? ''}
              className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </div>

      {/* ── Order history (company's orders) ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
          <p className="text-xs text-gray-400 mt-0.5">Orders that include your products</p>
        </div>

        {ordersLoading ? (
          <div className="flex justify-center py-14"><Spinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <div className="py-14 text-center text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-medium">No orders yet</p>
            <p className="text-sm mt-1">Share your store link to start receiving orders.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.slice(0, 10).map(o => {
              const myItems = o.items.filter(i => !i.companyId || i.companyId === appUser?.companyId);
              const myTotal = myItems.reduce((s, i) => s + i.price * i.quantity, 0);
              return (
                <div key={o.id}>
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                    className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 font-mono">#{o.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {o.createdAt?.toDate?.()?.toLocaleDateString() ?? '—'}
                          {' · '}{o.userName}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-gray-900">{formatCurrency(myTotal)}</span>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ORDER_STATUS_COLORS[o.status]}`}>
                          {o.status}
                        </span>
                        {expandedOrder === o.id
                          ? <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                          : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                  </button>

                  {expandedOrder === o.id && (
                    <div className="px-6 pb-5 pt-1 bg-orange-50/40 border-t border-orange-100">
                      <table className="min-w-full text-sm mt-2">
                        <thead>
                          <tr className="text-xs text-gray-400 uppercase tracking-wide">
                            <th className="text-left pb-2">Product</th>
                            <th className="text-right pb-2">Qty</th>
                            <th className="text-right pb-2">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {myItems.map((item, i) => (
                            <tr key={i}>
                              <td className="py-1.5 text-gray-800 font-medium">{item.productName}</td>
                              <td className="py-1.5 text-right text-gray-500">×{item.quantity}</td>
                              <td className="py-1.5 text-right font-medium">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-orange-200">
                            <td colSpan={2} className="pt-2 text-right font-semibold text-gray-600 text-sm">Total</td>
                            <td className="pt-2 text-right font-bold text-orange-600 text-sm">{formatCurrency(myTotal)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
