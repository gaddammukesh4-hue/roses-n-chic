'use server';

import { cookies } from 'next/headers';
import type { Currency } from '@/lib/catalog';

const COOKIE_NAME = 'rnc_currency';

export async function getCurrency(): Promise<Currency> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return value === 'USD' ? 'USD' : 'INR';
}

export async function setCurrency(currency: Currency) {
  const store = await cookies();
  store.set(COOKIE_NAME, currency, { maxAge: 60 * 60 * 24 * 365, path: '/' });
}
