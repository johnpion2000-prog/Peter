import React, { useState, useEffect } from 'react';
import { getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { categoriesCol, db } from '../../firebase/collections';
import { useUIStore } from '../../stores/uiStore';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

interface Cat { id: string; name: string; icon: string; slug: string; }

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(''); const [icon, setIcon] = useState('');
  const showToast = useUIStore((s) => s.showToast);

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(categoriesCol);
    setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Cat));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    await addDoc(categoriesCol, { name, icon, slug: name.toLowerCase().replace(/\s+/g, '-') } as any);
    showToast('Category added', 'success'); setName(''); setIcon(''); load();
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, 'categories', id));
    showToast('Category deleted', 'success'); load();
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categories</h1>
      <div className="flex gap-3 mb-6">
        <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Icon (emoji)" className="border rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="border rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-green-500" />
        <Button onClick={add}>Add</Button>
      </div>
      {loading ? <Spinner /> : (
        <div className="grid gap-2">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
              <span className="font-medium">{c.icon} {c.name}</span>
              <button onClick={() => remove(c.id)} className="text-red-400 hover:text-red-600 text-sm">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
