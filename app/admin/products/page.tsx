import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/catalog-types';

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name, fabric, price_inr, status')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-none bg-primary text-on-primary px-6 py-3 text-body-sm uppercase tracking-[0.14em] hover:bg-secondary transition-colors duration-base"
        >
          New product
        </Link>
      </div>

      <table className="w-full text-body-sm border border-border rounded-md overflow-hidden">
        <thead>
          <tr className="bg-muted text-left">
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Fabric</th>
            <th className="px-4 py-2 font-medium">Price</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {(products ?? []).map((p) => (
            <tr key={p.id} className="border-t border-border">
              <td className="px-4 py-2">{p.name}</td>
              <td className="px-4 py-2 text-muted-foreground">{p.fabric}</td>
              <td className="px-4 py-2">{formatPrice(p.price_inr, 'INR')}</td>
              <td className="px-4 py-2 capitalize">{p.status}</td>
              <td className="px-4 py-2 text-right">
                <Link href={`/admin/products/${p.id}`} className="text-secondary hover:text-primary transition-colors duration-base">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
