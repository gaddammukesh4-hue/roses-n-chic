const colorTokens = [
  { name: 'background', css: 'bg-background border border-border', hex: '#FBF5EE', label: 'Ivory' },
  { name: 'card', css: 'bg-card border border-border', hex: '#FFFFFF', label: 'White' },
  { name: 'muted', css: 'bg-muted', hex: '#F6DCD4', label: 'Blush' },
  { name: 'accent', css: 'bg-accent', hex: '#C9A27A', label: 'Champagne' },
  { name: 'secondary', css: 'bg-secondary', hex: '#8E5B52', label: 'Rose mid' },
  { name: 'primary', css: 'bg-primary', hex: '#5B3A34', label: 'Rose ink' },
  { name: 'destructive', css: 'bg-destructive', hex: '#9B2C2C', label: 'Destructive' },
];

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 space-y-20">
      <header className="space-y-2">
        <p className="text-caption uppercase tracking-[0.18em] text-muted-foreground">Phase 1</p>
        <h1 className="text-h1">Design system</h1>
        <p className="text-body-lg text-muted-foreground max-w-2xl">
          Colors, type, buttons, and cards built from the tokens in <code>app/globals.css</code>.
          Full rationale and contrast numbers live in <code>DESIGN.md</code>.
        </p>
      </header>

      {/* Color */}
      <section className="space-y-6">
        <h2 className="text-h2">Color</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {colorTokens.map((t) => (
            <div key={t.name} className="space-y-2">
              <div className={`h-20 rounded-md ${t.css}`} />
              <p className="text-body-sm font-medium">{t.label}</p>
              <p className="text-caption text-muted-foreground">{t.hex} · --color-{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-h2">Typography</h2>
        <div className="space-y-3">
          <p className="text-display leading-none">Roses N Chic</p>
          <h1 className="text-h1">Heading 1 — The Art of Elegance</h1>
          <h2 className="text-h2">Heading 2 — Handloom cotton, viscose rayon</h2>
          <h3 className="text-h3">Heading 3 — From our Chennai atelier</h3>
          <h4 className="text-h4">Heading 4 — A/W 2026 Collection</h4>
          <p className="text-body-lg">Body large — Every piece is cut and stitched by hand, in small batches.</p>
          <p className="text-base">Body — Every piece is cut and stitched by hand, in small batches, using fabric we weave ourselves.</p>
          <p className="text-body-sm text-muted-foreground">Body small — Care notes, fabric composition, and shipping details.</p>
          <p className="text-caption uppercase tracking-[0.18em] text-muted-foreground">Caption / Eyebrow label</p>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-6">
        <h2 className="text-h2">Buttons</h2>
        <div className="flex flex-wrap items-center gap-4">
          <button className="rounded-none bg-primary text-on-primary px-11 py-[15px] text-body-sm uppercase tracking-[0.14em] transition-colors duration-base hover:bg-secondary active:scale-[0.97] cursor-pointer">
            Add to bag
          </button>
          <button className="rounded-none border border-accent bg-card text-primary px-11 py-[15px] text-body-sm uppercase tracking-[0.14em] transition-colors duration-base hover:bg-secondary hover:text-white cursor-pointer">
            Explore
          </button>
          <button className="rounded-full bg-[var(--glass-pill-bg)] border border-accent/70 px-5 py-3 text-body-sm uppercase tracking-[0.14em] text-primary backdrop-blur-[8px] transition-colors duration-base hover:bg-card cursor-pointer">
            Ambient tour
          </button>
          <button disabled className="rounded-none bg-primary text-on-primary px-11 py-[15px] text-body-sm uppercase tracking-[0.14em] opacity-50 cursor-not-allowed">
            Sold out
          </button>
        </div>
        <p className="text-body-sm text-muted-foreground max-w-xl">
          Primary and &ldquo;Explore&rdquo; share <code>rounded-none</code> — the hero&apos;s signature sharp
          corner. Utility actions like the ambient tour use the pill shape (<code>rounded-full</code>).
          Hover states use rose-mid, not champagne — white-on-champagne fails WCAG AA (2.35:1).
        </p>
      </section>

      {/* Cards */}
      <section className="space-y-6">
        <h2 className="text-h2">Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-md bg-card border border-border p-6 shadow-md space-y-2">
            <p className="text-caption uppercase tracking-[0.18em] text-accent">New</p>
            <h3 className="text-h3">The Muse Wrap Dress</h3>
            <p className="text-body-sm text-muted-foreground">Handloom cotton · Blush pink</p>
            <p className="text-body-lg">₹ 6,400</p>
          </div>
          <div className="relative rounded-lg overflow-hidden min-h-[220px] bg-gradient-to-br from-blush-deep to-champagne p-6 flex items-end">
            <div
              className="absolute inset-4 rounded-md border border-white/30 p-5 flex flex-col justify-end text-white"
              style={{ background: 'var(--glass-drawer-bg)', backdropFilter: 'blur(var(--glass-drawer-blur))', color: 'var(--color-rose-ink)' }}
            >
              <p className="text-caption uppercase tracking-[0.18em] text-muted-foreground">Cart drawer preview</p>
              <p className="text-body-sm">Frosted-glass surface for cart &amp; auth drawers (Phase 6/7).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Logo */}
      <section className="space-y-6">
        <h2 className="text-h2">Logo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-md border border-border bg-card p-8 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Roses N Chic" className="h-10" />
          </div>
          <div className="rounded-md p-8 flex items-center justify-center bg-rose-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-light.svg" alt="Roses N Chic (light)" className="h-10" />
          </div>
        </div>
      </section>
    </main>
  );
}
