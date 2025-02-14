import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { SearchSection } from "@/components/search/search-section"

export default async function HouseholdsPage() {
    // Get unique barangays for the filter dropdown
    const barangays = await prisma.household.findMany({
        select: { barangay: true },
        distinct: ['barangay'],
        orderBy: { barangay: 'asc' }
    })

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Households</h1>
                <Link
                    href="/dashboard/households/new"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                    Add Household
                </Link>
            </div>
            <SearchSection barangays={barangays.map(b => b.barangay)} />
        </div>
    )
} 