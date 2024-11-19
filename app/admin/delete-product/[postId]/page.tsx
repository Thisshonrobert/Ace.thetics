'use client'

import ImageComponent from '@/app/MyComponent/ImageComponent'
import { AlertDialog, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { deleteProductFromPost } from '@/lib/actions/DeletePostandProduct'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AiOutlineLoading3Quarters } from "react-icons/ai"
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
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return;
  
    // Redirect if the user is not logged in or the email is not one of the allowed admin emails
    if (!session || (session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL && session.user?.email !== process.env.NEXT_PUBLIC_ADMIN1_EMAIL)) {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchPost() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/posts/${params.postId}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Fetched post data:', data)
        setPost(data)
      } catch (err) {
        console.error('Error fetching post:', err)
        setError('Failed to load post. Please try again later.')
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
        const result = await deleteProductFromPost(parseInt(params.postId), productId,true)
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
        console.error('Error removing product:', err)
        setError('Failed to remove product from post. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (error) {
    return (
      <AlertDialog >
        <AlertDialogTitle>Error</AlertDialogTitle>
        <AlertDialogDescription>{error}</AlertDialogDescription>
      </AlertDialog>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage Products for Post</h1>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : !post ? (
        <div className="text-center mt-8">Post not found</div>
      ) : (
        <>
          <h2 className="text-xl mb-4">Celebrity: {post.Celebrity.name}</h2>
          {post.products.length === 0 ? (
            <p>No products found for this post.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {post.products.map((product) => (
                <li key={product.id} className="bg-white p-4 rounded-lg shadow">
                  <div className=" absolute w-48 h-48 mb-4 ">
                    {product.imageUrl ? (
                      <ImageComponent
                        src={product.imageUrl}
                        alt={product.seoname}
                        width={30}
                        height={30}
                        className="rounded-md w-50 h-50 object-contain"
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
                  <h3 className="font-semibold ml-20">{product.brandname}</h3>
                  <p className="text-sm text-gray-500 mb-4 mt-4">{product.seoname}</p>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Removing...' : 'Remove Product'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}