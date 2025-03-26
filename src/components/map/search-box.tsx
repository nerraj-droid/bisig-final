"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface SearchBoxProps {
    onSelectLocation: (coordinates: [number, number], address: string) => void
}

export function SearchBox({ onSelectLocation }: SearchBoxProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSearch = async () => {
        if (!query.trim()) return

        setIsLoading(true)
        setError(null)

        try {
            // Use Nominatim (OpenStreetMap) API for geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=ph&limit=5`,
                {
                    headers: {
                        "User-Agent": "BarangayManagementSystem/1.0"
                    }
                }
            )

            if (!response.ok) throw new Error("Failed to search location")

            const data = await response.json()
            setResults(data || [])
        } catch (err) {
            console.error("Search error:", err)
            setError("Failed to search location. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSearch()
        }
    }

    const handleSelectLocation = (result: any) => {
        const longitude = parseFloat(result.lon)
        const latitude = parseFloat(result.lat)

        onSelectLocation([longitude, latitude], result.display_name)
        setResults([])
        setQuery("")
    }

    return (
        <div className="w-full space-y-2">
            <div className="flex w-full space-x-2">
                <Input
                    type="text"
                    placeholder="Search address..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                />
                <Button
                    type="button"
                    variant="default"
                    size="icon"
                    disabled={isLoading}
                    onClick={handleSearch}
                >
                    <Search className="h-4 w-4" />
                </Button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {results.length > 0 && (
                <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-border bg-background shadow-md">
                    {results.map((result, index) => (
                        <div
                            key={index}
                            className="cursor-pointer px-3 py-2 hover:bg-accent text-sm"
                            onClick={() => handleSelectLocation(result)}
                        >
                            {result.display_name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
} 