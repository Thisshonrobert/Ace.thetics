'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { ArrowLeft, Loader2, Save, Search } from 'lucide-react'
import { Gender, Profession } from '@prisma/client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ImageField } from '@/components/admin/ImageField'
import { COUNTRIES, IMAGE_FOLDERS, sanitizeUrl, titleCase } from '@/constants/taxonomy'

interface Celebrity {
  id: number
  name: string
  profession: Profession | null
  gender: Gender | null
  dp: string
  socialmediaId: string
  country: string | null
}

type CelebrityListItem = Pick<Celebrity, 'id' | 'name' | 'dp'>

export default function UpdateCelebrityPage() {
  const router = useRouter()
  const [celebrities, setCelebrities] = useState<CelebrityListItem[]>([])
  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchCelebrities() {
      try {
        const response = await fetch('/api/celebrities')
        if (!response.ok) throw new Error('Failed to fetch celebrities')
        setCelebrities(await response.json())
      } catch (error) {
        console.error(error)
        toast.error('Failed to fetch celebrities')
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

  const handleSelect = async (id: number) => {
    setIsLoadingDetail(true)
    try {
      const response = await fetch(`/api/celebrities/${id}`)
      if (!response.ok) throw new Error('Failed to fetch celebrity details')
      setSelectedCelebrity(await response.json())
    } catch (error) {
      console.error(error)
      toast.error('Failed to fetch celebrity details')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const patch = (changes: Partial<Celebrity>) =>
    setSelectedCelebrity((prev) => (prev ? { ...prev, ...changes } : prev))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCelebrity) return

    if (!selectedCelebrity.name.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/celebrities/${selectedCelebrity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedCelebrity.name.trim(),
          profession: selectedCelebrity.profession,
          gender: selectedCelebrity.gender,
          dp: selectedCelebrity.dp,
          socialmediaId: selectedCelebrity.socialmediaId,
          country: selectedCelebrity.country,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update celebrity')

      toast.success(data.message)
      // Reflect the change in the picker without a full refetch.
      setCelebrities((prev) =>
        prev.map((c) =>
          c.id === selectedCelebrity.id
            ? { ...c, name: selectedCelebrity.name.trim(), dp: selectedCelebrity.dp }
            : c
        )
      )
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to update celebrity')
    } finally {
      setIsSaving(false)
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

  return (
    <div className="px-4 pb-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Update Celebrity</h1>
          <p className="text-sm text-gray-500">
            Edit the profile picture, social handle and classification.
          </p>
        </div>
        {selectedCelebrity && (
          <Button variant="outline" onClick={() => setSelectedCelebrity(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to all celebrities
          </Button>
        )}
      </div>

      {!selectedCelebrity ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choose a celebrity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="celebrity-search"
                placeholder="Search celebrity"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-500">
                No celebrity matches “{searchTerm}”.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((celebrity) => (
                  <button
                    key={celebrity.id}
                    type="button"
                    onClick={() => handleSelect(celebrity.id)}
                    className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-indigo-400 hover:shadow-md"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={celebrity.dp}
                      alt={celebrity.name}
                      className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-100 object-cover"
                    />
                    <span className="truncate font-medium text-gray-900 group-hover:text-indigo-600">
                      {celebrity.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : isLoadingDetail ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Editing {selectedCelebrity.name}
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">
                #{selectedCelebrity.id}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-[200px_1fr]">
              <ImageField
                label="Profile picture"
                value={selectedCelebrity.dp}
                folder={IMAGE_FOLDERS.dp}
                onChange={(url) => patch({ dp: url })}
              />

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="celeb-name">Name</Label>
                  <Input
                    id="celeb-name"
                    value={selectedCelebrity.name}
                    onChange={(e) => patch({ name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="celeb-social">Social media handle / URL</Label>
                  <Input
                    id="celeb-social"
                    value={selectedCelebrity.socialmediaId ?? ''}
                    onChange={(e) => patch({ socialmediaId: e.target.value })}
                    placeholder="instagram.com/username"
                  />
                  {selectedCelebrity.socialmediaId && (
                    <p className="truncate text-xs text-gray-400">
                      Saved as: {sanitizeUrl(selectedCelebrity.socialmediaId)}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="celeb-profession">Profession</Label>
                    <Select
                      value={selectedCelebrity.profession ?? ''}
                      onValueChange={(value) => patch({ profession: value as Profession })}
                    >
                      <SelectTrigger id="celeb-profession">
                        <SelectValue placeholder="Select profession" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Profession).map((prof) => (
                          <SelectItem key={prof} value={prof}>
                            {titleCase(prof)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="celeb-gender">Gender</Label>
                    <Select
                      value={selectedCelebrity.gender ?? ''}
                      onValueChange={(value) => patch({ gender: value as Gender })}
                    >
                      <SelectTrigger id="celeb-gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Gender).map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {titleCase(gender)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="celeb-country">Country</Label>
                  {/* Datalist rather than a select: the previous 10-country
                      select could not represent celebrities already stored with
                      any of the other 15 countries the create form offers. */}
                  <Input
                    id="celeb-country"
                    value={selectedCelebrity.country ?? ''}
                    onChange={(e) => patch({ country: e.target.value })}
                    list="admin-countries"
                    placeholder="Search country"
                  />
                  <datalist id="admin-countries">
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country} />
                    ))}
                  </datalist>
                </div>

                <div className="flex justify-end gap-2 pt-2">
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
