'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Loader2, Search, SlidersHorizontal, X } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { useRouter } from 'next/navigation'

import GetRecentCelebrity from "@/lib/actions/GetRecent"
import { searchCelebrities, type CelebritySearchResult } from "@/lib/actions/SearchCelebrities"
import ImageComponent from './ImageComponent'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { COUNTRIES, PROFESSIONS, titleCase } from "@/constants/taxonomy"

/**
 * Declared at module scope, not inside the parent's body. A component defined
 * during render gets a brand-new type on every keystroke, so React unmounts and
 * remounts it — which threw away the Radix dropdown's open state. That is what
 * the old `setIsDropdownOpen(true)` calls inside `onValueChange` were papering
 * over.
 */
function FilterSection({
    selectedCountry,
    selectedProfession,
    onCountryChange,
    onProfessionChange,
    onClear,
}: {
    selectedCountry: string
    selectedProfession: string
    onCountryChange: (value: string) => void
    onProfessionChange: (value: string) => void
    onClear: () => void
}) {
    const hasFilters = Boolean(selectedCountry || selectedProfession)

    return (
        <div className="mb-2 flex flex-shrink-0 flex-wrap items-center gap-2 px-1 pb-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn("text-xs", selectedCountry && "border-purple-400 text-purple-700")}
                    >
                        {selectedCountry || 'Country'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-64 overflow-y-auto">
                    <DropdownMenuRadioGroup value={selectedCountry} onValueChange={onCountryChange}>
                        <DropdownMenuRadioItem value="">All countries</DropdownMenuRadioItem>
                        {COUNTRIES.map((country) => (
                            <DropdownMenuRadioItem key={country} value={country}>
                                {country}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn("text-xs", selectedProfession && "border-purple-400 text-purple-700")}
                    >
                        {selectedProfession ? titleCase(selectedProfession) : 'Profession'}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={selectedProfession} onValueChange={onProfessionChange}>
                        <DropdownMenuRadioItem value="">All professions</DropdownMenuRadioItem>
                        {PROFESSIONS.map((prof) => (
                            <DropdownMenuRadioItem key={prof} value={prof}>
                                {titleCase(prof)}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onClear}
                    className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-800"
                >
                    Clear
                </button>
            )}
        </div>
    )
}

function CelebrityList({
    celebrities,
    isLoading,
    error,
    hasFilters,
    onSelect,
}: {
    celebrities: CelebritySearchResult[]
    isLoading: boolean
    error: string | null
    hasFilters: boolean
    onSelect: (name: string) => void
}) {
    if (error) {
        return <p className="py-8 text-center text-sm text-red-500">{error}</p>
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching…
            </div>
        )
    }

    if (celebrities.length === 0) {
        return (
            <div className="py-10 text-center">
                <p className="text-sm font-medium text-gray-700">No celebrities found</p>
                <p className="mt-1 text-xs text-gray-500">
                    {hasFilters
                        ? 'Try clearing the filters or searching a different name.'
                        : 'Try a different spelling.'}
                </p>
            </div>
        )
    }

    // A vertical list, not a grid. A grid inside a ~300px dropdown has to guess
    // how many columns fit, and the `sm:grid-cols-4` breakpoint keys off the
    // viewport rather than the panel — so on desktop four 80px avatars were
    // being packed into a 280px panel, overlapping the names and forcing a
    // horizontal scrollbar. Rows give each name the full panel width.
    return (
        <ul>
            {celebrities.map((celebrity) => (
                <li key={celebrity.id}>
                    <button
                        type="button"
                        onClick={() => onSelect(celebrity.name)}
                        className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                    >
                        <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-transparent transition-all group-hover:ring-purple-300">
                            <ImageComponent
                                src={celebrity.dp}
                                alt={celebrity.name}
                                width={44}
                                height={44}
                                className="h-full w-full object-cover"
                                transformation={[{
                                    width: "88",
                                    height: "88",
                                    quality: "80",
                                    crop: "thumb",
                                    focus: "face"
                                }]}
                                lqip={{ active: true, quality: 20 }}
                                loading="lazy"
                            />
                        </div>
                        <span className="min-w-0 flex-1 truncate font-poppins text-sm font-medium text-gray-800 group-hover:text-purple-700">
                            {celebrity.name}
                        </span>
                    </button>
                </li>
            ))}
        </ul>
    )
}

export default function CelebritySearch() {
    const router = useRouter()

    const [recentCelebrities, setRecentCelebrities] = useState<CelebritySearchResult[]>([])
    const [searchResults, setSearchResults] = useState<CelebritySearchResult[]>([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearchQuery] = useDebounce(searchQuery, 300)
    const [selectedCountry, setSelectedCountry] = useState('')
    const [selectedProfession, setSelectedProfession] = useState('')

    // One ref per input. Previously a single `inputRef` was attached to both the
    // desktop and the mobile field; React kept only the last mount, so the
    // click-outside handler treated mousedowns on the desktop input as
    // "outside" and slammed the dropdown shut mid-interaction.
    const desktopInputRef = useRef<HTMLInputElement>(null)
    const mobileInputRef = useRef<HTMLInputElement>(null)
    const desktopPanelRef = useRef<HTMLDivElement>(null)

    const hasFilters = Boolean(selectedCountry || selectedProfession)
    const isSearchMode = searchQuery.trim().length > 0 || hasFilters

    useEffect(() => {
        GetRecentCelebrity()
            .then((celebrities) =>
                setRecentCelebrities(
                    celebrities.map((c) => ({ id: c.id, name: c.name, dp: c.image }))
                )
            )
            .catch((err) => {
                console.error("Failed to fetch recent celebrities:", err)
                setError("Couldn't load celebrities. Please try again later.")
            })
    }, [])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Element | null
            const insideDesktop =
                desktopPanelRef.current?.contains(target as Node) ||
                desktopInputRef.current?.contains(target as Node)
            // Radix renders dropdown menus in a portal outside this subtree, so
            // they have to be excluded explicitly or picking a filter closes the
            // panel it belongs to.
            const insideMenu = target?.closest('[data-radix-popper-content-wrapper]')

            if (!insideDesktop && !insideMenu) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Escape closes whichever surface is open.
    useEffect(() => {
        function handleKey(event: KeyboardEvent) {
            if (event.key !== 'Escape') return
            setIsDropdownOpen(false)
            setIsMobileSearchOpen(false)
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [])

    // Lock body scroll while the full-screen mobile panel is up.
    useEffect(() => {
        if (!isMobileSearchOpen) return
        const previous = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        mobileInputRef.current?.focus()
        return () => {
            document.body.style.overflow = previous
        }
    }, [isMobileSearchOpen])

    const runSearch = useCallback(async (query: string, country: string, profession: string) => {
        if (!query.trim() && !country && !profession) {
            setSearchResults([])
            setIsSearching(false)
            return
        }
        setIsSearching(true)
        try {
            setSearchResults(await searchCelebrities(query, country, profession))
            setError(null)
        } catch (err) {
            console.error("Failed to search celebrities:", err)
            setError("Search failed. Please try again.")
        } finally {
            setIsSearching(false)
        }
    }, [])

    useEffect(() => {
        runSearch(debouncedSearchQuery, selectedCountry, selectedProfession)
    }, [debouncedSearchQuery, selectedCountry, selectedProfession, runSearch])

    // True while the user has typed but the debounce/request hasn't settled, so
    // the panel can show a spinner instead of stale results.
    const isStale = searchQuery !== debouncedSearchQuery

    const visibleCelebrities = useMemo(
        () => (isSearchMode ? searchResults : recentCelebrities),
        [isSearchMode, searchResults, recentCelebrities]
    )

    const closeAll = () => {
        setIsDropdownOpen(false)
        setIsMobileSearchOpen(false)
    }

    const clearFilters = () => {
        setSelectedCountry('')
        setSelectedProfession('')
    }

    const goToCelebrity = (name: string) => {
        router.push(`/celebrity/${encodeURIComponent(name)}`)
        closeAll()
    }

    const filters = (
        <FilterSection
            selectedCountry={selectedCountry}
            selectedProfession={selectedProfession}
            onCountryChange={setSelectedCountry}
            onProfessionChange={setSelectedProfession}
            onClear={clearFilters}
        />
    )

    const results = (
        <CelebrityList
            celebrities={visibleCelebrities}
            isLoading={isSearching || isStale}
            error={error}
            hasFilters={hasFilters}
            onSelect={goToCelebrity}
        />
    )

    // Shrinkable rather than a fixed `md:w-80 lg:w-96`. The navbar centres its
    // title on a symmetric grid, so this column has to be able to give up
    // width as the viewport narrows — a fixed width would force the grid wider
    // than the screen and shove the title off-centre.
    return (
        <div className="relative w-auto min-w-0 md:w-full md:max-w-sm lg:max-w-md">
            {/* Desktop field */}
            <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    ref={desktopInputRef}
                    id="celebrity-search-desktop"
                    type="search"
                    placeholder="Search celebrity"
                    className="w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-9 text-sm text-gray-700 transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    onFocus={() => setIsDropdownOpen(true)}
                    onClick={() => setIsDropdownOpen(true)}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setIsDropdownOpen(true)
                    }}
                    autoComplete="off"
                />
                {searchQuery && (
                    <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => {
                            setSearchQuery('')
                            desktopInputRef.current?.focus()
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Mobile trigger */}
            <div className="flex justify-end md:hidden">
                <button
                    type="button"
                    onClick={() => setIsMobileSearchOpen(true)}
                    aria-label="Search celebrities"
                    className="grid h-10 w-10 place-items-center rounded-full transition-colors active:bg-gray-100"
                >
                    <Search className="h-5 w-5 text-gray-600" />
                </button>
            </div>

            {/* Mobile full-screen panel */}
            <div
                className={cn(
                    "fixed inset-0 z-50 bg-white transition-transform duration-300 ease-in-out md:hidden",
                    isMobileSearchOpen
                        ? "translate-x-0"
                        : "pointer-events-none invisible translate-x-full"
                )}
                aria-hidden={!isMobileSearchOpen}
            >
                <div className="flex h-full flex-col p-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Search celebrities</h2>
                        <button
                            type="button"
                            onClick={() => setIsMobileSearchOpen(false)}
                            aria-label="Close search"
                            className="grid h-9 w-9 place-items-center rounded-full text-gray-500 active:bg-gray-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="relative mb-4">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            ref={mobileInputRef}
                            id="celebrity-search-mobile"
                            type="search"
                            placeholder="Search celebrity"
                            className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoComplete="off"
                        />
                    </div>

                    {filters}
                    <h3 className="mb-3 text-sm font-semibold text-gray-800">
                        {isSearchMode ? 'Results' : 'Recent celebrities'}
                    </h3>
                    <div className="flex-1 overflow-y-auto pb-6">
                        {results}
                    </div>
                </div>
            </div>

            {/* Desktop dropdown.
                Rendered only while open rather than kept mounted and collapsed
                with `max-h-0`. The height-based reveal meant the panel's real
                height depended on an arbitrary-value utility resolving
                correctly, and any miss left a 2px sliver with the content
                clipped. Mounting on demand is simpler and can't half-open.
                Width is its own rather than inherited from the input, which was
                too narrow for the results. */}
            {isDropdownOpen && (
            <div
                ref={desktopPanelRef}
                className="absolute right-0 z-50 mt-2 hidden w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl md:block"
            >
                <div className="p-3">
                    <div className="mb-2 flex items-center justify-between px-1">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {isSearchMode ? 'Results' : 'Recent celebrities'}
                        </h2>
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(false)}
                            aria-label="Close search results"
                            className="text-gray-400 hover:text-gray-700"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    {filters}
                    {/* `overflow-x-hidden` as well as `-y-auto`: a stray
                        horizontal scrollbar was appearing under the results. */}
                    <div className="max-h-80 overflow-y-auto overflow-x-hidden">
                        {results}
                    </div>
                </div>
            </div>
            )}
        </div>
    )
}
