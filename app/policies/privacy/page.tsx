// DRAFT -- needs review by a qualified person against India's data
// protection law (DPDP Act) before launch. plan.md Phase 9 item 8 / Part E.
import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import PolicyLayout from '@/components/PolicyLayout';
import BusinessContact from '@/components/BusinessContact';

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
        lastUpdated="Last updated 13 October 2026. This is a draft and has not yet been reviewed by a qualified professional for compliance with Indian law."
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
            Page-visit records (page path and referring page). If you are signed in, these are
            linked to your account so we know which products and pages you’ve looked at; if you
            are browsing signed out, nothing about the visit identifies you — no IP address, no
            device identifier, no tracking cookie.
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
          <li>
            To send you order updates and, only if you’ve opted in (by creating an account or
            joining our mailing list), occasional promotional emails about new pieces. If you’re
            signed in, we may use what you’ve browsed on the site to make those emails more
            relevant — for example, letting you know when something you looked at is back in
            stock. We never use this to contact you if you haven’t opted in.
          </li>
        </ul>

        <h2>Who we share it with</h2>
        <p>
          <strong>We do not sell or share your personal information with any third party</strong>,
          for marketing or any other purpose. The only outside parties involved at all are the
          services strictly needed to run the store — our database host (Supabase), our payment
          processor (Razorpay), and, if you provide one, our shipping courier — each of which only
          ever sees the minimum needed to do its job (e.g. the courier sees a shipping address,
          never your payment details). None of them may use your data for their own purposes.
        </p>

        <h2>Cookies</h2>
        <p>
          We use only the cookies needed to run the site: one to keep you signed in, and one to
          remember your bag if you’re not signed in. We do not use advertising or third-party
          tracking cookies, and we do not use cookies to identify you while signed out. The
          page-visit linkage described above happens through your account session, not a separate
          tracking cookie.
        </p>

        <h2>Your rights</h2>
        <p>
          You can ask us to show you, correct, or delete your personal information at any time by
          contacting us. You can remove saved measurements and addresses yourself from your
          account page.
        </p>

        <BusinessContact />
      </PolicyLayout>
      <Footer />
    </>
  );
}
