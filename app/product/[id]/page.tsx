import { Metadata } from 'next'
import ProductPageClient from "./productClient"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // You can fetch product data here if needed
  // const product = await fetchProduct(params.id)

  return {
    title: `Product ${params.id}`,
    description: `Detailed information about product ${params.id}`,
    openGraph: {
      title: `Product ${params.id}`,
      description: `Detailed information about product ${params.id}`,
      type: 'website',
    },
  }
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="mt-[35%] md:mt-[15%] lg:mt-[7%]">
      <ProductPageClient productId={parseInt(params.id, 10)} />
    </div>
  )
}