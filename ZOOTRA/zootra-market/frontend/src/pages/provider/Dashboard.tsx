import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProviderRouteGuard from '../../routes/ProviderRouteGuard';

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <ProviderRouteGuard>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Company Dashboard</h1>
        <p className="mb-4">Welcome, {user?.displayName}! Here you can manage your products and company profile.</p>
        {/* TODO: Add product management, company info, etc. */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Products</h2>
          <p>Product management coming soon...</p>
        </div>
      </div>
    </ProviderRouteGuard>
  );
};

export default ProviderDashboard;
