import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { DeleteHouseholdButton } from "@/components/households/delete-household-button"
import { MapProvider } from "@/components/map/map-context"
import { MapView } from "@/components/map/map-view"
import { Prisma, HouseholdType as PrismaHouseholdType, HouseholdStatus as PrismaHouseholdStatus } from "@prisma/client"

type Household = Prisma.HouseholdGetPayload<{
    include: { Resident: true }
}>

type HouseholdType = PrismaHouseholdType
type HouseholdStatus = PrismaHouseholdStatus

interface PageProps {
    params: {
        householdId: string
    }
}

export default async function HouseholdPage({ params }: PageProps) {
    const { householdId } = await params;

    try {
        const household = await prisma.household.findUnique({
            where: { id: householdId },
            include: {
                Resident: true,
            },
        });

        if (!household) {
            notFound();
        }

        // Type-safety for household data
        const typedHousehold = household as Household;

        const markers = typedHousehold.latitude && typedHousehold.longitude ? [
            {
                id: typedHousehold.id,
                latitude: typedHousehold.latitude,
                longitude: typedHousehold.longitude,
                description: `
                    <strong>${typedHousehold.houseNo} ${typedHousehold.street}</strong><br/>
                    ${typedHousehold.Resident.length} residents
                `
            }
        ] : [];

        const formatEnumValue = (value: string) => {
            return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());
        };

        const getStatusColor = (status: HouseholdStatus) => {
            switch (status) {
                case 'ACTIVE':
                    return 'bg-green-100 text-green-800';
                case 'INACTIVE':
                    return 'bg-red-100 text-red-800';
                case 'RELOCATED':
                    return 'bg-yellow-100 text-yellow-800';
                case 'MERGED':
                    return 'bg-blue-100 text-blue-800';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        };

        return (
            <div>
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Household Details</h1>
                    <div className="flex space-x-4">
                        <Link
                            href={`/dashboard/households/${typedHousehold.id}/edit`}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                        >
                            Edit Household
                        </Link>
                        <DeleteHouseholdButton householdId={typedHousehold.id} />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold">Address Information</h2>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">House Number</dt>
                                <dd className="text-gray-900">{typedHousehold.houseNo}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Street</dt>
                                <dd className="text-gray-900">{typedHousehold.street}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Barangay</dt>
                                <dd className="text-gray-900">{typedHousehold.barangay}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">City</dt>
                                <dd className="text-gray-900">{typedHousehold.city}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Province</dt>
                                <dd className="text-gray-900">{typedHousehold.province}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">ZIP Code</dt>
                                <dd className="text-gray-900">{typedHousehold.zipCode}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Type</dt>
                                <dd className="text-gray-900">
                                    {formatEnumValue(typedHousehold.type)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                <dd className={`inline-flex rounded-full px-2 text-xs font-semibold ${getStatusColor(typedHousehold.status)}`}>
                                    {formatEnumValue(typedHousehold.status)}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {typedHousehold.notes && (
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold">Notes</h2>
                            <p className="text-gray-700 whitespace-pre-wrap">{typedHousehold.notes}</p>
                        </div>
                    )}

                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Residents</h2>
                            <Link
                                href={`/dashboard/residents/new?householdId=${typedHousehold.id}`}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                Add Resident
                            </Link>
                        </div>
                        {typedHousehold.Resident.length > 0 ? (
                            <ul className="divide-y divide-gray-200">
                                {typedHousehold.Resident.map((resident) => (
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
                    {typedHousehold.latitude && typedHousehold.longitude ? (
                        <div>
                            {process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? (
                                <MapProvider>
                                    <MapView
                                        markers={markers}
                                        initialView={{
                                            latitude: typedHousehold.latitude,
                                            longitude: typedHousehold.longitude,
                                            zoom: 18
                                        }}
                                    />
                                </MapProvider>
                            ) : (
                                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                                    <p className="text-gray-500">Map cannot be displayed (Mapbox token not configured).</p>
                                    <Link
                                        href={`https://www.google.com/maps?q=${typedHousehold.latitude},${typedHousehold.longitude}`}
                                        target="_blank"
                                        className="text-sm text-blue-600 hover:text-blue-500"
                                    >
                                        View on Google Maps
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                            <p className="text-gray-500">No location set for this household</p>
                            <Link
                                href={`/dashboard/households/${typedHousehold.id}/edit`}
                                className="text-sm text-blue-600 hover:text-blue-500"
                            >
                                Set Location
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error loading household data:", error);
        return (
            <div className="p-6 bg-white rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold mb-4">Error</h1>
                <p className="text-red-600">Failed to load household data. Please try again later.</p>
                <Link href="/dashboard/households" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
                    Return to Households
                </Link>
            </div>
        );
    }
} 