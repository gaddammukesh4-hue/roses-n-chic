import Nav from '@/components/Nav';
import HeroScrub from '@/components/HeroScrub';

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <HeroScrub />
        <section className="next" id="collections">
          <p className="next__eyebrow">Next</p>
          <h2>The collection</h2>
          <p>The catalog comes here in the next build phase.</p>
        </section>
      </main>
    </>
  );
}
