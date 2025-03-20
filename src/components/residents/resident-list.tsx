"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Resident {
    id: string
    firstName: string
    middleName: string | null
    lastName: string
    extensionName: string | null
    birthDate: string
    gender: string
    civilStatus: string
    contactNo: string | null
    email: string | null
    occupation: string | null
    voterInBarangay: boolean
    fatherName: string | null
    fatherMiddleName: string | null
    fatherLastName: string | null
    motherFirstName: string | null
    motherMiddleName: string | null
    motherMaidenName: string | null
    Household: {
        houseNo: string
        street: string
    } | null
}

interface ResidentListProps {
    initialResidents: Resident[]
}

export function ResidentList({ initialResidents }: ResidentListProps) {
    const [residents, setResidents] = useState(initialResidents)
    const [search, setSearch] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
    const router = useRouter()

    const fetchResidents = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setResidents(initialResidents)
            return
        }

        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            params.set("search", searchTerm)

            const res = await fetch(`/api/residents?${params.toString()}`)
            if (!res.ok) {
                throw new Error('Failed to fetch residents')
            }

            const data = await res.json()
            if (Array.isArray(data)) {
                setResidents(data)
            } else {
                console.error('Invalid response format:', data)
            }
        } catch (error) {
            console.error('Error searching residents:', error)
            // Keep the current residents list on error
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = (value: string) => {
        setSearch(value)

        // Clear any existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        // Set a new timeout
        const timeout = setTimeout(() => {
            fetchResidents(value)
        }, 300)

        setSearchTimeout(timeout)
    }

    // Clean up the timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout)
            }
        }
    }, [searchTimeout])

    return (
        <div>
            <div className="mb-4 relative">
                <input
                    type="text"
                    placeholder="Search residents by name or address..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#006B5E] focus:ring-1 focus:ring-[#006B5E] focus:outline-none"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#006B5E]"></div>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                Name
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                Gender
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                Civil Status
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                Contact
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                Voter
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                Address
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {residents.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                    {search.trim() ? 'No residents found matching your search.' : 'No residents found.'}
                                </td>
                            </tr>
                        ) : (
                            residents.map((resident) => (
                                <tr
                                    key={resident.id}
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => router.push(`/dashboard/residents/${resident.id}`)}
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {resident.lastName}, {resident.firstName} {resident.middleName}
                                        {resident.extensionName && ` ${resident.extensionName}`}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {resident.gender}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {resident.civilStatus}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {resident.contactNo || "N/A"}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {resident.voterInBarangay ? "Yes" : "No"}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        {resident.Household
                                            ? `${resident.Household.houseNo} ${resident.Household.street}`
                                            : "No Household"
                                        }
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
} 