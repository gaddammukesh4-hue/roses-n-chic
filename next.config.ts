import type { NextConfig } from "next";

// plan.md Part C: "HTTPS only. HSTS header on." / "Content Security Policy
// (CSP) header set." script-src/style-src keep 'unsafe-inline' because
// Next.js injects inline hydration <script>s and Tailwind/inline style={}
// attributes are used throughout -- a nonce-based strict CSP would need a
// middleware rewrite of every response and is left for a deliberate Phase
// 11 upgrade, not something to risk breaking checkout for right now.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
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
