import 'server-only';
import Razorpay from 'razorpay';

/** Server-only Razorpay client. Needs RAZORPAY_KEY_SECRET, which must never
 * reach the browser -- the `server-only` import fails the build if a
 * Client Component ever imports this file. */
export function getRazorpayClient() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}
