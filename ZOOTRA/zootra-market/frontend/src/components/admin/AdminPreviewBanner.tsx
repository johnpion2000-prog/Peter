import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Floating banner shown to admins when they browse the customer-facing pages.
 * Lets them quickly return to the admin panel.
 */
const AdminPreviewBanner: React.FC = () => {
  const { user } = useAuth();

  if (user?.role !== 'admin') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 bg-gray-900 text-white px-5 py-2.5 shadow-lg text-sm">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-yellow-400 flex-shrink-0" />
        <span className="font-medium">Admin Preview Mode</span>
        <span className="text-gray-400 hidden sm:inline">— You are browsing the customer dashboard</span>
      </div>
      <Link
        to="/admin"
        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition whitespace-nowrap"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Panel
      </Link>
    </div>
  );
};

export default AdminPreviewBanner;
