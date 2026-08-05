'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { ArrowLeft, PencilLine, Trash2 } from 'lucide-react'

import ImageComponent from '@/app/MyComponent/ImageComponent'
import { deleteProductFromPost } from '@/lib/actions/DeletePostandProduct'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'

interface Product {
  id: number
  brandname: string
  seoname: string
  imageUrl: string
  category: string
  shop: string
}

interface PostWithProducts {
  id: number
  Celebrity: { id: number; name: string; dp: string }
  products: Product[]
}

export default function DeleteProductPage({ params }: { params: { postId: string } }) {
  const [post, setPost] = useState<PostWithProducts | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/posts/${params.postId}`)
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        setPost(await response.json())
      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Failed to load post. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPost()
  }, [params.postId])

  const handleDeleteProduct = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      const result = await deleteProductFromPost(
        parseInt(params.postId),
        pendingDelete.id,
        true
      )
      if (!result.success) throw new Error(result.message)
      setPost((prev) =>
        prev ? { ...prev, products: prev.products.filter((p) => p.id !== pendingDelete.id) } : prev
      )
      toast.success(result.message || 'Product removed')
      setPendingDelete(null)
    } catch (err) {
      console.error('Error removing product:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to remove product')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 px-4">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-red-500">{error}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/delete-post">Back to posts</Link>
        </Button>
      </div>
    )
  }

  if (!post) {
    return <div className="px-4 py-12 text-center text-gray-500">Post not found</div>
  }

  return (
    <div className="px-4 pb-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Products on {post.Celebrity.name}&apos;s post
          </h1>
          <p className="text-sm text-gray-500">
            Post #{post.id} · removing a product only detaches it from this post.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/delete-post">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/update-post">
              <PencilLine className="mr-2 h-4 w-4" /> Edit post
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Products <span className="text-sm font-normal text-gray-500">({post.products.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {post.products.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">
              No products left on this post.
            </p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {post.products.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-col rounded-xl border border-gray-200 bg-white p-4"
                >
                  {/* The image sits in normal flow in a fixed-ratio box. It was
                      previously `absolute` inside a static card, so it escaped
                      the card and overlapped the text below it. */}
                  <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gray-50 p-2">
                    {product.imageUrl ? (
                      <ImageComponent
                        src={product.imageUrl}
                        alt={product.seoname}
                        width={200}
                        height={200}
                        className="h-auto w-auto max-h-full max-w-full object-contain"
                        transformation={[{
                          height: '300',
                          width: '300',
                          quality: '80',
                          crop: 'at_max',
                          background: 'FFFFFF',
                        }]}
                        lqip={{ active: true, quality: 10, blur: 10 }}
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-sm text-gray-400">No image</span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900">{product.brandname}</h3>
                  <p className="mb-3 line-clamp-2 flex-1 text-sm text-gray-500">
                    {product.seoname}
                  </p>
                  <p className="mb-3 text-xs text-gray-400">
                    #{product.id} · {product.category || 'uncategorised'} · {product.shop || 'no shop'}
                  </p>

                  <Button
                    variant="outline"
                    onClick={() => setPendingDelete(product)}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Remove from post
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove this product?"
        description={
          pendingDelete ? (
            <>
              <strong>{pendingDelete.brandname}</strong> — {pendingDelete.seoname} will be detached
              from this post.
            </>
          ) : null
        }
        confirmLabel="Remove product"
        isPending={isDeleting}
        onConfirm={handleDeleteProduct}
      />
    </div>
  )
}
