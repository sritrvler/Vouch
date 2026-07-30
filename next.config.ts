import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://us-assets.i.posthog.com https://eu-assets.i.posthog.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://logo.clearbit.com https://*.googleusercontent.com https://us-assets.i.posthog.com https://eu-assets.i.posthog.com",
      "media-src 'self' blob: https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co https://api.lemonsqueezy.com https://us.i.posthog.com https://eu.i.posthog.com https://us-assets.i.posthog.com https://eu-assets.i.posthog.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-select',
    ],
  },
  async headers() {
    return [
      {
        source: '/((?!embed|api\\/testimonials\\/widget).*)',
        headers: securityHeaders,
      },
      {
        source: '/embed/:path*',
        headers: securityHeaders.filter(h => h.key !== 'X-Frame-Options' && h.key !== 'Content-Security-Policy'),
      },
      {
        source: '/api/testimonials/widget/:path*',
        headers: securityHeaders.filter(h => h.key === 'X-Content-Type-Options' || h.key === 'Strict-Transport-Security'),
      },
      {
        source: '/embed.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default nextConfig;
