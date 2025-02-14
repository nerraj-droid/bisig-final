"use client"

import { useEffect, useRef } from "react"
import { AdvancedSearch, FilterOptions } from "./advanced-search"
import { SearchResults } from "./search-results"
import { SearchHistory } from "./search-history"
import { useSearch } from "@/hooks/use-search"

interface SearchSectionProps {
    barangays: string[]
}

export function SearchSection({ barangays }: SearchSectionProps) {
    const { search, currentSearch } = useSearch()
    const initialSearchDone = useRef(false)

    // Perform initial search only once when component mounts
    useEffect(() => {
        if (!initialSearchDone.current) {
            search("", {})
            initialSearchDone.current = true
        }
    }, [search])

    const handleSearch = (query: string, filters: FilterOptions) => {
        search(query, filters)

        // Save to search history
        const historyItem = {
            id: Date.now().toString(),
            query,
            filters,
            timestamp: Date.now(),
        }

        const savedHistory = localStorage.getItem('searchHistory')
        const history = savedHistory ? JSON.parse(savedHistory) : []
        const newHistory = [historyItem, ...history].slice(0, 5)
        localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    }

    const handleHistorySelect = (query: string, filters: FilterOptions) => {
        search(query, filters)
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <AdvancedSearch
                    onSearch={handleSearch}
                    barangays={barangays}
                    initialQuery={currentSearch.query}
                    initialFilters={currentSearch.filters}
                />
                <SearchHistory onSelect={handleHistorySelect} />
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <SearchResults />
            </div>
        </div>
    )
}