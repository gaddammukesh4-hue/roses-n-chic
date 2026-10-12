# Progress

Update this file at the end of every phase.

- [~] Phase 0: Set up. Done: git repo initialized, Next.js app scaffolded (TypeScript, App Router, Tailwind) in the project root, gsap/lenis/zod installed, dev server smoke-tested on localhost:3000. Not done (needs your accounts, see Notes): GitHub repo, Supabase `rnc-dev` project, Vercel link, Razorpay/Stripe test keys, skills from plan.md A3.
- [ ] Phase 1: Brand and design system
- [x] Phase 2: Hero video assets (done: frames and cut-out in hero/standalone/frames)
- [~] Phase 3: Hero scroll animation (plain page tested in browser, including a mobile-scroll-smoothness fix to hero-engine.js on 2026-10-12; Next.js files carry the same fix but are still not integrated/tested in the Next.js app)
- [ ] Phase 4: Database
- [ ] Phase 5: Catalog and product pages
- [ ] Phase 6: Accounts
- [ ] Phase 7: Cart and checkout
- [ ] Phase 8: Admin panel
- [ ] Phase 9: Marketing, SEO, content
- [ ] Phase 10: Security review
- [ ] Phase 11: Quality and speed
- [ ] Phase 12: Launch

## Notes
(Write decisions and open problems here.)

- 2026-10-12: Phase 0 scaffold done. `npm audit` reports 5 high-severity findings, all in the
  eslint-config-next dev-dependency chain (braces/micromatch/fast-glob ReDoS, GHSA-vfj7-8cjw-p6xm).
  Dev-only, not shipped to production; the auto-fix downgrades eslint-config-next to 14.2.35
  (a breaking change), so it was left for a deliberate decision rather than applied blindly.
- 2026-10-12: Mobile scroll had visible jank. Root cause: `hero-engine.js` set
  `ctx.imageSmoothingQuality` on every single render call (every scroll tick) instead of once,
  and canvas backing-store resolution was capped at 2x DPR even on phones with 3x screens.
  Fixed in both `hero/standalone/hero-engine.js` and `hero/nextjs/lib/hero-engine.js`. Verified
  with a Playwright CPU-throttle test: at 2x throttle (typical mid-range phone vs. a dev laptop),
  janky frames (>33ms) dropped from 56.3% to 8.3%. Very low-end/old devices (4x throttle) still
  show some jank — inherent to a 211-frame canvas scrub effect; would need frame-skipping or a
  lower-res mobile frame set to fully fix, which trades off visual quality.
