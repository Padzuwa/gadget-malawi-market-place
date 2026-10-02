import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLock } from '@fortawesome/free-solid-svg-icons';
import { createClient } from '@/lib/supabase/server';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order on Gadget Malawi.',
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/checkout');

  const { data: profile } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div className="gm-stack" style={{ gap: 24, maxWidth: 720 }}>
      <div className="gm-between" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="gm-eyebrow">Secure checkout</span>
          <h1 className="gm-title" style={{ marginTop: 6 }}>
            Almost there
          </h1>
        </div>
        <Link href="/cart" className="gm-btn gm-btn-ghost gm-btn-sm">
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to cart
        </Link>
      </div>

      <div className="gm-checkout-notice">
        <FontAwesomeIcon icon={faLock} />
        <span>
          No payment is taken on this step. You&apos;ll pay with Airtel Money
          or TNM Mpamba on the next screen.
        </span>
      </div>

      <CheckoutForm
        defaultPhone={profile?.phone ?? ''}
        defaultAddress=""
      />
    </div>
  );
}