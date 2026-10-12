import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Our atelier',
  description: 'Handloom cotton and viscose rayon, cut and stitched by hand in our Chennai atelier — the story behind every Roses N Chic piece.',
};

export default function AtelierPage() {
  return (
    <>
      <Nav />
      <main className="pt-[calc(var(--nav-h,76px)+40px)] pb-24 px-6 max-w-3xl mx-auto space-y-16">
        <header className="space-y-3">
          <p className="text-caption uppercase tracking-[0.18em] text-muted-foreground">Our atelier</p>
          <h1 className="text-h1">Made by hand, in Chennai</h1>
          <p className="text-body-lg text-muted-foreground">
            Roses N Chic is a small atelier, not a factory. Every dress that reaches you was cut
            and stitched by a person who knows your measurements, not a production line.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-h2">The fabric</h2>
          <p className="text-base text-foreground">
            We work in two fabrics, both chosen for how they feel against skin in Indian heat,
            and both woven ourselves rather than bought wholesale.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div className="rounded-md border border-border bg-card p-6 space-y-2">
              <h3 className="text-h4">Handloom cotton</h3>
              <p className="text-body-sm text-muted-foreground">
                Woven on traditional pit looms by weaving families we work with directly.
                Breathable, slightly textured, and it softens with every wash rather than
                wearing out.
              </p>
            </div>
            <div className="rounded-md border border-border bg-card p-6 space-y-2">
              <h3 className="text-h4">Viscose rayon</h3>
              <p className="text-body-sm text-muted-foreground">
                A plant-fibre weave with a soft drape, used for pieces that need to move —
                flowing silhouettes, gathered skirts, anything cut on the bias.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-h2">The atelier</h2>
          <p className="text-base text-foreground">
            Our small team works out of a single atelier in Chennai. We keep batches small on
            purpose — it is the only way to check every seam by hand before a piece ships, and
            the only way to take on custom-tailored orders built to your own measurements rather
            than a standard size chart.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-h2">Follow along</h2>
          <p className="text-base text-foreground">
            We post new pieces, fabric off the loom, and atelier notes on Instagram{' '}
            <a
              href="https://instagram.com/rosesnchic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-primary transition-colors duration-base"
            >
              @rosesnchic
            </a>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
