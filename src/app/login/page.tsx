import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';
import { Logo } from '@/components/brand/Logo';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Gadget Malawi account.',
};

export default function LoginPage() {
  return (
    <div className="gm-auth-wrap">
      <div className="gm-card gm-card-pad gm-auth-card">
        <div className="gm-stack" style={{ gap: 6, marginBottom: 22 }}>
          <Logo size={48} />
          <h1 className="gm-title" style={{ margin: '12px 0 4px', fontSize: '1.9rem' }}>
            Welcome back
          </h1>
          <p className="gm-muted" style={{ margin: 0 }}>
            Sign in to manage your listings, messages, and orders.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}