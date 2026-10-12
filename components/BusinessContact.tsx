import { BUSINESS_LEGAL_NAME, BUSINESS_GSTIN_STATUS, BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_TEL } from '@/lib/business-info';

/** Shared "who operates this site" + grievance-contact block for the
 * Privacy and Terms pages -- one place to update once real business
 * details (registered address, confirmed GSTIN) are available. */
export default function BusinessContact() {
  return (
    <>
      <h2>Who operates this site</h2>
      <p>Roses N Chic is operated by {BUSINESS_LEGAL_NAME}. {BUSINESS_GSTIN_STATUS}.</p>

      <h2>Grievance Officer</h2>
      <p>
        For any complaint or question about this policy, contact our Grievance Officer by phone
        at <a href={`tel:${BUSINESS_PHONE_TEL}`} className="text-secondary underline underline-offset-2 hover:text-primary transition-colors duration-base">{BUSINESS_PHONE_DISPLAY}</a>,
        or write to us on Instagram{' '}
        <a
          href="https://instagram.com/rosesnchic"
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary underline underline-offset-2 hover:text-primary transition-colors duration-base"
        >
          @rosesnchic <span className="sr-only">(opens in a new tab)</span>
        </a>
        . We aim to acknowledge every complaint within 48 hours.
      </p>
    </>
  );
}
