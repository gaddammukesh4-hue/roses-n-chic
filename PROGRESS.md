# Progress

Update this file at the end of every phase.

- [~] Phase 0: Set up. Done: git repo initialized and pushed to GitHub (gaddammukesh4-hue/roses-n-chic, 2026-10-12, secret scanning + push protection on), Next.js app scaffolded (TypeScript, App Router, Tailwind) in the project root, gsap/lenis/zod installed, dev server smoke-tested on localhost:3000. Supabase `rnc-dev` project created and linked, `.env.local` filled in. Razorpay test keys in `.env.local` (2026-10-12, see Phase 7). All four recommended plan.md A3 skills installed: ui-ux-pro-max, vercel-labs/agent-skills, supabase/agent-skills, owasp-security. Still not done: Vercel link, Stripe keys.
- [x] Phase 1: Brand and design system. DESIGN.md written (colors with computed WCAG contrast table, type scale, radius, shadows, frosted-glass tokens, button states, logo usage). Tokens wired into app/globals.css as Tailwind @theme. Logo files made: public/logo.svg, public/logo-light.svg, app/icon.svg (favicon). Live demo at /design-system (buttons, headings, cards, logo). Used the ui-ux-pro-max skill for spacing/button/glassmorphism UX guidance, but NOT its generic color-palette match (it returned a dark+gold "Liquid Glass" direction that contradicts CLAUDE.md's "no dark backgrounds" rule) — colors come from the palette already proven live in hero.css instead. Found and fixed a real WCAG AA failure along the way: the hero's "Explore" button hover state was white-on-champagne (2.35:1); changed to white-on-rose-mid (5.57:1) in all 4 copies of hero.css.
- [x] Phase 2: Hero video assets (done: frames and cut-out in hero/standalone/frames)
- [x] Phase 3: Hero scroll animation. Integrated into the live Next.js app on 2026-10-12: components/lib/styles copied in, frames copied to public/hero/frames, app/layout.tsx and app/page.tsx wired to Nav+HeroScrub, conflicting default body styles removed from globals.css. Verified with Playwright at 1440x810 and 390x844 (real device sizes, not the browser's default window) — 0 console/page errors, full scroll sequence renders correctly at both sizes, mobile dock position and logo fade match hero/README.md.
- [x] Phase 4: Database. Applied to the live `rnc-dev` project on 2026-10-12 (`supabase link` + `supabase db push`, all 4 migrations). Seed data loaded (6 products, 30 variants). RLS verified two ways: through the app (draft product 404s, active products list correctly), and independently via raw REST calls with the anon key (`/rest/v1/products` returns only the 5 active rows; `/rest/v1/measurements` returns `[]` with no auth) -- the Phase 4 "done when" criterion is genuinely confirmed, not just true by construction.
- [x] Phase 5: Catalog and product pages. Verified against the live database on 2026-10-12: /collections renders all 5 active products with real fabric/price/filters, /collections/[slug] renders the full size matrix, fabric/care notes, and JSON-LD. Deferred on purpose, not half-built: the video-badge/hover-reel/fullscreen-reel behavior (steps 3-5) has no media to work with yet (no product photography or reels exist, only the hero's own frames); "Custom Tailored" sizing (step 8) needs Phase 6 auth first. "Add to bag" is a visibly disabled button, not a fake-functional one -- Phase 7 wires it up. Found and fixed a real bug along the way: Nav had no styles of its own and only rendered correctly on the homepage (the only page that happened to also load hero.css) -- extracted nav.css as a globally-loaded shared file so Nav works on every page.
- [~] Phase 6: Accounts. Built and verified end-to-end against the live project (2026-10-12): slide-out frosted-glass Sign In / Create Account drawer (components/AuthDrawer.tsx, reusing the Phase 1 --glass-drawer-* tokens for the first time), email/password auth via Server Actions (app/actions/auth.ts), /auth/callback route for email-confirmation and password-recovery links, /account/reset-password, and the account page with a working save/remove measurements flow (app/actions/measurements.ts). Verified live: sign up (admin-confirmed test users, since Supabase's public signup endpoint blocks `@example.com` and the project's default email rate limit is 2/hour), sign in, Nav flips Sign-in <-> Account/Sign-out correctly, measurement save+display+remove, sign out, and RLS (profiles/measurements insert-own policies) all confirmed against the real database. Deferred: Google sign-in (needs Google Cloud OAuth credentials -- a user action, not started), guest-cart merge (no cart exists until Phase 7).
- [x] Phase 7: Cart and checkout (Razorpay). Payment wired up and verified live (2026-10-12): createOrder (app/actions/checkout.ts) re-reads prices/stock from the DB server-side and creates a real Razorpay test-mode order; CheckoutButton loads the real Razorpay Checkout widget (confirmed Test Mode banner, correct price, real iframe to api.razorpay.com); confirmPayment verifies the HMAC signature and calls the new fulfill_order Postgres function (migration 20261012000005), which atomically marks the order paid and decrements stock in one transaction; the webhook (app/api/webhooks/razorpay/route.ts) is the authoritative confirmation, independent of whether the client-side callback ever fires. All verified directly against the live database and a real signed webhook payload, not just by reading the code: stock decrements correctly (4->3), the RPC is idempotent (second call on a paid order is a no-op, verified via raw REST), oversell protection works (artificially zeroed stock -> RPC raises and rolls back, order stays pending), the webhook accepts a correctly HMAC-signed payload and rejects a tampered one (400), and a duplicate webhook delivery is detected and ignored via the event_id hash of the raw body. Stripe (international/USD) not started -- Razorpay covers India/UPI/cards for now. /account's Orders section now shows real order history.
- [x] Phase 8: Admin panel. Fully built and verified live end-to-end (2026-10-12). /admin (layout-gated on profiles.is_admin) confirmed both directions: a signed-in non-admin is redirected home, an admin reaches it. Products: create, edit, per-size stock (upsertVariant), photo upload via signed Storage URLs (components/admin/ImageUploader.tsx -- browser uploads directly to Storage, never through the Next.js server), reel video URL. Orders: status change and tracking number, both confirmed to actually persist. Every mutation type logs to admin_audit_log (migration 20261012000007) -- all four action kinds (create_product, upsert_variant, upload_product_image, update_reel_url, update_order_status) confirmed with correct metadata. All admin writes use the regular RLS-bound client, not the service-role one -- RLS's existing admin policies ARE the authorization, same principle Phase 7 established. The one earlier "image upload doesn't work" result was a test-timing issue (the test's fixed wait was shorter than the real multi-step round trip) -- confirmed by adding client-side debug logging and tracing every step to completion before concluding either way, same discipline as every other "is this really broken" question this session.
  Found and fixed a real schema bug while cleaning up test data: admin_audit_log.admin_id was `not null` but also `on delete set null` on its FK to auth.users -- a direct contradiction that made deleting any admin user who'd logged an action fail outright (500, transaction rolled back). Fixed by dropping the not-null constraint (migration 20261012000008) so a log entry can survive its admin's account being deleted, instead of blocking the deletion. Only surfaced because the cleanup step was actually exercised, not skipped.
- [ ] Phase 9: Marketing, SEO, content
- [ ] Phase 10: Security review
- [ ] Phase 11: Quality and speed
- [ ] Phase 12: Launch

## Notes
(Write decisions and open problems here.)

- 2026-10-12: Removed the 6 placeholder products (seeded for Phase 4-8
  testing) now that the admin panel works and the owner is entering real
  inventory through it. `supabase/seed.sql` emptied so a local
  `db reset` doesn't reintroduce them; `supabase/README.md`'s product/photo
  instructions updated to point at the admin panel as the primary path
  (the Storage-dashboard-folder + sync-script route documented earlier
  still works as a bulk-upload alternative). Catalog and `/collections`
  are correctly empty right now, not broken -- real products not entered
  yet.

- 2026-10-12: Phase 8 testing paused mid-session once for a low context
  budget, then resumed in a fresh session -- picked back up cleanly by
  reading this file, finished the remaining verification (orders page,
  reel URL, order status/tracking), found and fixed the admin_audit_log
  bug above, and cleaned up all test data (two test users, one test
  product, one test order). Confirms the PROGRESS.md discipline works
  across a context reset, not just within one conversation.

- 2026-10-12: Product photo pipeline built (fills in the gap Phase 5 left
  deliberately open). `product-media` Storage bucket (public, 10MB/file,
  jpeg/png/webp) with RLS matching every other admin-write table
  (migration 20261012000006). Catalog and product-detail pages now
  display real images via next/image when product_media has rows, and
  fall back to the existing brand-gradient placeholder otherwise -- no
  broken-image states either way. You upload photos yourself through the
  Supabase dashboard (one folder per product, named by slug -- see
  supabase/README.md for the exact steps and current slug list); I run
  `scripts/sync-product-media.mjs` to match folders to products afterward,
  safe to re-run any time photos change. Verified the whole pipeline
  end-to-end with a real uploaded test file (storage upload -> sync
  script -> product_media row -> real rendered image in the catalog),
  then cleaned the test artifact up.

- 2026-10-12: During Razorpay testing, hit a real race condition in
  CheckoutButton (not just a test artifact, though it showed up as one
  first): next/script's onReady fires via React state, which updates
  asynchronously -- a click that lands right as the external script
  finishes loading can read a stale `scriptReady=false` even though
  `window.Razorpay` the actual global is already set, producing a false
  "payment widget still loading" error. Fixed by polling `window.Razorpay`
  directly instead of trusting the onReady-derived state flag alone.
  Found by adding temporary debug logging and tracing actual execution
  order, not by inspection -- the first few "it's stuck" results were
  genuinely confusing until the logs showed createOrder() completing
  successfully server-side every time, which narrowed it to the client.
- 2026-10-12: Did not attempt to fully automate submitting a test card
  through Razorpay's own Checkout iframe (third-party UI outside this
  codebase, with its own React app, contact-verification step, and DOM
  structure not worth hard-coding against). Instead verified the actual
  security-critical code directly against the live database and a real
  signed HTTP request: the fulfill_order RPC (idempotency, oversell
  protection) and the webhook route (signature acceptance/rejection,
  duplicate-event detection) -- see Phase 7 entry above for the specific
  checks. This covers what the integration is actually responsible for
  getting right; Razorpay's own widget rendering correctly (Test Mode
  banner, correct price, real API calls) was confirmed visually.

- 2026-10-12: Ran an OWASP-skill-guided security pass over every Server
  Action (app/actions/auth.ts, cart.ts, measurements.ts). All of them use
  the regular RLS-bound Supabase client (lib/supabase/server.ts), never
  the service-role admin client -- grepped the whole app/components/lib
  tree to confirm nothing outside lib/supabase/admin.ts references
  service_role at all. This means ownership checks (e.g. "can this user
  delete this cart item") are enforced by Postgres RLS itself, not by
  app-code trust -- a forged ID from another user's data affects zero
  rows rather than bypassing anything. No exploitable issues found. One
  known, not-yet-built gap: rate limiting on sign-in/sign-up/password-
  reset, which is Phase 10 scope by design, not an oversight.

- 2026-10-12: Supabase `rnc-dev` project linked and schema pushed. The CLI
  personal access token used for `supabase link`/`db push` was never written
  to a file (passed inline as an env var to the one-off commands only) and
  is not needed again day-to-day -- the user may revoke it from
  supabase.com/dashboard/account/tokens if they'd rather not leave it active.

- 2026-10-12: Phase 0 scaffold done. `npm audit` reports 5 high-severity findings, all in the
  eslint-config-next dev-dependency chain (braces/micromatch/fast-glob ReDoS, GHSA-vfj7-8cjw-p6xm).
  Dev-only, not shipped to production; the auto-fix downgrades eslint-config-next to 14.2.35
  (a breaking change), so it was left for a deliberate decision rather than applied blindly.
- 2026-10-12: During Phase 7, found the Phase 6 drawer-reopen fix had only
  fixed the symptom, not the root cause -- the same pattern (a child form
  effect calling back to a parent on sign-in success) was reused for the
  cart merge and it silently never ran. Root cause: `signIn`'s
  `revalidatePath` call can unmount SignInForm (as part of the same RSC
  update that flips Nav's signedIn prop) before its own resolved-action-
  state effect gets a chance to fire. Fixed properly this time: both the
  drawer-close and the cart-merge now live in AuthControl's effect watching
  the `signedIn` prop directly (the one thing proven to update reliably),
  not in any child form's callback. Confirmed via direct Supabase REST
  queries (not just UI checks) that the merge actually lands in the
  database, and that two earlier "it's not working" results during testing
  were test-timing bugs (not waiting long enough for sequential DB round
  trips), not app bugs -- verified by tracing server-side logs before
  concluding either way.
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
