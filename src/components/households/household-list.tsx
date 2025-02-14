"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Household {
    id: string
    houseNo: string
    street: string
    barangay: string
    city: string
    province: string
    zipCode: string
    latitude: number | null
    longitude: number | null
    residents: {
        id: string
        firstName: string
        lastName: string
    }[]
}

interface HouseholdListProps {
    initialHouseholds: Household[]
}

export function HouseholdList({ initialHouseholds }: HouseholdListProps) {
    const [households, setHouseholds] = useState(initialHouseholds)
    const [search, setSearch] = useState("")
    const router = useRouter()

    const handleSearch = async (value: string) => {
        setSearch(value)

        const params = new URLSearchParams()
        if (value) params.set("search", value)

        const res = await fetch(`/api/households?${params.toString()}`)
        const data = await res.json()

        setHouseholds(data)
    }

    return (
        <div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search households..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Location
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Residents
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {households.map((household) => (
                            <tr
                                key={household.id}
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => router.push(`/dashboard/households/${household.id}`)}
                            >
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="font-medium text-gray-900">
                                        {household.houseNo} {household.street}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {household.barangay}, {household.city}, {household.province} {household.zipCode}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {household.latitude && household.longitude ? (
                                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                            Mapped
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                                            Not Mapped
                                        </span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {household.residents.length} residents
                                    </div>
                                    {household.residents.length > 0 && (
                                        <div className="text-sm text-gray-500">
                                            {household.residents.map(r => `${r.firstName} ${r.lastName}`).join(", ")}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
} 