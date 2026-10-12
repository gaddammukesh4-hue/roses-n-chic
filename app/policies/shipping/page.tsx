// DRAFT -- shipping times/costs below are placeholders, not confirmed
// courier rates. Fill in real figures and have a qualified person check
// GST treatment before launch. plan.md Phase 9 item 8 / Part E.
import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import PolicyLayout from '@/components/PolicyLayout';

export const metadata: Metadata = {
  title: 'Shipping policy',
  description: 'Delivery times, costs, and tracking for Roses N Chic orders.',
};

export default function ShippingPolicyPage() {
  return (
    <>
      <Nav />
      <PolicyLayout
        title="Shipping policy"
        lastUpdated="Last updated 12 October 2026. Draft placeholder — delivery times and costs below need to be confirmed with an actual courier before launch, and reviewed for GST treatment."
      >
        <h2>Processing time</h2>
        <p>
          Every piece is made or finished to order in small batches. Please allow a few days for
          your order to be prepared before it ships — exact timing will be confirmed once we're
          shipping for real.
        </p>

        <h2>Delivery within India</h2>
        <p>
          We ship across India through a tracked courier. A tracking number is added to your
          order and visible on your account page once your order ships.
        </p>

        <h2>International delivery</h2>
        <p>
          International shipping will open once our Stripe (international payments) setup is
          complete. Customs duties, if any, are the responsibility of the recipient.
        </p>

        <h2>Tracking your order</h2>
        <p>
          Sign in and visit your account page to see your order status and tracking number, once
          added.
        </p>

        <h2>Contact</h2>
        <p>Questions about a shipment? Write to us through the contact details on our Instagram, @rosesnchic.</p>
      </PolicyLayout>
      <Footer />
    </>
  );
}
