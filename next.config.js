/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Report-only CSP: starts collecting violations without blocking anything.
  // Tighten to an enforcing policy once the report data is clean.
  {
    key: "Content-Security-Policy-Report-Only",
    value:
      "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://generativelanguage.googleapis.com https://challenges.cloudflare.com; font-src 'self' data:; frame-src https://challenges.cloudflare.com; base-uri 'self'; form-action 'self'",
  },
];

const nextConfig = {
  outputFileTracingRoot: __dirname,
  outputFileTracingIncludes: {
    "/*": ["./content/news/**/*"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "rhinesolution.com" },
      { protocol: "https", hostname: "vercel.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
