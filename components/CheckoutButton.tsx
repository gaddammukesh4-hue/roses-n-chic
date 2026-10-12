'use client';

import { useState } from 'react';
import Script from 'next/script';
import { createOrder, confirmPayment } from '@/app/actions/checkout';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type Status = 'idle' | 'creating' | 'paying' | 'confirming' | 'success' | 'error';

/** Polls for window.Razorpay instead of trusting next/script's onReady
 * alone -- onReady updates React state asynchronously, and a fast click
 * right as the script finishes loading can read a stale "not ready" state
 * even though the actual global is already there. window.Razorpay itself
 * is the real signal; this just waits for it directly. */
async function waitForRazorpay(timeoutMs = 5000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (typeof window.Razorpay !== 'undefined') return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return typeof window.Razorpay !== 'undefined';
}

export default function CheckoutButton({ addressId, onSuccess }: { addressId: string | null; onSuccess: () => void }) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    if (!addressId) {
      setError('Select a shipping address first.');
      setStatus('error');
      return;
    }
    setError(null);
    setStatus('creating');

    const result = await createOrder(addressId);
    if ('error' in result) {
      setError(result.error);
      setStatus('error');
      return;
    }

    const ready = await waitForRazorpay();
    if (!ready) {
      setError('Payment widget could not load -- check your connection and try again.');
      setStatus('error');
      return;
    }

    setStatus('paying');
    const razorpay = new window.Razorpay({
      key: result.keyId,
      amount: result.amount,
      currency: result.currency,
      order_id: result.razorpayOrderId,
      name: 'Roses N Chic',
      theme: { color: '#5b3a34' },
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        setStatus('confirming');
        const confirmResult = await confirmPayment(result.orderId, response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
        if (confirmResult.success) {
          setStatus('success');
          onSuccess();
        } else {
          setError(confirmResult.error ?? 'Payment could not be confirmed.');
          setStatus('error');
        }
      },
      modal: {
        ondismiss: () => {
          if (status !== 'success') setStatus('idle');
        },
      },
    });
    razorpay.open();
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      {status === 'success' ? (
        <p className="text-body-sm text-primary">Payment successful! Your order is confirmed.</p>
      ) : (
        <>
          <button
            type="button"
            onClick={handlePay}
            disabled={!addressId || status === 'creating' || status === 'paying' || status === 'confirming'}
            className="w-full rounded-none bg-primary text-on-primary px-11 py-[15px] text-body-sm uppercase tracking-[0.14em] transition-colors duration-base hover:bg-secondary active:scale-[0.97] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'creating' ? 'Preparing…' : status === 'confirming' ? 'Confirming…' : 'Pay now'}
          </button>
          {error && <p className="text-body-sm text-destructive mt-2">{error}</p>}
        </>
      )}
    </>
  );
}
