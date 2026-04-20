import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import type { UserRole } from '../types/user.types';
import { FullPageSpinner } from '../components/ui/Spinner';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  roles?: UserRole[];
}

export default function RouteGuard({ children, roles }: Props) {
  const { currentUser, appUser, loading } = useAuthContext();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;

  if (!currentUser) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }

  if (roles && appUser && !roles.includes(appUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
