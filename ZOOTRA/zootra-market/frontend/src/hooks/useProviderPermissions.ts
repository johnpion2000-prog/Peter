import { useEffect, useState } from 'react';
import { getProviderPermissions } from '../services/userService';

export const useProviderPermissions = (uid?: string) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setPermissions([]); setLoading(false); return; }
    setLoading(true);
    getProviderPermissions(uid).then((perms) => {
      setPermissions(perms || []);
      setLoading(false);
    });
  }, [uid]);

  return { permissions, loading };
};
