import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchFeaturedProducts } from '../services/productService';
import type { Product } from '../types/product.types';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/ui/Spinner';
import { CATEGORIES } from '../config/constants';

const BANNERS = [
  {
    gradient: 'from-orange-500 to-amber-400',
    badge: 'Up to 80% OFF',
    title: 'Everything for Kids',
    sub: 'Top brands · Huge discounts · Fast delivery',
    cta: 'Shop Now',
    link: '/products?category=fashion',
  },
  {
    gradient: 'from-orange-600 to-red-500',
    badge: 'Flash Sale',
    title: 'Electronics & Tech',
    sub: 'Latest gadgets at unbeatable prices',
    cta: 'Explore Deals',
    link: '/products?category=electronics',
  },
  {
    gradient: 'from-amber-400 to-yellow-300',
    badge: 'New Season',
    title: 'Fashion & Style',
    sub: 'Trending looks · All sizes in stock',
    cta: 'Discover',
    link: '/products?category=shoes',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProducts(24).then(p => { setProducts(p); setLoading(false); });
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4500);
    return () => clearInterval(t);
  }, []);

  const banner = BANNERS[bannerIdx];

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* ── Hero Banner ── */}
      <div className={`bg-gradient-to-r ${banner.gradient} transition-all duration-700`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <span className="inline-block bg-white/30 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              {banner.badge}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              {banner.title}
            </h1>
            <p className="text-white/85 mt-2 text-sm sm:text-base">{banner.sub}</p>
            <Link
              to={banner.link}
              className="mt-5 inline-block bg-white text-orange-600 font-bold px-7 py-2.5 rounded-xl hover:bg-orange-50 transition-colors shadow-md text-sm sm:text-base"
            >
              {banner.cta}
            </Link>
          </div>
          {/* Dots */}
          <div className="flex sm:flex-col gap-2">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIdx(i)}
                className={`rounded-full transition-all duration-300 ${i === bannerIdx ? 'bg-white w-6 h-2 sm:w-2 sm:h-6' : 'bg-white/40 w-2 h-2'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Categories Row ── */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
            <Link
              to="/products"
              className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <span className="text-xl sm:text-2xl">🛍️</span>
              <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">All</span>
            </Link>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.value}
                to={`/products?category=${cat.value}`}
                className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <span className="text-xl sm:text-2xl">{cat.emoji}</span>
                <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Deal Chips ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {['🔥 Hot Deals', '⚡ Flash Sale', '🆕 New Arrivals', '⭐ Top Rated', '💰 Under $20', '🎁 Gifts'].map(chip => (
            <button
              key={chip}
              onClick={() => navigate('/products')}
              className="flex-shrink-0 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-orange-100 hover:text-orange-700 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ── Products Grid ── */}
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Today's Deals</h2>
          <Link to="/products" className="text-sm font-semibold text-orange-500 hover:text-orange-600">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Spinner size="lg" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-sm">No products yet. Check back soon!</p>
            <Link to="/signup" className="mt-4 inline-block text-sm font-semibold text-orange-500 hover:underline">
              Sign up as a seller →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
