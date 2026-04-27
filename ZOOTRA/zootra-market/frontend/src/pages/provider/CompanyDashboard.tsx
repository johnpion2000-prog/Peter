import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useProviderPermissions } from '../../hooks/useProviderPermissions';
import Spinner from '../../components/ui/Spinner';
import CompanyDashboardNav from './CompanyDashboardNav';

const CompanyDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const { permissions, loading: permsLoading } = useProviderPermissions(user?.uid);


  const [viewAsCustomer, setViewAsCustomer] = useState(false);

  if (loading || permsLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!user || user.role !== 'provider' || !user.isApproved || !user.isActive) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-5xl mx-auto py-10 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-800">Company Dashboard</h1>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${viewAsCustomer ? 'bg-white text-green-700 border-green-300' : 'bg-green-700 text-white border-green-700'}`}
            onClick={() => setViewAsCustomer((v) => !v)}
          >
            {viewAsCustomer ? 'Back to Company View' : 'View as Customer'}
          </button>
        </div>
        <CompanyDashboardNav permissions={permissions} />
        {!viewAsCustomer ? (
          <div className="grid gap-6 md:grid-cols-2">
            {permissions.includes('dashboard') && (
              <div className="bg-white rounded-xl shadow p-6 border border-green-100">
                <h2 className="text-xl font-semibold mb-4 text-green-700">Dashboard Overview</h2>
                <p>Overview and stats for your company.</p>
              </div>
            )}
            {permissions.includes('products') && (
              <div className="bg-white rounded-xl shadow p-6 border border-green-100">
                <h2 className="text-xl font-semibold mb-4 text-green-700">Products</h2>
                <p>Manage your products here.</p>
              </div>
            )}
            {permissions.includes('categories') && (
              <div className="bg-white rounded-xl shadow p-6 border border-green-100">
                <h2 className="text-xl font-semibold mb-4 text-green-700">Categories</h2>
                <p>View allowed categories.</p>
              </div>
            )}
            {permissions.includes('orders') && (
              <div className="bg-white rounded-xl shadow p-6 border border-green-100">
                <h2 className="text-xl font-semibold mb-4 text-green-700">Orders</h2>
                <p>See and manage your orders.</p>
              </div>
            )}
            {permissions.includes('users') && (
              <div className="bg-white rounded-xl shadow p-6 border border-green-100">
                <h2 className="text-xl font-semibold mb-4 text-green-700">Users</h2>
                <p>Manage company users.</p>
              </div>
            )}
            {permissions.includes('company') && (
              <div className="bg-white rounded-xl shadow p-6 border border-green-100">
                <h2 className="text-xl font-semibold mb-4 text-green-700">Company</h2>
                <p>Company information and settings.</p>
              </div>
            )}
            {permissions.includes('discounts') && (
              <div className="bg-white rounded-xl shadow p-6 border border-green-100">
                <h2 className="text-xl font-semibold mb-4 text-green-700">Discounts</h2>
                <p>Manage discounts and offers.</p>
              </div>
            )}
            {permissions.includes('bookings') && (
              <div className="bg-white rounded-xl shadow p-6 border border-green-100">
                <h2 className="text-xl font-semibold mb-4 text-green-700">Bookings</h2>
                <p>View and manage bookings.</p>
              </div>
            )}
            {permissions.includes('reviews') && (
              <div className="bg-white rounded-xl shadow p-6 border border-green-100">
                <h2 className="text-xl font-semibold mb-4 text-green-700">Reviews</h2>
                <p>See customer reviews.</p>
              </div>
            )}
            {permissions.includes('profile') && (
              <div className="bg-white rounded-xl shadow p-6 border border-green-100">
                <h2 className="text-xl font-semibold mb-4 text-green-700">Profile</h2>
                <p>Manage your company profile.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-8 border border-green-100 text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-4">Customer View</h2>
            <p className="text-gray-600">This is what a regular customer sees. Use this to preview your public profile and products.</p>
            <Link to="/" className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition">Go to Home</Link>
          </div>
        )}
        {permissions.length === 0 && (
          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
            <p>Your company does not have any permissions yet. Please contact the admin for access.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;
