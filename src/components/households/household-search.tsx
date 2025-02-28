"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function HouseholdSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        barangay: searchParams.get('barangay') || '',
        hasMinors: searchParams.get('hasMinors') || '',
        hasSeniors: searchParams.get('hasSeniors') || '',
        minResidents: searchParams.get('minResidents') || '',
        maxResidents: searchParams.get('maxResidents') || '',
    })

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value)
        })
        router.push(`/dashboard/households?${params.toString()}`)
    }

    return (
        <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    type="text"
                    placeholder="Search households..."
                    value={filters.search}
                    onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                    className="rounded-md border p-2"
                />
                <select
                    value={filters.barangay}
                    onChange={e => setFilters(f => ({ ...f, barangay: e.target.value }))}
                    className="rounded-md border p-2"
                >
                    <option value="">All Barangays</option>
                    {/* Add your barangay options here */}
                </select>
                <select
                    value={filters.hasMinors}
                    onChange={e => setFilters(f => ({ ...f, hasMinors: e.target.value }))}
                    className="rounded-md border p-2"
                >
                    <option value="">Has Minors</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
                {/* Add more filter inputs as needed */}
            </div>
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
                Apply Filters
            </button>
        </form>
    )
} 