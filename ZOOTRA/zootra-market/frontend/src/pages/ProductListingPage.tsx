import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Layers, Leaf, PawPrint, Pill, Package, Search, X } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCartStore } from '../stores/cartStore';
import { formatCurrency } from '../utils/formatCurrency';
import { PRODUCT_CATEGORIES } from '../utils/constants';
import { ProductCategory } from '../types/product.types';
import Spinner from '../components/ui/Spinner';
import type { LucideIcon } from 'lucide-react';

/* ── Category metadata ── */
const CATEGORY_META: Record<string, {
  label: string; description: string;
  icon: LucideIcon; iconColor: string; bg: string; border: string; badgeBg: string; badgeText: string;
}> = {
  livestock: {
    label: 'Livestock Products', description: 'Cattle, goats, pigs, poultry and their by-products.',
    icon: Layers, iconColor: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200',
    badgeBg: 'bg-orange-100', badgeText: 'text-orange-700',
  },
  feed: {
    label: 'Animal Feed', description: 'Concentrates, supplements, and organic feed products.',
    icon: Leaf, iconColor: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200',
    badgeBg: 'bg-yellow-100', badgeText: 'text-yellow-700',
  },
  pet: {
    label: 'Pet Products', description: 'Food, toys, and accessories for dogs, cats, and other pets.',
    icon: PawPrint, iconColor: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200',
    badgeBg: 'bg-purple-100', badgeText: 'text-purple-700',
  },
  health: {
    label: 'Animal Health', description: 'Vaccines, medicines, and health supplements for all animals.',
    icon: Pill, iconColor: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200',
    badgeBg: 'bg-green-100', badgeText: 'text-green-700',
  },
  other: {
    label: 'Other', description: 'Miscellaneous animal products not covered in other categories.',
    icon: Package, iconColor: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200',
    badgeBg: 'bg-gray-100', badgeText: 'text-gray-700',
  },
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  livestock: Layers, feed: Leaf, pet: PawPrint, health: Pill, other: Package,
};

const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as ProductCategory | null;
  const { products, loading } = useProducts(categoryParam ?? undefined);
  const addItem = useCartStore((s) => s.addItem);
  const [search, setSearch] = useState('');

  const filtered = search
    ? products.filter((p) => p.productName.toLowerCase().includes(search.toLowerCase()))
    : products;

  const activeMeta = categoryParam ? CATEGORY_META[categoryParam] : null;
  const ActiveIcon = activeMeta?.icon ?? null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Category Header Banner (shown when a category is selected) ── */}
      {activeMeta && ActiveIcon && (
        <div className={`${activeMeta.bg} border-b ${activeMeta.border} px-4 py-5`}>
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${activeMeta.badgeBg} flex items-center justify-center flex-shrink-0`}>
                <ActiveIcon className={`w-6 h-6 ${activeMeta.iconColor}`} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{activeMeta.label}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{activeMeta.description}</p>
              </div>
            </div>
            <button
              onClick={() => setSearchParams({})}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" /> Clear filter
            </button>
          </div>
        </div>
      )}

      {/* ── Top filter bar ── */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
          {/* Search */}
          <div className="relative w-full sm:w-72 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => setSearchParams({})}
              className={`px-3 py-1.5 text-xs rounded-full border font-semibold transition flex items-center gap-1.5 ${
                !categoryParam ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-700'
              }`}
            >
              All Products
            </button>
            {PRODUCT_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.value] ?? Package;
              const meta = CATEGORY_META[cat.value];
              const isActive = categoryParam === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSearchParams({ category: cat.value })}
                  className={`px-3 py-1.5 text-xs rounded-full border font-semibold transition flex items-center gap-1.5 ${
                    isActive
                      ? `${meta?.badgeBg ?? 'bg-green-100'} ${meta?.badgeText ?? 'text-green-700'} ${meta?.border ?? 'border-green-300'} border`
                      : 'border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? (meta?.iconColor ?? '') : ''}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-4">
            {filtered.length === 0
              ? 'No products found'
              : <><span className="font-semibold text-gray-800">{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}{categoryParam && activeMeta ? ` in ${activeMeta.label}` : ''}</>
            }
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            {activeMeta && ActiveIcon && (
              <div className={`w-16 h-16 ${activeMeta.badgeBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <ActiveIcon className={`w-8 h-8 ${activeMeta.iconColor}`} />
              </div>
            )}
            <p className="font-semibold text-gray-600 text-lg">
              No products in {activeMeta?.label ?? 'this category'} yet
            </p>
            <p className="text-sm text-gray-400 mt-1">Check back soon or browse another category.</p>
            <button
              onClick={() => setSearchParams({})}
              className="mt-5 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
            >
              View All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => {
              const catMeta = CATEGORY_META[product.category];
              const CatIcon = CATEGORY_ICONS[product.category] ?? Package;
              return (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                  <Link to={`/products/${product.id}`}>
                    <div className="relative">
                      <img src={product.imageURL || '/placeholder.jpg'} alt={product.productName} className="w-full h-44 object-cover group-hover:scale-105 transition duration-300" />
                      {product.discountPercent > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{product.discountPercent}%</span>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white text-gray-700 font-semibold text-sm px-3 py-1 rounded-full">Sold Out</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-3">
                    {/* Category badge */}
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${catMeta?.badgeBg ?? 'bg-gray-100'} ${catMeta?.badgeText ?? 'text-gray-600'}`}>
                      <CatIcon className={`w-3 h-3 ${catMeta?.iconColor ?? ''}`} />
                      {catMeta?.label ?? product.category}
                    </span>
                    <h3 className="font-semibold text-gray-800 text-sm mt-1.5 truncate">{product.productName}</h3>
                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />{product.location}
                    </p>
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="font-bold text-green-700">{formatCurrency(product.discountedPrice)}</span>
                      {product.discountPercent > 0 && <span className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</span>}
                    </div>
                    <button
                      onClick={() => addItem(product)}
                      disabled={product.stock === 0}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold py-2 rounded-xl transition"
                    >
                      {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListingPage;

