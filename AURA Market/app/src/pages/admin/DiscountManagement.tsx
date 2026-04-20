import { useEffect, useState } from 'react';
import { getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { discountsCol } from '../../firebase/collections';
import { db } from '../../firebase/config';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Discount { id: string; code: string; percent: number; active: boolean; }

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [form, setForm] = useState({ code: '', percent: 10 });
  const [saving, setSaving] = useState(false);

  const load = () => {
    getDocs(discountsCol).then(snap => {
      setDiscounts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Discount)));
      setLoading(false);
    });
  };
  useEffect(load, []);

  async function save() {
    if (!form.code.trim()) { toast.error('Code required'); return; }
    setSaving(true);
    try {
      const payload = { code: form.code.toUpperCase(), percent: form.percent, active: true };
      if (editing) {
        await updateDoc(doc(db, 'discounts', editing.id), payload);
        toast.success('Updated');
      } else {
        await addDoc(discountsCol, { ...payload, createdAt: serverTimestamp() });
        toast.success('Discount created');
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ code: '', percent: 10 });
      load();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(d: Discount) {
    await updateDoc(doc(db, 'discounts', d.id), { active: !d.active });
    setDiscounts(prev => prev.map(x => x.id === d.id ? { ...x, active: !x.active } : x));
  }

  async function remove(id: string) {
    if (!confirm('Delete this discount?')) return;
    await deleteDoc(doc(db, 'discounts', id));
    toast.success('Deleted');
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Discounts</h1>
        <Button onClick={() => { setEditing(null); setForm({ code: '', percent: 10 }); setModalOpen(true); }}>
          <PlusIcon className="w-4 h-4" /> Add Code
        </Button>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Code', 'Discount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {discounts.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">No discount codes yet.</td></tr>}
              {discounts.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">{d.code}</td>
                  <td className="px-4 py-3"><Badge label={`${d.percent}% off`} color="green" /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(d)}>
                      <Badge label={d.active ? 'Active' : 'Inactive'} color={d.active ? 'green' : 'red'} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(d); setForm({ code: d.code, percent: d.percent }); setModalOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-orange-500 rounded"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => remove(d.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Discount' : 'New Discount Code'}>
        <div className="space-y-4">
          <Input label="Code (e.g. SAVE20)" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
          <Input label="Discount %" type="number" min={1} max={100} value={form.percent} onChange={e => setForm(f => ({ ...f, percent: +e.target.value }))} />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => { setModalOpen(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
