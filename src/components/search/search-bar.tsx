"use client"

import { useState } from "react"
import { Search } from "lucide-react"

interface SearchBarProps {
    onSearch: (query: string) => void
    placeholder?: string
}

export function SearchBar({ onSearch, placeholder = "Search..." }: SearchBarProps) {
    const [query, setQuery] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch(query)
    }

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-lg">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </form>
    )
} 