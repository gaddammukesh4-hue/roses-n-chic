// DRAFT -- needs review by a qualified person against Indian consumer law
// before launch. plan.md Phase 9 item 8 / Part E.
import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import PolicyLayout from '@/components/PolicyLayout';

export const metadata: Metadata = {
  title: 'Terms of service',
  description: 'The terms that apply when you buy from Roses N Chic.',
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <PolicyLayout
        title="Terms of service"
        lastUpdated="Last updated 12 October 2026. This is a draft and has not yet been reviewed by a qualified professional for compliance with Indian consumer law."
      >
        <p>These terms apply whenever you buy from Roses N Chic online.</p>

        <h2>Our products</h2>
        <p>
          Every piece is handmade. Small variations in weave, dye, and stitching are normal, not
          defects — they are part of what handloom fabric is. Colours may appear slightly
          different on your screen than in person.
        </p>

        <h2>Prices and payment</h2>
        <p>
          Prices are shown in Indian Rupees (and US Dollars where offered) and include applicable
          taxes unless stated otherwise. Payment is processed securely by Razorpay (and, for
          international orders, Stripe, once enabled). We never see or store your full card
          details.
        </p>

        <h2>Custom-tailored orders</h2>
        <p>
          Orders made to your own saved measurements are cut specifically for you and cannot be
          resold, so our standard return window (see our Returns policy) does not apply to them
          unless the piece arrives damaged or significantly different from what you ordered.
        </p>

        <h2>Order acceptance</h2>
        <p>
          An order is only confirmed once payment has been verified. If an item goes out of stock
          between you adding it to your bag and completing payment, we will tell you and offer a
          refund.
        </p>

        <h2>Limitation</h2>
        <p>
          We are not liable for delays caused by couriers, customs, or events outside our
          reasonable control.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? Write to us through the contact details on our Instagram,{' '}
          <a
            href="https://instagram.com/rosesnchic"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary underline underline-offset-2 hover:text-primary transition-colors duration-base"
          >
            @rosesnchic <span className="sr-only">(opens in a new tab)</span>
          </a>
          .
        </p>
      </PolicyLayout>
      <Footer />
    </>
  );
}
