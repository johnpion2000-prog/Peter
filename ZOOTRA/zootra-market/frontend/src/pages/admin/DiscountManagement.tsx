import React, { useState, useEffect } from 'react';
import { getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { promoCodesCol, db } from '../../firebase/collections';
import { useUIStore } from '../../stores/uiStore';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

interface PromoCode { id: string; code: string; discount: number; active: boolean; expiresAt: string; }

const DiscountManagement: React.FC = () => {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState(''); const [discount, setDiscount] = useState(10); const [expires, setExpires] = useState('');
  const showToast = useUIStore((s) => s.showToast);

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(promoCodesCol);
    setCodes(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PromoCode));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!code.trim()) return;
    await addDoc(promoCodesCol, { code: code.toUpperCase(), discount, active: true, expiresAt: expires } as any);
    showToast('Promo code created', 'success'); setCode(''); setDiscount(10); setExpires(''); load();
  };

  const toggle = async (id: string, active: boolean) => {
    await updateDoc(doc(db, 'promoCodes', id), { active: !active });
    load();
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Discount Management</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">New Promo Code</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div><label className="text-xs text-gray-500">Code</label><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SAVE20" className="mt-1 border rounded-lg px-3 py-2 text-sm block focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
          <div><label className="text-xs text-gray-500">Discount %</label><input type="number" value={discount} onChange={(e) => setDiscount(+e.target.value)} min={1} max={80} className="mt-1 border rounded-lg px-3 py-2 text-sm block w-20 focus:outline-none" /></div>
          <div><label className="text-xs text-gray-500">Expires (YYYY-MM-DD)</label><input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className="mt-1 border rounded-lg px-3 py-2 text-sm block focus:outline-none" /></div>
          <Button onClick={add}>Create Code</Button>
        </div>
      </div>
      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="px-4 py-3 text-left">Code</th><th className="px-4 py-3 text-left">Discount</th><th className="px-4 py-3 text-left">Expires</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {codes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{c.discount}%</td>
                  <td className="px-4 py-3 text-gray-500">{c.expiresAt || '—'}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.active ? 'Active' : 'Disabled'}</span></td>
                  <td className="px-4 py-3 text-right"><button onClick={() => toggle(c.id, c.active)} className="text-xs text-blue-500 hover:underline">{c.active ? 'Disable' : 'Enable'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountManagement;
