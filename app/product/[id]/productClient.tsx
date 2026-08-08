'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ChevronLeft, ChevronRight, ExternalLink, Heart } from 'lucide-react'

import ImageComponent from '@/app/MyComponent/ImageComponent'
import { GetProduct, Product } from '@/lib/actions/GetProduct'
import {
  GetBrandItems,
  GetCategoryItems,
  GetProductWearers,
  GetShopItems,
  type ProductWearer,
} from '@/lib/actions/GetShopBrandItems'
import { toggleWishlist } from '@/lib/actions/Wishlist'
import { trackAffiliateClick } from '@/lib/gtag'
import { shops } from '@/constants/shop'
import { titleCase } from '@/constants/taxonomy'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import AuthDialog from '@/components/ui/AuthDialog'
import { useToast } from '@/hooks/use-toast'

/* ------------------------------------------------------------------ */
/* Related-products rail                                               */
/* ------------------------------------------------------------------ */

function ProductRail({
  items,
  title,
  href,
  isLoading,
}: {
  items: Product[]
  title: string
  href?: string
  isLoading: boolean
}) {
  // A ref instead of `document.getElementById` with a title-derived id: two
  // rails whose titles differ only by whitespace used to collide, and the
  // lookup broke entirely for titles containing punctuation.
  const railRef = useRef<HTMLDivElement>(null)

  const scrollBy = (direction: 'left' | 'right') => {
    railRef.current?.scrollBy({
      left: direction === 'left' ? -320 : 320,
      behavior: 'smooth',
    })
  }

  if (!isLoading && items.length === 0) return null

  return (
    <section className="border-t border-gray-100 py-8">
      <h2 className="mb-4 font-poppins text-sm font-semibold uppercase tracking-[0.15em] text-gray-900">
        More from{' '}
        {href ? (
          <Link href={href} className="underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900">
            {title}
          </Link>
        ) : (
          title
        )}
      </h2>

      <div className="relative">
        <div
          ref={railRef}
          className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-2"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="w-36 flex-shrink-0 sm:w-44">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="mt-2 h-3 w-2/3" />
                  <Skeleton className="mt-1.5 h-3 w-full" />
                </div>
              ))
            : items.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.id}`}
                  className="group w-36 flex-shrink-0 sm:w-44"
                >
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-white p-3 ring-1 ring-gray-100 transition-shadow group-hover:shadow-md">
                    <ImageComponent
                      src={item.imageUrl}
                      alt={item.seoname}
                      width={200}
                      height={200}
                      className="h-auto w-auto max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      transformation={[{
                        width: '300',
                        height: '300',
                        quality: '80',
                        crop: 'at_max',
                        background: 'FFFFFF',
                      }]}
                      lqip={{ active: true, quality: 10, blur: 10 }}
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-2 truncate font-poppins text-xs font-semibold uppercase tracking-wide text-gray-900">
                    {item.brandname}
                  </p>
                  <p className="line-clamp-2 font-poppins text-xs text-gray-500">{item.seoname}</p>
                </Link>
              ))}
        </div>

        {/* Arrows are a desktop affordance; touch devices just swipe. */}
        <button
          type="button"
          onClick={() => scrollBy('left')}
          aria-label={`Scroll ${title} left`}
          className="absolute -left-3 top-1/3 hidden h-8 w-8 place-items-center rounded-full bg-white shadow-md ring-1 ring-gray-100 transition hover:bg-gray-50 md:grid"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy('right')}
          aria-label={`Scroll ${title} right`}
          className="absolute -right-3 top-1/3 hidden h-8 w-8 place-items-center rounded-full bg-white shadow-md ring-1 ring-gray-100 transition hover:bg-gray-50 md:grid"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* "Worn by" strip                                                     */
/* ------------------------------------------------------------------ */

function WornBy({ wearers }: { wearers: ProductWearer[] }) {
  if (wearers.length === 0) return null

  return (
    <div className="mt-6">
      <h2 className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">
        Worn by
      </h2>
      <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
        {wearers.map((wearer) => (
          <Link
            key={wearer.postId}
            href={`/celebrity/${encodeURIComponent(wearer.celebrityName)}`}
            className="group w-24 flex-shrink-0"
          >
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
              <ImageComponent
                src={wearer.postImage}
                alt={`${wearer.celebrityName} wearing this item`}
                transformation={[{ width: '200', height: '270', quality: '80', crop: 'at_max' }]}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                lqip={{ active: true, quality: 10, blur: 10 }}
                loading="lazy"
              />
            </div>
            <p className="mt-1.5 line-clamp-2 text-center font-poppins text-[11px] font-medium text-gray-700">
              {wearer.celebrityName}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

interface ProductPageClientProps {
  productId: number
}

export default function ProductPageClient({ productId }: ProductPageClientProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [brandItems, setBrandItems] = useState<Product[]>([])
  const [categoryItems, setCategoryItems] = useState<Product[]>([])
  const [shopItems, setShopItems] = useState<Product[]>([])
  const [wearers, setWearers] = useState<ProductWearer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRelatedLoading, setIsRelatedLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)

  const { data: session } = useSession()
  const { toast } = useToast()
  const userId = session?.user?.id

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setIsLoading(true)
      setIsRelatedLoading(true)
      setError(null)
      try {
        const fetchedProduct = await GetProduct(productId)
        if (cancelled) return

        setProduct(fetchedProduct)
        setIsLoading(false)

        if (!fetchedProduct) {
          setIsRelatedLoading(false)
          return
        }

        const [brand, category, shop, worn] = await Promise.all([
          GetBrandItems(fetchedProduct.brandname, productId),
          GetCategoryItems(fetchedProduct.category, productId),
          GetShopItems(fetchedProduct.shop, productId),
          GetProductWearers(productId),
        ])
        if (cancelled) return

        setBrandItems(brand)
        setCategoryItems(category)
        setShopItems(shop)
        setWearers(worn)
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setError('Failed to load product data')
          setIsLoading(false)
        }
      } finally {
        if (!cancelled) setIsRelatedLoading(false)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
    // Deliberately keyed on the id alone. The old effect also depended on the
    // whole `session` object, so every session refresh refetched the product
    // and every related list.
  }, [productId])

  // Wishlist state is derived from the product + who is signed in, so it stays
  // correct when the user signs in without triggering a product refetch.
  useEffect(() => {
    if (!product || !userId) {
      setIsWishlisted(false)
      return
    }
    setIsWishlisted(product.wishList.some((item) => item.id === userId))
  }, [product, userId])

  const shopLogo = useMemo(
    () => shops.find((s) => s.name === product?.shop)?.image,
    [product?.shop]
  )

  const handleWishlistToggle = async () => {
    if (!product) return
    if (!session) {
      setIsAuthDialogOpen(true)
      return
    }

    const previous = isWishlisted
    setIsWishlisted(!previous)
    setIsTogglingWishlist(true)
    try {
      const result = await toggleWishlist(product.id)
      setIsWishlisted(result.wishlisted)
      toast({
        title: result.wishlisted ? 'Added to wishlist' : 'Removed from wishlist',
        description: `${product.seoname} ${result.wishlisted ? 'has been added to' : 'has been removed from'} your wishlist.`,
      })
    } catch (err) {
      console.error('Failed to toggle wishlist:', err)
      // Restore the real previous value. The old handler hard-reset to `false`
      // on failure, which showed "not wishlisted" for items that still were.
      setIsWishlisted(previous)
      toast({
        title: 'Error',
        description: 'Failed to update wishlist. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsTogglingWishlist(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="space-y-4 pt-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="mt-8 text-center text-red-500">{error}</div>
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Product not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          This item may have been removed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to looks</Link>
        </Button>
      </div>
    )
  }

  const buyUrl = `https://${product.link}`

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-5 font-poppins text-xs text-gray-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-gray-900">Home</Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-gray-900">{titleCase(product.category || 'Item')}</li>
          <li aria-hidden>/</li>
          <li className="truncate text-gray-900">{product.brandname}</li>
        </ol>
      </nav>

      {/* `min-w-0` on the grid children: grid tracks size to min-content by
          default, so any child wider than the viewport drags the whole column
          — and therefore the page — with it. */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* ---------- Gallery ---------- */}
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          {/* Portrait on phones, square from `sm` up. Garment shots are almost
              always taller than they are wide, so a square box on a narrow
              screen wasted a band of empty space above and below the product. */}
          <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl bg-white p-4 ring-1 ring-gray-100 sm:aspect-square sm:p-10">
            <ImageComponent
              src={product.imageUrl}
              alt={`${product.brandname} ${product.seoname}`}
              width={600}
              height={600}
              className="h-auto w-auto max-h-full max-w-full object-contain"
              transformation={[{
                width: '800',
                height: '800',
                quality: '90',
                crop: 'at_max',
                background: 'FFFFFF',
              }]}
              lqip={{ active: true, quality: 20, blur: 10 }}
              priority
            />
          </div>
          <div className="hidden lg:block">
            <WornBy wearers={wearers} />
          </div>
        </div>

        {/* ---------- Details ---------- */}
        <div className="flex min-w-0 flex-col">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-poppins text-sm font-semibold uppercase tracking-[0.18em] text-gray-900">
                {product.brandname}
              </p>
              <h1 className="mt-2 font-poppins text-2xl leading-snug text-gray-800 sm:text-3xl">
                {product.seoname}
              </h1>
            </div>

            <button
              type="button"
              onClick={handleWishlistToggle}
              disabled={isTogglingWishlist}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={isWishlisted}
              className={cn(
                'grid h-11 w-11 flex-shrink-0 place-items-center rounded-full ring-1 transition-colors',
                isWishlisted
                  ? 'bg-red-50 text-red-500 ring-red-200'
                  : 'bg-white text-gray-400 ring-gray-200 hover:text-red-500',
                isTogglingWishlist && 'opacity-60'
              )}
            >
              <Heart className={cn('h-5 w-5', isWishlisted && 'fill-current')} />
            </button>
          </div>

          {product.description && (
            <p className="mt-5 font-poppins text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>
          )}

          {product.shop && (
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <span className="font-poppins">from</span>
              <Avatar className="h-7 w-7">
                <AvatarImage src={shopLogo} alt={product.shop} />
                <AvatarFallback className="text-[10px]">
                  {product.shop.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-poppins font-medium text-gray-800">
                {titleCase(product.shop)}
              </span>
            </div>
          )}

          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            onClick={() => trackAffiliateClick(product.seoname, product.shop || product.link)}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-4 font-poppins text-sm font-bold uppercase tracking-[0.12em] text-white transition-transform hover:scale-[1.01] hover:bg-gray-900 active:scale-100"
          >
            Buy at {titleCase(product.shop || 'store')}
            <ExternalLink className="h-4 w-4" />
          </a>

          <p className="mt-3 text-center font-poppins text-[11px] text-gray-400">
            Affiliate link — we may earn a commission at no extra cost to you.
          </p>

          <dl className="mt-8 divide-y divide-gray-100 border-y border-gray-100 font-poppins text-sm">
            <div className="flex justify-between py-3">
              <dt className="text-gray-500">Category</dt>
              <dd className="font-medium text-gray-900">{titleCase(product.category || '—')}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-gray-500">Brand</dt>
              <dd className="font-medium text-gray-900">{product.brandname}</dd>
            </div>
          </dl>

          <div className="lg:hidden">
            <WornBy wearers={wearers} />
          </div>
        </div>
      </div>

      {/* ---------- Related ---------- */}
      <div className="mt-12">
        <ProductRail
          items={brandItems}
          title={product.brandname}
          isLoading={isRelatedLoading}
        />
        {/* No `href` on the category rail: /filter/[filter] only handles the
            gender enum, so a category link would land on an empty page. */}
        <ProductRail
          items={categoryItems}
          title={titleCase(product.category)}
          isLoading={isRelatedLoading}
        />
        <ProductRail
          items={shopItems}
          title={titleCase(product.shop)}
          isLoading={isRelatedLoading}
        />
      </div>

      <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setIsAuthDialogOpen(false)} />
    </div>
  )
}
