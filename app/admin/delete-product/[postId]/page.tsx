'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProductFromPost } from '@/lib/actions/DeletePostandProduct'
import { useSession } from 'next-auth/react'
import ImageComponent from '@/app/MyComponent/ImageComponent'
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
  id: number
  brandname: string
  seoname: string
  imageUrl: string
}

interface PostWithProducts {
  id: number
  Celebrity: {
    name: string
  }
  products: Product[]
}

export default function DeleteProductPage({ params }: { params: { postId: string } }) {
  const [post, setPost] = useState<PostWithProducts | null>(null)
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
    async function fetchPost() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/posts/${params.postId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch post')
        }
        const data = await response.json()
        console.log('Fetched post data:', data)
        setPost(data)
      } catch (err) {
        setError('Failed to load post')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [params.postId])

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Are you sure you want to remove this product from the post?')) {
      setIsLoading(true)
      try {
        const result = await deleteProductFromPost(parseInt(params.postId), productId)
        if (result.success) {
          setPost(prevPost => prevPost ? {
            ...prevPost,
            products: prevPost.products.filter(product => product.id !== productId)
          } : null)
          alert(result.message)
        } else {
          throw new Error(result.message)
        }
      } catch (err) {
        setError('Failed to remove product from post')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>
  if (!post && !isLoading) return <div className="text-center mt-8">Post not found</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Products for Post</h1>
      {isLoading ? (
        <Skeleton className="h-8 w-64 mb-4" />
      ) : (
        <h2 className="text-xl mb-4">Celebrity: {post?.Celebrity.name}</h2>
      )}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <Skeleton className="w-full h-48 mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : post?.products.length === 0 ? (
        <p>No products found for this post.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {post?.products.map((product) => (
            <li key={product.id} className="bg-white p-4 rounded-lg shadow">
              <div className="w-full h-48 mb-4">
                {product.imageUrl && !isLoading ? (
                  <ImageComponent
                    src={product.imageUrl}
                    alt={product.seoname}
                    width={500}
                    height={500}
                    className="rounded-md w-full h-full object-contain"
                    transformation={[{
                      height: "200",
                      width: "200",
                      quality: "80",
                      focus: "auto",
                      crop: "at_max"
                    }]}
                    lqip={{ active: true, quality: 10, blur: 10 }}
                    loading="lazy"
                   
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold">{product.brandname}</h3>
              <p className="text-sm text-gray-500 mb-4">{product.seoname}</p>
              <button
                onClick={() => handleDeleteProduct(product.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors w-full"
              >
                Remove Product
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}