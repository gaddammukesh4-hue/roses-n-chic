import Link from 'next/link';
import Nav from '@/components/Nav';
import HeroScrub from '@/components/HeroScrub';

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <HeroScrub />
        <section className="next" id="collections">
          <p className="next__eyebrow">The collection</p>
          <h2>Handloom, made to last</h2>
          <p className="text-body-lg text-muted-foreground max-w-xl mx-auto mt-4">
            Cut and stitched by hand in our Chennai atelier, from fabric we weave ourselves.
          </p>
          <Link
            href="/collections"
            className="inline-block mt-8 rounded-none border border-accent bg-card text-primary px-11 py-[15px] text-body-sm uppercase tracking-[0.14em] transition-colors duration-base hover:bg-secondary hover:text-white"
          >
            View the collection
          </Link>
        </section>
      </main>
    </>
  );
}
