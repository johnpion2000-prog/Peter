import React, { useMemo } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import Spinner from '../../components/ui/Spinner';
import { updateUserProfile } from '../../services/userService';

const CompanyManagement: React.FC = () => {
  const { users, products, orders, loading, refetch } = useAdmin();
  const providerUsers = useMemo(() => users.filter((u) => u.role === 'provider'), [users]);

  const getCompanyStats = (companyId: string) => {
    const companyProducts = products.filter((p) => p.ownerId === companyId);
    const companyOrders = orders.filter((o) => companyProducts.some((p) => p.id === o.productId));
    const totalOrders = companyOrders.length;
    const totalRevenue = companyOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return {
      products: companyProducts,
      totalProducts: companyProducts.length,
      totalOrders,
      totalRevenue,
    };
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    await updateUserProfile(userId, { isActive: !isActive });
    refetch();
  };

  // One-word permission options for company dashboard
  const PERMISSION_OPTIONS = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'products', label: 'Products' },
    { key: 'categories', label: 'Categories' },
    { key: 'orders', label: 'Orders' },
    { key: 'users', label: 'Users' },
    { key: 'company', label: 'Company' },
    { key: 'discounts', label: 'Discounts' },
    { key: 'bookings', label: 'Bookings' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'profile', label: 'Profile' },
  ];

  const handlePermissionsChange = async (userId: string, permissions: string[]) => {
    await updateUserProfile(userId, { permissions });
    refetch();
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Company Management ({providerUsers.length})</h1>
      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 font-medium">
                <tr>
                  <th className="px-4 py-3 text-left">Company Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Products</th>
                  <th className="px-4 py-3 text-left">Orders</th>
                  <th className="px-4 py-3 text-left">Total Revenue</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left">Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {providerUsers.map((company) => {
                  const stats = getCompanyStats(company.uid);
                  return (
                    <tr key={company.uid} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{company.displayName || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{company.email}</td>
                      <td className="px-4 py-3">{stats.totalProducts}</td>
                      <td className="px-4 py-3">{stats.totalOrders}</td>
                      <td className="px-4 py-3">{stats.totalRevenue.toLocaleString()} RWF</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${company.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {company.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className={`px-3 py-1 rounded text-xs font-medium ${company.isActive ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                          onClick={() => handleToggleActive(company.uid, !!company.isActive)}
                        >
                          {company.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {PERMISSION_OPTIONS.map((perm) => {
                            const checked = company.permissions?.includes(perm.key) || false;
                            return (
                              <button
                                key={perm.key}
                                type="button"
                                className={`px-2 py-1 rounded text-xs font-semibold border transition-colors duration-150 ${checked ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                                onClick={() => {
                                  const current = company.permissions || [];
                                  const updated = checked
                                    ? current.filter((p) => p !== perm.key)
                                    : [...current, perm.key];
                                  handlePermissionsChange(company.uid, updated);
                                }}
                                aria-pressed={checked}
                              >
                                {perm.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
