import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;
  } catch {
    return null;
  }
})();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://connect.facebook.net https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com https://checkout.stripe.com https://my.matterport.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/portfolio", destination: "/work", permanent: true },
      { source: "/portfolio/:slug", destination: "/work", permanent: true },
      // Real-estate service pages that used to live at /services/<slug> now live in the pricing table.
      { source: "/services/:slug(photography|drone-photography|drone-video|cinematic-video|social-media-reel|matterport-3d-tour|floor-plans|virtual-twilight|twilight-photography|property-website|marketing-kit)", destination: "/pricing", permanent: true },
    ];
  },
  images: {
    // Images are pre-sized in /public/media; resizing them on the fly (especially AVIF) blew past the 512 MB instance limit.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      ...(supabaseHost && !supabaseHost.endsWith(".supabase.co") ? [{ protocol: "https" as const, hostname: supabaseHost }] : []),
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: process.env.NODE_ENV === "production" ? securityHeaders : securityHeaders.slice(0, 4) },
      // Films and photos: let browsers keep them for a week instead of re-checking every visit.
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }] },
    ];
  },
};

export default nextConfig;
