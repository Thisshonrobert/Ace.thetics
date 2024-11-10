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
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from '@/hooks/use-toast'

interface ProductCarouselProps {
  items: Product[]
  title: string
  isLoading: boolean
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ items, title, isLoading }) => {
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
          {isLoading
            ? Array(5).fill(0).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-24 ml-4 mr-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-md">
                    <Skeleton className="w-full h-full rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-full mt-1" />
                  <Skeleton className="h-3 w-3/4 mt-1" />
                </div>
              ))
            : items.map((item) => (
                <Link href={`/product/${item.id}`} key={item.id} className="flex-shrink-0 w-24 ml-4 mr-4">
                  <div className="w-30 h-30 bg-white rounded-md flex items-center justify-center p-1">
                    <ImageComponent
                      src={item.imageUrl}
                      alt={item.seoname}
                      width={100}
                      height={100}
                      className="w-auto h-auto max-w-full max-h-full object-contain"
                      transformation={[{
                        width: "160",
                        height: "160",
                        quality: "80",
                        crop: "at_max",
                        background: "FFFFFF"
                      }]}
                      lqip={{ active: true, quality: 10, blur: 10 }}
                      loading="lazy"
                    />
                  </div>
                  <h3 className="mt-2 text-xs font-medium truncate">{item.seoname}</h3>
                  <p className="text-xs text-gray-500 truncate">{item.brandname}</p>
                </Link>
              ))
          }
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
  const { data: session } = useSession()
  const { toast } = useToast()

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
    setIsWishlisted(!isWishlisted)
    try {
      const result = await toggleWishlist(product.id)
      if (result.success) {
        setIsWishlisted(result.wishlisted)
        toast({
          title: result.wishlisted ? "Added to Wishlist" : "Removed from Wishlist",
          description: result.wishlisted ? `${product.seoname} has been added to your wishlist.` : `${product.seoname} has been removed from your wishlist.`,
        })
      } else {
        setIsWishlisted(false)
        toast({
          title: "Error",
          description: "Failed to update wishlist. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto mt-4 px-4 bg-zinc-50 rounded-xl">
        <div className="mb-6 pt-6 max-w-sm mx-auto">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
        <div className="bg-white max-w-5xl shadow-lg rounded-lg p-6 mx-auto">
          <ProductCarousel items={[]} title="Category" isLoading={true} />
          <div className='border'></div>
          <ProductCarousel items={[]} title="Shop" isLoading={true} />
        </div>
      </div>
    )
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
          category={product.category}
          description={product.description}
          link={product.link}
          isWishlisted={isWishlisted}
          onWishlistToggle={handleWishlistToggle}
        />
      </div>

      <div className="bg-white max-w-5xl shadow-lg rounded-lg p-6 mx-auto">
        <ProductCarousel items={categoryItems} title={`${product.category}`} isLoading={false} />
        <div className='border'></div>
        <ProductCarousel items={shopItems} title={`${product.shop}`} isLoading={false} />
      </div>
    </div>
  )
}


