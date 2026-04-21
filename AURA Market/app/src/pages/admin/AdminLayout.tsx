import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import {
  HomeIcon, CubeIcon, ShoppingBagIcon, UsersIcon, TagIcon,
  BuildingOfficeIcon, Squares2X2Icon, Bars3Icon, XMarkIcon, ArrowLeftOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const superAdminLinks = [
  { to: '/admin',                   label: 'Dashboard',    icon: HomeIcon },
  { to: '/admin/products',          label: 'Products',     icon: CubeIcon },
  { to: '/admin/categories',        label: 'Categories',   icon: Squares2X2Icon },
  { to: '/admin/orders',            label: 'Orders',       icon: ShoppingBagIcon },
  { to: '/admin/users',             label: 'Users',        icon: UsersIcon },
  { to: '/admin/discounts',         label: 'Discounts',    icon: TagIcon },
  { to: '/admin/companies',         label: 'Companies',    icon: BuildingOfficeIcon },
];

const companyAdminLinks = [
  { to: '/admin',                 label: 'Dashboard',   icon: HomeIcon },
  { to: '/admin/products',        label: 'My Products',  icon: CubeIcon },
  { to: '/admin/orders',          label: 'My Orders',    icon: ShoppingBagIcon },
  { to: '/admin/company-profile', label: 'My Profile',   icon: UserCircleIcon },
];

export default function AdminLayout() {
  const { appUser, logout } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = appUser?.role === 'superAdmin' ? superAdminLinks : companyAdminLinks;

  async function handleLogout() {
    await logout();
    toast.success('Signed out');
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-orange-50 text-orange-600'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 px-4 py-5 font-bold text-orange-500 text-lg border-b border-gray-100">
        ✨ AURA Market
      </Link>

      {/* Role badge */}
      <div className="px-4 py-3 bg-orange-50 border-b border-orange-100">
        <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">
          {appUser?.role === 'superAdmin' ? '👑 Super Admin' : '🏢 Company Admin'}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{appUser?.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/admin'} className={linkClass}>
            <l.icon className="w-5 h-5" />
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 bg-white border-r border-gray-200 shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-60 bg-white z-50 shadow-xl">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-14 flex items-center gap-4 shrink-0">
          <button
            className="lg:hidden text-gray-500 p-1"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
          <div className="flex-1" />
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">← Back to Store</Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
