"use client"

import { useState } from "react"
import { useMap } from "./map-context"

interface SearchResult {
    id: string
    place_name: string
    center: [number, number]
}

export function SearchBox() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const { map } = useMap()

    const handleSearch = async (value: string) => {
        setQuery(value)
        if (!value) {
            setResults([])
            return
        }

        setLoading(true)
        try {
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    value
                )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&country=ph&types=address,place`
            )
            const data = await res.json()
            setResults(data.features.map((f: any) => ({
                id: f.id,
                place_name: f.place_name,
                center: f.center,
            })))
        } catch (error) {
            console.error("Search error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (result: SearchResult) => {
        if (map) {
            map.flyTo({
                center: result.center,
                zoom: 16,
            })
        }
        setQuery(result.place_name)
        setResults([])
    }

    return (
        <div className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for a location..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
            />
            {loading && (
                <div className="absolute right-3 top-2.5">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                </div>
            )}
            {results.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg">
                    {results.map((result) => (
                        <li
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                        >
                            {result.place_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
} 