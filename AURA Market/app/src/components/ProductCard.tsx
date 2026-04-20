import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import type { Product } from '../types/product.types';
import { formatCurrency } from '../utils/formatCurrency';
import { useCartStore } from '../stores/cartStore';
import Badge from './ui/Badge';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore(s => s.addItem);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem({ productId: product.id, quantity: 1, product });
    toast.success(`${product.productName} added to cart!`);
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.imageURL}
          alt={product.productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{product.discountPercent}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <Badge label={product.category} color="orange" />
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors">
          {product.productName}
        </h3>

        {/* Price */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">
              {formatCurrency(product.discountedPrice)}
            </span>
            {product.discountPercent > 0 && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            <ShoppingCartIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
