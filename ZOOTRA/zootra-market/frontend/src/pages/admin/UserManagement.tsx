import React from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import Spinner from '../../components/ui/Spinner';
import ProviderApprovalToggle from './ProviderApprovalToggle';

const roleColors: Record<string, string> = {
  admin: 'bg-red-50 text-red-600', customer: 'bg-green-50 text-green-600',
  farmer: 'bg-yellow-50 text-yellow-600', provider: 'bg-blue-50 text-blue-600',
};

const UserManagement: React.FC = () => {
  const { users, loading } = useAdmin();

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users ({users.length})</h1>
      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 font-medium">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Approved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.displayName || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[u.role] ?? 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    {u.role === 'provider' ? (
                      <ProviderApprovalToggle user={u} />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
