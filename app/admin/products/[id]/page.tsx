import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateProduct } from '@/app/actions/admin-products';
import ProductForm from '@/components/admin/ProductForm';
import VariantEditor from '@/components/admin/VariantEditor';
import ImageUploader from '@/components/admin/ImageUploader';
import ReelUrlField from '@/components/admin/ReelUrlField';

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from('products')
    .select('id, name, description, fabric, fabric_notes, care_notes, price_inr, price_usd, status, product_variants(id, size, stock_count), product_media(id, image_url, reel_video_url, sort_order)')
    .eq('id', id)
    .maybeSingle();

  if (!product) notFound();

  const boundUpdate = updateProduct.bind(null, product.id);
  const reel = product.product_media.find((m) => m.reel_video_url)?.reel_video_url ?? '';

  return (
    <div className="space-y-12">
      <h1 className="text-h1">{product.name}</h1>

      <section>
        <h2 className="text-h3 mb-4">Details</h2>
        <ProductForm action={boundUpdate} mode="edit" initial={product} />
      </section>

      <section>
        <h2 className="text-h3 mb-4">Sizes and stock</h2>
        <VariantEditor productId={product.id} initialVariants={product.product_variants} />
      </section>

      <section>
        <h2 className="text-h3 mb-4">Photos</h2>
        <ImageUploader productId={product.id} initialMedia={product.product_media} />
      </section>

      <section>
        <h2 className="text-h3 mb-4">Reel video link</h2>
        <ReelUrlField productId={product.id} initialUrl={reel} />
      </section>
    </div>
  );
}
