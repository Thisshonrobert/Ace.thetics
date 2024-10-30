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
}

export default nextConfig;
