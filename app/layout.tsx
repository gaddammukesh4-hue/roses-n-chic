import type { Metadata } from 'next';
import { Cormorant_Garamond, Montserrat } from 'next/font/google';
import './globals.css';
import '@/styles/nav.css';
import CartProvider from '@/components/CartProvider';

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-serif', display: 'swap' });
const sans = Montserrat({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Roses N Chic | The Art of Elegance',
  description: "Handcrafted handloom cotton and viscose rayon women's clothing from our Chennai atelier.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
