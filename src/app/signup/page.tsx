import type { Metadata } from 'next';
import { SignupForm } from '@/components/auth/SignupForm';
import { Logo } from '@/components/brand/Logo';

export const metadata: Metadata = {
  title: 'Create your account',
  description: 'Join Gadget Malawi — buy and sell gadgets across Malawi.',
};

export default function SignupPage() {
  return (
    <div className="gm-auth-wrap">
      <div className="gm-card gm-card-pad gm-auth-card">
        <div className="gm-stack" style={{ gap: 6, marginBottom: 22 }}>
          <Logo size={48} />
          <h1 className="gm-title" style={{ margin: '12px 0 4px', fontSize: '1.9rem' }}>
            Create your account
          </h1>
          <p className="gm-muted" style={{ margin: 0 }}>
            It takes less than a minute. You can start selling right away.
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  );
}