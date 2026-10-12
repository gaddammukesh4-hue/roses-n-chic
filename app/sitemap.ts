import type { MetadataRoute } from 'next';
import { getProducts, hasSupabaseConfig } from '@/lib/catalog';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/collections`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/atelier`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/policies/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/policies/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/policies/shipping`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${siteUrl}/policies/returns`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  if (!hasSupabaseConfig()) return staticRoutes;

  const products = await getProducts();
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/collections/${product.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
