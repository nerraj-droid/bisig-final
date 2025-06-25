"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { FilterCriteria } from "@/app/(dashboard)/dashboard/residents/page"

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
    currentFilters?: FilterCriteria
}

export const ResidentList = ({ initialResidents, currentFilters = {} }: ResidentListProps) => {
    const [residents, setResidents] = useState<Resident[]>(initialResidents)
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const router = useRouter()

    const fetchResidents = async (search: string = "", page: number = 1) => {
        setLoading(true)
        try {
            // Build query parameters for API call
            const queryParams = new URLSearchParams()

            // Add search parameter
            if (search) {
                queryParams.append("search", search)
            }

            // Add pagination parameters
            queryParams.append("page", page.toString())
            queryParams.append("limit", "10")
            queryParams.append("withCount", "true")

            // Add filter parameters from currentFilters
            if (currentFilters.gender) {
                queryParams.append("gender", currentFilters.gender)
            }

            if (currentFilters.civilStatus) {
                queryParams.append("civilStatus", currentFilters.civilStatus)
            }

            if (currentFilters.ageGroup) {
                queryParams.append("ageGroup", currentFilters.ageGroup)
            }

            if (currentFilters.voterInBarangay !== undefined) {
                queryParams.append("voter", currentFilters.voterInBarangay.toString())
            }
            
            // Add age range filters
            if (currentFilters.minAge !== undefined) {
                queryParams.append("minAge", currentFilters.minAge.toString())
            }
            
            if (currentFilters.maxAge !== undefined) {
                queryParams.append("maxAge", currentFilters.maxAge.toString())
            }
            
            // Add precise age filters
            if (currentFilters.ageYears !== undefined) {
                queryParams.append("ageYears", currentFilters.ageYears.toString())
            }
            
            if (currentFilters.ageMonths !== undefined) {
                queryParams.append("ageMonths", currentFilters.ageMonths.toString())
            }
            
            if (currentFilters.ageDays !== undefined) {
                queryParams.append("ageDays", currentFilters.ageDays.toString())
            }
            
            // Add other advanced filters
            if (currentFilters.employmentStatus) {
                queryParams.append("employmentStatus", currentFilters.employmentStatus)
            }
            
            if (currentFilters.educationalAttainment) {
                queryParams.append("educationalAttainment", currentFilters.educationalAttainment)
            }
            
            if (currentFilters.sectors && currentFilters.sectors.length > 0) {
                queryParams.append("sectors", currentFilters.sectors.join(','))
            }
            
            if (currentFilters.religion) {
                queryParams.append("religion", currentFilters.religion)
            }
            
            if (currentFilters.bloodType) {
                queryParams.append("bloodType", currentFilters.bloodType)
            }

            // Fetch data with filters
            const response = await fetch(`/api/residents?${queryParams.toString()}`)
            const result = await response.json()

            if (result.meta) {
                setResidents(result.data)
                setTotalPages(result.meta.pages)
            } else {
                setResidents(result)
                setTotalPages(1)
            }
        } catch (error) {
            console.error("Error fetching residents:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Reset to page 1 when search or filters change
        setPage(1)

        // Debounce search input to prevent too many API calls
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        searchTimeoutRef.current = setTimeout(() => {
            fetchResidents(searchTerm, 1)
        }, 300)

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [searchTerm, currentFilters])

    useEffect(() => {
        fetchResidents(searchTerm, page)
    }, [page])

    // Helper function to format name with extension
    const formatName = (resident: Resident) => {
        let name = `${resident.lastName}, ${resident.firstName}`
        if (resident.middleName) {
            name += ` ${resident.middleName.charAt(0)}.`
        }
        if (resident.extensionName) {
            name += ` ${resident.extensionName}`
        }
        return name
    }

    // Helper function to calculate age
    const calculateAge = (birthDateString: string) => {
        const birthDate = new Date(birthDateString)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const month = today.getMonth() - birthDate.getMonth()
        if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    return (
        <div className="w-full">
            {/* Search bar */}
            <div className="mb-4 flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                        type="text"
                        placeholder="Search residents by name, address..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Residents table */}
            <div className="w-full overflow-auto rounded-md border">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-[#E8F5F3] text-xs uppercase text-[#006B5E]">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Age</th>
                            <th className="px-4 py-3">Gender</th>
                            <th className="px-4 py-3">Contact No.</th>
                            <th className="px-4 py-3">Address</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-4 text-center">
                                    Loading residents...
                                </td>
                            </tr>
                        ) : residents.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-4 text-center">
                                    No residents found.
                                </td>
                            </tr>
                        ) : (
                            residents.map((resident) => (
                                <tr key={resident.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-[#006B5E]">
                                        {formatName(resident)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {resident.birthDate ? calculateAge(resident.birthDate) : "N/A"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {resident.gender === "MALE" ? "Male" : "Female"}
                                    </td>
                                    <td className="px-4 py-3">{resident.contactNo || "N/A"}</td>
                                    <td className="px-4 py-3">
                                        {resident.Household
                                            ? `${resident.Household.houseNo} ${resident.Household.street}`
                                            : "N/A"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link href={`/dashboard/residents/${resident.id}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-[#006B5E] text-[#006B5E] hover:bg-[#006B5E] hover:text-white"
                                            >
                                                View
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
} 