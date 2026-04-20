import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../services/productService';
import type { Product } from '../types/product.types';
import { formatCurrency } from '../utils/formatCurrency';
import { useCartStore } from '../stores/cartStore';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore(s => s.addItem);

  useEffect(() => {
    if (!id) return;
    getProduct(id).then(p => {
      setProduct(p);
      setLoading(false);
    });
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addItem({ productId: product.id, quantity: qty, product });
    toast.success(`${product.productName} added to cart!`);
  }

  function handleBuyNow() {
    handleAddToCart();
    navigate('/cart');
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>;
  if (!product) return (
    <div className="text-center py-32 text-gray-500">
      <p className="text-xl font-semibold">Product not found</p>
      <Button variant="ghost" className="mt-4" onClick={() => navigate('/products')}>← Back</Button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-900 mb-6">← Back</button>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Image */}
        <div className="md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-gray-50 shadow">
          <img src={product.imageURL} alt={product.productName} className="w-full h-full object-cover" />
        </div>

        {/* Details */}
        <div className="md:w-1/2 flex flex-col gap-4">
          <Badge label={product.category} color="orange" />
          <h1 className="text-3xl font-extrabold text-gray-900">{product.productName}</h1>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(product.discountedPrice)}</span>
            {product.discountPercent > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
                <span className="bg-orange-100 text-orange-600 text-sm font-bold px-2 py-0.5 rounded-full">
                  -{product.discountPercent}%
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Stock */}
          <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `✓ In stock (${product.stock} available)` : '✗ Out of stock'}
          </p>

          {/* Qty */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
              >−</button>
              <span className="px-4 py-2 font-medium border-x border-gray-300">{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
              >+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              Add to Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              size="lg"
              className="flex-1"
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
