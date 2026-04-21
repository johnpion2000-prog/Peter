import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCompanyBySlug, getCompany } from '../services/companyService';
import { fetchProducts } from '../services/productService';
import type { Company } from '../types/company.types';
import type { Product } from '../types/product.types';
import type { ProductCategory } from '../types/product.types';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/ui/Spinner';
import { CATEGORIES } from '../config/constants';
import { MagnifyingGlassIcon, FunnelIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export default function CompanyStorefrontPage() {
  const { slug } = useParams<{ slug: string }>();

  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      try {
        // Try by slug first, then fall back to Firestore document ID
        let co = await getCompanyBySlug(slug);
        if (!co) co = await getCompany(slug);
        if (!co) { setNotFound(true); return; }
        setCompany(co);
        const prods = await fetchProducts(co.id);
        setProducts(prods);
      } catch (err) {
        console.error('Storefront load error:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !company) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <BuildingStorefrontIcon className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900">Store Not Found</h1>
        <p className="text-gray-500">This store link may be incorrect or the store no longer exists.</p>
        <Link to="/products" className="text-orange-500 font-medium hover:text-orange-600">
          ← Browse all products
        </Link>
      </div>
    );
  }

  if (company.status !== 'active') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <BuildingStorefrontIcon className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
        <p className="text-gray-500">This store is not currently available.</p>
        <Link to="/products" className="text-orange-500 font-medium hover:text-orange-600">
          ← Browse all products
        </Link>
      </div>
    );
  }

  const filtered = products.filter(p => {
    const matchesCat = !activeCategory || p.category === activeCategory;
    const matchesSearch = !search || p.productName.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Only show categories that this company actually has products in
  const usedCategories = CATEGORIES.filter(c => products.some(p => p.category === c.value));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Store header ── */}
      <div className="flex items-center gap-5 mb-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        {company.logoURL ? (
          <img
            src={company.logoURL}
            alt={company.name}
            className="w-20 h-20 rounded-2xl object-cover bg-gray-100 shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
            <BuildingStorefrontIcon className="w-10 h-10 text-orange-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{company.name}</h1>
          {company.description && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{company.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            {products.length} product{products.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search in ${company.name}…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        {usedCategories.length > 1 && (
          <div className="flex gap-2 flex-wrap items-center">
            <FunnelIcon className="w-4 h-4 text-gray-400 hidden sm:block" />
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !activeCategory ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {usedCategories.map(c => (
              <button
                key={c.value}
                onClick={() => setActiveCategory(c.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === c.value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Products grid ── */}
      {products.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <BuildingStorefrontIcon className="w-12 h-12 mx-auto mb-3 opacity-25" />
          <p className="font-medium">No products listed yet</p>
          <p className="text-sm mt-1">Check back soon!</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No products match your search.</div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
