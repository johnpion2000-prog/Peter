import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useProviderPermissions } from '../../hooks/useProviderPermissions';
import Spinner from '../../components/ui/Spinner';

const CompanyDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const { permissions, loading: permsLoading } = useProviderPermissions(user?.uid);

  if (loading || permsLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!user || user.role !== 'provider' || !user.isApproved || !user.isActive) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Company Dashboard</h1>
      <p className="mb-4">Welcome, {user.displayName}! Only your company can see this dashboard. Customers cannot access these features.</p>
      <div className="grid gap-6 md:grid-cols-2">
        {permissions.includes('dashboard') && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
            <p>Overview and stats for your company.</p>
          </div>
        )}
        {permissions.includes('products') && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Products</h2>
            <p>Manage your products here.</p>
          </div>
        )}
        {permissions.includes('categories') && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <p>View allowed categories.</p>
          </div>
        )}
        {permissions.includes('orders') && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Orders</h2>
            <p>See and manage your orders.</p>
          </div>
        )}
        {permissions.includes('users') && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <p>Manage company users.</p>
          </div>
        )}
        {permissions.includes('company') && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Company</h2>
            <p>Company information and settings.</p>
          </div>
        )}
        {permissions.includes('discounts') && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Discounts</h2>
            <p>Manage discounts and offers.</p>
          </div>
        )}
        {permissions.includes('bookings') && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Bookings</h2>
            <p>View and manage bookings.</p>
          </div>
        )}
        {permissions.includes('reviews') && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <p>See customer reviews.</p>
          </div>
        )}
        {permissions.includes('profile') && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <p>Manage your company profile.</p>
          </div>
        )}
      </div>
      {permissions.length === 0 && (
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
          <p>Your company does not have any permissions yet. Please contact the admin for access.</p>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
