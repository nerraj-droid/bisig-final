// This is a Server Component - no "use client" directive here
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Prisma, HouseholdType as PrismaHouseholdType, HouseholdStatus as PrismaHouseholdStatus } from "@prisma/client"
import HouseholdDetailView from "@/components/households/household-detail-view"

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
    const { householdId } = params;

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

        // Create markers for the map
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
        ] : [];

        // Pass all data to the client component
        return <HouseholdDetailView household={household} markers={markers} />;
    } catch (error) {
        console.error("Error loading household data:", error);
        return <HouseholdDetailView error={true} />;
    }
} 