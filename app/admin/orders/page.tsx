import { createClient } from '@/lib/supabase/server';
import OrderRow from '@/components/admin/OrderRow';

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total, currency, tracking_number, created_at, order_items(product_name, size, quantity)')
    .order('created_at', { ascending: false });

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
              <th className="px-4 py-2 font-medium">Items</th>
              <th className="px-4 py-2 font-medium">Total</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Tracking</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
