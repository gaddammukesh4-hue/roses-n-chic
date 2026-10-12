import type { Metadata } from 'next';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import './globals.css';
import '@/styles/nav.css';
import CartProvider from '@/components/CartProvider';
import PageViewBeacon from '@/components/PageViewBeacon';
import CookieNotice from '@/components/CookieNotice';

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-serif', display: 'swap' });
const sans = Montserrat({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-sans', display: 'swap' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Roses N Chic | The Art of Elegance',
    template: '%s | Roses N Chic',
  },
  description: "Handcrafted handloom cotton and viscose rayon women's clothing from our Chennai atelier.",
  openGraph: {
    siteName: 'Roses N Chic',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <PageViewBeacon />
        <CartProvider>{children}</CartProvider>
        <CookieNotice />
      </body>
    </html>
  );
}
