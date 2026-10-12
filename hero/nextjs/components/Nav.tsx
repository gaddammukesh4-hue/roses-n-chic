import Link from 'next/link';

export default function Nav() {
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
        <Link href="/account">Sign in</Link>
        <Link href="/bag">Bag (0)</Link>
      </div>
    </header>
  );
}
