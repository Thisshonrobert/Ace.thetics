'use client'

import { useState, useEffect } from 'react'
import ProductCard from "@/app/MyComponent/ProductCard"
import { GetProduct, Product } from "@/lib/actions/GetProduct"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ImageComponent from '@/app/MyComponent/ImageComponent'
import Link from 'next/link'
import { GetCategoryItems, GetShopItems } from '@/lib/actions/GetShopBrandItems'
import { toggleWishlist } from '@/lib/actions/Wishlist'
import { useSession } from 'next-auth/react'

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
        <h1 className='font-poppins text-md text-gray-500'>Discover More from </h1>
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
              <ImageComponent
                src={item.imageUrl}
                alt={item.seoname}
                width={128}
                height={128}
                className="w-full h-32 object-cover rounded-md"
                transformation={[{
                  width: "128",
                  height: "128",
                  quality: "80",
                  crop: "at_max",
                  focus: "auto"
                }]}
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
  const [categoryItems, setCategoryItems] = useState<Product[]>([])
  const [shopItems, setShopItems] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { data: session } = useSession();

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const fetchedProduct = await GetProduct(productId)
        setProduct(fetchedProduct)

        if (fetchedProduct) {
          const [categoryItems, shopItems] = await Promise.all([
            GetCategoryItems(fetchedProduct.category, productId),
            GetShopItems(fetchedProduct.shop, productId)
          ])
          setCategoryItems(categoryItems)
          setShopItems(shopItems)
          
          // Check if the product is wishlisted
          if (session?.user?.id) {
            const isProductWishlisted = fetchedProduct.wishList.some(item => item.id === (session?.user?.id))
            setIsWishlisted(isProductWishlisted)
          }
        }
      } catch (err) {
        setError('Failed to load product data')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [productId, session])

  const handleWishlistToggle = async () => {
    if (!product || !session?.user?.id) return
    setIsWishlisted(!isWishlisted);
    try {
      const result = await toggleWishlist(product.id)
      if (result.success) {
        setIsWishlisted(result.wishlisted)
      }
      else {
        setIsWishlisted(false)
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
    }
  }

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>
  }

  if (!product) {
    return <div className="text-center mt-8">Product not found</div>
  }

  return (
    <div className="max-w-6xl mx-auto mt-4 px-4 bg-zinc-50 rounded-xl">
      <div className="mb-6 pt-6 max-w-sm mx-auto">
        <ProductCard 
          image={product.imageUrl}
          alt={product.brandname}
          seoname={product.seoname}
          description={product.description}
          link={product.link}
          isWishlisted={isWishlisted}
          onWishlistToggle={handleWishlistToggle}
        />
      </div>

      <div className="bg-white max-w-5xl shadow-lg rounded-lg p-6 mx-auto">
        <ProductCarousel items={categoryItems} title={`${product.category}`} />
        <div className='border'></div>
        <ProductCarousel items={shopItems} title={`${product.shop}`} />
      </div>
    </div>
  )
}