'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { Search, Trash2 } from 'lucide-react'

import { deleteCelebrity } from '@/lib/actions/DeleteCelebrity'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'

interface Celebrity {
  id: number
  name: string
  dp: string
}

export default function DeleteCelebrityPage() {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Celebrity | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchCelebrities() {
      try {
        const response = await fetch('/api/celebrities')
        if (!response.ok) throw new Error('Failed to fetch celebrities')
        setCelebrities(await response.json())
      } catch (err) {
        console.error(err)
        setError('Failed to load celebrities')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCelebrities()
  }, [])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return celebrities
    return celebrities.filter((c) => c.name.toLowerCase().includes(term))
  }, [celebrities, searchTerm])

  const handleDelete = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)
    try {
      const result = await deleteCelebrity(pendingDelete.id)
      if (!result.success) throw new Error(result.message)
      setCelebrities((prev) => prev.filter((c) => c.id !== pendingDelete.id))
      toast.success(result.message || 'Celebrity deleted')
      setPendingDelete(null)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Failed to delete celebrity')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 px-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (error) return <div className="px-4 text-center text-red-500">{error}</div>

  return (
    <div className="px-4 pb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delete Celebrity</h1>
        <p className="text-sm text-gray-500">
          Removing a celebrity cascades to every one of their posts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            All celebrities{' '}
            <span className="text-sm font-normal text-gray-500">({celebrities.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="delete-celebrity-search"
              placeholder="Search celebrity"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">No celebrities found.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {filtered.map((celebrity) => (
                <li
                  key={celebrity.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={celebrity.dp}
                      alt={celebrity.name}
                      className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-100 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{celebrity.name}</p>
                      <p className="text-xs text-gray-400">#{celebrity.id}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPendingDelete(celebrity)}
                    className="flex-shrink-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete {celebrity.name}</span>
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
        title={`Delete ${pendingDelete?.name ?? 'this celebrity'}?`}
        description="Every post belonging to this celebrity will be deleted too. This cannot be undone."
        confirmLabel="Delete celebrity"
        isPending={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
