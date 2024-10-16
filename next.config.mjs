/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'www.google.com',  
      'm.media-amazon.com', 
      'your-s3-bucket-name.s3.amazonaws.com',
      process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN.replace('https://', '')
    ],
}
}

export default nextConfig;
