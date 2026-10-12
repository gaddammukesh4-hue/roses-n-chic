import { createClient } from '@/lib/supabase/server';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: subscriberCount }, { data: recentViews }] = await Promise.all([
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
    supabase.from('page_views').select('path').gte('created_at', since),
  ]);

  const byPath = new Map<string, number>();
  for (const row of recentViews ?? []) {
    byPath.set(row.path, (byPath.get(row.path) ?? 0) + 1);
  }
  const topPaths = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);

  return (
    <div className="space-y-10">
      <h1 className="text-h1">Analytics</h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-md border border-border bg-card p-6">
          <p className="text-caption uppercase tracking-[0.18em] text-muted-foreground">Page views, last 30 days</p>
          <p className="text-h1 mt-2">{recentViews?.length ?? 0}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-6">
          <p className="text-caption uppercase tracking-[0.18em] text-muted-foreground">Newsletter subscribers</p>
          <p className="text-h1 mt-2">{subscriberCount ?? 0}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-h3">Most viewed pages</h2>
        {topPaths.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">No page views recorded yet.</p>
        ) : (
          <table className="w-full text-body-sm border border-border rounded-md overflow-hidden">
            <thead>
              <tr className="bg-muted text-left">
                <th className="px-4 py-2 font-medium">Path</th>
                <th className="px-4 py-2 font-medium">Views</th>
              </tr>
            </thead>
            <tbody>
              {topPaths.map(([path, count]) => (
                <tr key={path} className="border-t border-border">
                  <td className="px-4 py-2">{path}</td>
                  <td className="px-4 py-2">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
