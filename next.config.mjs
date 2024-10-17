/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'www.google.com',  
      'm.media-amazon.com', 
      'acethetics.s3.ap-south-1.amazonaws.com',
      process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN.replace('https://', '')
    ],
}
}

export default nextConfig;
