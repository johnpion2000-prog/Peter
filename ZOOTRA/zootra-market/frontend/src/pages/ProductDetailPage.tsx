import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { getProductById } from '../services/productService';
import { Product } from '../types/product.types';
import { useCartStore } from '../stores/cartStore';
import { formatCurrency } from '../utils/formatCurrency';
import Spinner from '../components/ui/Spinner';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!id) return;
    getProductById(id).then((p) => { setProduct(p); setLoading(false); });
  }, [id]);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!product) return <div className="text-center py-24 text-gray-500">Product not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-green-600 hover:underline text-sm mb-6 flex items-center gap-1">← Back</button>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img src={product.imageURL || '/placeholder.jpg'} alt={product.productName} className="w-full h-80 object-cover" />
            </div>
            <div className="p-6 md:w-1/2">
              {product.discountPercent > 0 && (
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">-{product.discountPercent}% OFF</span>
              )}
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{product.productName}</h1>
              <p className="text-sm text-green-600 font-medium capitalize mt-1">{product.category}</p>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{product.location}</p>
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-bold text-green-700">{formatCurrency(product.discountedPrice)}</span>
                {product.discountPercent > 0 && <span className="text-gray-400 line-through">{formatCurrency(product.price)}</span>}
              </div>
              <p className="text-gray-600 text-sm mt-4 leading-relaxed">{product.description}</p>
              <p className="text-sm text-gray-500 mt-2">Stock: <span className={product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>{product.stock > 0 ? `${product.stock} available` : 'Sold Out'}</span></p>
              {product.stock > 0 && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">−</button>
                    <span className="px-4 py-2 text-sm font-medium">{qty}</span>
                    <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">+</button>
                  </div>
                  <button onClick={() => { addItem(product, qty); navigate('/cart'); }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition">
                    Add to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
