"use client"

import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { FilterOptions } from "./advanced-search"

interface SearchHistoryItem {
    id: string
    query: string
    filters: FilterOptions
    timestamp: number
}

interface SearchHistoryProps {
    onSelect: (query: string, filters: FilterOptions) => void
}

export function SearchHistory({ onSelect }: SearchHistoryProps) {
    const [history, setHistory] = useState<SearchHistoryItem[]>([])

    useEffect(() => {
        const savedHistory = localStorage.getItem('searchHistory')
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory))
        }
    }, [])

    const removeFromHistory = (id: string) => {
        const newHistory = history.filter(item => item.id !== id)
        setHistory(newHistory)
        localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    }

    const clearHistory = () => {
        setHistory([])
        localStorage.removeItem('searchHistory')
    }

    if (history.length === 0) return null

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">Recent Searches</h3>
                <button
                    onClick={clearHistory}
                    className="text-sm text-red-600 hover:text-red-500"
                >
                    Clear All
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {history.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm"
                    >
                        <button
                            onClick={() => onSelect(item.query, item.filters)}
                            className="hover:text-blue-600"
                        >
                            {item.query || "Advanced Search"}
                        </button>
                        <button
                            onClick={() => removeFromHistory(item.id)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
} 