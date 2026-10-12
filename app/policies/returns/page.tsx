// DRAFT -- the return window below is a placeholder business decision,
// and must be checked against Indian consumer-protection rules for online
// retail before launch. plan.md Phase 9 item 8 / Part E.
import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import PolicyLayout from '@/components/PolicyLayout';

export const metadata: Metadata = {
  title: 'Returns policy',
  description: 'How to return or exchange a Roses N Chic order.',
};

export default function ReturnsPolicyPage() {
  return (
    <>
      <Nav />
      <PolicyLayout
        title="Returns policy"
        lastUpdated="Last updated 12 October 2026. Draft placeholder — the return window and conditions below need business and legal sign-off before launch."
      >
        <h2>Standard orders</h2>
        <p>
          If a piece doesn't fit or isn't right, you may request a return within 7 days of
          delivery. The piece must be unworn, unwashed, and with its original tags attached.
        </p>

        <h2>Custom-tailored orders</h2>
        <p>
          Pieces cut to your own saved measurements are made specifically for you and cannot be
          returned for fit or preference reasons. If a custom piece arrives damaged or
          significantly different from what you ordered, contact us and we'll make it right.
        </p>

        <h2>Damaged or incorrect items</h2>
        <p>
          If your order arrives damaged, or the wrong item was sent, contact us with a photo
          within 48 hours of delivery and we will arrange a replacement or refund at no cost to
          you.
        </p>

        <h2>How to start a return</h2>
        <p>
          Write to us through the contact details on our Instagram, @rosesnchic, with your order
          number. We'll confirm the next steps.
        </p>

        <h2>Refunds</h2>
        <p>
          Approved refunds are issued to your original payment method once the returned piece is
          received and checked. Processing times depend on your bank or payment provider.
        </p>
      </PolicyLayout>
      <Footer />
    </>
  );
}
