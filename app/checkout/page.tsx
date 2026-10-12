import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import CheckoutCart from '@/components/CheckoutCart';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

/**
 * Order review only -- no payment yet. Creating an order and taking payment
 * happen together (plan.md Phase 7: the server creates the Razorpay/Stripe
 * order and verifies the signature in the same flow), so this intentionally
 * stops short of a "place order" button rather than wiring up a fake one.
 */
export default function CheckoutPage() {
  return (
    <>
      <Nav />
      <main className="pt-[calc(var(--nav-h,76px)+40px)] pb-24 px-6 max-w-2xl mx-auto space-y-8">
        <h1 className="text-h1">Checkout</h1>
        <CheckoutCart />
      </main>
    </>
  );
}
