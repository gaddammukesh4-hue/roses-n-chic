# Progress

Update this file at the end of every phase.

- [~] Phase 0: Set up. Done: git repo initialized and pushed to GitHub (gaddammukesh4-hue/roses-n-chic, 2026-10-12, secret scanning + push protection on), Next.js app scaffolded (TypeScript, App Router, Tailwind) in the project root, gsap/lenis/zod installed, dev server smoke-tested on localhost:3000. Supabase `rnc-dev` project created and linked, `.env.local` filled in. Razorpay test keys in `.env.local` (2026-10-12, see Phase 7). All four recommended plan.md A3 skills installed: ui-ux-pro-max, vercel-labs/agent-skills, supabase/agent-skills, owasp-security. **Vercel linked and live 2026-10-13**: project `gaddam1/roses-n-chic`, connected to the GitHub repo (pushes to `main` will auto-deploy from now on), all 8 env vars set for Production (NEXT_PUBLIC_SUPABASE_ANON_KEY needed an explicit `--type config` override -- Vercel's CLI flags any NEXT_PUBLIC_ var that looks like a credential and asks you to confirm the public exposure is intentional, which it is here). Live at https://roses-n-chic.vercel.app -- verified home, /collections, /atelier, a policy page, robots.txt, sitemap.xml, and the generated OG image all return 200, and the CSP/HSTS/security headers from next.config.ts are present on the real deployment. Still not done: Stripe keys. **Follow-up needed**: the Razorpay webhook was never registered in the Razorpay dashboard (per .env.local.example's own note, that step was deliberately deferred until there was a real deployed URL) -- now that one exists, go to the Razorpay dashboard -> Webhooks, add `https://roses-n-chic.vercel.app/api/webhooks/razorpay`, and enter the same RAZORPAY_WEBHOOK_SECRET value already in `.env.local`/Vercel.
- [x] Phase 1: Brand and design system. DESIGN.md written (colors with computed WCAG contrast table, type scale, radius, shadows, frosted-glass tokens, button states, logo usage). Tokens wired into app/globals.css as Tailwind @theme. Logo files made: public/logo.svg, public/logo-light.svg, app/icon.svg (favicon). Live demo at /design-system (buttons, headings, cards, logo). Used the ui-ux-pro-max skill for spacing/button/glassmorphism UX guidance, but NOT its generic color-palette match (it returned a dark+gold "Liquid Glass" direction that contradicts CLAUDE.md's "no dark backgrounds" rule) — colors come from the palette already proven live in hero.css instead. Found and fixed a real WCAG AA failure along the way: the hero's "Explore" button hover state was white-on-champagne (2.35:1); changed to white-on-rose-mid (5.57:1) in all 4 copies of hero.css.
- [x] Phase 2: Hero video assets (done: frames and cut-out in hero/standalone/frames)
- [x] Phase 3: Hero scroll animation. Integrated into the live Next.js app on 2026-10-12: components/lib/styles copied in, frames copied to public/hero/frames, app/layout.tsx and app/page.tsx wired to Nav+HeroScrub, conflicting default body styles removed from globals.css. Verified with Playwright at 1440x810 and 390x844 (real device sizes, not the browser's default window) — 0 console/page errors, full scroll sequence renders correctly at both sizes, mobile dock position and logo fade match hero/README.md.
- [x] Phase 4: Database. Applied to the live `rnc-dev` project on 2026-10-12 (`supabase link` + `supabase db push`, all 4 migrations). Seed data loaded (6 products, 30 variants). RLS verified two ways: through the app (draft product 404s, active products list correctly), and independently via raw REST calls with the anon key (`/rest/v1/products` returns only the 5 active rows; `/rest/v1/measurements` returns `[]` with no auth) -- the Phase 4 "done when" criterion is genuinely confirmed, not just true by construction.
- [x] Phase 5: Catalog and product pages. Verified against the live database on 2026-10-12: /collections renders all 5 active products with real fabric/price/filters, /collections/[slug] renders the full size matrix, fabric/care notes, and JSON-LD. Deferred on purpose, not half-built: the video-badge/hover-reel/fullscreen-reel behavior (steps 3-5) has no media to work with yet (no product photography or reels exist, only the hero's own frames); "Custom Tailored" sizing (step 8) needs Phase 6 auth first. "Add to bag" is a visibly disabled button, not a fake-functional one -- Phase 7 wires it up. Found and fixed a real bug along the way: Nav had no styles of its own and only rendered correctly on the homepage (the only page that happened to also load hero.css) -- extracted nav.css as a globally-loaded shared file so Nav works on every page.
- [x] Phase 6: Accounts. Built and verified end-to-end against the live project (2026-10-12): slide-out frosted-glass Sign In / Create Account drawer (components/AuthDrawer.tsx, reusing the Phase 1 --glass-drawer-* tokens for the first time), email/password auth via Server Actions (app/actions/auth.ts), /auth/callback route for email-confirmation and password-recovery links, /account/reset-password, and the account page with a working save/remove measurements flow (app/actions/measurements.ts). Verified live: sign up (admin-confirmed test users, since Supabase's public signup endpoint blocks `@example.com` and the project's default email rate limit is 2/hour), sign in, Nav flips Sign-in <-> Account/Sign-out correctly, measurement save+display+remove, sign out, and RLS (profiles/measurements insert-own policies) all confirmed against the real database. **Google sign-in added and verified live 2026-10-13**: "Continue with Google" button in AuthDrawer, Google OAuth client set up by the user, provider enabled in Supabase via the Management API, confirmed end-to-end (redirects to a real Google consent screen with the correct client_id/redirect_uri, lands back signed in). Guest-cart merge: done (see Phase 7).
- [x] Phase 7: Cart and checkout (Razorpay). Payment wired up and verified live (2026-10-12): createOrder (app/actions/checkout.ts) re-reads prices/stock from the DB server-side and creates a real Razorpay test-mode order; CheckoutButton loads the real Razorpay Checkout widget (confirmed Test Mode banner, correct price, real iframe to api.razorpay.com); confirmPayment verifies the HMAC signature and calls the new fulfill_order Postgres function (migration 20261012000005), which atomically marks the order paid and decrements stock in one transaction; the webhook (app/api/webhooks/razorpay/route.ts) is the authoritative confirmation, independent of whether the client-side callback ever fires. All verified directly against the live database and a real signed webhook payload, not just by reading the code: stock decrements correctly (4->3), the RPC is idempotent (second call on a paid order is a no-op, verified via raw REST), oversell protection works (artificially zeroed stock -> RPC raises and rolls back, order stays pending), the webhook accepts a correctly HMAC-signed payload and rejects a tampered one (400), and a duplicate webhook delivery is detected and ignored via the event_id hash of the raw body. Stripe (international/USD) not started -- Razorpay covers India/UPI/cards for now. /account's Orders section now shows real order history. **Razorpay webhook still needs registering in the Razorpay dashboard** pointing at `https://roses-n-chic.vercel.app/api/webhooks/razorpay` with the existing RAZORPAY_WEBHOOK_SECRET -- flagged since Phase 0, not yet done (user action).
  **Shipping address collection added 2026-10-13** -- a real gap found via a user question, not originally planned as a fix: nothing collected a shipping address anywhere (not at signup, not at checkout) despite the `addresses` table and `orders.shipping_address` column existing since Phase 4. Built an address book (account page) and an address picker at checkout; `createOrder` now requires a selected address and stores it on the order. Verified live end-to-end (real order, confirmed the exact address landed in the database).
- [x] Phase 8: Admin panel. Fully built and verified live end-to-end (2026-10-12). /admin (layout-gated on profiles.is_admin) confirmed both directions: a signed-in non-admin is redirected home, an admin reaches it. Products: create, edit, per-size stock (upsertVariant), photo upload via signed Storage URLs (components/admin/ImageUploader.tsx -- browser uploads directly to Storage, never through the Next.js server), reel video URL. Orders: status change and tracking number, both confirmed to actually persist. Every mutation type logs to admin_audit_log (migration 20261012000007) -- all four action kinds (create_product, upsert_variant, upload_product_image, update_reel_url, update_order_status) confirmed with correct metadata. All admin writes use the regular RLS-bound client, not the service-role one -- RLS's existing admin policies ARE the authorization, same principle Phase 7 established. The one earlier "image upload doesn't work" result was a test-timing issue (the test's fixed wait was shorter than the real multi-step round trip) -- confirmed by adding client-side debug logging and tracing every step to completion before concluding either way, same discipline as every other "is this really broken" question this session.
  Found and fixed a real schema bug while cleaning up test data: admin_audit_log.admin_id was `not null` but also `on delete set null` on its FK to auth.users -- a direct contradiction that made deleting any admin user who'd logged an action fail outright (500, transaction rolled back). Fixed by dropping the not-null constraint (migration 20261012000008) so a log entry can survive its admin's account being deleted, instead of blocking the deletion. Only surfaced because the cleanup step was actually exercised, not skipped.
  **Three more real gaps found and fixed 2026-10-13**, all from the user actually using the admin panel rather than from code review: (1) creating a product had no visible way to add photos/video -- `createProduct` now redirects straight to the edit page instead of leaving you on the bare details form; (2) orders showed no customer info at all -- now shows name/phone (new `profiles_select_admin` RLS policy, migration 20261012000011) and email (service-role, since auth.users isn't RLS-governable) plus the full shipping address; (3) direct video file upload for reels (components/admin/ReelUploader.tsx replaces the URL-only field) -- product-media bucket now allows video/mp4/webm/quicktime up to 50MB (the project's Storage plan cap). A visible "Admin" nav link was also added for signed-in admins (desktop + mobile) -- previously had to know the `/admin` URL by heart. All verified live through the real admin UI, not just read.
- [~] Phase 9: Marketing, SEO, content. Built 2026-10-12: Footer (components/Footer.tsx — Chennai atelier note, @rosesnchic Instagram link, policy links, newsletter form) added to every public page (home, collections, product, account, reset-password). /atelier (about + fabric story: handloom cotton, viscose rayon). Four policy pages (/policies/privacy, /terms, /shipping, /returns) — written as honest drafts, explicitly flagged both on-page ("Last updated" line) and in code comments as NOT yet reviewed against Indian consumer/data-protection law (plan.md Part E) -- do not launch on these as-is. app/sitemap.ts (static routes + live active products) and app/robots.ts (disallows /admin, /account, /checkout, /api, /auth) added. Every page now resolves a title via the root layout's title template, plus a generated brand share image (app/opengraph-image.tsx, app/twitter-image.tsx via next/og) as the default, overridden by the product's own photo on product pages when one exists. Removed two dead Nav links (/journal, /search) that 404'd -- neither has a planned feature behind it in plan.md, so left out rather than building placeholder pages.
  Analytics (item 6): built a minimal privacy-respecting self-hosted pageview log instead of adding a third-party analytics account (nobody asked me to pick a vendor, and this needed no new account/credentials to actually ship now) -- migration 20261012000009 adds `page_views` (path + referrer only, no IP/user-agent/cookie) and `newsletter_subscribers`, both insert-open to anyone but only admin-readable; components/PageViewBeacon.tsx logs one row per route change via a Server Action; /admin/analytics shows 30-day totals and top pages. Swapping in Vercel Analytics or similar later (once Vercel is linked) is a small change, not a rebuild.
  Newsletter (item 7): footer form -> app/actions/newsletter.ts -> `newsletter_subscribers`, same migration as above.
  **Applied to the live `rnc-dev` database 2026-10-13** (user provided a fresh Supabase CLI token) -- newsletter signup and page-view logging both verified working live. Newsletter and analytics have since been extended further: components/CookieNotice.tsx (dismissible, informational -- only functional cookies are used, nothing to gate behind consent), and per-visitor "who viewed what" tracking for signed-in users (migration 20261012000012 adds `page_views.user_id`; signed-out visits stay fully anonymous). The Privacy policy was rewritten accordingly: explicit "we do not sell or share with any third party" language, promotional-email-only use of browsing data, and a new Cookies section. Page-view logging runs as a Route Handler (app/api/track-view/route.ts) called via explicit fetch, not a Server Action -- see the Phase 11 entry below for why.

- [~] Phase 10: Security review. Started 2026-10-12, the parts buildable without a live staging deployment or new accounts:
  - **Rate limiting** (Part C item, previously flagged as deferred in the Phase 7 note above): migration 20261012000010_rate_limits.sql adds `rate_limit_hits` (service-role-only, no RLS policy for anon/authenticated at all -- same pattern as payment_events). lib/rate-limit.ts keys on a hash of the caller's IP (from x-forwarded-for/x-real-ip) per action type; fails open on any DB error so a rate-limit outage can't lock out every visitor. Wired into sign-in (10/5min), sign-up (5/hour), password-reset request (3/hour), checkout order creation (20/hour), and the new newsletter signup (5/hour). Also depends on migration 20261012000010 being applied -- until then every check fails open (allows the action), so nothing breaks, the limits just aren't active yet.
  - **Security headers** (next.config.ts): CSP, Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, Permissions-Policy added via `headers()`. CSP keeps `'unsafe-inline'` for script-src/style-src -- Next.js's own hydration scripts and the Tailwind/inline-style JSX used throughout need it; a nonce-based strict CSP would need a middleware rewrite of every response, left for a deliberate Phase 11 pass rather than risked against checkout right now. Verified live: headers present on a built-and-started production server, homepage and checkout iframe still render correctly.
  - **Dependabot**: `.github/dependabot.yml` added (npm + github-actions, weekly). Still needs you to flip "Dependabot alerts" / "Dependabot security updates" on in the repo's Settings -> Code security page -- a one-click dashboard toggle, not a credential I can act on.
  - **Git history secret scan**: ran a pattern scan (`sk_live`, `rzp_live`, `github_pat_`, `sbp_`, private-key headers, etc.) across the full `git log --all -p`. Clean -- `git ls-files` also confirms only `.env.local.example` (no real values) was ever tracked, `.env.local` itself was never committed.
  - **OWASP self-review of the new Phase 9/10 code** (2026-10-12): newsletter.ts, analytics.ts, and rate-limit.ts all use the regular RLS-bound client (lib/supabase/server.ts), *except* rate-limit.ts, which deliberately uses the service-role client -- same justification as payment_events/admin_audit_log: `rate_limit_hits` has no RLS policy for anon/authenticated at all, so there's no "ownership" for RLS to enforce, and the whole point is that a client can't read or clear its own bucket. Verified live against the real database (not just read): anon can insert a newsletter signup and a page view but cannot read either back; anon insert into `rate_limit_hits` is actually rejected (42501); the admin-analytics select policy mirrors the already-proven admin-role-check pattern from Phase 8. No issues found.
  - **`npm audit` eslint-config-next finding: closed, not fixed** (see Notes below) -- re-checked, still no safe non-breaking fix available; accepted as a dev-only risk with no path to the production runtime.
  - **Manual OWASP-style audit against the live site (2026-10-14)**: actual OWASP ZAP isn't runnable in this environment (needs Docker or a Java/Python install, neither available) -- did a manual Top-10-style pass instead using curl/Supabase REST/Playwright: confirmed RLS blocks anonymous and cross-user reads on every sensitive table (orders, payment_events, admin_audit_log, rate_limit_hits, addresses, measurements, profiles -- all return empty to an anon-key request with no auth), ran a real two-user IDOR test (user B cannot read or delete user A's address/measurement by ID), confirmed /admin redirects unauthenticated visitors, confirmed the Razorpay webhook rejects an unsigned payload (400), confirmed no permissive CORS headers, confirmed rate limiting is genuinely active (real entries in `rate_limit_hits` from live usage). Found and fixed two real gaps: app/auth/callback/route.ts's `next` redirect param had no validation (hardened against `//`-prefixed protocol-relative payloads); the Product JSON-LD on collection pages embedded `JSON.stringify()` output unescaped inside a `<script>` tag, which a product name containing `</script>` could break out of (now escapes `<`). Not a substitute for a real ZAP scan, but a legitimate manual pass within what's actually available here.
- [~] Phase 11: Quality and speed. Started 2026-10-13, scoped to the pages touched in Phase 9 (full-site Playwright checkout re-run and real-device testing still pending):
  - Ran Lighthouse (desktop, production build) against home, /atelier, /collections, and all four policy pages. Found and fixed three real issues, not just confirmed clean:
    1. **Contrast bug, same root cause as the Phase 1 CTA bug**: `.next__eyebrow` ("The collection" label under the hero) used `color: var(--champagne)` -- 2.17:1 on ivory, fails even the 3:1 non-text minimum, violating DESIGN.md's own "champagne is accent/border/decorative only, never text" rule. Fixed to `var(--rose-mid)` (5.15:1) in all five existing copies of hero.css (styles/, hero/standalone/, hero/nextjs/styles/, and the legacy roses-n-chic-hero sibling folder's nextjs/ and standalone/ copies).
    2. **Focusable content behind `aria-hidden`**: AuthDrawer and CartDrawer set `aria-hidden={!open}` when closed but left their inputs/buttons tab-focusable -- a keyboard or screen-reader user could reach a "hidden" sign-in form. Fixed by adding `inert={!open}` alongside the existing `aria-hidden` (React 19 passes it straight through as the native DOM attribute, which removes focusability and the accessibility-tree presence together).
    3. **Links relying on color alone**: the inline @rosesnchic Instagram mentions in /atelier and all four policy pages' "contact us" lines were either color-only links or not links at all (plain text mentioning the handle). Made all of them real links with an underline, plus a screen-reader-only "(opens in a new tab)" suffix (WCAG 2.4.4).
  - Re-verified after fixes: Performance 100, Accessibility 100, Best Practices 100, SEO 100 on every page tested (home included).
  - **Business/legal details added to the policy pages (2026-10-13)**: lib/business-info.ts (single source of truth) + components/BusinessContact.tsx now surface a real-ish Grievance Officer contact on Privacy and Terms, a governing-law/jurisdiction clause (India, Chennai courts) on Terms, and a phone contact + concrete 7-business-day refund window on Returns/Shipping (replacing the previous vague "depends on your bank" line). **These are still placeholders, not final**: legal name "GM Innovations Private Limited" and phone "+91 80748 59918" (user explicitly called this phone number "rough usage", i.e. temporary) were given 2026-10-13 and the user explicitly asked these be tracked as needing replacement later -- also saved to Claude's cross-session memory for this reason. GSTIN is deliberately NOT a real/fabricated number -- shown as "GST registration in progress" instead, since a made-up GSTIN shown to a real customer would be a false statement, not just an incomplete field (flagged to the user, who didn't object). **Address added 2026-10-13**: Chinnamushidivada, Visakhapatnam, Andhra Pradesh 531173, India (user gave this alongside a brief, since-corrected business-name mix-up -- see the Notes entry below). Re-verified Lighthouse accessibility still 100 on all four pages after this change.
  - **Page-view tracking debugging episode (2026-10-13)**: spent real effort chasing what looked like a Next.js Server Action bug (auth cookie never reaching a client-invoked action, confirmed with a raw cookie dump) before finding the actual cause was a test-script locator ambiguity (Footer has its own always-present "Account" link), not an app bug. Converted page-view logging to a Route Handler anyway (app/api/track-view/route.ts) since it already works and gives a cleaner, more explicit request path for a frequently-firing beacon. See the Notes entry below for the full story -- worth reading before assuming a similar "cookie not reaching the server" symptom elsewhere is a framework bug.
  - **Full checkout regression re-verified live (2026-10-14)**: sign-in, add-to-bag, checkout, add-address, Pay -- confirmed via the database (not just the UI) that real orders were created with the exact address and correct total, same proof standard as Phase 7's original verification. The automated end-to-end test script itself kept hanging partway through on repeated runs (traced to a serious, unrelated environment problem -- see below), so this was confirmed by inspecting the actual order rows those partial runs left behind rather than one single clean script pass; the checkout code itself is proven working, not assumed.
  - **axe-core accessibility audit (2026-10-14)**: a proper automated accessibility audit (more thorough than Lighthouse's built-in a11y check) against all 8 live pages (home, /atelier, /collections, all 4 policy pages, /account), since no real screen-reader/assistive-technology tool is available in this environment for a true manual pass. Found one real, consistent issue on every single page: components/CookieNotice.tsx's root div sits directly under `<body>` in the root layout, outside any semantic landmark, which axe flags ("region: Ensure all page content is contained by landmarks"). Fixed with `role="region" aria-label="Cookie notice"`. Re-ran after deploying: 0 violations on all 8 pages. scripts/axe-audit.mjs kept as a reusable regression check.
  - **Real-device/slow-network pass (2026-10-14)**: iPhone SE emulation + 4x CPU throttle + ~400kbps/400ms-latency network profile (same methodology as the hero's earlier mobile jank fix) against the live site. Home loaded in ~9s under this throttle (expected -- it's the heaviest page, the 211-frame hero sequence), /collections in ~3.4s, /atelier in ~1s. The mobile-nav-interaction sub-check didn't complete (see the environment issue below) but the nav/mobile-menu code itself was already extensively proven working in the earlier mobile-nav-fix round this session.
  - **Found and fixed a real environment problem, not an app bug**: discovered dozens of orphaned `next start` server processes (ports 3100-3250, one per test server started throughout this entire session) and 27 leftover Chromium browser instances still running, because `pkill -f "next start"` was not actually killing the underlying Windows process tree the way it does on Linux/Mac -- it silently reported success while leaving processes alive. This was very likely the cause of the increasingly flaky/hanging Playwright test runs today (resource contention). Cleaned up via PowerShell `Stop-Process` against the actual process list. Also found and cleaned up real leftover test data this had caused: several "Phase 11 Test Dress" products and their associated real orders were sitting live in the production catalog/database from earlier hung test runs that never reached their cleanup step -- all removed, catalog confirmed empty again. **For future sessions**: `pkill` alone is not reliable for killing background Next.js/Playwright processes in this Windows environment -- verify with `Get-CimInstance Win32_Process -Filter "name='node.exe'"` (or similar) and force-kill via PowerShell `Stop-Process` when something seems to hang.
- [ ] Phase 12: Launch. Not started. User explicitly deferred custom domain and Razorpay KYC "until everything else is done" (2026-10-13, saved to cross-session memory) -- don't flag these as overlooked gaps, but do raise them again once the rest of this list is genuinely done.

## Notes
(Write decisions and open problems here.)

- 2026-10-13: Built the "who viewed what" per-visitor analytics the user
  asked for, after confirming the trade-off against the privacy policy's
  existing no-identification promise -- user explicitly said to rewrite
  the policy and asked for a cookie notice too. Privacy policy
  (app/policies/privacy/page.tsx) rewritten: page views are now linked to
  the account for signed-in visitors (still fully anonymous when signed
  out), explicit "we do not sell or share with any third party" language,
  and a new Cookies section (functional cookies only -- auth session,
  guest cart -- no ad/tracking cookies). Added components/CookieNotice.tsx,
  a dismissible informational banner (not a blocking consent gate, since
  no non-essential cookies are used) in the root layout. Migration
  20261012000012 adds `page_views.user_id` (nullable, set null on user
  delete); the signed-in user's id is recorded from the server session
  (never client input, so it can't be spoofed); /admin/analytics has a
  new "Who viewed what" table (customer name/email + page + timestamp,
  signed-in visits only).

  Implementation note: page-view logging is a Route Handler
  (app/api/track-view/route.ts) called via an explicit fetch() from
  components/PageViewBeacon.tsx, not a plain Server Action -- initially
  built as a Server Action, but chasing a real-looking "the cookie never
  reaches this action" symptom during testing (confirmed with a raw
  cookie dump inside the action -- genuinely empty) burned a lot of time
  before the actual root cause turned up: my own test script's
  `getByRole('link', { name: 'Account' })` locator was ambiguous (Footer
  also has an Account link, always present regardless of auth state), so
  `waitFor()` wasn't reliably waiting for sign-in to actually finish
  before the test navigated onward -- not a Next.js or app bug at all.
  Confirmed this by re-testing with the locator properly scoped to
  `header.nav`, which passed cleanly. Kept the Route Handler anyway since
  it already works and gives this one frequently-firing beacon explicit
  control over its own request rather than relying on Next's Server
  Action dispatch -- a reasonable choice either way, not a required fix.

- 2026-10-13: Google sign-in (Phase 6, previously deferred) -- **done and
  verified live.** components/AuthDrawer.tsx has a "Continue with Google"
  button (both sign-in and create-account views) using the browser
  Supabase client's `signInWithOAuth`, redirecting through the existing
  app/auth/callback/route.ts (already written generically enough to
  handle this, per its own comment -- no changes needed there). User
  created the Google Cloud OAuth client and gave me the Client ID +
  Secret; enabled the provider directly via the Supabase Management API
  (`PATCH /v1/projects/{ref}/config/auth`) using the existing CLI access
  token, no dashboard clicking needed. Verified live against production:
  clicking the button redirects to a real accounts.google.com screen with
  the correct client_id and redirect_uri in the URL. One real limitation,
  not a bug: the Google Cloud OAuth consent screen is in "Testing" mode by
  default, so only email addresses explicitly added as test users in
  Google Cloud Console can actually complete sign-in until the user
  publishes the consent screen for public use -- told them this.
- 2026-10-13: User had the policy pages reviewed by an actual lawyer (not
  me) -- their guidance: refund timeline should be 12-15 working days, not
  a shorter window, "for safer side." Updated app/policies/returns/page.tsx
  accordingly and adjusted its lastUpdated disclaimer to reflect that this
  specific detail has real legal sign-off, while being careful not to
  claim the same for the other three policy pages or the rest of the
  returns page, since only the refund timing was specifically mentioned.
- 2026-10-13: Direct video file upload for product reels (user explicitly
  asked for file upload, not just a URL field). Bucket `product-media`'s
  config updated via the Storage Management API to also allow
  video/mp4, video/webm, video/quicktime, and raised the per-file limit
  from 10MB to 50MB (the project's own plan-level Storage cap -- 100MB was
  rejected with a 413). New action `getProductVideoUploadUrl` (same
  signed-upload pattern as the existing image uploader) in
  app/actions/admin-products.ts; new components/admin/ReelUploader.tsx
  replaces ReelUrlField.tsx (deleted, no longer used) -- file upload is
  the primary path, with "paste a URL instead" still available as a
  fallback for external hosting, both writing to the same
  `updateReelUrl` action since the DB doesn't distinguish the two.
  Verified three ways before calling it done: (1) raw Storage-layer test
  confirming the bucket accepts video/mp4 and serves the correct
  content-type back; (2) a full Playwright run through the REAL admin UI
  -- created a temporary admin user, created a real product, uploaded an
  actual file through the file input, confirmed the video player appears
  with the uploaded content; (3) all test data (product, storage file,
  admin user, audit log rows) cleaned up afterward.
- 2026-10-13: Business name corrected back to "GM Innovations Private
  Limited" (the earlier switch to "Aruna Apparals" was wrong -- user
  confirmed GM Innovations is correct). Address stays as given
  (Chinnamushidivada, Visakhapatnam).
- 2026-10-13: Three more admin-panel gaps the user caught, all fixed:
  1. **Product creation had no visible path to add photos/video.**
     `/admin/products/new` only ever had the bare details form by design
     (photos/video/sizes live on the edit page) -- but staying on that
     page after creating looked like the feature didn't exist.
     `createProduct` now redirects straight to the new product's edit
     page on success.
  2. **Admin orders showed no customer info** -- just items/total/status.
     Added customer name/phone (via a new `profiles_select_admin` RLS
     policy, migration 20261012000011 -- same pattern as every other
     admin-read policy, not a service-role workaround) and email (via the
     service-role client, since auth.users isn't a public-schema table
     RLS can govern) alongside the full shipping address now that orders
     actually capture one.
  3. **Analytics showed a subscriber count but not who** -- now lists
     actual subscriber emails with signup dates, not just a number.
  Verified live: admin nav link appears after sign-in (confirmed with a
  proper `waitFor`, not a timeout -- an earlier timing-based check falsely
  read it as missing), product creation redirects to the edit page with
  photos/video sections immediately visible, and a test order's row shows
  the exact customer name/email/phone/address. All test data cleaned up
  after. **Deliberately not built**: per-visitor "who viewed what" page
  tracking -- the current privacy policy explicitly promises no visitor
  identification is stored for page views; adding that would mean
  rewriting that promise, not just a code change, so it's flagged to the
  user rather than silently built.
- 2026-10-13: **Real functional gap found and fixed**: user asked "why
  isn't phone/address collected at Google sign-in" -- the honest answer
  surfaced a bigger problem: nothing collected a shipping address
  *anywhere*, not just at Google sign-in. `createOrder` never asked for
  one; the account page literally said "Address book is planned for a
  future update." A customer could pay for an order today with zero
  record of where to ship it. The `addresses` table and
  `orders.shipping_address` column have existed since Phase 4's schema,
  just never wired to any UI. Built: app/actions/addresses.ts
  (add/delete, RLS-bound same pattern as measurements), components/
  AddressForm.tsx + DeleteAddressButton.tsx (account page, replaces the
  placeholder text), components/AddressPicker.tsx (radio-select existing
  + inline add-new, used at checkout). app/actions/checkout.ts's
  `createOrder` now requires an `addressId`, looks it up (RLS + explicit
  ownership check), and stores the full address as `orders.shipping_address`
  jsonb -- CheckoutButton's Pay button is disabled until an address is
  selected. Verified live end-to-end: created a test user, a real
  in-stock product, signed in, added to bag, added a new address inline
  at checkout, clicked Pay, and confirmed the resulting order row in the
  database has the exact address stored correctly -- then deleted all of
  it. Also added a visible "Admin" link to both the desktop nav and the
  mobile menu for signed-in admins (previously had to know the `/admin`
  URL by heart).
- 2026-10-13: Business identity updated again -- user gave "Aruna
  Apparals, Chinnamushidivada, Visakhapatnam -531173" as the real
  business name + address, replacing the earlier "GM Innovations Private
  Limited" placeholder. lib/business-info.ts and components/
  BusinessContact.tsx updated; GSTIN still "in progress" (unconfirmed).
  Saved to cross-session memory, including the open question of whether
  "Aruna Apparals" is a trade name under a separately-registered company.
- 2026-10-13: User explicitly deferred custom domain and Razorpay KYC
  ("can be done later, remember and remind me after everything else is
  done") -- saved to cross-session memory so these aren't mistakenly
  flagged as overlooked gaps in future status updates, and so they get
  raised again once the rest of the build is genuinely done.
- 2026-10-13: Granted admin access to gaddammukesh8074@gmail.com (the
  account that signed in via Google) via direct profiles.is_admin update
  -- same mechanism as every other admin grant this project, just
  triggered by a Google-authenticated account instead of email/password.
- 2026-10-13: User asked for an additional hero animation (a needle
  visibly stitching through cloth, prepended before the existing "Needle"
  chapter) to reinforce "hand-stitched, not mass manufactured." Told them
  plainly that generating new video/frame content is outside what this
  agent can do (no video-generation tool available) -- the original hero
  frames came from the user's own AI video tool + ffmpeg (plan.md Phase
  2), not from Claude Code. Offered the same path for this addition: they
  generate new footage (same reference image for consistency) and hand
  over frames; I handle all the integration into hero-engine.js (frame
  count, new chapter entry, retimed easing, mobile perf re-check). Not
  started -- waiting on footage from the user.

- 2026-10-13: User reported sign-in, the hero's Explore button, and nav
  links all "not working" on their phone's Safari. Investigated live with
  Playwright's real WebKit engine (Safari's actual rendering engine, not
  just a resized Chrome window) against the deployed site, and found two
  distinct, confirmed real bugs plus one design question (not yet
  resolved, see below):
  1. **AuthDrawer/CartDrawer collapsed to 64px tall in Safari specifically**
     (confirmed: 664px in Chrome, 64px in WebKit, same code, same page).
     Root cause: both drawers live inside `<header class="nav">`, which has
     `backdrop-filter` -- in WebKit, an ancestor with backdrop-filter
     becomes the containing block for `position:fixed` descendants (Chrome
     doesn't do this), so the drawers' "fixed inset-0" wrapper was
     constrained to the 60px nav bar's own box instead of the viewport.
     Fixed with components/ClientPortal.tsx (renders into document.body via
     react-dom's createPortal, mounted post-hydration to avoid an SSR
     mismatch), wrapping both drawers. Re-verified: 664px on both engines
     now.
  2. **Collections/Atelier had no path to them at all on mobile** (<=768px):
     nav.css's `.nav__links { display: none }` media rule hid them with no
     replacement -- not Safari-specific, present in Chrome mobile too, and
     likely the real reason "Collections...anything" felt broken, since a
     visitor can't even see the link to tap. Added components/
     MobileNavMenu.tsx, a small hamburger toggle (mobile-only) that reveals
     a dropdown with both links. Verified: toggle visible, panel link
     visible and clickable, navigates to /collections, on both Chrome and
     Safari mobile viewports.
  3. **Not yet fixed, needs a decision, not obviously a bug**: the hero's
     "Explore" button and tagline (`data-hero-late` elements in
     hero-engine.js) have `pointer-events: none` and `opacity: 0` until
     scroll progress passes ~84% (`cfg.scrubEnd`) -- confirmed via
     getComputedStyle on a fresh page load with zero scroll, in BOTH
     Chrome and Safari, so this is universal, not browser-specific. This
     looks like a deliberate cinematic choice (the brand lockup + CTA only
     completes once the model "docks" next to the logo at the end of the
     640vh scroll sequence, matching chapter 4's name "Roses N Chic" in
     cfg.chapters) rather than an accident -- but it means the hero's
     primary CTA is unusable from the very first view, which is a real
     usability cost regardless of original intent. Flagged to the user,
     not changed without their input since it touches the hero's
     carefully-tuned choreography from Phase 3.
  All verified against the LIVE Vercel deployment first (to reproduce
  exactly what the user saw), then against localhost after the fix, on
  both webkit and chromium via Playwright -- not just code review.

  Re-verifying fix #2 directly on the live deployment (after the first
  push) surfaced two MORE real bugs in the mobile menu I'd just added,
  caught by testing the actual result rather than trusting the local pass:
  - The panel's CSS (`left: calc(-1 * ...); right: -100vw`) was a botched
    attempt at full-bleed width that instead made it ~400px wider than the
    390px viewport, overflowing off-screen.
  - `.nav__mobile-menu { position: relative }` made the dropdown panel's
    `position: absolute` resolve against that small toggle-button wrapper
    instead of the full-width `.nav` bar, collapsing it to ~40px wide.
  - Separately: a leftover pre-Phase-9 CSS rule, `.nav__tools a:nth-child(2)
    { display: none }` (originally meant to hide the old search link,
    removed in Phase 9), was coincidentally also matching the new Atelier
    link (literally the 2nd `<a>` child of its own parent, anywhere inside
    .nav__tools) and hiding it with a zero-size box. Removed the stale
    selector.
  Fixed all three, then re-verified on both engines with both links
  rendering at correct, distinct positions and both navigating correctly,
  before pushing again.

- 2026-10-12: Closed out the `npm audit` eslint-config-next finding (open
  since Phase 0) as a deliberate accepted risk rather than leaving it
  ambiguous. Re-checked: no stable eslint-config-next release newer than
  16.4.0 exists yet (16.5.0 is canary-only), so the only "fix" npm offers is
  still a downgrade to 14.2.35 -- a semver-major regression against a
  Next 16 app, trading a real compatibility risk for a theoretical one. The
  5 flagged packages (braces/micromatch/fast-glob, ReDoS GHSA-vfj7-8cjw-p6xm)
  are dev-only (eslint's own file-globbing), never bundled into what ships
  to a visitor's browser or the server's production runtime -- exploiting it
  would require controlling the glob patterns fed to a local/CI lint run,
  not something reachable through the live site. Decision: leave as-is,
  revisit when eslint-config-next ships a stable 16.5.x (or later) release.

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
