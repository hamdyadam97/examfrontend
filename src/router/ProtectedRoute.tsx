import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const token = Cookies.get('token');
  if (!token) {
    // Remember the page so the login form can return there.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = Cookies.get('token');
  if (token) {
    return <Navigate to="/user/dashboard" replace />;
  }
  return <>{children}</>;
}
