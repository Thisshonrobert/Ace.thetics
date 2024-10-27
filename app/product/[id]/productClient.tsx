'use client'

import { useState, useEffect } from 'react'
import ProductCard from "@/app/MyComponent/ProductCard"
import { GetProduct, Product } from "@/lib/actions/GetProduct"
import { GetShopBrandItems } from "@/lib/actions/GetShopBrandItems"
import { ChevronLeft, ChevronRight } from "lucide-react"
import CloudFrontImage from '@/app/MyComponent/CloudFrontImage'
import Link from 'next/link'

interface ProductCarouselProps {
  items: Product[]
  title: string
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ items, title }) => {
  const scrollProducts = (direction: 'left' | 'right') => {
    const container = document.getElementById(`${title.replace(/\s+/g, '')}Container`)
    if (container) {
      const scrollAmount = direction === 'left' ? -200 : 200
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="mt-8">
        <div className='flex items-center mb-3'>
             <h1 className='font-poppins text-md text-gray-500 '>Discover More from </h1>
        <h2 className="text-lg font-poppins underline font-semibold ml-2 text-gray-500">{title}</h2>
</div>
      <div className="relative">
        <button 
          onClick={() => scrollProducts('left')} 
          className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md z-10 hover:bg-gray-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <div 
          id={`${title.replace(/\s+/g, '')}Container`}
          className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4 mx-auto font-poppins font-semibold"
        >
          {items.map((item) => (
            <Link href={`/product/${item.id}`} key={item.id} className="flex-shrink-0 w-32 ml-4 mr-4">
              <CloudFrontImage
                src={item.imageUrl}
                alt={item.seoname}
                width={128}
                height={128}
                className="w-full h-32 object-cover rounded-md"
              />
              <h3 className="mt-1 text-xs font-medium truncate">{item.seoname}</h3>
              <p className="text-xs text-gray-500 truncate">{item.brandname}</p>
            </Link>
          ))}
        </div>
        <button 
          onClick={() => scrollProducts('right')} 
          className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md z-10 hover:bg-gray-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    </div>
  )
}

interface ProductPageClientProps {
  productId: number
}

export default function ProductPageClient({ productId }: ProductPageClientProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [shopBrandItems, setShopBrandItems] = useState<Product[]>([])
  const [shopItems, setShopItems] = useState<Product[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const fetchedProduct = await GetProduct(productId)
      setProduct(fetchedProduct)

      if (fetchedProduct) {
        const brandItems = await GetShopBrandItems(fetchedProduct.shop, fetchedProduct.brandname,productId)
        setShopBrandItems(brandItems)

        const shopItems = await GetShopBrandItems(fetchedProduct.shop, '',productId)
        setShopItems(shopItems)
      }
    }

    fetchData()
  }, [productId])

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="max-w-6xl mx-auto mt-4 px-4 bg-zinc-50 rounded-xl">
      <div className="mb-6 pt-6 max-w-sm mx-auto ">
        <ProductCard 
          image={product.imageUrl} 
          alt={product.brandname} 
          seoname={product.seoname} 
          description={product.description} 
          link={product.link}
        />
      </div>

      <div className="bg-white max-w-5xl shadow-lg rounded-lg p-6 mx-auto">
        <ProductCarousel items={shopBrandItems} title={`${product.brandname}`} />
        <div className='border'></div>
        <ProductCarousel items={shopItems} title={`${product.shop}`} />
      </div>
    </div>
  )
}