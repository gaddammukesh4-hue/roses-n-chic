import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  // Async Server Components run once per request on the server, not as a
  // reactive render -- Date.now() here is fine; the purity rule is aimed
  // at Client Components. Cache Components is deliberately off for this
  // project (next.config.ts) so there's no caching ambiguity either.
  // eslint-disable-next-line react-hooks/purity
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: subscribers }, { data: recentViews }, { data: identifiedViews }] = await Promise.all([
    supabase.from('newsletter_subscribers').select('email, created_at').order('created_at', { ascending: false }),
    supabase.from('page_views').select('path').gte('created_at', since),
    supabase
      .from('page_views')
      .select('path, created_at, user_id')
      .not('user_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  const byPath = new Map<string, number>();
  for (const row of recentViews ?? []) {
    byPath.set(row.path, (byPath.get(row.path) ?? 0) + 1);
  }
  const topPaths = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);

  // "Who viewed what" -- only for signed-in visitors (page_views.user_id),
  // per the Privacy policy update: signed-out browsing stays unidentified.
  const viewerIds = [...new Set((identifiedViews ?? []).map((v) => v.user_id).filter((id): id is string => Boolean(id)))];
  const { data: viewerProfiles } = viewerIds.length
    ? await supabase.from('profiles').select('id, name').in('id', viewerIds)
    : { data: [] };
  const nameById = new Map((viewerProfiles ?? []).map((p) => [p.id, p.name]));
  const emailById = new Map<string, string>();
  if (viewerIds.length) {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of data.users) {
      if (u.id && u.email && viewerIds.includes(u.id)) emailById.set(u.id, u.email);
    }
  }

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
          <p className="text-h1 mt-2">{subscribers?.length ?? 0}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-h3">Newsletter subscribers</h2>
        {!subscribers || subscribers.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">No subscribers yet.</p>
        ) : (
          <table className="w-full text-body-sm border border-border rounded-md overflow-hidden">
            <thead>
              <tr className="bg-muted text-left">
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s) => (
                <tr key={s.email} className="border-t border-border">
                  <td className="px-4 py-2">{s.email}</td>
                  <td className="px-4 py-2 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-h3">Who viewed what</h2>
        <p className="text-body-sm text-muted-foreground">
          Signed-in visitors only -- last 100 views. Signed-out browsing stays unidentified, per
          the privacy policy.
        </p>
        {!identifiedViews || identifiedViews.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">No identified page views yet.</p>
        ) : (
          <table className="w-full text-body-sm border border-border rounded-md overflow-hidden">
            <thead>
              <tr className="bg-muted text-left">
                <th className="px-4 py-2 font-medium">Customer</th>
                <th className="px-4 py-2 font-medium">Page</th>
                <th className="px-4 py-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {identifiedViews.map((v, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-2">
                    {v.user_id && nameById.get(v.user_id) && <div>{nameById.get(v.user_id)}</div>}
                    <div className="text-muted-foreground">{v.user_id ? (emailById.get(v.user_id) ?? v.user_id) : '—'}</div>
                  </td>
                  <td className="px-4 py-2">{v.path}</td>
                  <td className="px-4 py-2 text-muted-foreground">{new Date(v.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
