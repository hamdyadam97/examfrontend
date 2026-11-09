import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthShowcase } from './AuthShowcase';

export function LoginPage() {
  const navigate = useNavigate();
  return (
    <AuthShowcase>
      <LoginForm onSwitchToSignup={() => navigate('/signup')} />
    </AuthShowcase>
  );
}
