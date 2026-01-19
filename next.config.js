/** @type {import('next').NextConfig} */

/**
 * Security Headers Configuration
 * 
 * SECURITY RATIONALE:
 * These headers protect against common web vulnerabilities:
 * - XSS (Cross-Site Scripting) via Content-Security-Policy
 * - Clickjacking via X-Frame-Options
 * - MIME sniffing attacks via X-Content-Type-Options
 * - Information leakage via Referrer-Policy
 * - Browser feature abuse via Permissions-Policy
 */
const securityHeaders = [
  {
    // Prevents the page from being embedded in iframes (Clickjacking protection)
    // DENY = never allow embedding
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    // Prevents browsers from MIME-sniffing away from declared Content-Type
    // This stops attacks where malicious files are disguised as safe types
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    // Controls how much referrer info is shared with other sites
    // strict-origin-when-cross-origin = share origin only for cross-origin requests
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    // Forces HTTPS for 1 year (prevents downgrade attacks)
    // Only enable in production with valid HTTPS
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains'
  },
  {
    // Restricts browser features the page can use
    // Blocks access to sensitive APIs that could be exploited
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
  },
  {
    // Content Security Policy - defines trusted content sources
    // This is the most important header for XSS prevention
    key: 'Content-Security-Policy',
    value: [
      // Only allow scripts from same origin and specific trusted CDNs
      "default-src 'self'",
      // Scripts: self + inline for React hydration + specific CDNs
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://kit.fontawesome.com https://ka-f.fontawesome.com",
      // Styles: self + inline for styled-jsx and CSS-in-JS + Font Awesome CDN
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://ka-f.fontawesome.com https://cdnjs.cloudflare.com",
      // Images: self + data URIs (for inline images) + Supabase storage + Mapbox
      "img-src 'self' data: blob: https://*.supabase.co https://api.mapbox.com https://*.mapbox.com",
      // Fonts: self + Google Fonts + Font Awesome CDN
      "font-src 'self' https://fonts.gstatic.com https://ka-f.fontawesome.com https://cdnjs.cloudflare.com",
      // Connect: API calls to Supabase + Mapbox + Stripe + Groq AI + Google Fonts + Font Awesome CDN
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com https://*.tiles.mapbox.com https://events.mapbox.com https://api.stripe.com https://ka-f.fontawesome.com https://api.groq.com https://fonts.googleapis.com https://fonts.gstatic.com https://cdnjs.cloudflare.com",
      // Frames: Stripe checkout (if used) + Supabase Auth
      "frame-src 'self' https://js.stripe.com https://*.supabase.co",
      // Workers: for Mapbox GL workers
      "worker-src 'self' blob:",
      // Object/embed: disabled for security
      "object-src 'none'",
      // Base URI: restrict base tag manipulation
      "base-uri 'self'",
      // Form actions: only submit to same origin
      "form-action 'self'",
      // Frame ancestors: prevent this page from being framed
      "frame-ancestors 'none'"
      // NOTE: 'upgrade-insecure-requests' removed - breaks localhost development without SSL
      // Re-enable in production: "upgrade-insecure-requests"
    ].join('; ')
  }
]

const nextConfig = {
  reactStrictMode: true,

  // Build optimizations
  swcMinify: true,

  // Skip type checking during build (faster, rely on IDE)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Skip ESLint during build (run separately)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Optimize images
  images: {
    domains: ['localhost'],
    unoptimized: true, // For static export compatibility
  },

  // Experimental features for faster builds
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      '@react-three/fiber',
      '@react-three/drei',
      'mapbox-gl',
    ],
  },

  // Apply security headers to all routes
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig

