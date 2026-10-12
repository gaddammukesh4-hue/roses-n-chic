import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import MeasurementForm from '@/components/MeasurementForm';
import DeleteMeasurementButton from '@/components/DeleteMeasurementButton';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseConfig, formatPrice } from '@/lib/catalog';

export const metadata: Metadata = { title: 'Account', robots: { index: false, follow: false } };

type Measurement = {
  id: string;
  label: string;
  data: { bust_cm?: number; waist_cm?: number; hip_cm?: number; height_cm?: number };
  created_at: string;
};

type Order = {
  id: string;
  status: string;
  total: number;
  currency: 'INR' | 'USD';
  created_at: string;
  order_items: { product_name: string; size: string; quantity: number }[];
};

export default async function AccountPage() {
  const configured = hasSupabaseConfig();
  const supabase = configured ? await createClient() : null;
  const { data: userData } = configured ? await supabase!.auth.getUser() : { data: { user: null } };
  const user = userData.user;

  let name: string | null = null;
  let measurements: Measurement[] = [];
  let orders: Order[] = [];
  if (user && supabase) {
    const [{ data: profile }, { data: measurementRows }, { data: orderRows }] = await Promise.all([
      supabase.from('profiles').select('name').eq('id', user.id).maybeSingle(),
      supabase.from('measurements').select('id, label, data, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select('id, status, total, currency, created_at, order_items(product_name, size, quantity)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    ]);
    name = profile?.name ?? null;
    measurements = (measurementRows ?? []) as Measurement[];
    orders = (orderRows ?? []) as unknown as Order[];
  }

  return (
    <>
      <Nav />
      <main className="pt-[calc(var(--nav-h,76px)+40px)] pb-24 px-6 max-w-3xl mx-auto">
        {!user ? (
          <div className="rounded-md border border-border bg-card p-12 text-center space-y-2">
            <h1 className="text-h2">Sign in to view your account</h1>
            <p className="text-body-sm text-muted-foreground">Use "Sign in" in the top menu.</p>
          </div>
        ) : (
          <div className="space-y-12">
            <header>
              <p className="text-caption uppercase tracking-[0.18em] text-muted-foreground">Account</p>
              <h1 className="text-h1">{name || user.email}</h1>
              <p className="text-body-sm text-muted-foreground">{user.email}</p>
            </header>

            <section className="space-y-4">
              <h2 className="text-h3">Saved measurements</h2>
              {measurements.length > 0 && (
                <ul className="space-y-2">
                  {measurements.map((m) => (
                    <li key={m.id} className="flex items-center justify-between rounded-md border border-border bg-card p-4 text-body-sm">
                      <div>
                        <p className="font-medium">{m.label}</p>
                        <p className="text-muted-foreground">
                          Bust {m.data.bust_cm} · Waist {m.data.waist_cm} · Hip {m.data.hip_cm} · Height {m.data.height_cm} cm
                        </p>
                      </div>
                      <DeleteMeasurementButton id={m.id} />
                    </li>
                  ))}
                </ul>
              )}
              <MeasurementForm />
            </section>

            <section className="space-y-4">
              <h2 className="text-h3">Orders</h2>
              {orders.length === 0 ? (
                <p className="text-body-sm text-muted-foreground">No orders yet.</p>
              ) : (
                <ul className="space-y-2">
                  {orders.map((order) => (
                    <li key={order.id} className="rounded-md border border-border bg-card p-4 text-body-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{order.status}</span>
                        <span>{formatPrice(order.total, order.currency)}</span>
                      </div>
                      <p className="text-muted-foreground">
                        {order.order_items.map((i) => `${i.product_name} (${i.size}) × ${i.quantity}`).join(', ')}
                      </p>
                      <p className="text-caption text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-2">
              <h2 className="text-h3">Addresses</h2>
              <p className="text-body-sm text-muted-foreground">Address book is planned for a future update.</p>
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
