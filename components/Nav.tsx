import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseConfig } from '@/lib/catalog';
import AuthControl from '@/components/AuthControl';
import CartControl from '@/components/CartControl';
import MobileNavMenu from '@/components/MobileNavMenu';
import { getCurrency } from '@/app/actions/currency';

export default async function Nav() {
  let signedIn = false;
  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    signedIn = Boolean(data.user);
  }
  const currency = await getCurrency();

  return (
    <header className="nav" data-hero="nav">
      <Link className="nav__logo" href="/">Roses N Chic</Link>
      <nav className="nav__links" aria-label="Main">
        <Link href="/collections">Collections</Link>
        <Link href="/atelier">Atelier</Link>
      </nav>
      <div className="nav__tools">
        <MobileNavMenu />
        <AuthControl signedIn={signedIn} />
        <CartControl currency={currency} />
      </div>
    </header>
  );
}
