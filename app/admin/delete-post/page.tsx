'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deletePost } from '@/lib/actions/DeletePostandProduct'
import { useSession } from 'next-auth/react'

interface Post {
  id: number
  imageUrl: string[]
  date: string
  Celebrity: {
    name: string
  }
}

export default function DeletePostPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession();


  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/posts')
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = await response.json()
        setPosts(data)
      } catch (err) {
        setError('Failed to load posts')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      setIsLoading(true)
      try {
        const result = await deletePost(id)
        if (result.success) {
          setPosts(posts.filter(post => post.id !== id))
          alert(result.message)
        } else {
          throw new Error(result.message)
        }
      } catch (err) {
        setError('Failed to delete post')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (isLoading) return <div className="text-center mt-8">Loading...</div>
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Delete Post</h1>
      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold">{post.Celebrity.name}</h2>
                  <p className="text-sm text-gray-500">{new Date(post.date).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-2">
                  <Link href={`/admin/delete-product/${post.id}`}>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                      Manage Products
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Delete Post
                  </button>
                </div>
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                {post.imageUrl.map((url, index) => (
                  <img key={index} src={url} alt={`Post image ${index + 1}`} className="w-24 h-24 object-cover rounded" />
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}