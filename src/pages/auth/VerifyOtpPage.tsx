import { useNavigate } from 'react-router-dom';
import { OtpVerifyCard } from '@/components/auth/OtpVerify';
import { AuthShowcase } from './AuthShowcase';

/** Code entry as a page: used by the forgot-password flow and old links to /verify-otp. */
export function VerifyOtpPage() {
  const navigate = useNavigate();
  return (
    <AuthShowcase>
      <OtpVerifyCard onVerified={(isForget) => navigate(isForget ? '/reset' : '/user/dashboard', { replace: true })} />
    </AuthShowcase>
  );
}
