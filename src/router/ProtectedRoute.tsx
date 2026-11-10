import { Navigate, useLocation } from 'react-router-dom';
import { hasSession } from '@/lib/api';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  if (!hasSession()) {
    // Remember the page so the login form can return there.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  if (hasSession()) {
    return <Navigate to="/user/dashboard" replace />;
  }
  return <>{children}</>;
}
