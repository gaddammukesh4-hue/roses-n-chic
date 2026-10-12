import ProductForm from '@/components/admin/ProductForm';
import { createProduct } from '@/app/actions/admin-products';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-h1">New product</h1>
      <p className="text-body-sm text-muted-foreground">
        Creates as a draft. You&apos;ll land on the product&apos;s edit page next to add sizes, photos, and a reel video, then switch status to Active.
      </p>
      <ProductForm action={createProduct} mode="create" />
    </div>
  );
}
