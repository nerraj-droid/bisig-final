"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Prisma } from "@prisma/client"

type HouseholdType = "SINGLE_FAMILY" | "MULTI_FAMILY" | "EXTENDED_FAMILY" | "SINGLE_PERSON" | "NON_FAMILY" | "OTHER"
type HouseholdStatus = "ACTIVE" | "INACTIVE" | "RELOCATED" | "MERGED" | "ARCHIVED"

const HouseholdTypes: HouseholdType[] = ["SINGLE_FAMILY", "MULTI_FAMILY", "EXTENDED_FAMILY", "SINGLE_PERSON", "NON_FAMILY", "OTHER"]
const HouseholdStatuses: HouseholdStatus[] = ["ACTIVE", "INACTIVE", "RELOCATED", "MERGED", "ARCHIVED"]

interface Resident {
    id: string
    firstName: string
    middleName: string | null
    lastName: string
    contactNo: string | null
}

interface Household {
    id: string
    houseNo: string
    street: string
    barangay: string
    city: string
    province: string
    zipCode: string
    type: HouseholdType
    status: HouseholdStatus
    notes: string | null
    Resident: Resident[]
}

interface HouseholdListProps {
    initialHouseholds: Household[]
}

export function HouseholdList({ initialHouseholds }: HouseholdListProps) {
    const [households, setHouseholds] = useState(initialHouseholds)
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState<HouseholdType | "">("")
    const [statusFilter, setStatusFilter] = useState<HouseholdStatus | "">("")
    const router = useRouter()

    const handleSearch = async () => {
        try {
            const params = new URLSearchParams()
            if (search) params.set("search", search)
            if (typeFilter) params.set("type", typeFilter)
            if (statusFilter) params.set("status", statusFilter)

            const res = await fetch(`/api/households?${params.toString()}`)
            if (!res.ok) {
                throw new Error('Failed to fetch households')
            }

            const data = await res.json()
            if (Array.isArray(data)) {
                setHouseholds(data)
            } else {
                console.error('Invalid response format:', data)
            }
        } catch (error) {
            console.error('Error searching households:', error)
            setHouseholds(initialHouseholds)
        }
    }

    const formatEnumValue = (value: string) => {
        return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())
    }

    const getStatusColor = (status: HouseholdStatus) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800'
            case 'INACTIVE':
                return 'bg-red-100 text-red-800'
            case 'RELOCATED':
                return 'bg-yellow-100 text-yellow-800'
            case 'MERGED':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div>
            <div className="mb-4 grid gap-4 md:grid-cols-3">
                <input
                    type="text"
                    placeholder="Search households..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        handleSearch()
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
                <select
                    value={typeFilter}
                    onChange={(e) => {
                        setTypeFilter(e.target.value as HouseholdType | "")
                        handleSearch()
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                    <option value="">All Types</option>
                    {HouseholdTypes.map((type) => (
                        <option key={type} value={type}>
                            {formatEnumValue(type)}
                        </option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value as HouseholdStatus | "")
                        handleSearch()
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                    <option value="">All Statuses</option>
                    {HouseholdStatuses.map((status) => (
                        <option key={status} value={status}>
                            {formatEnumValue(status)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                Address
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                Type
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                                Status
                            </th>
                            <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
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
                                        {household.barangay}, {household.city}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {formatEnumValue(household.type)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${getStatusColor(household.status)}`}>
                                        {formatEnumValue(household.status)}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {(household.Resident?.length || 0)} residents
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
} 