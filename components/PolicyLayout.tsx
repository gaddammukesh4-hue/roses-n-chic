/** Shared wrapper for the four Phase 9 policy pages -- plain Tailwind
 * utilities (no typography plugin installed), styled via descendant
 * selectors so each page's content can stay plain <h2>/<p>/<ul> markup. */
export default function PolicyLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="pt-[calc(var(--nav-h,76px)+40px)] pb-24 px-6 max-w-2xl mx-auto">
      <h1 className="text-h1 mb-10">{title}</h1>
      <div
        className="space-y-4 text-base text-foreground
          [&_h2]:text-h3 [&_h2]:mt-10 [&_h2]:mb-2 [&_h2]:text-primary
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:text-body-sm
          [&_p]:text-body-sm"
      >
        {children}
      </div>
      <p className="text-caption text-muted-foreground mt-12">{lastUpdated}</p>
    </main>
  );
}
