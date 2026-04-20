import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts } from '../services/productService';
import type { Product } from '../types/product.types';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/ui/Spinner';
import { CATEGORIES } from '../config/constants';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts(8).then(p => { setProducts(p); setLoading(false); });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 to-amber-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Premium Products,<br />
            <span className="text-orange-500">Every Brand You Love</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
            Discover fashion, electronics, cars, and more from trusted vendors — all in one place.
          </p>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link
              to="/products"
              className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow"
            >
              Shop Now
            </Link>
            <Link
              to="/signup"
              className="bg-white text-gray-800 border border-gray-200 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.value}
              to={`/products?category=${cat.value}`}
              className="flex flex-col items-center gap-2 p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition"
            >
              <span className="text-4xl">{cat.emoji}</span>
              <span className="text-sm font-medium text-gray-700 capitalize">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-sm font-medium text-orange-500 hover:text-orange-600">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No products yet. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
