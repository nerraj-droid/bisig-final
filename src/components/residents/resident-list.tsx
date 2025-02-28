"use client"

import { useState } from "react"
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
    headOfHousehold: boolean
    household: {
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
    const router = useRouter()

    const handleSearch = async (value: string) => {
        try {
            setSearch(value)

            const params = new URLSearchParams()
            if (value) params.set("search", value)

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
            setResidents(initialResidents)
        }
    }

    return (
        <div>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search residents..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
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
                                Head of HH
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
                        {residents.map((resident) => (
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
                                    {resident.headOfHousehold ? "Yes" : "No"}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {resident.household
                                        ? `${resident.household.houseNo} ${resident.household.street}`
                                        : "No Household"
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
} 