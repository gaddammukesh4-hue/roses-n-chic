import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseConfig } from '@/lib/catalog';
import AuthControl from '@/components/AuthControl';

export default async function Nav() {
  let signedIn = false;
  if (hasSupabaseConfig()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    signedIn = Boolean(data.user);
  }

  return (
    <header className="nav" data-hero="nav">
      <Link className="nav__logo" href="/">Roses N Chic</Link>
      <nav className="nav__links" aria-label="Main">
        <Link href="/collections">Collections</Link>
        <Link href="/atelier">Atelier</Link>
        <Link href="/journal">Journal</Link>
      </nav>
      <div className="nav__tools">
        <Link href="/search" className="nav__search">Search</Link>
        <AuthControl signedIn={signedIn} />
        <Link href="/bag">Bag (0)</Link>
      </div>
    </header>
  );
}
