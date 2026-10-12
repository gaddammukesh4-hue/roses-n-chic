'use client';

import { useEffect, useRef } from 'react';
import 'lenis/dist/lenis.css';
import '@/styles/hero.css';

/**
 * Roses N Chic hero: stitching, dress, model, glow-up, then the woman walks
 * next to the logo. All the motion lives in lib/hero-engine.js.
 * Put the frames in /public/hero/frames (desktop/, mobile/, cutout.webp).
 */
export default function HeroScrub() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let api: { destroy: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }, { initHero }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('lenis'),
        import('@/lib/hero-engine'),
      ]);
      if (cancelled || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      api = initHero({
        gsap,
        ScrollTrigger,
        Lenis,
        root: rootRef.current,
        config: { baseUrl: '/hero/frames/' },
      });
    })();

    return () => {
      cancelled = true;
      api?.destroy();
    };
  }, []);

  return (
    <section ref={rootRef} className="hero" data-hero="root" aria-label="Roses N Chic introduction">
      <div className="stage" data-hero="stage">
        <div className="stage__bg" aria-hidden="true" />
        <canvas className="stage__canvas" data-hero="canvas" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="stage__cutout"
          data-hero="cutout"
          src="/hero/frames/cutout.webp"
          alt="A woman in a blush-pink handloom wrap dress with a fabric rose on the shoulder"
          draggable={false}
        />
        <div className="stage__loader" data-hero="loader" aria-hidden="true" />

        <div className="brand" data-hero="brand">
          <h1 className="logo" data-hero="logo">
            <span>Roses</span>
            <span>N Chic</span>
          </h1>
          <p className="tagline" data-hero-late>The Art of Elegance</p>
          <a className="cta" href="#collections" data-hero-late>Explore</a>
        </div>

        <div className="side-note" data-hero-late aria-hidden="true">
          <span className="side-note__arrow" />
          <span className="side-note__text">A/W 2026 Collection</span>
          <span className="side-note__arrow" />
        </div>

        <div className="counter" aria-hidden="true">
          <span className="counter__num" data-hero="counter-num">01</span>
          <span className="counter__total"> / 04</span>
          <span className="counter__label" data-hero="counter-label">The Needle</span>
        </div>

        <div className="hint" data-hero="hint" aria-hidden="true"><span />Scroll</div>

        <button className="tour" type="button" data-hero="tour" aria-pressed="false">
          <i aria-hidden="true" />
          <span data-hero="tour-label">Ambient tour</span>
        </button>
      </div>
    </section>
  );
}
