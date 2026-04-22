import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Leaf, Menu, X, LayoutDashboard, Package, CalendarCheck, LogOut, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCartStore } from '../../stores/cartStore';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const totalItems = useCartStore((s) => s.totalItems());
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);
  const handleLogout = async () => { close(); await logout(); navigate('/login'); };

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" onClick={close} className="flex items-center gap-2 text-xl font-bold text-green-700">
            <Leaf className="w-5 h-5" />
            ZOOTRA
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden sm:flex items-center gap-4">
            <NavLink to="/products" className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-600'}`}>
              Browse
            </NavLink>
            <Link to="/cart" className="relative text-gray-600 hover:text-green-600">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{totalItems}</span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'admin' && <Link to="/admin" className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded font-medium">Admin</Link>}
                <Link to="/orders" className="text-sm text-gray-600 hover:text-green-600">Orders</Link>
                <Link to="/bookings" className="text-sm text-gray-600 hover:text-green-600">Book a Service</Link>
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">Sign out</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-gray-600 hover:text-green-600 font-medium">Sign In</Link>
                <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition">Register</Link>
              </div>
            )}
          </div>

          {/* ── Mobile right side: cart + burger ── */}
          <div className="flex sm:hidden items-center gap-3">
            <Link to="/cart" onClick={close} className="relative text-gray-600">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{totalItems}</span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="sm:hidden fixed inset-0 z-30 flex flex-col" onClick={close}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Panel — slides in from top below the navbar */}
          <div
            className="relative mt-14 bg-white shadow-xl rounded-b-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User info strip (if logged in) */}
            {user && (
              <div className="px-5 py-4 bg-green-50 border-b border-green-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(user.displayName?.[0] ?? user.email?.[0] ?? 'U').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate text-sm">{user.displayName || 'My Account'}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <nav className="py-2">
              {/* Browse */}
              <NavLink
                to="/products"
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center justify-between px-5 py-3.5 text-sm font-medium transition ${isActive ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                <span className="flex items-center gap-3"><Package className="w-4 h-4 text-green-500" /> Browse Animals</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </NavLink>

              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={close}
                      className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                    >
                      <span className="flex items-center gap-3"><LayoutDashboard className="w-4 h-4" /> Admin Dashboard</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    onClick={close}
                    className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <span className="flex items-center gap-3"><ShoppingCart className="w-4 h-4 text-green-500" /> My Orders</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>
                  <Link
                    to="/bookings"
                    onClick={close}
                    className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <span className="flex items-center gap-3"><CalendarCheck className="w-4 h-4 text-green-500" /> Book a Service</span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>
                  <div className="mx-5 my-1 border-t border-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-red-500 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <div className="px-5 py-3">
                    <Link
                      to="/login"
                      onClick={close}
                      className="flex items-center justify-between text-sm font-medium text-gray-700 py-2"
                    >
                      <span className="flex items-center gap-3"><User className="w-4 h-4 text-green-500" /> Sign In</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
                  </div>
                  <div className="px-5 pb-4">
                    <Link
                      to="/register"
                      onClick={close}
                      className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition text-sm"
                    >
                      Create Account
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

