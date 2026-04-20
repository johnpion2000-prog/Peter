import { useEffect, useState } from 'react';
import { onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { usersCol } from '../../firebase/collections';
import { db } from '../../firebase/config';
import type { AppUser, UserRole } from '../../types/user.types';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

const roleColors: Record<UserRole, 'purple' | 'blue' | 'gray'> = {
  superAdmin: 'purple',
  companyAdmin: 'blue',
  customer: 'gray',
};

export default function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No orderBy — Firestore silently skips docs without that field.
    // Fetch ALL users and sort client-side so every account is visible.
    const unsub = onSnapshot(usersCol, snap => {
      const list = snap.docs
        .map(d => d.data() as AppUser)
        .sort((a, b) => {
          const ta = (a.createdAt as any)?.toMillis?.() ?? 0;
          const tb = (b.createdAt as any)?.toMillis?.() ?? 0;
          return tb - ta;
        });
      setUsers(list);
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  async function changeRole(uid: string, role: UserRole) {
    try {
      await updateDoc(doc(db, 'users', uid), { role });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role } : u));
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {users.length} registered account{users.length !== 1 ? 's' : ''} · updates live
            </p>
          )}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {users.length === 0 ? (
            <div className="py-20 text-center text-gray-400">No users found.</div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Email', 'Role', 'Joined', 'Change Role'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.uid} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.displayName || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3"><Badge label={u.role} color={roleColors[u.role]} /></td>
                    <td className="px-4 py-3 text-gray-500">{(u.createdAt as any)?.toDate?.()?.toLocaleDateString() ?? '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        defaultValue={u.role}
                        onChange={e => changeRole(u.uid, e.target.value as UserRole)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs"
                      >
                        <option value="customer">customer</option>
                        <option value="companyAdmin">companyAdmin</option>
                        <option value="superAdmin">superAdmin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}
    </div>
  );
}
