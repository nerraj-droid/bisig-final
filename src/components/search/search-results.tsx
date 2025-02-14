"use client"

import { useSearch } from "@/hooks/use-search"
import { useRouter } from "next/navigation"
import { Pagination } from "../ui/pagination"

export function SearchResults() {
    const { residents, households, loading, error, pagination, search, currentSearch } = useSearch()
    const router = useRouter()

    console.log("Search results state:", {
        residentsCount: residents.length,
        householdsCount: households.length,
        loading,
        error,
        pagination,
        currentSearch
    })

    const handlePageChange = (page: number) => {
        search(currentSearch.query, currentSearch.filters, page)
    }

    if (loading) {
        return <div className="text-center text-gray-500">Loading...</div>
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>
    }

    if (!residents.length && !households.length) {
        return <div className="text-center text-gray-500">No results found</div>
    }

    return (
        <div className="space-y-8">
            {residents.length > 0 && (
                <div>
                    <h2 className="mb-4 text-lg font-semibold">Residents</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Age
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Gender
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Address
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {residents.map((resident) => (
                                    <tr
                                        key={resident.id}
                                        onClick={() => router.push(`/dashboard/residents/${resident.id}`)}
                                        className="cursor-pointer hover:bg-gray-50"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {resident.lastName}, {resident.firstName}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {resident.age}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {resident.gender}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {resident.household ?
                                                `${resident.household.houseNo} ${resident.household.street}, ${resident.household.barangay}` :
                                                "No address"
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {households.length > 0 && (
                <div>
                    <h2 className="mb-4 text-lg font-semibold">Households</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Address
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
                                        onClick={() => router.push(`/dashboard/households/${household.id}`)}
                                        className="cursor-pointer hover:bg-gray-50"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {household.houseNo} {household.street}, {household.barangay}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {household.residents.length} residents
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {pagination && pagination.totalPages > 1 && (
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    )
} 