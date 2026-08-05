'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageField, ImageGalleryField } from '@/components/admin/ImageField'
import {
  IMAGE_FOLDERS,
  PRODUCT_CATEGORIES,
  sanitizeUrl,
  titleCase,
} from '@/constants/taxonomy'
import { shops } from '@/constants/shop'

interface EditableProduct {
  /** Absent for products staged locally but not yet written to the database. */
  id?: number
  brandname: string
  seoname: string
  imageUrl: string
  link: string
  description: string
  category: string
  shop: string
}

interface PostSummary {
  id: number
  imageUrl: string[]
  date: string
  Celebrity: { id: number; name: string; dp: string }
  _count?: { products: number }
}

interface EditablePost {
  id: number
  imageUrl: string[]
  date: string
  Celebrity: { id: number; name: string; dp: string }
  products: EditableProduct[]
}

const emptyProduct = (): EditableProduct => ({
  brandname: '',
  seoname: '',
  imageUrl: '',
  link: '',
  description: '',
  category: '',
  shop: '',
})

/** `<input type="date">` needs `yyyy-mm-dd`, not an ISO timestamp. */
const toDateInput = (iso: string) => new Date(iso).toISOString().slice(0, 10)

export default function UpdatePostPage() {
  const router = useRouter()

  const [posts, setPosts] = useState<PostSummary[]>([])
  const [selectedPost, setSelectedPost] = useState<EditablePost | null>(null)
  const [removedProductIds, setRemovedProductIds] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPost, setIsLoadingPost] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [categories, setCategories] = useState<string[]>([...PRODUCT_CATEGORIES])
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/posts')
        if (!res.ok) throw new Error('Failed to fetch posts')
        setPosts(await res.json())
      } catch (err) {
        console.error(err)
        toast.error('Could not load posts')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const filteredPosts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return posts
    return posts.filter((post) => post.Celebrity.name.toLowerCase().includes(term))
  }, [posts, searchTerm])

  const handlePostSelect = async (postId: number) => {
    setIsLoadingPost(true)
    setRemovedProductIds([])
    try {
      const res = await fetch(`/api/posts/${postId}`)
      if (!res.ok) throw new Error('Failed to load post')
      const data = await res.json()
      const products: EditableProduct[] = (data.products ?? []).map((p: EditableProduct) => ({
        ...p,
        link: p.link ?? '',
        description: p.description ?? '',
      }))
      setSelectedPost({ ...data, products })
      // Older rows can carry categories that are no longer in the canonical
      // list. Merge them in so the select shows the real value instead of an
      // empty placeholder.
      setCategories((prev) => {
        const extra = products
          .map((p) => p.category)
          .filter((c): c is string => Boolean(c) && !prev.includes(c))
        return extra.length > 0 ? [...prev, ...Array.from(new Set(extra))] : prev
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error(err)
      toast.error('Could not load that post')
    } finally {
      setIsLoadingPost(false)
    }
  }

  /** Immutably patches one product in the working copy. */
  const patchProduct = useCallback(
    (index: number, patch: Partial<EditableProduct>) => {
      setSelectedPost((prev) => {
        if (!prev) return prev
        const products = prev.products.map((product, i) =>
          i === index ? { ...product, ...patch } : product
        )
        return { ...prev, products }
      })
    },
    []
  )

  const removeProduct = (index: number) => {
    setSelectedPost((prev) => {
      if (!prev) return prev
      const target = prev.products[index]
      if (target.id) setRemovedProductIds((ids) => [...ids, target.id!])
      return { ...prev, products: prev.products.filter((_, i) => i !== index) }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPost) return

    if (selectedPost.imageUrl.length === 0) {
      toast.error('Add at least one celebrity image')
      return
    }
    const incomplete = selectedPost.products.find(
      (p) => !p.brandname.trim() || !p.imageUrl.trim()
    )
    if (incomplete) {
      toast.error('Every product needs a brand name and an image')
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/posts/${selectedPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: selectedPost.imageUrl,
          date: selectedPost.date,
          products: selectedPost.products.map((p) => ({
            ...p,
            link: sanitizeUrl(p.link),
          })),
          removedProductIds,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update post')

      toast.success(data.message || 'Post updated successfully!')
      setRemovedProductIds([])
      // Keep the list in sync so the thumbnail reflects the new images.
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id
            ? { ...p, imageUrl: selectedPost.imageUrl, date: selectedPost.date }
            : p
        )
      )
    } catch (error) {
      console.error('Error updating post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update post')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 px-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="px-4 pb-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Update Post</h1>
          <p className="text-sm text-gray-500">
            Edit images, product details and the post date. Changes go live immediately.
          </p>
        </div>
        {selectedPost && (
          <Button variant="outline" onClick={() => setSelectedPost(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to all posts
          </Button>
        )}
      </div>

      {!selectedPost ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choose a post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="post-search"
                placeholder="Search by celebrity name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {filteredPosts.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">
                No posts match “{searchTerm}”.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => handlePostSelect(post.id)}
                    className="group flex gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-indigo-400 hover:shadow-md"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.imageUrl[0]}
                      alt={post.Celebrity.name}
                      className="h-20 w-16 flex-shrink-0 rounded-lg bg-gray-100 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900 group-hover:text-indigo-600">
                        {post.Celebrity.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.date).toLocaleDateString()}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        #{post.id} · {post.imageUrl.length} image
                        {post.imageUrl.length === 1 ? '' : 's'}
                        {post._count ? ` · ${post._count.products} product${post._count.products === 1 ? '' : 's'}` : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : isLoadingPost ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <datalist id="admin-shops">
            {shops.map((shop) => (
              <option key={shop.name} value={shop.name} />
            ))}
          </datalist>

          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-3 text-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPost.Celebrity.dp}
                  alt={selectedPost.Celebrity.name}
                  className="h-10 w-10 rounded-full bg-gray-100 object-cover"
                />
                <span>{selectedPost.Celebrity.name}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">
                  Post #{selectedPost.id}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-xs space-y-2">
                <Label htmlFor="post-date" className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" /> Post date
                </Label>
                <Input
                  id="post-date"
                  type="date"
                  value={toDateInput(selectedPost.date)}
                  onChange={(e) =>
                    setSelectedPost({
                      ...selectedPost,
                      date: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>

              <ImageGalleryField
                label="Celebrity images"
                values={selectedPost.imageUrl}
                folder={IMAGE_FOLDERS.celebrities}
                onChange={(urls) => setSelectedPost({ ...selectedPost, imageUrl: urls })}
                emptyHint="No images on this post yet — add at least one."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">
                Products{' '}
                <span className="text-sm font-normal text-gray-500">
                  ({selectedPost.products.length})
                </span>
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedPost({
                    ...selectedPost,
                    products: [...selectedPost.products, emptyProduct()],
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" /> Add product
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPost.products.length === 0 && (
                <p className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">
                  No products on this post. Add one above.
                </p>
              )}

              {selectedPost.products.map((product, index) => (
                <div
                  key={product.id ?? `new-${index}`}
                  className="grid gap-5 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-[180px_1fr]"
                >
                  <div className="space-y-2">
                    <ImageField
                      value={product.imageUrl}
                      folder={IMAGE_FOLDERS.products}
                      onChange={(url) => patchProduct(index, { imageUrl: url })}
                    />
                    <p className="text-center text-xs text-gray-400">
                      {product.id ? `Product #${product.id}` : 'New product'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`brand-${index}`}>Brand name</Label>
                        <Input
                          id={`brand-${index}`}
                          value={product.brandname}
                          onChange={(e) => patchProduct(index, { brandname: e.target.value })}
                          placeholder="e.g. Louis Philippe"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`shop-${index}`}>Shop</Label>
                        {/* Free text with suggestions rather than a hard select:
                            the shop list in constants/shop.ts only covers the
                            logos we ship, but products may legitimately come
                            from other retailers. */}
                        <Input
                          id={`shop-${index}`}
                          value={product.shop}
                          onChange={(e) =>
                            patchProduct(index, { shop: e.target.value.toLowerCase() })
                          }
                          list="admin-shops"
                          placeholder="e.g. amazon"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`seoname-${index}`}>Product name (SEO)</Label>
                      <Input
                        id={`seoname-${index}`}
                        value={product.seoname}
                        onChange={(e) => patchProduct(index, { seoname: e.target.value })}
                        placeholder="Full product title shown to visitors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`description-${index}`}>Description</Label>
                      <textarea
                        id={`description-${index}`}
                        value={product.description}
                        onChange={(e) => patchProduct(index, { description: e.target.value })}
                        rows={2}
                        placeholder="Elevate your style, embrace the trend!"
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`category-${index}`}>Category</Label>
                        <Select
                          value={product.category}
                          onValueChange={(value) => patchProduct(index, { category: value })}
                        >
                          <SelectTrigger id={`category-${index}`}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c} value={c}>
                                {titleCase(c)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`link-${index}`}>Buy link</Label>
                        <Input
                          id={`link-${index}`}
                          value={product.link}
                          onChange={(e) => patchProduct(index, { link: e.target.value })}
                          placeholder="amazon.in/dp/XXXX"
                        />
                        {product.link && (
                          <p className="truncate text-xs text-gray-400">
                            Saved as: {sanitizeUrl(product.link)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove from post
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap items-end gap-2 border-t pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-category">Need a new category?</Label>
                  <Input
                    id="new-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. hoodies"
                    className="w-56"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const value = newCategory.trim().toLowerCase()
                    if (!value) return
                    if (categories.includes(value)) {
                      toast.info('That category already exists')
                      return
                    }
                    setCategories((prev) => [...prev, value])
                    setNewCategory('')
                    toast.success(`“${value}” is now selectable`)
                  }}
                >
                  Add category
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 -mx-4 flex items-center justify-between gap-3 border-t bg-white/95 px-4 py-3 backdrop-blur">
            <p className="text-xs text-gray-500">
              {removedProductIds.length > 0 &&
                `${removedProductIds.length} product${removedProductIds.length === 1 ? '' : 's'} will be detached on save.`}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.push('/admin')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
