// DRAFT -- needs review by a qualified person against India's data
// protection law (DPDP Act) before launch. plan.md Phase 9 item 8 / Part E.
import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import PolicyLayout from '@/components/PolicyLayout';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How Roses N Chic collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Nav />
      <PolicyLayout
        title="Privacy policy"
        lastUpdated="Last updated 12 October 2026. This is a draft and has not yet been reviewed by a qualified professional for compliance with Indian law."
      >
        <p>
          This policy explains what personal information Roses N Chic collects when you use this
          site, and what we do with it.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>Account details: name, email, phone number (optional), shipping addresses.</li>
          <li>Order details: items purchased, order total, payment status.</li>
          <li>Measurements you choose to save for custom-tailored orders.</li>
          <li>
            Basic page-visit records (page path and referring page only — no name, IP address, or
            device identifier is stored) used to understand which pages are popular.
          </li>
          <li>Your email address, if you sign up for our mailing list.</li>
        </ul>

        <h2>What we do not collect</h2>
        <p>
          We never see or store your card number, UPI PIN, or bank details. Payments are handled
          directly by our payment processor (Razorpay), which is certified to handle this data
          securely.
        </p>

        <h2>How we use it</h2>
        <ul>
          <li>To process and ship your order.</li>
          <li>To let you sign in and see your order history and saved measurements.</li>
          <li>To send you order updates and, if you opted in, occasional emails about new pieces.</li>
        </ul>

        <h2>Who we share it with</h2>
        <p>
          Only the services needed to run the store: our database host (Supabase), our payment
          processor (Razorpay), and, if you provide one, our shipping courier. We do not sell
          your information to anyone.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask us to show you, correct, or delete your personal information at any time by
          contacting us. You can remove saved measurements and addresses yourself from your
          account page.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Write to us through the contact details on our Instagram,{' '}
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
