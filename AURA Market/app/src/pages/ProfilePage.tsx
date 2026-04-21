import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthContext } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { fetchOrders } from '../services/orderService';
import { getCompany } from '../services/companyService';
import { uploadImage } from '../firebase/storage';
import { ORDER_STATUS_COLORS } from '../config/constants';
import { formatCurrency } from '../utils/formatCurrency';
import type { Order } from '../types/order.types';
import type { Company } from '../types/company.types';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { CameraIcon, ChevronDownIcon, ChevronUpIcon, LinkIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const schema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  phone:   z.string().optional(),
  address: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const { appUser, currentUser, updateUserProfile } = useAuthContext();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();

  const [orders, setOrders]           = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [saving, setSaving]           = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [expandedOrder, setExpandedOrder]   = useState<string | null>(null);
  const [company, setCompany]         = useState<Company | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  // Redirect if not signed in
  useEffect(() => {
    if (!currentUser) { navigate('/signin'); return; }
    reset({
      displayName: appUser?.displayName ?? '',
      phone:   appUser?.phone   ?? '',
      address: appUser?.address ?? '',
    });
  }, [currentUser, appUser, navigate, reset]);

  // Load order history
  useEffect(() => {
    if (!currentUser) return;
    fetchOrders(currentUser.uid)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [currentUser]);

  // Load company for companyAdmin users
  useEffect(() => {
    if (appUser?.role === 'companyAdmin' && appUser.companyId) {
      getCompany(appUser.companyId).then(setCompany);
    }
  }, [appUser]);

  async function onSubmit(data: FormValues) {
    setSaving(true);
    try {
      await updateUserProfile(data);
      toast.success(t('profileUpdated'));
    } catch {
      toast.error(t('errorSaving'));
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
      toast.success(t('photoUpdated'));
    } catch {
      toast.error(t('errorSaving'));
    } finally {
      setUploadingPhoto(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const initials = appUser?.displayName
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  const photoURL = appUser?.photoURL ?? currentUser?.photoURL;

  const LANGS: { code: 'en' | 'fr'; label: string; flag: string }[] = [
    { code: 'en', label: 'English',  flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('myProfile')}</h1>

      {/* ── Store link (company admins only) ── */}
      {company && (() => {
        const storeUrl = `${window.location.origin}/store/${company.slug || company.id}`;
        return (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <BuildingStorefrontIcon className="w-5 h-5 text-orange-500" />
              <h2 className="text-sm font-semibold text-orange-700">
                {company.name} — Your Store Link
              </h2>
              {company.status !== 'active' && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium capitalize">
                  {company.status}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Share this link with your customers — they'll see only your products.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href={storeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center gap-2 bg-white border border-orange-200 rounded-xl px-4 py-2.5 text-sm text-orange-600 font-medium hover:bg-orange-50 transition-colors truncate"
              >
                <LinkIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">{storeUrl}</span>
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(storeUrl).then(() => toast.success('Link copied!'))}
                className="shrink-0 flex items-center justify-center gap-1.5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                Copy Link
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── Avatar + identity ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          {photoURL ? (
            <img
              src={photoURL}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-orange-100 shadow-sm"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-2xl font-bold border-4 border-orange-100 shadow-sm">
              {initials}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingPhoto}
            title={t('changePhoto')}
            className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-60"
          >
            {uploadingPhoto
              ? <Spinner size="sm" />
              : <CameraIcon className="w-4 h-4" />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        {/* Summary */}
        <div className="text-center sm:text-left">
          <p className="text-xl font-bold text-gray-900">{appUser?.displayName || '—'}</p>
          <p className="text-sm text-gray-500 mt-0.5">{appUser?.email}</p>
          <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="text-xs font-semibold bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full capitalize">
              {appUser?.role}
            </span>
            {appUser?.phone && (
              <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-0.5 rounded-full">
                {appUser.phone}
              </span>
            )}
          </div>
          <p
            className="mt-1.5 text-xs text-gray-400 cursor-pointer hover:text-orange-500 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {t('changePhoto')}
          </p>
        </div>
      </div>

      {/* ── Edit details ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">{t('personalDetails')}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('displayName')}
              error={errors.displayName?.message}
              {...register('displayName')}
            />
            <Input
              label={t('phone')}
              type="tel"
              placeholder="+1 555 000 0000"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t('address')}</label>
            <textarea
              rows={2}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              {...register('address')}
            />
          </div>
          {/* Read-only email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t('email')}</label>
            <input
              type="email"
              readOnly
              value={appUser?.email ?? ''}
              className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>{t('saveChanges')}</Button>
          </div>
        </form>
      </div>

      {/* ── Order history ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{t('orderHistory')}</h2>
        </div>

        {ordersLoading ? (
          <div className="flex justify-center py-14"><Spinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <div className="py-14 text-center text-gray-400">
            <p className="text-4xl mb-3">🛒</p>
            <p className="font-medium">{t('noOrders')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map(o => (
              <div key={o.id}>
                {/* Summary row */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                  className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 font-mono">
                        #{o.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {o.createdAt?.toDate?.()?.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        }) ?? '—'}
                        {' · '}
                        {o.items.length} {t('items')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-gray-900">{formatCurrency(o.total)}</span>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ORDER_STATUS_COLORS[o.status]}`}>
                        {o.status}
                      </span>
                      {expandedOrder === o.id
                        ? <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                        : <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                </button>

                {/* Expanded detail */}
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
                        {o.items.map((item, i) => (
                          <tr key={i}>
                            <td className="py-1.5 text-gray-800 font-medium">{item.productName}</td>
                            <td className="py-1.5 text-right text-gray-500">×{item.quantity}</td>
                            <td className="py-1.5 text-right font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-orange-200">
                          <td colSpan={2} className="pt-2 text-right font-semibold text-gray-600 text-sm">
                            {t('total')}
                          </td>
                          <td className="pt-2 text-right font-bold text-orange-600 text-sm">
                            {formatCurrency(o.total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                    {o.userAddress && (
                      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        {o.userAddress}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Preferences ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">{t('preferences')}</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm text-gray-600 font-medium">{t('language')}:</span>
          <div className="flex gap-2">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                  lang === l.code
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
