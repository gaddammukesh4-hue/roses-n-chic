# Roses N Chic: Build Plan

Luxury women's clothing e-commerce site. Self-hosted. No Shopify.

Stack: Next.js, Tailwind CSS, GSAP, Lenis, Supabase, Razorpay, Stripe, Vercel.


## Status (updated 12 October 2026)

| Phase | Status |
|---|---|
| 0 Set up | Partly done. Repo git-initialized, Next.js app scaffolded, gsap/lenis/zod installed. Still needs your accounts: GitHub push, Supabase `rnc-dev`, Vercel link, Razorpay/Stripe test keys. |
| 1 Brand and design system | **Done.** Formalized in `DESIGN.md` and `app/globals.css`. Live demo at `/design-system`. |
| 2 Hero video assets | **Done.** 211 frames and a cut-out image are in `hero/standalone/frames/`. |
| 3 Hero scroll animation | **Done.** Integrated into the live Next.js app, verified headlessly at 1440x810 and 390x844. |
| 4 to 12 | Not started. |

Read `hero/README.md` before Phase 3. Keep `PROGRESS.md` up to date after each phase.

---

## How to use this plan

1. Do the phases in order. Do not skip a phase.
2. Finish the "Done when" check at the end of each phase.
3. Give your coding agent one phase at a time.
4. Commit to Git after each phase.

---

## Part A: Skills to get from GitHub

Skills are folders that contain a `SKILL.md` file. The agent reads them to do better work.

### Warning before you install

- A skill can change how your agent works. Read the `SKILL.md` file before you install it.
- Install only from repositories that you trust.
- Check the README of each repository for the current install command. Commands can change.
- One audit service flagged `ui-ux-pro-max` while two other services passed it. Read it yourself first.

### A1. Skill library repositories

| Need | Repository | Use |
|---|---|---|
| Official skills | `anthropics/skills` | Base skills and examples |
| Official plugins | `anthropics/claude-plugins-official` | Code review, skill creator |
| Skill installer | `vercel-labs/skills` | Command: `npx skills add <owner/repo>` |
| Skill lists | `VoltAgent/awesome-agent-skills` | Find more skills |
| Skill lists | `sickn33/antigravity-awesome-skills` | Large collection (700+ skills) |
| Skill lists | `ComposioHQ/awesome-claude-skills` | Find more skills |

### A2. Skills by task

| Task | Repository | Why you need it |
|---|---|---|
| UI and UX design | `nextlevelbuilder/ui-ux-pro-max-skill` | Design styles, color palettes, font pairs. Use it for the blush, champagne, and ivory theme. |
| Design reference | `VoltAgent/awesome-design-md` | `DESIGN.md` files from known brands. Use them as layout reference only. |
| Frontend design | `frontend-design` skill in `anthropics/skills` | Avoids generic, template-like designs |
| React and Next.js | `vercel-labs/agent-skills` | React and Next.js performance rules. Web design rules. |
| Database | `supabase/agent-skills` | Postgres schema, Row Level Security (RLS), query speed |
| Marketing and SEO | `coreyhaines31/marketingskills` | Copy, SEO, conversion rate, analytics |
| Security review | `agamm/claude-code-owasp` | OWASP Top 10:2025, ASVS 5.0 checklists |
| Security review | `briiirussell/cybersecurity-skills` | `owasp-audit`, `api-audit`, `dependency-audit`, `threat-modeling` |
| Security review | `natolitech/security-skill` | `/security-review` and `/threat-model` commands |
| Security tools | `AgentSecOps/SecOpsAgentKit` | Scan for secrets, scan dependencies, run OWASP ZAP |
| Document skills | `anthropics/skills` | Make PDF invoices and docs, if you need them |

### A3. Install commands (check each README first)

Every skill adds to the agent's context and costs credits. Install only these four first: `ui-ux-pro-max`, `vercel-labs/agent-skills`, `supabase/agent-skills`, and `agamm/claude-code-owasp`. Add the others when you reach the phase that needs them.


```bash
# Skill installer (needs Node.js)
npx skills add nextlevelbuilder/ui-ux-pro-max-skill
npx skills add vercel-labs/agent-skills
npx skills add supabase/agent-skills
npx skills add coreyhaines31/marketingskills
npx skills add briiirussell/cybersecurity-skills

# OWASP skill (copy to your project)
npx degit agamm/claude-code-owasp/.claude/skills/owasp-security .claude/skills/owasp-security
```

Put the skills in `.claude/skills/` inside your project folder. Then they apply only to this project.

### A4. MCP servers (tool connections)

| Server | Purpose | Note |
|---|---|---|
| Supabase MCP | Manage tables and policies | Use a development project only. Never connect it to production data. |
| GitHub MCP | Manage repo, issues, and pull requests | Use a token with minimum scope |
| Playwright MCP | Run browser tests | Use for checkout tests |
| Vercel MCP | Deploy and read logs | Check that it exists before you plan on it |
| Stripe agent toolkit | Stripe test mode | Use test keys only |
| Mux MCP | Video hosting | Check that it exists before you plan on it |

Rule: give each MCP server the smallest permission that works.

---

## Part B: Implementation plan

### Phase 0: Set up (Day 1)

1. Make a GitHub account and a repository named `roses-n-chic`.
2. Install Node.js (current LTS version) and Git.
3. Install Claude Code.
4. Make a Supabase project. Name it `rnc-dev`.
5. Make a Vercel account. Link it to the repository.
6. Make Razorpay and Stripe accounts. Stay in test mode.
7. Make a `.env.local` file. Add `.env*` to `.gitignore` at once.
8. Install the skills from A3.
9. Make a `CLAUDE.md` file. Write the brand rules in it (see Part D).

Done when: an empty Next.js app runs on your computer and on Vercel.

### Phase 1: Brand and design system (Days 2-3)

1. Ask the agent to use the `ui-ux-pro-max` skill.
2. Set the colors. Use blush pink, champagne gold, and ivory. Do not use dark backgrounds.
3. Pick two fonts: one serif for headings, one clean sans-serif for text.
4. Set spacing, corner radius, shadows, and button styles.
5. Set the frosted-glass style for drawers.
6. Write all values in a `DESIGN.md` file and in Tailwind tokens.
7. Make the logo files: SVG, light version, and favicon.
8. Check color contrast for all text. Use WCAG AA as the minimum.

Done when: a test page shows all buttons, headings, and cards in the brand style.

### Phase 2: Hero video assets (Days 3-7) — DONE

This phase makes the video. The code in Phase 3 needs these files.

1. Write the storyboard in four scenes:
   - Scene 1: A golden needle and thread stitch floral embroidery on a blush-pink handloom dress.
   - Scene 2: The model comes out of rose petals and white feathers.
   - Scene 3: She stops next to the logo. Her height matches the logo letters.
   - Scene 4: A 3D fabric rose rosette sits on the dress shoulder. No flower in her mouth.
2. Make the video with an AI video tool. Make several tries for each scene.
3. Keep the dress, face, and light the same in all scenes. Use a reference image.
4. Join the scenes. Keep the final video at 5 to 8 seconds.
5. Cut the video into frames with `ffmpeg`.
6. Convert the frames to WebP. Make two sets: desktop (about 1920 px wide) and mobile (about 960 px wide).
7. Keep the frame count between 90 and 180. Keep each frame small.
8. Make a poster image for the first frame.

Done when: you have a folder of numbered WebP frames and one poster image.

Note: if your video tool cannot keep the dress the same, make each scene as a short clip and join them.

### Phase 3: Hero scroll animation (Days 7-9) — BUILT, NEEDS INTEGRATION

Already built. Do not start from nothing. Use the files in `hero/`:

1. Copy the Next.js files from `hero/nextjs/` into the app (see `hero/README.md`).
2. Copy `hero/standalone/frames/` to `public/hero/frames/`.
3. Install `gsap` and `lenis`. Run the app.
4. Scroll through all parts on desktop and on a phone. Fix any problem.
5. Then continue with the checks below.

The original steps are kept for reference:


1. Make a `<canvas>` component named `HeroScrub`.
2. Load the poster first. Load the other frames in the background.
3. Draw the frame that matches the scroll position.
4. Use GSAP ScrollTrigger to link scroll progress to the frame number.
5. Use Lenis for smooth scroll. Connect Lenis to ScrollTrigger.
6. Add mouse-move control. The cursor position moves the frame a small amount.
7. Add an "ambient tour" button. It plays the video by itself.
8. Support `prefers-reduced-motion`. Show the poster only.
9. Test on a low-cost phone. The animation must stay smooth.
10. Show the brand text and a button over the hero. Keep the logo next to the model.

Done when: the animation runs at a smooth frame rate on desktop and phone.

### Phase 4: Database (Days 9-11)

1. Use the `supabase-postgres-best-practices` skill.
2. Make these tables:
   - `products`: name, slug, description, fabric notes, price in INR, price in USD, status.
   - `product_variants`: product, size (XS, S, M, L, XL, Custom), stock count.
   - `product_media`: product, images, reel video link.
   - `profiles`: user, name, phone.
   - `measurements`: user, saved custom measurements.
   - `addresses`: user, shipping address.
   - `carts` and `cart_items`.
   - `orders` and `order_items`: price copy, payment status, payment ID.
   - `payment_events`: webhook log, with a unique event ID.
3. Turn on Row Level Security (RLS) on every table.
4. Write policies:
   - Public can read active products only.
   - A user can read and write only their own rows.
   - Only the server can write orders and payments.
5. Save the schema as migration files in Git.
6. Add seed data: 6 sample dresses.
7. Make a private admin role for you.

Done when: you can add a product in the database and it shows on the site. A test user cannot read another user's data.

### Phase 5: Catalog and product pages (Days 11-15)

1. Make the catalog page. Fetch products on the server.
2. Add filters: fabric, size, price.
3. Make the product card. Show a video badge.
4. On hover, play the 9:16 reel preview. On touch devices, play on tap.
5. On click, open the reel in full screen.
6. Make the product page: images, size matrix, fabric notes, care notes.
7. Show the price in INR or USD. Choose by the user's country, with a manual switch.
8. Add a size guide and a "Custom Tailored" option that uses saved measurements.
9. Use `next/image` and lazy loading for all media.
10. Add the `Product` schema (JSON-LD) for SEO.

Done when: a new product appears on the site without a code change.

### Phase 6: Accounts (Days 15-17)

1. Use Supabase Auth.
2. Make the slide-out Sign In and Create Account drawer.
3. Add email and password sign-in.
4. Add Google sign-in. Set up the OAuth keys in Google Cloud.
5. Add email verification and password reset.
6. Make the account page: orders, addresses, saved measurements.
7. Merge the guest cart into the user cart after sign-in.

Done when: a user can sign up, sign in, save measurements, and sign out.

### Phase 7: Cart and checkout (Days 17-22)

1. Make the frosted-glass cart drawer.
2. Store the cart in the database for signed-in users. Store it in local storage for guests.
3. Do all price calculations on the server. Never trust a price from the browser.
4. Make a server action that creates an order. It checks stock and price.
5. Create a Razorpay order from the server. Send only the order ID to the browser.
6. Open the Razorpay modal. It supports UPI, cards, and net banking.
7. After payment, verify the signature on the server.
8. Add a webhook route. Verify the webhook signature. Store each event ID. Ignore a repeated event.
9. Only the webhook or the verified signature can set an order to "paid".
10. Reduce stock in one database transaction.
11. Add Stripe for international buyers. Use the same rules.
12. Send an order email (use Resend or a similar service).
13. Make the order success page and the failure page.

Done when: a test payment in Razorpay test mode sets the order to "paid" and reduces stock. A fake webhook without a valid signature is rejected.

### Phase 8: Admin panel (Days 22-25)

1. Make a protected `/admin` area. Only the admin role can enter.
2. Add: create product, edit product, upload images and reels, edit stock.
3. Add: order list, change order status, add tracking number.
4. Use signed upload links for media. Check file type and file size.
5. Log all admin actions.

Done when: you can add a dress with a reel from the admin panel.

### Phase 9: Marketing, SEO, and content (Days 25-27)

1. Use the `marketingskills` repository.
2. Write the home page, about page, and fabric story (handloom cotton, viscose rayon).
3. Add the Chennai atelier notes and the Instagram link (@rosesnchic) in the footer.
4. Add meta tags, Open Graph images, `sitemap.xml`, and `robots.txt`.
5. Add privacy policy, terms, shipping policy, and return policy pages.
6. Add analytics. Use a tool that respects privacy.
7. Add an email sign-up form.
8. Check that the policy pages follow Indian consumer law and tax rules (GST). Ask a qualified person.

Done when: every page has a title, description, and share image.

### Phase 10: Security review (Days 27-29)

Run these reviews with the security skills. Fix every high and critical finding.

1. Run `threat-modeling` on the checkout and account flows.
2. Run `owasp-audit` on the full code.
3. Run `api-audit` on all API routes and server actions.
4. Run `dependency-audit`. Update vulnerable packages.
5. Scan the Git history for secrets.
6. Run OWASP ZAP against the staging site.
7. Do the manual checks in Part C.

Done when: no open high or critical finding remains. You have a written list of the low findings.

### Phase 11: Quality and speed (Days 29-31)

1. Test with Playwright: sign up, add to cart, pay, see order.
2. Run Lighthouse. Target: Performance 90 or more on mobile for pages other than the hero.
3. Use `vercel-react-best-practices` to find slow code.
4. Check the site on a real phone, on slow network.
5. Check keyboard use and screen reader use.
6. Check all text in the brand style. Check for any dark or harsh visual.

Done when: the test suite passes and the speed targets are met.

### Phase 12: Launch (Days 31-33)

1. Buy the domain. Link it to Vercel.
2. Make a separate production Supabase project. Do not reuse the dev project.
3. Set production keys in Vercel environment variables.
4. Complete Razorpay and Stripe business checks (KYC). This can take days.
5. Run one real low-value payment. Then refund it.
6. Turn on uptime alerts and error tracking.
7. Turn on database backups.
8. Launch. Tell your Instagram followers.

Done when: a real customer can buy a dress.

---

## Part C: Security checklist

Check each item before launch.

**Secrets**
- [ ] No key in Git. No key in browser code.
- [ ] Only public keys use the `NEXT_PUBLIC_` prefix.
- [ ] The Supabase service-role key is on the server only.
- [ ] Razorpay and Stripe secret keys are on the server only.

**Database**
- [ ] RLS is on for every table.
- [ ] A test user cannot read or change another user's data.
- [ ] Admin actions check the role on the server.

**Payments**
- [ ] The server sets all prices.
- [ ] The server verifies every payment signature.
- [ ] The webhook rejects bad signatures.
- [ ] A repeated webhook does not repeat an action.
- [ ] The site never stores card data.

**Web protection**
- [ ] HTTPS only. HSTS header on.
- [ ] Content Security Policy (CSP) header set.
- [ ] Rate limits on sign-in, sign-up, password reset, and checkout.
- [ ] Input checks with Zod on all server actions and routes.
- [ ] Safe file upload: check type, size, and name.
- [ ] CORS limited to your own domain.

**Operations**
- [ ] Dependency updates are automatic (Dependabot).
- [ ] Error tracking is on. Logs hold no personal data.
- [ ] Backups are tested.
- [ ] A privacy policy exists. It follows India's data protection law.

---

## Part D: Content for `CLAUDE.md`

Copy this into your project file. The agent reads it in each session.

```markdown
# Roses N Chic

Luxury women's clothing store. Handloom pure cotton and viscose rayon.

## Brand rules
- Style: bright, radiant, feminine, romantic.
- Colors: soft blush pink, champagne gold, ivory.
- Do not use dark, rugged, or edgy styles.

## Tech rules
- Next.js (App Router), TypeScript, Tailwind CSS, GSAP, Lenis, Supabase.
- Payments: Razorpay and Stripe. The server sets all prices.
- Never put secret keys in browser code.
- RLS must be on for every table.
- Check all input with Zod.

## Work rules
- Do one phase at a time.
- Read the matching skill before you start a task.
- Run tests before you say a task is done.
- Do not change files outside the task.
```

---

## Part E: Honest limits

- Skills help the agent. They do not replace your review. Test every phase yourself.
- The video quality depends on your AI video tool. This is the hardest part. Plan extra time.
- Self-hosting means you own the security. Do not skip Phase 10.
- Payment provider approval (KYC) takes time. Start it in Phase 7.
- Check Indian rules for GST, returns, and data privacy with a qualified person before launch.
- Some MCP server names (Mux, Vercel) need a check. Search GitHub for the current name before you plan on them.
