import React, { useState, useRef } from 'react';
import { MapPin, PawPrint, Upload, Trash2, LayoutGrid, List } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormData } from '../../utils/validateProduct';
import { useAdmin } from '../../hooks/useAdmin';
import { createProduct, updateProduct, deleteProduct } from '../../services/productService';
import { useImageUpload } from '../../hooks/useImageUpload';
import { formatCurrency } from '../../utils/formatCurrency';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { useUIStore } from '../../stores/uiStore';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { Product } from '../../types/product.types';
import { useAuth } from '../../contexts/AuthContext';

// ─── Field helper ────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; error?: string; children: React.ReactNode; hint?: string }> = ({ label, error, children, hint }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
    {children}
    {hint && !error && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white';

// ─── Image Upload Zone ────────────────────────────────────────────────────────
const ImageUploadZone: React.FC<{
  preview: string;
  progress: number;
  uploading: boolean;
  onChange: (file: File) => void;
}> = ({ preview, progress, uploading, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="relative w-full h-44 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-400 bg-gray-50 cursor-pointer flex items-center justify-center overflow-hidden transition group"
    >
      {preview ? (
        <>
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
            <span className="text-white text-sm font-medium">Change Image</span>
          </div>
        </>
      ) : (
        <div className="text-center px-4">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-500">Click to upload animal photo</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5 MB · optional</p>
        </div>
      )}
      {uploading && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 px-3 py-2">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-green-600 mt-1 text-center">Uploading… {Math.round(progress)}%</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
    </div>
  );
};

// ─── Product Form ─────────────────────────────────────────────────────────────
interface ProductFormProps {
  onSave: (data: ProductFormData, imageFile: File | null) => Promise<void>;
  defaultValues?: Partial<ProductFormData>;
  existingImageURL?: string;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSave, defaultValues, existingImageURL }) => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { discountPercent: 0, stock: 1, ...defaultValues },
  });
  const { upload, uploading, progress } = useImageUpload();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(existingImageURL ?? '');

  const price = watch('price') || 0;
  const discountPercent = watch('discountPercent') || 0;
  const discountedPrice = discountPercent > 0 ? Math.round(price * (1 - discountPercent / 100)) : price;

  const handleImageChange = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (data: ProductFormData) => {
    await onSave(data, imageFile);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Image */}
      <ImageUploadZone preview={imagePreview} progress={progress} uploading={uploading} onChange={handleImageChange} />

      {/* Name */}
      <Field label="Animal Name" error={errors.productName?.message}>
        <input {...register('productName')} placeholder="e.g. Friesian Dairy Cow" className={inputCls} />
      </Field>

      {/* Category + Location */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category" error={errors.category?.message}>
          <select {...register('category')} className={inputCls}>
            {PRODUCT_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Location" error={errors.location?.message}>
          <input {...register('location')} placeholder="e.g. Kigali" className={inputCls} />
        </Field>
      </div>

      {/* Price + Discount + Stock */}
      <div className="grid grid-cols-3 gap-3">
        <Field label="Price (RWF)" error={errors.price?.message}>
          <input type="number" min={1} {...register('price', { valueAsNumber: true })} placeholder="0" className={inputCls} />
        </Field>
        <Field label="Discount %" error={errors.discountPercent?.message}>
          <input type="number" min={0} max={99} {...register('discountPercent', { valueAsNumber: true })} placeholder="0" className={inputCls} />
        </Field>
        <Field label="Stock (qty)" error={errors.stock?.message}>
          <input type="number" min={1} {...register('stock', { valueAsNumber: true })} placeholder="1" className={inputCls} />
        </Field>
      </div>

      {/* Price preview */}
      {price > 0 && (
        <div className="bg-green-50 rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {discountPercent > 0 && <span>Original: <span className="line-through">{formatCurrency(price)}</span></span>}
            {discountPercent === 0 && <span>Selling price</span>}
          </div>
          <div className="flex items-center gap-2">
            {discountPercent > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">-{discountPercent}%</span>
            )}
            <span className="text-lg font-bold text-green-700">{formatCurrency(discountedPrice)}</span>
          </div>
        </div>
      )}

      {/* Description */}
      <Field label="Description" error={errors.description?.message} hint="Min 10 characters — breed details, age, health info, etc.">
        <textarea rows={3} {...register('description')} placeholder="Describe the animal — breed, age, health status, feeding…" className={inputCls} />
      </Field>

      <Button type="submit" loading={isSubmitting || uploading} className="w-full" size="lg">
        Save Product
      </Button>
    </form>
  );
};

// ─── Stock badge ──────────────────────────────────────────────────────────────
const StockBadge: React.FC<{ stock: number }> = ({ stock }) => {
  if (stock === 0) return <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">Out of stock</span>;
  if (stock <= 2) return <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium">Low: {stock}</span>;
  return <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{stock} avail.</span>;
};

// ─── Main component ───────────────────────────────────────────────────────────
const ProductManagement: React.FC = () => {
  const { products, loading, refetch } = useAdmin();
  const { user } = useAuth();
  const showToast = useUIStore((s) => s.showToast);
  const { upload } = useImageUpload();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'table'>('grid');

  const filtered = products.filter((p) => {
    const matchSearch = p.productName.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditing(p); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async (data: ProductFormData, imageFile: File | null) => {
    try {
      let imageURL = editing?.imageURL ?? '';
      if (imageFile) {
        try {
          const tempId = editing?.id ?? `img_${Date.now()}`;
          imageURL = await upload(tempId, imageFile);
        } catch (uploadErr: any) {
          const msg = uploadErr?.code === 'storage/unauthorized'
            ? 'Image upload failed: Storage permission denied. Saving without image.'
            : `Image upload failed: ${uploadErr.message}. Saving without image.`;
          showToast(msg, 'error');
          imageURL = editing?.imageURL ?? '';
        }
      }
      if (editing) {
        await updateProduct(editing.id, { ...data, imageURL });
        showToast('Product updated successfully', 'success');
      } else {
        await createProduct({ ...data, imageURL, sellerId: user?.uid ?? '' });
        showToast('Product added successfully', 'success');
      }
      closeModal();
      refetch();
    } catch (err: any) {
      const msg = err?.code === 'permission-denied'
        ? 'Permission denied — make sure you are logged in as admin.'
        : (err.message ?? 'Something went wrong');
      showToast(msg, 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      showToast(`"${deleteTarget.productName}" deleted`, 'success');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const catLabel = (cat: string) => PRODUCT_CATEGORIES.find(c => c.value === cat);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Animal Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} listed</p>
        </div>
        <Button onClick={openAdd} size="lg">
          + Add Animal
        </Button>
      </div>

      {/* ── Filters bar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search animals..."
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-56"
        />
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${categoryFilter === 'all' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}
          >
            All
          </button>
          {PRODUCT_CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition ${categoryFilter === c.value ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => setView('grid')} className={`px-3 py-1.5 text-sm transition ${view === 'grid' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView('table')} className={`px-3 py-1.5 text-sm transition ${view === 'table' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <PawPrint className="w-14 h-14 text-gray-300 mb-3 mx-auto" />
          <p className="font-medium">No products found</p>
          <p className="text-sm mt-1">Try adjusting your search or add a new product.</p>
        </div>
      ) : view === 'grid' ? (
        /* ── Grid view ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const cat = catLabel(p.category);
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition group">
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  {p.imageURL ? (
                    <img src={p.imageURL} alt={p.productName} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PawPrint className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                  {p.discountPercent > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      -{p.discountPercent}%
                    </span>
                  )}
                  <span className="absolute top-2 right-2 bg-white/90 backdrop-blur text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {cat?.label}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{p.productName}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{p.location}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {p.discountPercent > 0 && (
                      <span className="text-xs text-gray-400 line-through">{formatCurrency(p.price)}</span>
                    )}
                    <span className="text-base font-bold text-green-700">{formatCurrency(p.discountedPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <StockBadge stock={p.stock} />
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-xs text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-lg font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="text-xs text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-lg font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Table view ── */
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Animal</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => {
                const cat = catLabel(p.category);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {p.imageURL
                            ? <img src={p.imageURL} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><PawPrint className="w-5 h-5 text-gray-300" /></div>
                          }
                        </div>
                        <span className="font-medium text-gray-900">{p.productName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{cat?.label}</td>
                    <td className="px-4 py-3 text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{p.location}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-green-700">{formatCurrency(p.discountedPrice)}</span>
                        {p.discountPercent > 0 && (
                          <span className="text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">-{p.discountPercent}%</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3"><StockBadge stock={p.stock} /></td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openEdit(p)} className="text-blue-500 hover:bg-blue-50 px-2.5 py-1 rounded-lg text-xs font-medium transition">Edit</button>
                      <button onClick={() => setDeleteTarget(p)} className="text-red-500 hover:bg-red-50 px-2.5 py-1 rounded-lg text-xs font-medium transition">Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? `Edit: ${editing.productName}` : 'Add New Animal'}
        maxWidth="max-w-xl"
      >
        <ProductForm
          onSave={handleSave}
          existingImageURL={editing?.imageURL}
          defaultValues={editing ? {
            productName: editing.productName,
            category: editing.category,
            price: editing.price,
            discountPercent: editing.discountPercent,
            description: editing.description,
            stock: editing.stock,
            location: editing.location,
          } : undefined}
        />
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Product">
        <div className="text-center py-2">
          <Trash2 className="w-12 h-12 text-red-400 mb-3 mx-auto" />
          <p className="text-gray-700 font-medium mb-1">Delete "{deleteTarget?.productName}"?</p>
          <p className="text-sm text-gray-400 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>Yes, Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductManagement;
