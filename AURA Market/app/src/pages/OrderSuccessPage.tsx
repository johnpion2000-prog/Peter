import { useSearchParams, Link } from 'react-router-dom';

export default function OrderSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-7xl mb-6">🎉</p>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Order Placed!</h1>
        <p className="text-gray-500 mb-2">Thank you for your purchase.</p>
        {orderId && (
          <p className="text-xs text-gray-400 font-mono bg-gray-100 rounded-lg px-3 py-2 mb-6">
            Order ID: {orderId}
          </p>
        )}
        <Link to="/products" className="inline-block bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
