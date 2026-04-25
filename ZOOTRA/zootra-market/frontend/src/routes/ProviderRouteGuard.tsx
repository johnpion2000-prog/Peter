import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/ui/Spinner';

interface ProviderRouteGuardProps {
  children: React.ReactNode;
}

const ProviderRouteGuard: React.FC<ProviderRouteGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }


  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'provider' || !user.isApproved) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProviderRouteGuard;
