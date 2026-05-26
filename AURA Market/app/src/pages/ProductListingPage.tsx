import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../services/productService';
import type { Product } from '../types/product.types';
import type { ProductCategory } from '../types/product.types';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/ui/Spinner';

export default function ProductListingPage() {
  const [searchParams] = useSearchParams();
  const [all, setAll] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const activeCategory = searchParams.get('category') as ProductCategory | null;
  const search = searchParams.get('q') ?? '';

  useEffect(() => {
    fetchProducts().then(p => { setAll(p); setLoading(false); });
  }, []);

  const filtered = all.filter(p => {
    const matchesCat = !activeCategory || p.category === activeCategory;
    const matchesSearch = !search || p.productName.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">All Products</h1>

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
