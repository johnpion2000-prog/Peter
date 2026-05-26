import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useAuthContext } from '../context/AuthContext';
import { useCartStore } from '../stores/cartStore';
import { CATEGORIES } from '../config/constants';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { currentUser, appUser, logout } = useAuthContext();
  const itemCount = useCartStore(s => s.itemCount());
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  async function handleLogout() {
    await logout();
    toast.success('Signed out');
    navigate('/');
    setMenuOpen(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/products?q=${encodeURIComponent(query.trim())}`);
  }

  const photoURL = appUser?.photoURL ?? currentUser?.photoURL;
  const initials = appUser?.displayName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <header className="sticky top-0 z-40">
      {/* Main orange bar */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 shadow-md">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-5">
          <div className="flex items-center gap-2 sm:gap-3 h-14 sm:h-16">

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
              aria-label="Menu"
            >
              {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 text-white font-extrabold text-xl sm:text-2xl tracking-tight select-none">
              AURA
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 mx-1 sm:mx-3">
              <div className="flex items-center bg-white rounded-xl overflow-hidden h-10">
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search on AURA Market..."
                  className="flex-1 px-3 sm:px-4 text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400 min-w-0"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 px-3 sm:px-4 h-10 bg-orange-400 hover:bg-orange-500 transition-colors flex items-center justify-center"
                  aria-label="Search"
                >
                  <MagnifyingGlassIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>

            {/* Account – desktop */}
            {currentUser ? (
              <Link
                to="/profile"
                className="hidden sm:flex flex-col items-center gap-0.5 text-white hover:text-orange-100 transition-colors flex-shrink-0"
              >
                {photoURL ? (
                  <img src={photoURL} alt="avatar" className="w-7 h-7 rounded-full object-cover border-2 border-white/50" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold">
                    {initials}
                  </div>
                )}
                <span className="text-[10px] font-medium leading-none">
                  {appUser?.displayName?.split(' ')[0] ?? 'Account'}
                </span>
              </Link>
            ) : (
              <Link
                to="/signin"
                className="hidden sm:flex flex-col items-center gap-0.5 text-white hover:text-orange-100 transition-colors flex-shrink-0"
              >
                <UserIcon className="w-6 h-6" />
                <span className="text-[10px] font-medium leading-none">Sign In</span>
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex flex-col items-center gap-0.5 text-white hover:text-orange-100 transition-colors flex-shrink-0"
            >
              <div className="relative">
                <ShoppingCartIcon className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-gray-900 text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none hidden sm:block">Cart</span>
            </Link>

          </div>
        </div>
      </div>

      {/* Left side drawer + backdrop */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 left-0 z-50 h-full w-[270px] sm:w-[300px] bg-white shadow-2xl flex flex-col overflow-y-auto">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 h-14 bg-gradient-to-r from-orange-500 to-orange-600 flex-shrink-0">
              <span className="text-white font-extrabold text-lg tracking-tight">AURA</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Sale row */}
            <Link
              to="/products"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 bg-orange-600 text-white font-extrabold text-sm uppercase tracking-wide flex-shrink-0"
            >
              <span className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-sm flex-shrink-0">%</span>
              Sale
            </Link>

            {/* Category list */}
            <div className="flex-1 divide-y divide-gray-100">
              {[
                { emoji: '🛍️', label: 'All Products', to: '/products' },
                ...CATEGORIES.map(c => ({ emoji: c.emoji, label: c.label, to: `/products?category=${c.value}` })),
              ].map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                    {item.emoji}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Account section */}
            <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 flex flex-col gap-1 flex-shrink-0">
              {currentUser ? (
                <>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2.5 text-sm font-medium text-gray-800 hover:text-orange-500">
                    <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">👤</span>
                    My Profile
                  </Link>
                  {(appUser?.role === 'superAdmin' || appUser?.role === 'companyAdmin') && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 py-2.5 text-sm font-medium text-gray-800 hover:text-orange-500">
                      <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">⚙️</span>
                      Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex items-center gap-3 py-2.5 text-sm font-medium text-red-500 text-left">
                    <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-lg flex-shrink-0">🚪</span>
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/signin" onClick={() => setMenuOpen(false)} className="text-sm font-semibold text-orange-500 py-2 px-4 border border-orange-300 rounded-xl text-center hover:bg-orange-50 transition-colors">
                    Sign In
                  </Link>
                  <Link to="/signup" onClick={() => setMenuOpen(false)} className="text-sm font-bold bg-orange-500 text-white py-2.5 px-4 rounded-xl text-center hover:bg-orange-600 transition-colors">
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
