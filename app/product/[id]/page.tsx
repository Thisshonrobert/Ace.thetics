import { Metadata } from 'next'
import ProductPageClient from "./productClient"
import { GetProduct } from '@/lib/actions/GetProduct'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await GetProduct(parseInt(params.id, 10));

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product does not exist.',
      openGraph: {
        title: 'Product Not Found',
        description: 'The requested product does not exist.',
        type: 'website',
      },
    };
  }

  return {
    title: `Product ${product.seoname}`,
    description: `Detailed information about product ${product.seoname}`,
    openGraph: {
      title: `Product ${product.seoname}`,
      description: `Detailed information about product ${product.seoname}`,
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="mt-[35%] md:mt-[15%] lg:mt-[7%] mb-3">
      <ProductPageClient productId={parseInt(params.id, 10)} />
    </div>
  )
}