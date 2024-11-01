import ProductPageClient from "./productClient";

export default function ProductPage({ params }: { params: { id: string } }) {
  return <div className="mt-[35%] md:mt-[15%] lg:mt-[7%]">
      <ProductPageClient productId={parseInt(params.id, 10)} />

  </div>
}