'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Profession, Gender } from '@prisma/client'

interface Celebrity {
  id: number
  name: string
  profession: Profession | null
  gender: Gender | null
  dp: string
  socialmediaId: string
  country: string | null
}



const COUNTRIES = [
  "United States", "United Kingdom", "India", "Canada", "Australia",
  "France", "Germany", "Italy", "Japan", "South Korea"
] as const

export default function UpdateCelebrityPage() {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([])
  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchCelebrities() {
      try {
        const response = await fetch('/api/celebrities')
        if (!response.ok) throw new Error('Failed to fetch celebrities')
        const data = await response.json()
        setCelebrities(data)
        setIsLoading(false)
      } catch (error) {
        toast.error('Failed to fetch celebrities')
        setIsLoading(false)
      }
    }
    fetchCelebrities()
  }, [])

  const fetchCelebrityDetails = async (id: number) => {
    try {
      const response = await fetch(`/api/celebrities/${id}`)
      if (!response.ok) throw new Error('Failed to fetch celebrity details')
      const data = await response.json()
      setSelectedCelebrity(data)
    } catch (error) {
      toast.error('Failed to fetch celebrity details')
    }
  }

  const handleSelectCelebrity = (celebrity: Celebrity) => {
    fetchCelebrityDetails(celebrity.id)
  }

  const handleUpdateCelebrity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCelebrity) return

    try {
      const response = await fetch(`/api/celebrities/${selectedCelebrity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedCelebrity.name,
          profession: selectedCelebrity.profession,
          gender: selectedCelebrity.gender,
         
          socialmediaId: selectedCelebrity.socialmediaId,
          country: selectedCelebrity.country,
        }),
      })

      if (!response.ok) throw new Error('Failed to update celebrity')
      
      const data = await response.json()
      toast.success(data.message)
      router.push('/admin/dashboard')
    } catch (error) {
      toast.error('Failed to update celebrity')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Update Celebrity</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
           id="search"
            type="text"
            placeholder="Search Celebrity"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          {!selectedCelebrity ? (
            <ul className="space-y-2">
              {celebrities
                .filter(celeb => celeb.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(celebrity => (
                  <li key={celebrity.id}>
                    <Button 
                      variant="ghost"
                      onClick={() => handleSelectCelebrity(celebrity)}
                      className="w-full text-left"
                    >
                      {celebrity.name}
                    </Button>
                  </li>
                ))}
            </ul>
          ) : (
            <form onSubmit={handleUpdateCelebrity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={selectedCelebrity.name}
                  onChange={(e) => setSelectedCelebrity({
                    ...selectedCelebrity,
                    name: e.target.value
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Profession</label>
                <Select
                  value={selectedCelebrity.profession?.toString() || ''}
                  onValueChange={(value) => setSelectedCelebrity({
                    ...selectedCelebrity,
                    profession: value as Profession
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select profession" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Profession).map((prof) => (
                      <SelectItem key={prof} value={prof}>
                        {prof.charAt(0).toUpperCase() + prof.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <Select
                  value={selectedCelebrity.gender?.toString() || ''}
                  onValueChange={(value) => setSelectedCelebrity({
                    ...selectedCelebrity,
                    gender: value as Gender
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Gender).map((gender) => (
                      <SelectItem key={gender} value={gender}>
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>


              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <Select
                  value={selectedCelebrity.country || ''}
                  onValueChange={(value) => setSelectedCelebrity({
                    ...selectedCelebrity,
                    country: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedCelebrity(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Update Celebrity
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 