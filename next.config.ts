import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // Product photos live in Supabase Storage's public product-media
    // bucket (supabase/README.md). next/image requires remote hosts to be
    // explicitly allowlisted.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Cache Components (Next.js 16's experimental static/dynamic boundary
  // optimization) is off: this is a dynamic e-commerce app from Phase 4
  // onward (live DB reads, auth cookies on every page), not a static-first
  // site, and the feature mostly added friction (explicit `instant` exports,
  // over-eager prerender diagnostics) without benefit at this stage.
  // Revisit deliberately in Phase 11 (Quality and speed) if it's worth it.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
