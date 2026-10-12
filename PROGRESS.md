# Progress

Update this file at the end of every phase.

- [~] Phase 0: Set up. Done: git repo initialized, Next.js app scaffolded (TypeScript, App Router, Tailwind) in the project root, gsap/lenis/zod installed, dev server smoke-tested on localhost:3000. Supabase `rnc-dev` project created and linked, `.env.local` filled in (2026-10-12). Still not done: GitHub repo + push, Vercel link, Razorpay/Stripe test keys, skills from plan.md A3.
- [x] Phase 1: Brand and design system. DESIGN.md written (colors with computed WCAG contrast table, type scale, radius, shadows, frosted-glass tokens, button states, logo usage). Tokens wired into app/globals.css as Tailwind @theme. Logo files made: public/logo.svg, public/logo-light.svg, app/icon.svg (favicon). Live demo at /design-system (buttons, headings, cards, logo). Used the ui-ux-pro-max skill for spacing/button/glassmorphism UX guidance, but NOT its generic color-palette match (it returned a dark+gold "Liquid Glass" direction that contradicts CLAUDE.md's "no dark backgrounds" rule) — colors come from the palette already proven live in hero.css instead. Found and fixed a real WCAG AA failure along the way: the hero's "Explore" button hover state was white-on-champagne (2.35:1); changed to white-on-rose-mid (5.57:1) in all 4 copies of hero.css.
- [x] Phase 2: Hero video assets (done: frames and cut-out in hero/standalone/frames)
- [x] Phase 3: Hero scroll animation. Integrated into the live Next.js app on 2026-10-12: components/lib/styles copied in, frames copied to public/hero/frames, app/layout.tsx and app/page.tsx wired to Nav+HeroScrub, conflicting default body styles removed from globals.css. Verified with Playwright at 1440x810 and 390x844 (real device sizes, not the browser's default window) — 0 console/page errors, full scroll sequence renders correctly at both sizes, mobile dock position and logo fade match hero/README.md.
- [x] Phase 4: Database. Applied to the live `rnc-dev` project on 2026-10-12 (`supabase link` + `supabase db push`, all 4 migrations). Seed data loaded (6 products, 30 variants). RLS verified two ways: through the app (draft product 404s, active products list correctly), and independently via raw REST calls with the anon key (`/rest/v1/products` returns only the 5 active rows; `/rest/v1/measurements` returns `[]` with no auth) -- the Phase 4 "done when" criterion is genuinely confirmed, not just true by construction.
- [x] Phase 5: Catalog and product pages. Verified against the live database on 2026-10-12: /collections renders all 5 active products with real fabric/price/filters, /collections/[slug] renders the full size matrix, fabric/care notes, and JSON-LD. Deferred on purpose, not half-built: the video-badge/hover-reel/fullscreen-reel behavior (steps 3-5) has no media to work with yet (no product photography or reels exist, only the hero's own frames); "Custom Tailored" sizing (step 8) needs Phase 6 auth first. "Add to bag" is a visibly disabled button, not a fake-functional one -- Phase 7 wires it up. Found and fixed a real bug along the way: Nav had no styles of its own and only rendered correctly on the homepage (the only page that happened to also load hero.css) -- extracted nav.css as a globally-loaded shared file so Nav works on every page.
- [~] Phase 6: Accounts. Built and verified end-to-end against the live project (2026-10-12): slide-out frosted-glass Sign In / Create Account drawer (components/AuthDrawer.tsx, reusing the Phase 1 --glass-drawer-* tokens for the first time), email/password auth via Server Actions (app/actions/auth.ts), /auth/callback route for email-confirmation and password-recovery links, /account/reset-password, and the account page with a working save/remove measurements flow (app/actions/measurements.ts). Verified live: sign up (admin-confirmed test users, since Supabase's public signup endpoint blocks `@example.com` and the project's default email rate limit is 2/hour), sign in, Nav flips Sign-in <-> Account/Sign-out correctly, measurement save+display+remove, sign out, and RLS (profiles/measurements insert-own policies) all confirmed against the real database. Deferred: Google sign-in (needs Google Cloud OAuth credentials -- a user action, not started), guest-cart merge (no cart exists until Phase 7).
- [ ] Phase 7: Cart and checkout
- [ ] Phase 8: Admin panel
- [ ] Phase 9: Marketing, SEO, content
- [ ] Phase 10: Security review
- [ ] Phase 11: Quality and speed
- [ ] Phase 12: Launch

## Notes
(Write decisions and open problems here.)

- 2026-10-12: Supabase `rnc-dev` project linked and schema pushed. The CLI
  personal access token used for `supabase link`/`db push` was never written
  to a file (passed inline as an env var to the one-off commands only) and
  is not needed again day-to-day -- the user may revoke it from
  supabase.com/dashboard/account/tokens if they'd rather not leave it active.

- 2026-10-12: Phase 0 scaffold done. `npm audit` reports 5 high-severity findings, all in the
  eslint-config-next dev-dependency chain (braces/micromatch/fast-glob ReDoS, GHSA-vfj7-8cjw-p6xm).
  Dev-only, not shipped to production; the auto-fix downgrades eslint-config-next to 14.2.35
  (a breaking change), so it was left for a deliberate decision rather than applied blindly.
- 2026-10-12: Real bug found and fixed during Phase 6 testing, not just by
  inspection: AuthDrawer could reopen itself automatically right after
  sign-out. Root cause was a race between signIn's server action (which calls
  revalidatePath, auto-refreshing Nav) and AuthDrawer's own client-side
  onSignedIn callback meant to close the drawer -- the automatic Nav refresh
  could unmount SignInForm before its effect ever ran, leaving AuthControl's
  `open` state stuck true. Fixed by making AuthControl itself reset `open`
  whenever its `signedIn` prop flips true, instead of relying solely on the
  child's callback. Found via a Playwright trace with temporary debug
  logging, not by reading the code.
- 2026-10-12: Disabled Next.js 16's experimental "Cache Components" feature
  (next.config.ts) -- it was enabled by default by create-next-app and kept
  throwing prerendering diagnostics for pages that are legitimately dynamic
  by design (auth cookies, live DB reads). Not needed at this stage; revisit
  deliberately in Phase 11 if useful.
- 2026-10-12: Mobile scroll had visible jank. Root cause: `hero-engine.js` set
  `ctx.imageSmoothingQuality` on every single render call (every scroll tick) instead of once,
  and canvas backing-store resolution was capped at 2x DPR even on phones with 3x screens.
  Fixed in both `hero/standalone/hero-engine.js` and `hero/nextjs/lib/hero-engine.js`. Verified
  with a Playwright CPU-throttle test: at 2x throttle (typical mid-range phone vs. a dev laptop),
  janky frames (>33ms) dropped from 56.3% to 8.3%. Very low-end/old devices (4x throttle) still
  show some jank — inherent to a 211-frame canvas scrub effect; would need frame-skipping or a
  lower-res mobile frame set to fully fix, which trades off visual quality.
