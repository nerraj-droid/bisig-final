"use client"

import { useState } from "react"
import { Filter } from "lucide-react"
import { SearchBar } from "./search-bar"

export interface FilterOptions {
    barangay?: string
    gender?: string
    civilStatus?: string
    ageRange?: string
    householdSize?: string
}

interface AdvancedSearchProps {
    onSearch: (query: string, filters: FilterOptions) => void
    barangays: string[]
    initialQuery?: string
    initialFilters?: FilterOptions
}

export function AdvancedSearch({
    onSearch,
    barangays,
    initialQuery = "",
    initialFilters = {}
}: AdvancedSearchProps) {
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<FilterOptions>(initialFilters)
    const [query, setQuery] = useState(initialQuery)

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery)
        onSearch(searchQuery, filters)
    }

    const handleFilterChange = (key: keyof FilterOptions, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value === "all" ? undefined : value
        }))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <SearchBar onSearch={handleSearch} placeholder="Search residents or households..." />
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                    <Filter className="h-4 w-4" />
                    Filters
                </button>
            </div>

            {showFilters && (
                <div className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Barangay</label>
                        <select
                            value={filters.barangay || "all"}
                            onChange={(e) => handleFilterChange("barangay", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="all">All Barangays</option>
                            {barangays.map((barangay) => (
                                <option key={barangay} value={barangay}>
                                    {barangay}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Gender</label>
                        <select
                            value={filters.gender || "all"}
                            onChange={(e) => handleFilterChange("gender", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="all">All</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Civil Status</label>
                        <select
                            value={filters.civilStatus || "all"}
                            onChange={(e) => handleFilterChange("civilStatus", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="all">All</option>
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                            <option value="widowed">Widowed</option>
                            <option value="divorced">Divorced</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Age Range</label>
                        <select
                            value={filters.ageRange || "all"}
                            onChange={(e) => handleFilterChange("ageRange", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="all">All Ages</option>
                            <option value="0-17">0-17</option>
                            <option value="18-24">18-24</option>
                            <option value="25-34">25-34</option>
                            <option value="35-44">35-44</option>
                            <option value="45-54">45-54</option>
                            <option value="55-64">55-64</option>
                            <option value="65+">65+</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Household Size</label>
                        <select
                            value={filters.householdSize || "all"}
                            onChange={(e) => handleFilterChange("householdSize", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="all">Any Size</option>
                            <option value="1-2">1-2 members</option>
                            <option value="3-4">3-4 members</option>
                            <option value="5-6">5-6 members</option>
                            <option value="7+">7+ members</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    )
} 