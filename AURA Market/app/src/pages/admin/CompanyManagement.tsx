import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCompanies,
  createCompany,
  updateCompany,
  setCompanyStatus,
  deleteCompany,
  backfillCompanySlugs,
} from '../../services/companyService';
import { doc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { usersCol } from '../../firebase/collections';
import type { Company, CompanyFormData, CompanyStatus } from '../../types/company.types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import {
  PlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon,
  CheckCircleIcon, XCircleIcon, ClockIcon, UserPlusIcon,
  LinkIcon, ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/* ─── Schema ─── */
const schema = z.object({
  name:             z.string().min(2, 'Company name required'),
  email:            z.string().email('Invalid email'),
  ownerEmail:       z.string().email('Invalid owner email'),
  description:      z.string().optional(),
  maxProducts:      z.coerce.number().int().min(1),
  discountLimit:    z.coerce.number().int().min(0).max(100),
  canManageOrders:  z.boolean(),
  expiresAt:        z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

/* ─── Status helpers ─── */
const statusColor: Record<CompanyStatus, 'green' | 'red' | 'yellow'> = {
  active:    'green',
  suspended: 'red',
  pending:   'yellow',
};
const StatusIcon = ({ s }: { s: CompanyStatus }) => {
  if (s === 'active')    return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
  if (s === 'suspended') return <XCircleIcon className="w-4 h-4 text-red-500" />;
  return <ClockIcon className="w-4 h-4 text-yellow-500" />;
};

/* ─── Assign companyAdmin modal ─── */
function AssignAdminModal({
  company,
  open,
  onClose,
}: { company: Company; open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function assign() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(usersCol, where('email', '==', email.trim())));
      if (snap.empty) { toast.error('User not found — they must sign up first'); return; }
      const userDoc = snap.docs[0];
      await updateDoc(doc(db, 'users', userDoc.id), {
        role: 'companyAdmin',
        companyId: company.id,
      });
      await updateDoc(doc(db, 'companies', company.id), { ownerId: userDoc.id });
      toast.success(`${email} assigned as company admin`);
      onClose();
    } catch {
      toast.error('Assignment failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Assign Admin — ${company.name}`}>
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Enter the email of a registered user to make them a company admin for <strong>{company.name}</strong>.</p>
        <Input
          label="User Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="user@example.com"
        />
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={assign} loading={loading}>Assign</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Main component ─── */
export default function CompanyManagement() {
  const { companies, loading } = useCompanies();
  const [formOpen, setFormOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [assignTarget, setAssignTarget] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [backfilling, setBackfilling] = useState(false);

  async function handleBackfill() {
    setBackfilling(true);
    try {
      const count = await backfillCompanySlugs();
      if (count === 0) toast.success('All companies already have store links.');
      else toast.success(`Store links generated for ${count} company${count > 1 ? 'ies' : ''}!`);
    } catch {
      toast.error('Backfill failed — try again.');
    } finally {
      setBackfilling(false);
    }
  }

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { maxProducts: 50, discountLimit: 30, canManageOrders: true },
  });

  function openAdd() {
    reset({ maxProducts: 50, discountLimit: 30, canManageOrders: true, name: '', email: '', ownerEmail: '' });
    setEditCompany(null);
    setFormOpen(true);
  }

  function openEdit(c: Company) {
    setEditCompany(c);
    reset({
      name:            c.name,
      email:           c.email,
      ownerEmail:      c.ownerEmail,
      description:     c.description ?? '',
      maxProducts:     c.permissions.maxProducts,
      discountLimit:   c.permissions.discountLimit,
      canManageOrders: c.permissions.canManageOrders,
      expiresAt:       c.expiresAt
        ? new Date(c.expiresAt.toDate()).toISOString().split('T')[0]
        : '',
    });
    setFormOpen(true);
  }

  async function onSubmit(data: FormValues) {
    setSaving(true);
    try {
      const payload: CompanyFormData = {
        name:            data.name,
        email:           data.email,
        ownerEmail:      data.ownerEmail,
        description:     data.description ?? '',
        maxProducts:     data.maxProducts,
        discountLimit:   data.discountLimit,
        canManageOrders: data.canManageOrders,
        expiresAt:       data.expiresAt ?? '',
      };
      if (editCompany) {
        await updateCompany(editCompany.id, payload);
        toast.success('Company updated');
      } else {
        await createCompany(payload);
        toast.success('Company created');
      }
      setFormOpen(false);
      setEditCompany(null);
      // onSnapshot auto-refreshes the list
    } catch {
      toast.error('Failed to save company');
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(c: Company) {
    const next: CompanyStatus = c.status === 'active' ? 'suspended' : 'active';
    try {
      await setCompanyStatus(c.id, next);
      toast.success(`Company ${next}`);
    } catch {
      toast.error('Failed to update status');
    }
  }

  async function handleDelete(c: Company) {
    if (!confirm(`Permanently delete "${c.name}"?`)) return;
    try {
      await deleteCompany(c.id);
      toast.success('Company removed');
    } catch {
      toast.error('Failed to delete');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage vendor companies and their marketplace permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackfill}
            disabled={backfilling}
            title="Generate store links for companies that don't have one yet"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 disabled:opacity-50 transition-colors"
          >
            {backfilling
              ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
              : <LinkIcon className="w-4 h-4" />}
            Fix Store Links
          </button>
          <Button onClick={openAdd}>
            <PlusIcon className="w-4 h-4" /> Add Company
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total',     value: companies.length,                                color: 'text-gray-900' },
          { label: 'Active',    value: companies.filter(c => c.status === 'active').length,    color: 'text-green-600' },
          { label: 'Suspended', value: companies.filter(c => c.status === 'suspended').length, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 py-20 text-center">
          <BuildingOfficeIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No companies yet</p>
          <p className="text-sm text-gray-400 mt-1">Click "Add Company" to onboard your first vendor</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Company', 'Store Link', 'Status', 'Max Products', 'Disc. Limit', 'Order Mgmt', 'Expires', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {companies.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    {/* Name / email */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </td>

                    {/* Store link */}
                    <td className="px-4 py-3">
                      {c.slug ? (
                        <a
                          href={`/store/${c.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-700 font-medium whitespace-nowrap"
                        >
                          <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                          /store/{c.slug}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300 italic">No link yet</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(c)}
                        title={`Click to ${c.status === 'active' ? 'suspend' : 'activate'}`}
                        className="flex items-center gap-1.5"
                      >
                        <StatusIcon s={c.status} />
                        <Badge label={c.status} color={statusColor[c.status]} />
                      </button>
                    </td>

                    {/* Permissions */}
                    <td className="px-4 py-3 text-center font-mono">{c.permissions.maxProducts}</td>
                    <td className="px-4 py-3 text-center font-mono">{c.permissions.discountLimit}%</td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        label={c.permissions.canManageOrders ? 'Yes' : 'No'}
                        color={c.permissions.canManageOrders ? 'green' : 'red'}
                      />
                    </td>

                    {/* Expiry */}
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {c.expiresAt
                        ? c.expiresAt.toDate().toLocaleDateString()
                        : <span className="text-gray-300">No limit</span>
                      }
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setAssignTarget(c)}
                          title="Assign company admin"
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        >
                          <UserPlusIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditCompany(null); }}
        title={editCompany ? `Edit — ${editCompany.name}` : 'Add New Company'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Company Name" error={errors.name?.message} {...register('name')} />
            <Input label="Company Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Owner Email" type="email" error={errors.ownerEmail?.message} {...register('ownerEmail')} hint="Registered user to invite as admin" />
            <Input label="Expires At" type="date" error={errors.expiresAt?.message} {...register('expiresAt')} hint="Leave blank for no expiry" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea rows={2} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" {...register('description')} />
          </div>

          {/* Permissions section */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-4">
            <p className="text-sm font-semibold text-orange-700">🔐 Permissions</p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Max Products"
                type="number"
                min={1}
                error={errors.maxProducts?.message}
                hint="How many products this vendor can list"
                {...register('maxProducts')}
              />
              <Input
                label="Max Discount %"
                type="number"
                min={0}
                max={100}
                error={errors.discountLimit?.message}
                hint="Maximum discount they can apply"
                {...register('discountLimit')}
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" {...register('canManageOrders')} className="w-4 h-4 accent-orange-500 rounded" />
              <div>
                <p className="text-sm font-medium text-gray-800">Can manage orders</p>
                <p className="text-xs text-gray-500">Allow this company to view and update order status</p>
              </div>
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="ghost" onClick={() => { setFormOpen(false); setEditCompany(null); }}>Cancel</Button>
            <Button type="submit" loading={saving}>{editCompany ? 'Save Changes' : 'Create Company'}</Button>
          </div>
        </form>
      </Modal>

      {/* Assign admin modal */}
      {assignTarget && (
        <AssignAdminModal
          company={assignTarget}
          open={!!assignTarget}
          onClose={() => setAssignTarget(null)}
        />
      )}
    </div>
  );
}
