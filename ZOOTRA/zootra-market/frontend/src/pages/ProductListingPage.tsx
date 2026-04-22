import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCartStore } from '../stores/cartStore';
import { formatCurrency } from '../utils/formatCurrency';
import { PRODUCT_CATEGORIES } from '../utils/constants';
import { ProductCategory } from '../types/product.types';
import Spinner from '../components/ui/Spinner';

const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as ProductCategory | null;
  const { products, loading, setFilters } = useProducts(categoryParam ?? undefined);
  const addItem = useCartStore((s) => s.addItem);
  const [search, setSearch] = useState('');

  const filtered = search
    ? products.filter((p) => p.productName.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search animals..."
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSearchParams({})}
              className={`px-3 py-1.5 text-xs rounded-full border font-medium transition ${!categoryParam ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-600 hover:border-green-500'}`}>
              All
            </button>
            {PRODUCT_CATEGORIES.map((cat) => (
              <button key={cat.value} onClick={() => setSearchParams({ category: cat.value })}
                className={`px-3 py-1.5 text-xs rounded-full border font-medium transition ${categoryParam === cat.value ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-600 hover:border-green-500'}`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No animals found. Try a different category or search term.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                <Link to={`/products/${product.id}`}>
                  <div className="relative">
                    <img src={product.imageURL || '/placeholder.jpg'} alt={product.productName} className="w-full h-44 object-cover" />
                    {product.discountPercent > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">-{product.discountPercent}%</span>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-gray-700 font-semibold text-sm px-3 py-1 rounded">Sold Out</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <span className="text-xs text-green-600 font-medium capitalize">{product.category}</span>
                  <h3 className="font-semibold text-gray-800 text-sm mt-0.5 truncate">{product.productName}</h3>
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" />{product.location}</p>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="font-bold text-green-700">{formatCurrency(product.discountedPrice)}</span>
                    {product.discountPercent > 0 && <span className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</span>}
                  </div>
                  <button onClick={() => addItem(product)} disabled={product.stock === 0}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-xs font-medium py-1.5 rounded-lg transition">
                    {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListingPage;
