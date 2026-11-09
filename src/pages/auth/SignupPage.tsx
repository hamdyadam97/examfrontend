import { useNavigate } from 'react-router-dom';
import { SignupForm } from '@/components/auth/SignupForm';
import { AuthShowcase } from './AuthShowcase';

export function SignupPage() {
  const navigate = useNavigate();
  return (
    <AuthShowcase>
      <SignupForm onSwitchToLogin={() => navigate('/login')} />
    </AuthShowcase>
  );
}
