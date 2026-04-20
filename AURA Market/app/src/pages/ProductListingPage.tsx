import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../services/productService';
import type { Product } from '../types/product.types';
import type { ProductCategory } from '../types/product.types';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/ui/Spinner';
import { CATEGORIES } from '../config/constants';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [all, setAll] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const activeCategory = searchParams.get('category') as ProductCategory | null;

  useEffect(() => {
    fetchProducts().then(p => { setAll(p); setLoading(false); });
  }, []);

  const filtered = all.filter(p => {
    const matchesCat = !activeCategory || p.category === activeCategory;
    const matchesSearch = !search || p.productName.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  function setCategory(cat: ProductCategory | null) {
    const next = new URLSearchParams(searchParams);
    if (cat) next.set('category', cat);
    else next.delete('category');
    setSearchParams(next);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Products</h1>

      {/* Filters top bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap items-center">
          <FunnelIcon className="w-4 h-4 text-gray-400 hidden sm:block" />
          <button
            onClick={() => setCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !activeCategory ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === c.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No products found.</div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
