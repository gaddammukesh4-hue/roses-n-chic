import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseConfig } from '@/lib/catalog';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseConfig()) redirect('/');

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect('/');

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', userData.user.id).maybeSingle();
  if (!profile?.is_admin) redirect('/');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center gap-8">
        <Link href="/admin/products" className="text-h4 font-serif text-primary">Roses N Chic — Admin</Link>
        <nav className="flex gap-6 text-body-sm">
          <Link href="/admin/products" className="hover:text-secondary transition-colors duration-base">Products</Link>
          <Link href="/admin/orders" className="hover:text-secondary transition-colors duration-base">Orders</Link>
        </nav>
        <Link href="/" className="ml-auto text-body-sm text-muted-foreground hover:text-primary transition-colors duration-base">
          Back to site
        </Link>
      </header>
      <main className="px-6 py-8 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}
