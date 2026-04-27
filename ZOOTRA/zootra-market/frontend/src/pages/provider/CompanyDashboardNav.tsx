import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { key: 'dashboard', label: 'Overview', path: '/provider/dashboard' },
  { key: 'products', label: 'Products', path: '/provider/dashboard/products' },
  { key: 'orders', label: 'Orders', path: '/provider/dashboard/orders' },
  { key: 'bookings', label: 'Bookings', path: '/provider/dashboard/bookings' },
  { key: 'reviews', label: 'Reviews', path: '/provider/dashboard/reviews' },
  { key: 'profile', label: 'Profile', path: '/provider/dashboard/profile' },
];

const CompanyDashboardNav: React.FC<{ permissions: string[] }> = ({ permissions }) => {
  const location = useLocation();
  return (
    <nav className="mb-8 flex gap-2 flex-wrap">
      {navItems.filter(item => permissions.includes(item.key)).map(item => (
        <Link
          key={item.key}
          to={item.path}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition border
            ${location.pathname === item.path
              ? 'bg-green-700 text-white border-green-700'
              : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default CompanyDashboardNav;
