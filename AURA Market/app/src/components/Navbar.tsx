import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, Bars3Icon, XMarkIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuthContext } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { useCartStore } from '../stores/cartStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { currentUser, appUser, logout } = useAuthContext();
  const { lang, setLang, t } = useLang();
  const itemCount = useCartStore(s => s.itemCount());
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]       = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    toast.success(t('signOut'));
    navigate('/');
    setDropdownOpen(false);
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-gray-700 hover:text-orange-500'}`;

  const photoURL = appUser?.photoURL ?? currentUser?.photoURL;
  const initials = appUser?.displayName?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-orange-500 text-xl">
            ✨ AURA Market
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={linkClass}>{t('home')}</NavLink>
            <NavLink to="/products" className={linkClass}>{t('products')}</NavLink>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <div className="hidden md:flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden text-xs font-semibold">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1.5 transition-colors ${lang === 'en' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >EN</button>
              <button
                onClick={() => setLang('fr')}
                className={`px-2.5 py-1.5 transition-colors ${lang === 'fr' ? 'bg-orange-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >FR</button>
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
              <ShoppingCartIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User menu – desktop */}
            {currentUser ? (
              <div className="hidden md:block relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {photoURL ? (
                    <img src={photoURL} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-orange-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold border-2 border-orange-200">
                      {initials}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate font-medium">
                    {appUser?.displayName?.split(' ')[0] ?? 'Account'}
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{appUser?.displayName}</p>
                      <p className="text-xs text-gray-400 truncate">{appUser?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                      <UserCircleIcon className="w-4 h-4" />
                      {t('profile')}
                    </Link>
                    {(appUser?.role === 'superAdmin' || appUser?.role === 'companyAdmin') && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                        {t('dashboard')}
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        {t('signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/signin" className="text-sm font-medium text-gray-700 hover:text-orange-500">{t('signIn')}</Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {t('signUp')}
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 pb-4 flex flex-col gap-3">
          <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>{t('home')}</NavLink>
          <NavLink to="/products" className={linkClass} onClick={() => setMenuOpen(false)}>{t('products')}</NavLink>

          {/* Language toggle – mobile */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{t('language')}:</span>
            <div className="flex gap-1 border border-gray-200 rounded-lg overflow-hidden text-xs font-semibold">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 transition-colors ${lang === 'en' ? 'bg-orange-500 text-white' : 'text-gray-500'}`}
              >EN</button>
              <button
                onClick={() => setLang('fr')}
                className={`px-3 py-1.5 transition-colors ${lang === 'fr' ? 'bg-orange-500 text-white' : 'text-gray-500'}`}
              >FR</button>
            </div>
          </div>

          {currentUser ? (
            <>
              <Link to="/profile" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>{t('profile')}</Link>
              {(appUser?.role === 'superAdmin' || appUser?.role === 'companyAdmin') && (
                <Link to="/admin" className="text-sm font-medium text-orange-500" onClick={() => setMenuOpen(false)}>{t('dashboard')}</Link>
              )}
              <button onClick={handleLogout} className="text-sm text-left text-red-500">{t('signOut')}</button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>{t('signIn')}</Link>
              <Link to="/signup" className="text-sm font-medium text-orange-500" onClick={() => setMenuOpen(false)}>{t('signUp')}</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
