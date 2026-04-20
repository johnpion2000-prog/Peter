import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { UserRole } from '../types/user.types';

/**
 * Redirect to `redirectTo` if the user doesn't have one of `allowedRoles`.
 * Pass no roles to simply require authentication.
 */
export function useRequireAuth(
  allowedRoles?: UserRole[],
  redirectTo = '/signin'
) {
  const { currentUser, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!currentUser) { navigate(redirectTo); return; }
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      navigate('/');
    }
  }, [currentUser, role, loading, navigate, allowedRoles, redirectTo]);

  return { currentUser, role, loading };
}
