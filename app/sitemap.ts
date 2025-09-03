import { MetadataRoute } from 'next'
import { prisma } from '@/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://acethetics.starzc.com"

  // Get all celebrities
  const celebrities = await prisma.celebrity.findMany({
    select: {
      name: true,
    },
  })

  const celebrityUrls = celebrities.map((celebrity) => ({
    url: `${baseUrl}/celebrity/${encodeURIComponent(celebrity.name)}`,
    lastModified: new Date(),
  }))

  // Get all posts
  const posts = await prisma.post.findMany({
    select: {
      id: true,
    },
  })

  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/post/${post.id}`,
    lastModified: new Date(),
  }))

  // Get all products
  const products = await prisma.product.findMany({
    select: {
      id: true,
    },
  })

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(),
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/liked`,
      lastModified: new Date(),
    },
    ...celebrityUrls,
    ...postUrls,
    ...productUrls,
  ]
}
