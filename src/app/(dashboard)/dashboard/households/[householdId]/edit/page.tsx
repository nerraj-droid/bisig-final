import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EditHouseholdForm } from "@/components/households/edit-household-form"
import Link from "next/link"
import { ChevronRight, Home, Users } from "lucide-react"

export default async function EditHouseholdPage({
    params,
}: {
    params: { householdId: string } | Promise<{ householdId: string }>
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    // Await the params object (if it's a promise)
    const resolvedParams = await Promise.resolve(params);

    const household = await prisma.household.findUnique({
        where: { id: resolvedParams.householdId },
        include: {
            Resident: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true
                }
            }
        }
    })

    if (!household) {
        notFound()
    }

    // Get a simplified address for the breadcrumb
    const shortAddress = `${household.houseNo} ${household.street}`

    return (
        <div className="mx-auto max-w-4xl">
            {/* Breadcrumb navigation */}
            <nav className="mb-4 flex items-center text-sm text-gray-500">
                <Link href="/dashboard" className="flex items-center hover:text-gray-900">
                    <Home size={16} className="mr-1" /> Dashboard
                </Link>
                <ChevronRight size={16} className="mx-2" />
                <Link href="/dashboard/households" className="flex items-center hover:text-gray-900">
                    <Users size={16} className="mr-1" /> Households
                </Link>
                <ChevronRight size={16} className="mx-2" />
                <Link
                    href={`/dashboard/households/${household.id}`}
                    className="hover:text-gray-900 truncate max-w-[150px]"
                >
                    {shortAddress}
                </Link>
                <ChevronRight size={16} className="mx-2" />
                <span className="text-gray-900 font-medium">Edit</span>
            </nav>

            <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Household</h1>

            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-100">
                <EditHouseholdForm household={household} />
            </div>
        </div>
    )
}