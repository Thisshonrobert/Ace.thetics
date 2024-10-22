import CloudFrontImage from "@/app/MyComponent/CloudFrontImage";
import { GetProduct } from "@/lib/actions/GetProduct";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await GetProduct(parseInt(params.id, 10));

  if (!product || typeof product === 'string') {
    return <div>{product || "Product not found"}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{product.brandname}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* <CloudFrontImage
                  src={product.image}
                  alt={product.seoname}
                  width={48}
                  height={48}
                  className="rounded-md ml-2"
                /> */}
        <div>
          <p className="text-lg mb-2"><strong>Category:</strong> {product.category}</p>
          <p className="text-lg mb-2"><strong>SEO Name:</strong> {product.seoname}</p>
          <p className="text-lg mb-2"><strong>Shop:</strong> {product.shop}</p>
        </div>
      </div>
    </div>
  );
}
