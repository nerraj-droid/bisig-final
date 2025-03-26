import { prisma } from "@/lib/prisma"
import { ReportsList } from "@/components/reports/reports-list"
import { ReportsCharts } from "@/components/reports/reports-charts"
import { differenceInYears } from "date-fns"
import { Toaster } from "sonner"

export default async function ReportsPage() {
    const [
        householdsByBarangay,
        genderDistribution,
        civilStatusDistribution,
        residents,
    ] = await Promise.all([
        prisma.household.groupBy({
            by: ["barangay"],
            _count: {
                _all: true,
            },
            orderBy: {
                barangay: "asc",
            },
        }).then(async (groups: { barangay: string, _count: { _all: number } }[]) => {
            // Get resident counts for each barangay
            const residentsPerBarangay = await Promise.all(
                groups.map(async (group) => {
                    const residents = await prisma.resident.count({
                        where: {
                            Household: {
                                barangay: group.barangay,
                            },
                        },
                    })
                    return {
                        barangay: group.barangay,
                        households: group._count._all,
                        residents,
                    }
                })
            )
            return residentsPerBarangay
        }),
        prisma.resident.groupBy({
            by: ["gender"],
            _count: {
                _all: true,
            },
            orderBy: {
                gender: "asc",
            },
        }).then((groups: { gender: string, _count: { _all: number } }[]) => groups.map(g => ({
            gender: g.gender,
            count: g._count._all,
        }))),
        prisma.resident.groupBy({
            by: ["civilStatus"],
            _count: {
                _all: true,
            },
            orderBy: {
                civilStatus: "asc",
            },
        }).then((groups: { civilStatus: string, _count: { _all: number } }[]) => groups.map(g => ({
            civilStatus: g.civilStatus,
            count: g._count._all,
        }))),
        prisma.resident.findMany({
            select: {
                birthDate: true,
            },
        }),
    ])

    // Calculate age distribution
    const ageGroups = [
        { range: "0-17", min: 0, max: 17, count: 0 },
        { range: "18-24", min: 18, max: 24, count: 0 },
        { range: "25-34", min: 25, max: 34, count: 0 },
        { range: "35-44", min: 35, max: 44, count: 0 },
        { range: "45-54", min: 45, max: 54, count: 0 },
        { range: "55-64", min: 55, max: 64, count: 0 },
        { range: "65+", min: 65, max: Infinity, count: 0 },
    ]

    residents.forEach((resident: { birthDate: Date }) => {
        const age = differenceInYears(new Date(), resident.birthDate)
        const group = ageGroups.find(g => age >= g.min && age <= g.max)
        if (group) group.count++
    })

    return (
        <div>
            <Toaster richColors position="top-right" />
            <ReportsCharts
                householdsByBarangay={householdsByBarangay}
                genderDistribution={genderDistribution}
                civilStatusDistribution={civilStatusDistribution}
                ageGroups={ageGroups}
            />
            <div className="rounded-lg bg-white p-6 shadow-sm">
                <ReportsList />
            </div>
        </div>
    )
} 