'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCelebrity } from '@/lib/actions/DeleteCelebrity'
import { useSession } from 'next-auth/react'

interface Celebrity {
  id: number
  name: string
  dp: string
}

export default function DeleteCelebrityPage() {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession();


  useEffect(() => {
    if (status === "loading") return;
  
    // Redirect if the user is not logged in or the email is not one of the allowed admin emails
    if (!session || (session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL && session.user?.email !== process.env.NEXT_PUBLIC_ADMIN1_EMAIL)) {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    async function fetchCelebrities() {
      try {
        const response = await fetch('/api/celebrities')
        if (!response.ok) {
          throw new Error('Failed to fetch celebrities')
        }
        const data = await response.json()
        setCelebrities(data)
      } catch (err) {
        setError('Failed to load celebrities')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCelebrities()
  }, [])

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this celebrity? This action cannot be undone.')) {
      setIsLoading(true)
      try {
        const result = await deleteCelebrity(id)
        if (result.success) {
          setCelebrities(celebrities.filter(celeb => celeb.id !== id))
          alert(result.message)
        } else {
          throw new Error(result.message)
        }
      } catch (err) {
        setError('Failed to delete celebrity')
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
      <h1 className="text-2xl font-bold mb-6">Delete Celebrity</h1>
      {celebrities.length === 0 ? (
        <p>No celebrities found.</p>
      ) : (
        <ul className="space-y-4">
          {celebrities.map((celebrity) => (
            <li key={celebrity.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <img src={celebrity.dp} alt={celebrity.name} className="w-12 h-12 rounded-full mr-4" />
                <span className="font-semibold">{celebrity.name}</span>
              </div>
              <button
                onClick={() => handleDelete(celebrity.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}