import { useEffect, useState } from 'react';
import { getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { categoriesCol } from '../../firebase/collections';
import { db } from '../../firebase/config';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Category { id: string; name: string; emoji: string; }

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', emoji: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    getDocs(categoriesCol).then(snap => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
      setLoading(false);
    });
  };
  useEffect(load, []);

  async function save() {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'categories', editing.id), form);
        toast.success('Category updated');
      } else {
        await addDoc(categoriesCol, { ...form, createdAt: serverTimestamp() });
        toast.success('Category added');
      }
      setAddOpen(false);
      setEditing(null);
      setForm({ name: '', emoji: '' });
      load();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete category "${name}"?`)) return;
    await deleteDoc(doc(db, 'categories', id));
    toast.success('Deleted');
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button onClick={() => { setEditing(null); setForm({ name: '', emoji: '' }); setAddOpen(true); }}>
          <PlusIcon className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-2 relative">
              <span className="text-4xl">{c.emoji}</span>
              <span className="font-medium text-gray-900">{c.name}</span>
              <div className="flex gap-2 mt-1">
                <button onClick={() => { setEditing(c); setForm({ name: c.name, emoji: c.emoji }); setAddOpen(true); }}
                  className="p-1.5 text-gray-400 hover:text-orange-500 rounded transition-colors">
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button onClick={() => remove(c.id, c.name)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <p className="col-span-4 text-center text-gray-400 py-10">No custom categories yet.</p>}
        </div>
      )}

      <Modal open={addOpen} onClose={() => { setAddOpen(false); setEditing(null); }} title={editing ? 'Edit Category' : 'Add Category'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Emoji" value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} placeholder="🐾" />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => { setAddOpen(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={save} loading={saving}>{editing ? 'Save' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
