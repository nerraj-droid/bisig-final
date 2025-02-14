import { prisma } from "@/lib/prisma"
import { MapProvider } from "@/components/map/map-context"
import { MapView } from "@/components/map/map-view"
import { SearchBox } from "@/components/map/search-box"
import Link from "next/link"

export default async function MapPage() {
    const households = await prisma.household.findMany({
        where: {
            latitude: { not: null },
            longitude: { not: null },
        },
        include: {
            residents: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    const markers = households.map(household => ({
        id: household.id,
        latitude: household.latitude!,
        longitude: household.longitude!,
        description: `
      <div class="space-y-1">
        <div class="font-medium">${household.houseNo} ${household.street}</div>
        <div class="text-sm text-gray-500">${household.barangay}, ${household.city}</div>
        <div class="text-sm">
          ${household.residents.length} resident${household.residents.length !== 1 ? 's' : ''}
        </div>
        ${household.residents.length > 0 ? `
          <div class="mt-2 text-sm">
            ${household.residents.map(r => `${r.firstName} ${r.lastName}`).join('<br/>')}
          </div>
        ` : ''}
        <a href="/dashboard/households/${household.id}" class="mt-2 inline-block text-sm text-blue-600 hover:text-blue-500">
          View Details
        </a>
      </div>
    `
    }))

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Household Map</h1>
                <Link
                    href="/dashboard/households/new"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                >
                    Add Household
                </Link>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-4">
                    <MapProvider>
                        <SearchBox />
                    </MapProvider>
                </div>
                <div className="rounded-lg border border-gray-200">
                    <MapProvider>
                        <MapView markers={markers} />
                    </MapProvider>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                    Showing {markers.length} mapped households
                </div>
            </div>
        </div>
    )
} 