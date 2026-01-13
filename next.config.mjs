/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  images: {
    domains: [
      'www.google.com',  
      'm.media-amazon.com', 
      'ik.imagekit.io'
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  staticPageGenerationTimeout: 180,
  // Ensure CSS is properly optimized in production builds
  swcMinify: true,
}

export default nextConfig;
