import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { onSnapshot, query, where } from 'firebase/firestore';
import { productsCol } from '../../firebase/collections';
import { createProduct, updateProduct, deleteProduct } from '../../services/productService';
import type { Product, ProductFormData } from '../../types/product.types';
import { useAuthContext } from '../../context/AuthContext';
import { CATEGORIES } from '../../config/constants';
import { formatCurrency } from '../../utils/formatCurrency';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const schema = z.object({
  productName:     z.string().min(2),
  category:        z.enum(['fashion', 'shoes', 'automotive', 'electronics', 'home', 'sports', 'beauty', 'food', 'other']),
  price:           z.coerce.number().positive(),
  discountPercent: z.coerce.number().min(0).max(100),
  description:     z.string().min(5),
  stock:           z.coerce.number().int().min(0),
});
type FormValues = z.infer<typeof schema>;

export default function ProductManagement() {
  const { appUser } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  // Real-time: company admins see only their products; superAdmins see all
  useEffect(() => {
    const q = appUser?.role === 'companyAdmin' && appUser.companyId
      ? query(productsCol, where('companyId', '==', appUser.companyId))
      : productsCol;
    const unsub = onSnapshot(q, snap => {
      setProducts(
        snap.docs
          .map(d => ({ ...d.data(), id: d.id } as Product))
          .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)),
      );
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [appUser?.companyId, appUser?.role]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function openAdd() { reset({}); setImageFile(null); setAddOpen(true); }
  function openEdit(p: Product) {
    setEditProduct(p);
    reset({
      productName: p.productName,
      category: p.category,
      price: p.price,
      discountPercent: p.discountPercent,
      description: p.description,
      stock: p.stock,
    });
    setImageFile(null);
  }

  async function onSave(data: FormValues) {
    if (!editProduct && !imageFile) { toast.error('Please select an image'); return; }
    setSaving(true);
    try {
      if (editProduct) {
        await updateProduct(editProduct.id, data as ProductFormData, imageFile ?? undefined, editProduct.imageURL);
        toast.success('Product updated');
      } else {
        await createProduct(data as ProductFormData, imageFile!, appUser?.role === 'companyAdmin' ? appUser.companyId : undefined);
        toast.success('Product added');
      }
      setAddOpen(false);
      setEditProduct(null);
      // onSnapshot auto-refreshes the list
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Delete "${p.productName}"?`)) return;
    try {
      await deleteProduct(p.id, p.imageURL, p.companyId);
      toast.success('Deleted');
      // onSnapshot auto-refreshes
    } catch {
      toast.error('Failed to delete');
    }
  }

  const filtered = products.filter(p => p.productName.toLowerCase().includes(search.toLowerCase()));

  const productFormJSX = (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <Input label="Product Name" error={errors.productName?.message} {...register('productName')} />
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" {...register('category')}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
          </select>
        </div>
        <Input label="Price (RWF)" type="number" step="1" error={errors.price?.message} {...register('price')} />
        <Input label="Discount %" type="number" error={errors.discountPercent?.message} {...register('discountPercent')} />
        <Input label="Stock" type="number" error={errors.stock?.message} {...register('stock')} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea rows={3} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" {...register('description')} />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Image {editProduct ? '(leave empty to keep current)' : '*'}</label>
        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} className="text-sm" />
        {imageFile && <p className="text-xs text-green-600">Selected: {imageFile.name}</p>}
      </div>
      <div className="flex gap-3 pt-2 justify-end">
        <Button type="button" variant="ghost" onClick={() => { setAddOpen(false); setEditProduct(null); }}>Cancel</Button>
        <Button type="submit" loading={saving}>{editProduct ? 'Save Changes' : 'Add Product'}</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={openAdd}><PlusIcon className="w-4 h-4" /> Add Product</Button>
      </div>

      <input
        type="text" placeholder="Search products…" value={search}
        onChange={e => setSearch(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Image', 'Name', 'Category', 'Price', 'Discount', 'Stock', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No products found.</td></tr>
                )}
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img src={p.imageURL} alt={p.productName} className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{p.productName}</td>
                    <td className="px-4 py-3"><Badge label={p.category} color="orange" /></td>
                    <td className="px-4 py-3">{formatCurrency(p.discountedPrice)}</td>
                    <td className="px-4 py-3">{p.discountPercent > 0 ? <Badge label={`-${p.discountPercent}%`} color="green" /> : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock > 0 ? 'text-green-600' : 'text-red-500'}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded transition-colors"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Product" size="lg">
        {productFormJSX}
      </Modal>
      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product" size="lg">
        {productFormJSX}
      </Modal>
    </div>
  );
}
