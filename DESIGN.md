# Roses N Chic: Design System

Phase 1 of `plan.md`. Tokens live in `app/globals.css` (`@theme` block) for the
Next.js app, and as plain CSS custom properties in `styles/hero.css` for the
hero (same hex values, kept in sync by hand — see "Why two token files"
below). A live demo of every token below is at `/design-system`.

## Color

| Role | Token | Hex | Used for |
|---|---|---|---|
| Background | `--color-ivory` / `--color-background` | `#FBF5EE` | Page background |
| Card | `--color-card` | `#FFFFFF` | Cards, panels, inputs |
| Muted surface | `--color-blush` / `--color-muted` | `#F6DCD4` | Soft section backgrounds |
| Deep surface | `--color-blush-deep` | `#E9B8AD` | Hover/pressed surface, photo overlays |
| Accent | `--color-champagne` / `--color-accent` | `#C9A27A` | Borders, dividers, decorative accents, icons — **not text, not fill under text** |
| Secondary | `--color-rose-mid` / `--color-secondary` | `#8E5B52` | Secondary text, hover fill for primary buttons, links |
| Primary / ink | `--color-rose-ink` / `--color-primary` / `--color-foreground` | `#5B3A34` | Body text, headings, primary button fill, focus ring |
| Destructive | `--color-destructive` | `#9B2C2C` | Errors, delete actions (Phase 4+) |

These are the same hex values already shipped in the hero (`hero.css`
`:root`) — Phase 1 did not invent a new palette, it formalized the one
already proven on the live hero and extended it with the semantic roles
(primary/secondary/accent/muted/destructive) the rest of the site needs.

### Contrast (WCAG AA, computed, not eyeballed)

| Pair | Ratio | Verdict |
|---|---|---|
| rose-ink on ivory | 9.24:1 | Pass (normal text) |
| rose-ink on white | 10.00:1 | Pass (normal text) |
| rose-mid on ivory | 5.15:1 | Pass (normal text) |
| rose-mid on white | 5.57:1 | Pass (normal text) |
| white on rose-mid | 5.57:1 | Pass (normal text) — safe solid-fill button |
| rose-ink on blush | 7.67:1 | Pass (normal text) |
| rose-ink on blush-deep | 5.68:1 | Pass (normal text) |
| destructive on ivory / white | 6.95:1 / 7.53:1 | Pass (normal text) |
| **white on champagne** | **2.35:1** | **Fail** — champagne never carries text |
| **champagne on ivory** | **2.17:1** | **Fail** even the 3:1 non-text/UI-boundary minimum — champagne alone must never be the only signal for a focus ring or required control boundary |
| rose-ink on champagne | 4.25:1 | Fails AA for *small* text (close, not safe) — if champagne is ever a solid fill, pair it with rose-ink and keep the label large (≥18.66px bold / 24px regular), or just use rose-mid/rose-ink as the fill instead |

**Bug found and fixed during this phase:** the hero's "Explore" CTA hover
state was `background: champagne; color: #fff` — 2.35:1, fails AA. Changed
hover fill to `rose-mid` (5.57:1) in all four copies of `hero.css`
(`styles/`, `hero/standalone/`, `hero/nextjs/styles/`, and the sibling
`roses-n-chic-hero` project).

**Rule going forward:** champagne is accent/border/decorative only. Focus
rings use `--color-ring` (rose-ink), not champagne — champagne fails even
the 3:1 non-text contrast minimum against ivory.

## Typography

Two fonts, matching the hero and `CLAUDE.md`:
- **Cormorant Garamond** (serif) — all headings (`h1`–`h6` default to it globally via `app/globals.css`)
- **Montserrat** (sans) — body text, UI labels (`body` default)

Loaded via `next/font` in `app/layout.tsx` (self-hosted, no layout shift).
`hero.css` reads the same `--font-serif`/`--font-sans` variables that
`next/font` sets on `<html>`, with a literal-name fallback for the
standalone (non-Next.js) build, which loads the fonts via a Google Fonts
`<link>` instead.

| Token | Size | Use |
|---|---|---|
| `--text-display` | `clamp(2.5rem, 4vw + 1rem, 6.5rem)` | Large serif moments outside the hero (the hero's own logo lockup uses its own larger clamp in `hero.css`) |
| `--text-h1` | 3rem / 48px | Page titles |
| `--text-h2` | 2.25rem / 36px | Section titles |
| `--text-h3` | 1.75rem / 28px | Card/subsection titles |
| `--text-h4` | 1.375rem / 22px | Minor headings |
| `--text-body-lg` | 1.125rem / 18px | Lead paragraphs |
| (Tailwind default `text-base`) | 1rem / 16px | Body copy |
| `--text-body-sm` | 0.875rem / 14px | Secondary text, meta |
| `--text-caption` | 0.75rem / 12px | Eyebrows, labels — pair with `uppercase tracking-[0.14em]` to match the hero's existing nav/chapter-counter style |

## Spacing

Tailwind's default 4px-based scale is used as-is — no override. The hero's
own generous `clamp()` paddings (e.g. nav `clamp(20px, 3.5vw, 56px)`) stay
local to `hero.css`; they're hero-specific art direction, not a general
token.

## Corner radius

| Token | Value | Use |
|---|---|---|
| `--radius-none` | 0 | **Primary commerce CTAs** (Add to bag, Checkout) and the hero's "Explore" button — the brand's signature sharp, editorial corner |
| `--radius-sm` | 4px | Inputs, small chips |
| `--radius-md` | 8px | Cards, panels |
| `--radius-lg` | 16px | Large media panels, photo cards |
| `--radius-full` | 999px | Pill/utility buttons — matches the hero's existing "Ambient tour" button |

## Shadows

Warm-tinted from rose-ink, never flat black — the brand rule is "bright,
radiant, feminine," and a neutral-gray shadow reads cold against ivory.

```
--shadow-sm: 0 1px 3px rgba(91, 58, 52, 0.08)
--shadow-md: 0 8px 24px rgba(91, 58, 52, 0.10)
--shadow-lg: 0 24px 48px rgba(91, 58, 52, 0.14)
```

## Frosted glass (drawers)

Formalized from values already shipped and proven in `hero.css` (`.nav`,
`.tour`) rather than invented fresh:

| Token | Value | Source |
|---|---|---|
| `--glass-nav-bg` | `rgba(252, 246, 241, 0.92)` | `.nav` |
| `--glass-nav-blur` | `10px` | `.nav` |
| `--glass-pill-bg` | `rgba(255, 252, 248, 0.78)` | `.tour` |
| `--glass-pill-blur` | `8px` | `.tour` |
| `--glass-drawer-bg` | `rgba(252, 246, 241, 0.90)` | New — for Phase 6/7 cart & auth drawers |
| `--glass-drawer-blur` | `18px` | New — stronger blur since a drawer covers more of the viewport and needs firmer separation from the page behind it (within the 10-20px range typical for this style) |
| `--glass-border` | `1px solid rgba(201, 162, 122, 0.28)` | `.nav` |

## Buttons

| Variant | Fill | Text | Radius | Hover |
|---|---|---|---|---|
| Primary (commerce CTA) | rose-ink | white | none | fills rose-mid |
| Secondary (outline, e.g. "Explore") | card (near-white) | rose-ink, champagne border | none | fills rose-mid, text white |
| Utility/pill (e.g. "Ambient tour") | glass-pill | rose-ink | full | fills card |
| Disabled | any | any | — | `opacity-50 cursor-not-allowed`, no hover/active |

All interactive states: `active:scale-[0.97]` for press feedback,
`transition-colors duration-base` (250ms), visible `:focus-visible` ring in
`--color-ring` (rose-ink — champagne fails the 3:1 non-text minimum, see
above).

## Logo

- `public/logo.svg` — wordmark, same rose-gold gradient as the hero's CSS
  logo (`linear-gradient(150deg, #6c3d36, #9a5d50, #bf8878, #85504a)`), for
  use anywhere outside the hero (footer, emails, admin panel).
- `public/logo-light.svg` — solid ivory wordmark, for use over photography
  or a rose-ink/blush-deep panel where the gradient version loses contrast.
- `app/icon.svg` — favicon: an ivory circle, champagne hairline border, "R"
  monogram in the same gradient. Next.js picks this up automatically via
  the `app/icon.svg` file convention.

## Why two token files

`app/globals.css` (Tailwind `@theme`) is the source for every page built
from here forward. `styles/hero.css` keeps its own copy of the same hex
values because it's a framework-free, portable file by design (the same
file also runs in the plain `standalone/` page, which has no Tailwind and
no build step) — see `hero/README.md`. If a color value changes, update
both and re-check the contrast table above.

## Accessibility checklist (Phase 1 "Done when")

- [x] Contrast 4.5:1 checked for every text/background pairing actually used (table above)
- [x] Champagne identified as accent-only; never text, never a solo focus/boundary signal
- [x] Found and fixed a real AA failure (hero CTA hover state)
- [x] Focus-visible ring defined globally (`--color-ring`, 2px, 2px offset)
- [x] `prefers-reduced-motion` respected globally (`app/globals.css`), in addition to the hero's own existing handling
- [x] Disabled states visually distinct (`opacity-50`, `cursor-not-allowed`) — not required to meet text contrast (WCAG 1.4.3 exempts inactive controls)
- [ ] Full-page automated a11y scan (axe or similar) — deferred to Phase 11 (Quality and speed), once there's more than one page to scan
