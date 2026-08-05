'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { Boxes, Search, Trash2 } from 'lucide-react'

import { deletePost } from '@/lib/actions/DeletePostandProduct'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'

interface Post {
  id: number
  imageUrl: string[]
  date: string
  Celebrity: { id: number; name: string; dp: string }
  _count?: { products: number }
}

export default function DeletePostPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Post | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // No client-side admin redirect here: AdminAuthWrapper already gates the
  // whole /admin subtree, and the duplicated check just caused a flash of the
  // page before the redirect fired.
  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/posts')
        if (!response.ok) throw new Error('Failed to fetch posts')
        setPosts(await response.json())
      } catch (err) {
        console.error(err)
        setError('Failed to load posts')
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

  const handleDelete = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      const result = await deletePost(pendingDelete.id)
      if (!result.success) throw new Error(result.message)
      setPosts((prev) => prev.filter((post) => post.id !== pendingDelete.id))
      toast.success(result.message || 'Post deleted')
      setPendingDelete(null)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Failed to delete post')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 px-4">
        <Skeleton className="h-9 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) return <div className="px-4 text-center text-red-500">{error}</div>

  return (
    <div className="px-4 pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delete Post</h1>
        <p className="text-sm text-gray-500">
          Deleting a post also removes its product links. This cannot be undone.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            All posts <span className="text-sm font-normal text-gray-500">({posts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="delete-post-search"
              placeholder="Search by celebrity name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredPosts.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No posts found.</p>
          ) : (
            <ul className="space-y-3">
              {filteredPosts.map((post) => (
                <li
                  key={post.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-3"
                >
                  <div className="flex gap-2">
                    {post.imageUrl.slice(0, 3).map((url, index) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={index}
                        src={url}
                        alt={`${post.Celebrity.name} ${index + 1}`}
                        className="h-20 w-16 rounded-lg bg-gray-100 object-cover"
                      />
                    ))}
                    {post.imageUrl.length > 3 && (
                      <div className="grid h-20 w-16 place-items-center rounded-lg bg-gray-100 text-xs text-gray-500">
                        +{post.imageUrl.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900">{post.Celebrity.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Post #{post.id}
                      {post._count ? ` · ${post._count.products} product${post._count.products === 1 ? '' : 's'}` : ''}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/delete-product/${post.id}`}>
                        <Boxes className="mr-2 h-4 w-4" /> Products
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingDelete(post)}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete this post?"
        description={
          pendingDelete ? (
            <>
              <strong>{pendingDelete.Celebrity.name}</strong> · Post #{pendingDelete.id} ·{' '}
              {pendingDelete.imageUrl.length} image
              {pendingDelete.imageUrl.length === 1 ? '' : 's'}. This cannot be undone.
            </>
          ) : null
        }
        confirmLabel="Delete post"
        isPending={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
