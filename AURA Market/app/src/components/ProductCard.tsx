import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import type { Product } from '../types/product.types';
import { formatCurrency } from '../utils/formatCurrency';
import { useCartStore } from '../stores/cartStore';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
}

const DELIVERY_LABELS = ['Tomorrow', 'Day After Tomorrow', 'Within 3 Days'];

function deliveryLabel(id: string) {
  return DELIVERY_LABELS[id.charCodeAt(0) % 3];
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore(s => s.addItem);
  const delivery = deliveryLabel(product.id);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem({ productId: product.id, quantity: 1, product });
    toast.success(`${product.productName} added!`);
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded overflow-hidden hover:shadow-lg transition-shadow flex flex-col border border-gray-200"
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden bg-gray-50" style={{ paddingBottom: '133%' }}>
        <img
          src={product.imageURL}
          alt={product.productName}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Discount badge */}
        {product.discountPercent > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded leading-none">
            -{product.discountPercent}%
          </span>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
            <span className="text-white text-xs font-semibold bg-black/60 px-2 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}

        {/* Bottom chips */}
        {product.discountPercent > 0 && product.stock > 0 && (
          <div className="absolute bottom-1.5 left-1.5 flex gap-1 flex-wrap">
            <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              ⭐ Best Price
            </span>
            <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              Sale
            </span>
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="p-2 flex flex-col gap-1 flex-1">

        {/* Price row */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-[15px] font-extrabold text-gray-900 leading-none">
            {formatCurrency(product.discountedPrice)}
          </span>
          {product.discountPercent > 0 && (
            <span className="text-[11px] text-gray-400 line-through leading-none">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.ratingCount ? (
          <div className="flex items-center gap-0.5">
            <StarIcon className="w-3 h-3 text-yellow-400 flex-shrink-0" />
            <span className="text-[11px] text-gray-500 leading-none">
              {product.ratingAvg?.toFixed(1)} · {product.ratingCount}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-0.5">
            <StarIcon className="w-3 h-3 text-gray-200 flex-shrink-0" />
            <span className="text-[11px] text-gray-400 leading-none">No reviews</span>
          </div>
        )}

        {/* Name */}
        <p className="text-[12px] text-gray-800 leading-snug line-clamp-2 font-medium flex-1">
          {product.productName}
        </p>

        {/* Delivery */}
        <p className="text-[11px] font-semibold text-green-600 leading-none">
          {delivery}
        </p>

        {/* Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="mt-1 w-full flex items-center justify-center gap-1.5 py-2 bg-orange-500 text-white text-[12px] font-bold rounded hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Add to cart"
        >
          <ShoppingCartIcon className="w-3.5 h-3.5 flex-shrink-0" />
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
