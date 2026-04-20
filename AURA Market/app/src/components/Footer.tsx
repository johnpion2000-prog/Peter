import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="text-white font-bold text-xl flex items-center gap-2">
              ✨ AURA Market
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Your one-stop marketplace for fashion, electronics, cars, and much more.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?category=fashion" className="hover:text-white transition-colors">Fashion</Link></li>
              <li><Link to="/products?category=electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=automotive" className="hover:text-white transition-colors">Automotive</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/signin" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-800 pt-6 text-sm text-center">
          © {new Date().getFullYear()} AURA Market. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
