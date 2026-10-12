import Link from 'next/link';
import NewsletterForm from '@/components/NewsletterForm';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="space-y-3 lg:col-span-2">
          <p className="font-serif text-h4 text-secondary">Roses N Chic</p>
          <p className="text-body-sm text-muted-foreground max-w-sm">
            Every piece is cut and stitched by hand in our small atelier in Chennai, from
            handloom cotton and viscose rayon we weave ourselves.
          </p>
          <a
            href="https://instagram.com/rosesnchic"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-body-sm text-secondary hover:text-primary transition-colors duration-base"
          >
            @rosesnchic on Instagram <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>

        <nav aria-label="Footer" className="space-y-2 text-body-sm">
          <p className="text-caption uppercase tracking-[0.18em] text-muted-foreground mb-2">Shop</p>
          <Link href="/collections" className="block hover:text-secondary transition-colors duration-base">Collections</Link>
          <Link href="/atelier" className="block hover:text-secondary transition-colors duration-base">Our atelier</Link>
          <Link href="/account" className="block hover:text-secondary transition-colors duration-base">Account</Link>
        </nav>

        <nav aria-label="Policies" className="space-y-2 text-body-sm">
          <p className="text-caption uppercase tracking-[0.18em] text-muted-foreground mb-2">Policies</p>
          <Link href="/policies/shipping" className="block hover:text-secondary transition-colors duration-base">Shipping</Link>
          <Link href="/policies/returns" className="block hover:text-secondary transition-colors duration-base">Returns</Link>
          <Link href="/policies/privacy" className="block hover:text-secondary transition-colors duration-base">Privacy</Link>
          <Link href="/policies/terms" className="block hover:text-secondary transition-colors duration-base">Terms</Link>
        </nav>

        <div className="space-y-3 sm:col-span-2 lg:col-span-4 lg:border-t lg:border-border lg:pt-8 lg:mt-2">
          <p className="text-caption uppercase tracking-[0.18em] text-muted-foreground">Join the list</p>
          <p className="text-body-sm text-muted-foreground max-w-sm">New pieces and atelier notes, no spam.</p>
          <div className="max-w-sm">
            <NewsletterForm />
          </div>
        </div>
      </div>
      <div className="border-t border-border px-6 py-6 text-caption text-muted-foreground text-center">
        © {new Date().getFullYear()} Roses N Chic, Chennai.
      </div>
    </footer>
  );
}
