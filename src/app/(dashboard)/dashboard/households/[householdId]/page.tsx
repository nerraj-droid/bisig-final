import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { DeleteHouseholdButton } from "@/components/households/delete-household-button"
import { MapProvider } from "@/components/map/map-context"
import { MapView } from "@/components/map/map-view"
import { Prisma } from "@prisma/client"

type Household = Prisma.HouseholdGetPayload<{
    include: { Resident: true }
}>

type HouseholdType = Household['type']
type HouseholdStatus = Household['status']

export default async function HouseholdPage({
    params,
}: {
    params: { householdId: string }
}) {
    const household = await prisma.household.findUnique({
        where: { id: params.householdId },
        include: {
            Resident: true,
        },
    }) as Household | null

    if (!household) {
        notFound()
    }

    const markers = household.latitude && household.longitude ? [
        {
            id: household.id,
            latitude: household.latitude,
            longitude: household.longitude,
            description: `
                <strong>${household.houseNo} ${household.street}</strong><br/>
                ${household.Resident.length} residents
            `
        }
    ] : []

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
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Household Details</h1>
                <div className="flex space-x-4">
                    <Link
                        href={`/dashboard/households/${household.id}/edit`}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                        Edit Household
                    </Link>
                    <DeleteHouseholdButton householdId={household.id} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Address Information</h2>
                    <dl className="space-y-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">House Number</dt>
                            <dd className="text-gray-900">{household.houseNo}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Street</dt>
                            <dd className="text-gray-900">{household.street}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Barangay</dt>
                            <dd className="text-gray-900">{household.barangay}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">City</dt>
                            <dd className="text-gray-900">{household.city}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Province</dt>
                            <dd className="text-gray-900">{household.province}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">ZIP Code</dt>
                            <dd className="text-gray-900">{household.zipCode}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Type</dt>
                            <dd className="text-gray-900">
                                {formatEnumValue(household.type)}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Status</dt>
                            <dd className={`inline-flex rounded-full px-2 text-xs font-semibold ${getStatusColor(household.status)}`}>
                                {formatEnumValue(household.status)}
                            </dd>
                        </div>
                    </dl>
                </div>

                {household.notes && (
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold">Notes</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{household.notes}</p>
                    </div>
                )}

                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Residents</h2>
                        <Link
                            href={`/dashboard/residents/new?householdId=${household.id}`}
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            Add Resident
                        </Link>
                    </div>
                    {household.Resident.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {household.Resident.map((resident) => (
                                <li key={resident.id} className="py-4">
                                    <Link
                                        href={`/dashboard/residents/${resident.id}`}
                                        className="block hover:bg-gray-50"
                                    >
                                        <div className="font-medium text-gray-900">
                                            {resident.lastName}, {resident.firstName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {resident.contactNo || "No contact number"}
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No residents in this household</p>
                    )}
                </div>
            </div>

            <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Location</h2>
                {household.latitude && household.longitude ? (
                    <MapProvider>
                        <MapView
                            markers={markers}
                            initialView={{
                                latitude: household.latitude,
                                longitude: household.longitude,
                                zoom: 18
                            }}
                        />
                    </MapProvider>
                ) : (
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                        <p className="text-gray-500">No location set for this household</p>
                        <Link
                            href={`/dashboard/households/${household.id}/edit`}
                            className="text-sm text-blue-600 hover:text-blue-500"
                        >
                            Set Location
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
} 