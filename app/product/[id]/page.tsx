import ProductPageClient from "./productClient";

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductPageClient productId={parseInt(params.id, 10)} />
}