import React, { useState, useEffect } from 'react';
import { getDocs, addDoc, deleteDoc, setDoc, doc, query, where, writeBatch } from 'firebase/firestore';
import {
  Layers, Leaf, PawPrint, Pill, Package, ChevronRight,
  Plus, Trash2, RefreshCw, CheckCircle2,
} from 'lucide-react';
import { categoriesCol, productsCol, db } from '../../firebase/collections';
import { useUIStore } from '../../stores/uiStore';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { ProductCategory } from '../../types/product.types';
import Spinner from '../../components/ui/Spinner';

/* ── Canonical category definitions (mirrors the home page) ── */
const CANONICAL: {
  value: ProductCategory;
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  textColor: string;
  icon: React.ElementType;
  subcategories: string[];
}[] = [
  {
    value: 'livestock',
    label: 'Livestock Products',
    description: 'Cattle, goats, pigs, poultry and their by-products.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    textColor: 'text-orange-700',
    icon: Layers,
    subcategories: ['Cattle (Milk, Meat, Butter)', 'Goats (Meat & Milk)', 'Pig (Pork)', 'Poultry (Eggs)'],
  },
  {
    value: 'feed',
    label: 'Animal Feed',
    description: 'Concentrates, supplements, and organic feed products.',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-100',
    textColor: 'text-yellow-700',
    icon: Leaf,
    subcategories: ['Concentrates', 'Supplements', 'Organic Feed', 'Hay & Silage'],
  },
  {
    value: 'pet',
    label: 'Pet Products',
    description: 'Food, toys, and accessories for dogs, cats, and other pets.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    textColor: 'text-purple-700',
    icon: PawPrint,
    subcategories: ['Dog & Cat Food', 'Toys', 'Accessories', 'Grooming Supplies'],
  },
  {
    value: 'health',
    label: 'Animal Health',
    description: 'Vaccines, medicines, and health supplements for all animals.',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-100',
    textColor: 'text-green-700',
    icon: Pill,
    subcategories: ['Vaccines', 'Medicines', 'Supplements', 'Dewormers'],
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Miscellaneous animal products not covered above.',
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    textColor: 'text-gray-700',
    icon: Package,
    subcategories: ['Equipment', 'Tools', 'Farm Supplies'],
  },
];

interface Cat { id: string; name: string; icon: string; slug: string; }

const CategoryManagement: React.FC = () => {
  const showToast = useUIStore((s) => s.showToast);
  const [firestoreCats, setFirestoreCats] = useState<Cat[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customIcon, setCustomIcon] = useState('');
  const [adding, setAdding] = useState(false);

  // ── Migration state ──
  const [legacyProducts, setLegacyProducts] = useState<{ id: string; name: string; category: string }[] | null>(null);
  const [scanning, setScanning] = useState(false);
  const [migrating, setMigrating] = useState(false);

  /* Old category → new category mapping */
  const MIGRATE_MAP: Record<string, ProductCategory> = {
    cattle: 'livestock', goat: 'livestock', sheep: 'livestock', pig: 'livestock', poultry: 'livestock',
    dog: 'pet', cat: 'pet', bird: 'pet', rabbit: 'pet', fish: 'pet',
  };
  const VALID_CATEGORIES = new Set<string>(['livestock', 'feed', 'pet', 'health', 'other']);

  const scanLegacy = async () => {
    setScanning(true);
    try {
      const snap = await getDocs(productsCol);
      const legacy = snap.docs
        .map((d) => ({ id: d.id, name: (d.data() as any).name ?? 'Unnamed', category: (d.data() as any).category ?? '' }))
        .filter((p) => !VALID_CATEGORIES.has(p.category));
      setLegacyProducts(legacy);
      if (legacy.length === 0) showToast('All products already have valid categories!', 'success');
    } catch {
      showToast('Scan failed', 'error');
    } finally {
      setScanning(false);
    }
  };

  const migrateAll = async () => {
    if (!legacyProducts?.length) return;
    setMigrating(true);
    try {
      const batch = writeBatch(db);
      legacyProducts.forEach(({ id, category }) => {
        const newCat: ProductCategory = MIGRATE_MAP[category] ?? 'other';
        batch.update(doc(db, 'products', id), { category: newCat });
      });
      await batch.commit();
      showToast(`Migrated ${legacyProducts.length} product(s) to correct categories!`, 'success');
      setLegacyProducts(null);
      loadData();
    } catch {
      showToast('Migration failed', 'error');
    } finally {
      setMigrating(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    const [catSnap, prodSnap] = await Promise.all([
      getDocs(categoriesCol),
      getDocs(productsCol),
    ]);
    setFirestoreCats(catSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Cat));
    const countMap: Record<string, number> = {};
    prodSnap.docs.forEach((d) => {
      const cat = (d.data() as any).category as string;
      countMap[cat] = (countMap[cat] ?? 0) + 1;
    });
    setCounts(countMap);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  /* Seed all 5 canonical categories to Firestore (upsert by slug) */
  const seedAll = async () => {
    setSeeding(true);
    try {
      await Promise.all(
        CANONICAL.map((c) =>
          setDoc(
            doc(db, 'categories', c.value),
            { name: c.label, icon: c.value, slug: c.value, description: c.description },
          )
        )
      );
      showToast('All categories saved to Firestore!', 'success');
      loadData();
    } catch {
      showToast('Failed to seed categories', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const removeFirestore = async (id: string) => {
    if (!confirm('Delete this category from Firestore?')) return;
    await deleteDoc(doc(db, 'categories', id));
    showToast('Category deleted', 'success');
    loadData();
  };

  const addCustom = async () => {
    if (!customName.trim()) return;
    setAdding(true);
    try {
      await addDoc(categoriesCol, {
        name: customName.trim(),
        icon: customIcon.trim() || '📦',
        slug: customName.trim().toLowerCase().replace(/\s+/g, '-'),
      } as any);
      showToast('Custom category added', 'success');
      setCustomName(''); setCustomIcon('');
      loadData();
    } catch {
      showToast('Failed to add category', 'error');
    } finally {
      setAdding(false);
    }
  };

  const seededSlugs = new Set(firestoreCats.map((c) => c.slug));

  return (
    <div className="p-4 sm:p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Product Categories</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage the categories shown on Browse by Category and product listings.</p>
        </div>
        <button
          onClick={seedAll}
          disabled={seeding}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
        >
          {seeding
            ? <><RefreshCw className="w-4 h-4 animate-spin" />Saving…</>
            : <><CheckCircle2 className="w-4 h-4" />Save All to Firestore</>
          }
        </button>
      </div>

      {/* ── Canonical Category Cards ── */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
            {CANONICAL.map((cat) => {
              const Icon = cat.icon;
              const count = counts[cat.value] ?? 0;
              const inFirestore = seededSlugs.has(cat.value);
              return (
                <div
                  key={cat.value}
                  className={`${cat.bg} border ${cat.border} rounded-2xl p-5 flex flex-col gap-3 relative`}
                >
                  {/* Firestore badge */}
                  <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full ${inFirestore ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {inFirestore ? 'In Firestore' : 'Not seeded'}
                  </span>

                  {/* Icon + title */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${cat.bg} border ${cat.border} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">{cat.label}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                    </div>
                  </div>

                  {/* Subcategories */}
                  <ul className="space-y-1">
                    {cat.subcategories.map((sub) => (
                      <li key={sub} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <ChevronRight className={`w-3 h-3 flex-shrink-0 ${cat.color}`} />
                        {sub}
                      </li>
                    ))}
                  </ul>

                  {/* Footer */}
                  <div className={`mt-auto flex items-center justify-between pt-2 border-t ${cat.border}`}>
                    <span className={`text-xs font-semibold ${cat.textColor}`}>
                      {count} product{count !== 1 ? 's' : ''}
                    </span>
                    <a
                      href={`/products?category=${cat.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs font-semibold ${cat.color} hover:underline flex items-center gap-0.5`}
                    >
                      Browse <ChevronRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Firestore Categories List ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Firestore Categories ({firestoreCats.length})</h2>
            {firestoreCats.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                No categories in Firestore yet — click <strong>Save All to Firestore</strong> above.
              </p>
            ) : (
              <div className="divide-y divide-gray-50">
                {firestoreCats.map((c) => {
                  const canonical = CANONICAL.find((x) => x.value === c.slug);
                  const Icon = canonical?.icon ?? Package;
                  return (
                    <div key={c.id} className="flex items-center justify-between py-2.5 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${canonical?.bg ?? 'bg-gray-100'}`}>
                          <Icon className={`w-4 h-4 ${canonical?.color ?? 'text-gray-500'}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                          <p className="text-xs text-gray-400 font-mono">slug: {c.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-gray-400">{counts[c.slug] ?? 0} products</span>
                        <button
                          onClick={() => removeFirestore(c.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Remove from Firestore"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Migrate Legacy Products ── */}
          <div className="bg-white rounded-2xl border border-amber-100 p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-700">Fix Legacy Product Categories</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Products added before the category rename may still have old values (cattle, dog, etc.). Scan and auto-fix them.
                </p>
              </div>
              <button
                onClick={scanLegacy}
                disabled={scanning}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition flex-shrink-0"
              >
                {scanning ? <><RefreshCw className="w-4 h-4 animate-spin" />Scanning…</> : 'Scan Products'}
              </button>
            </div>

            {legacyProducts !== null && (
              legacyProducts.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl px-4 py-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  All products have valid categories — nothing to fix!
                </div>
              ) : (
                <>
                  <div className="text-sm text-amber-800 bg-amber-50 rounded-xl px-4 py-3 mb-3">
                    Found <strong>{legacyProducts.length}</strong> product(s) with legacy categories. They will be mapped:
                    <span className="font-mono text-xs ml-1">cattle/goat/sheep/pig → livestock · dog/cat/bird/rabbit → pet · unknown → other</span>
                  </div>
                  <div className="divide-y divide-gray-50 mb-3 max-h-40 overflow-y-auto">
                    {legacyProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between py-2 text-xs">
                        <span className="text-gray-700 font-medium truncate max-w-[60%]">{p.name}</span>
                        <span className="flex items-center gap-1.5">
                          <span className="font-mono bg-red-50 text-red-700 px-1.5 py-0.5 rounded">{p.category || '(empty)'}</span>
                          <ChevronRight className="w-3 h-3 text-gray-400" />
                          <span className="font-mono bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{MIGRATE_MAP[p.category] ?? 'other'}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={migrateAll}
                    disabled={migrating}
                    className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                  >
                    {migrating ? <><RefreshCw className="w-4 h-4 animate-spin" />Migrating…</> : `Fix All ${legacyProducts.length} Products`}
                  </button>
                </>
              )
            )}
          </div>

          {/* ── Add Custom Category ── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Add Custom Category</h2>
            <div className="flex gap-2 flex-wrap">
              <input
                value={customIcon}
                onChange={(e) => setCustomIcon(e.target.value)}
                placeholder="Emoji icon"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Category name"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyDown={(e) => e.key === 'Enter' && addCustom()}
              />
              <button
                onClick={addCustom}
                disabled={adding || !customName.trim()}
                className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                {adding ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryManagement;
