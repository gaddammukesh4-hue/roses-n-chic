import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import OrderRow from '@/components/admin/OrderRow';

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('id, user_id, status, total, currency, tracking_number, shipping_address, created_at, order_items(product_name, size, quantity)')
    .order('created_at', { ascending: false });

  const userIds = [...new Set((orders ?? []).map((o) => o.user_id).filter((id): id is string => Boolean(id)))];

  // profiles: regular RLS-bound client (profiles_select_admin policy lets
  // an admin read every profile, not just their own -- same pattern as
  // every other admin read in this app, RLS is the real authorization).
  const { data: profileRows } = userIds.length
    ? await supabase.from('profiles').select('id, name, phone').in('id', userIds)
    : { data: [] };
  const profileById = new Map((profileRows ?? []).map((p) => [p.id, p]));

  // emails: auth.users isn't a public-schema table RLS can govern, so this
  // one lookup genuinely needs the service-role client -- same reasoning
  // as every other service-role use in this codebase (orders/payments),
  // not a way around RLS for data RLS could otherwise protect.
  const emailById = new Map<string, string>();
  if (userIds.length) {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of data.users) {
      if (u.id && u.email && userIds.includes(u.id)) emailById.set(u.id, u.email);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-h1">Orders</h1>

      {!orders || orders.length === 0 ? (
        <p className="text-body-sm text-muted-foreground">No orders yet.</p>
      ) : (
        <table className="w-full text-body-sm border border-border rounded-md overflow-hidden">
          <thead>
            <tr className="bg-muted text-left">
              <th className="px-4 py-2 font-medium">Order</th>
              <th className="px-4 py-2 font-medium">Customer</th>
              <th className="px-4 py-2 font-medium">Shipping address</th>
              <th className="px-4 py-2 font-medium">Items</th>
              <th className="px-4 py-2 font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Tracking</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                customer={{
                  name: order.user_id ? (profileById.get(order.user_id)?.name ?? null) : null,
                  phone: order.user_id ? (profileById.get(order.user_id)?.phone ?? null) : null,
                  email: order.user_id ? (emailById.get(order.user_id) ?? null) : null,
                }}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
