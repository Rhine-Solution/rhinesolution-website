/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: [
      'images.unsplash.com',
      'github.com',
      'avatars.githubusercontent.com',
      'rhinesolution.com',
      'vercel.com',
    ],
  },
  outputFileTracingIncludes: {
    "/*": ["./content/news/**/*"],
  },
};

export default nextConfig;
