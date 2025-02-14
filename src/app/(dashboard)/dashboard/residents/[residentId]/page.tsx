import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { DeleteResidentButton } from "@/components/residents/delete-resident-button"
import { format } from "date-fns"

export default async function ResidentPage({
    params,
}: {
    params: { residentId: string }
}) {
    const resident = await prisma.resident.findUnique({
        where: { id: params.residentId },
        include: {
            household: true,
        },
    })

    if (!resident) {
        notFound()
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Resident Details</h1>
                <div className="flex space-x-4">
                    <Link
                        href={`/dashboard/residents/${resident.id}/edit`}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                        Edit Resident
                    </Link>
                    <DeleteResidentButton residentId={resident.id} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Personal Information</h2>
                    <dl className="space-y-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                            <dd className="text-gray-900">
                                {resident.lastName}, {resident.firstName} {resident.middleName}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Birth Date</dt>
                            <dd className="text-gray-900">
                                {format(new Date(resident.birthDate), "MMMM d, yyyy")}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Gender</dt>
                            <dd className="text-gray-900">{resident.gender}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Civil Status</dt>
                            <dd className="text-gray-900">{resident.civilStatus}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                            <dd className="text-gray-900">{resident.contactNo || "N/A"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="text-gray-900">{resident.email || "N/A"}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Occupation</dt>
                            <dd className="text-gray-900">{resident.occupation || "N/A"}</dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Household Information</h2>
                    {resident.household ? (
                        <>
                            <div className="mb-4">
                                <div className="font-medium text-gray-900">
                                    {resident.household.houseNo} {resident.household.street}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {resident.household.barangay}, {resident.household.city},
                                    {resident.household.province} {resident.household.zipCode}
                                </div>
                            </div>
                            <Link
                                href={`/dashboard/households/${resident.household.id}`}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                View Household Details
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center justify-between">
                            <p className="text-gray-500">No household assigned</p>
                            <Link
                                href={`/dashboard/residents/${resident.id}/edit`}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                Assign to Household
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 