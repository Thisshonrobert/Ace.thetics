'use client'

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, X } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import GetRecentCelebrity, { Celebrity } from "@/lib/actions/GetRecent"
import ImageComponent from './ImageComponent'
import { searchCelebrities } from "@/lib/actions/SearchCelebrities"
import { useRouter } from 'next/navigation'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { topCountries } from "../admin/AdminPageClient"
import { Profession } from "../admin/AdminPageClient"

type CelebrityWithDP = Celebrity & { dp?: string }

export default function Component() {
    const router = useRouter()
    const [recentCelebrities, setRecentCelebrities] = useState<CelebrityWithDP[]>([])
    const [searchResults, setSearchResults] = useState<CelebrityWithDP[]>([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearchQuery] = useDebounce(searchQuery, 300)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [selectedCountry, setSelectedCountry] = useState<string>('')
    const [selectedProfession, setSelectedProfession] = useState<string>('')

    useEffect(() => {
        const fetchCelebrities = async () => {
            try {
                const celebrities = await GetRecentCelebrity()
                setRecentCelebrities(celebrities)
            } catch (error) {
                console.error("Failed to fetch recent celebrities:", error)
                setError("Failed to fetch recent celebrities. Please try again later.")
            }
        }

        fetchCelebrities()
    }, [])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                !(event.target as Element)?.closest('[role="menu"]') &&
                !(event.target as Element)?.closest('[role="menuitem"]') &&
                !(event.target as Element)?.closest('[data-state="open"]')
            ) {
                setIsDropdownOpen(false)
                setIsMobileSearchOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const toggleMobileSearch = () => {
        setIsMobileSearchOpen((prev) => !prev)
    }

    const closeMobileSearch = () => {
        setIsMobileSearchOpen(false)
    }

    const handleSearch = useCallback(async (query: string) => {
        try {
            const results = await searchCelebrities(query, selectedCountry, selectedProfession)
            setSearchResults(results.map(celebrity => ({
                ...celebrity,
                image: celebrity.dp
            })))
        } catch (error) {
            console.error("Failed to search celebrities:", error)
            setError("Failed to search celebrities. Please try again later.")
        }
    }, [selectedCountry, selectedProfession])

    useEffect(() => {
        handleSearch(debouncedSearchQuery)
    }, [debouncedSearchQuery, handleSearch, selectedCountry, selectedProfession])

    const renderCelebrityList = (celebrities: CelebrityWithDP[]) => (
        <div  className="grid grid-cols-2 gap-4">
            {celebrities.map((celebrity) => (
                <div 
                    key={celebrity.id} 
                    className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                        router.push(`/celebrity/${encodeURIComponent(celebrity.name)}`)
                        setIsDropdownOpen(false)
                        setIsMobileSearchOpen(false)
                    }}
                >
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-2">
                        <ImageComponent
                            src={celebrity.image || celebrity.dp || ''}
                            alt={celebrity.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                            transformation={[{
                                width: "160",
                                height: "160",
                                quality: "80",
                                crop: "thumb",
                                focus: "face"
                            }]}
                            lqip={{ active: true, quality: 20 }}
                            loading="lazy"
                        />
                    </div>
                    <p className="text-sm font-medium font-poppins text-gray-800 text-center">
                        {celebrity.name}
                    </p>
                </div>
            ))}
        </div>
    )

    const FilterSection = () => (
        <div className="flex gap-2 mb-4">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="text-sm">
                        {selectedCountry || 'Country'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuRadioGroup 
                        value={selectedCountry} 
                        onValueChange={(value) => {
                            setSelectedCountry(value)
                            // Ensure the main dropdown stays open
                            setIsDropdownOpen(true)
                            setIsMobileSearchOpen(true)
                        }}
                    >
                        <DropdownMenuRadioItem value="">All Countries</DropdownMenuRadioItem>
                        {topCountries.map((country: string) => (
                            <DropdownMenuRadioItem key={country} value={country}>
                                {country}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="text-sm">
                        {selectedProfession || 'Profession'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuRadioGroup 
                        value={selectedProfession} 
                        onValueChange={(value) => {
                            setSelectedProfession(value)
                            // Ensure the main dropdown stays open
                            setIsDropdownOpen(true)
                            setIsMobileSearchOpen(true)
                        }}
                    >
                        <DropdownMenuRadioItem value="">All Professions</DropdownMenuRadioItem>
                        {Object.values(Profession).map((prof) => (
                            <DropdownMenuRadioItem key={prof} value={prof}>
                                {prof.charAt(0).toUpperCase() + prof.slice(1)}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )

    return (
        <div className="w-full max-w-2xl mx-auto relative">
            <div className="relative hidden md:block">
                <input
                    ref={inputRef}
                    id='search-results1'
                    type="text"
                    placeholder="Search celebrity"
                    className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-full focus:outline-none focus:border-purple-500"
                    onClick={() => setIsDropdownOpen(true)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            <div className="md:hidden flex justify-end ml-1">
                <button onClick={toggleMobileSearch} className="p-2">
                    <Search className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            <div
                className={`fixed inset-y-0 right-0 w-full bg-white z-50 transform transition-transform duration-300 ease-in-out ${
                    isMobileSearchOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Search Celebrities...
                        </h2>
                        <button onClick={closeMobileSearch} className="text-gray-500 hover:text-gray-700">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <input
                        id='search-results'
                        ref={inputRef}
                        type="text"
                        placeholder="Search celebrity"
                        className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-full focus:outline-none focus:border-purple-500 mb-4"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoComplete="off"
                    />
                    <FilterSection />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {searchQuery ? 'Search Results' : 'Recent Celebrities'}
                    </h3>
                    {error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        renderCelebrityList(searchQuery ? searchResults : recentCelebrities)
                    )}
                </div>
            </div>

            <div
                ref={dropdownRef}
                className={`absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-500 ease-in-out ${
                    isDropdownOpen && !isMobileSearchOpen
                        ? "max-h-[600px] opacity-100"
                        : "max-h-0 opacity-0"
                }`}
            >
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {searchQuery ? 'Search Results' : 'Recent Celebrities'}
                        </h2>
                        <button
                            onClick={() => setIsDropdownOpen(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <FilterSection />
                    {error ? (
                        <p className="text-red-500">{error}</p>
                    ) : (
                        renderCelebrityList(searchQuery ? searchResults : recentCelebrities)
                    )}
                </div>
            </div>
        </div>
    )
}