import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderOpen, ShoppingBag, Users, Tag,
  Leaf, Eye, LogOut, CalendarCheck, Menu, X, MessageSquare, type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AdminNotificationBell from '../../components/admin/AdminNotificationBell';

const navItems: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/products',   label: 'Animals',    icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { to: '/admin/orders',     label: 'Orders',     icon: ShoppingBag },
  { to: '/admin/users',      label: 'Users',      icon: Users },
  { to: '/admin/company-users', label: 'Company Users', icon: Users },
  { to: '/admin/company-management', label: 'Company Management', icon: Users },
  { to: '/admin/discounts',  label: 'Discounts',  icon: Tag },
  { to: '/admin/bookings',   label: 'Bookings',   icon: CalendarCheck },
  { to: '/admin/reviews',    label: 'Reviews',    icon: MessageSquare },
];

/* shared nav-link style builder */
const linkCls = (isActive: boolean, compact = false) =>
  `flex items-center gap-3 rounded-xl font-medium transition
   ${compact ? 'px-3 py-2.5' : 'px-3 py-2.5'}
   ${isActive
     ? 'bg-green-50 text-green-700'
     : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`;

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout  = async () => { setDrawerOpen(false); await logout(); navigate('/login'); };
  const handlePreview = ()          => { setDrawerOpen(false); navigate('/'); };
  const closeDrawer   = ()          => setDrawerOpen(false);

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-500" />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-green-700 leading-none">ZOOTRA</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
          <AdminNotificationBell />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNav}
            className={({ isActive }) => `${linkCls(isActive)} text-sm`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold flex-shrink-0">
            {user?.displayName?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">{user?.displayName ?? 'Admin'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handlePreview}
          className="w-full flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-xl text-left transition font-medium"
        >
          <Eye className="w-4 h-4" /> View as Customer
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl text-left transition font-medium"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ─────────── DESKTOP SIDEBAR (hidden on mobile) ─────────── */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-gray-100 flex-col shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ─────────── MOBILE DRAWER OVERLAY ─────────── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
          {/* panel */}
          <div className="relative w-64 bg-white shadow-2xl flex flex-col h-full">
            <button
              onClick={closeDrawer}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent onNav={closeDrawer} />
          </div>
        </div>
      )}

      {/* ─────────── MAIN AREA ─────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 bg-white border-b border-gray-100 px-4 h-14 flex-shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <Leaf className="w-5 h-5 text-green-500" />
            <span className="text-base font-bold text-green-700">ZOOTRA Admin</span>
          </div>
          <AdminNotificationBell />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* ── Mobile bottom tab bar ── */}
        <nav className="lg:hidden flex-shrink-0 bg-white border-t border-gray-100 flex items-center justify-around px-1 py-1 sticky bottom-0 z-30">
          {navItems.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition min-w-0 flex-1
                 ${isActive ? 'text-green-700' : 'text-gray-400 hover:text-gray-600'}`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px] font-medium truncate w-full text-center leading-tight">{label}</span>
            </NavLink>
          ))}
          {/* "More" tab that opens drawer for remaining items */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition min-w-0 flex-1 text-gray-400 hover:text-gray-600"
          >
            <Menu className="w-5 h-5 flex-shrink-0" />
            <span className="text-[10px] font-medium leading-tight">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AdminLayout;

