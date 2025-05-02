import { prisma } from "@/lib/prisma"
import { ReportsList } from "@/components/reports/reports-list"
import { ReportsCharts } from "@/components/reports/reports-charts"
import { differenceInYears } from "date-fns"
import { Toaster } from "sonner"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Users,
    Home,
    User2,
    TrendingUp,
    Baby,
    Heart
} from "lucide-react"

export default async function ReportsPage() {
    const [
        householdsByBarangay,
        genderDistribution,
        civilStatusDistribution,
        residents,
        totalHouseholds,
        totalResidents,
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
        prisma.household.count(),
        prisma.resident.count(),
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

    // Calculate key metrics
    const seniorCitizens = ageGroups.find(g => g.range === "65+")?.count || 0
    const minors = ageGroups.find(g => g.range === "0-17")?.count || 0
    const marriedCount = civilStatusDistribution.find(g => g.civilStatus === "MARRIED")?.count || 0
    const singleCount = civilStatusDistribution.find(g => g.civilStatus === "SINGLE")?.count || 0

    return (
        <div className="space-y-6">
            <Toaster richColors position="top-right" />

            <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Barangay Statistics Dashboard</h1>
                <p className="text-gray-500">Key metrics and population statistics</p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Residents</p>
                                <p className="text-3xl font-bold">{totalResidents}</p>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                                <Users size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Households</p>
                                <p className="text-3xl font-bold">{totalHouseholds}</p>
                            </div>
                            <div className="p-2 bg-green-50 rounded-full text-green-600">
                                <Home size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Senior Citizens</p>
                                <p className="text-3xl font-bold">{seniorCitizens}</p>
                            </div>
                            <div className="p-2 bg-amber-50 rounded-full text-amber-600">
                                <User2 size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Minors</p>
                                <p className="text-3xl font-bold">{minors}</p>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                                <Baby size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Demographic Distribution</CardTitle>
                        <CardDescription>Population statistics by gender and age</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReportsCharts
                            genderDistribution={genderDistribution}
                            ageGroups={ageGroups}
                            hideBarangayChart={true}
                            hideCivilStatusChart={true}
                            showHeader={false}
                        />
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Barangay Distribution</CardTitle>
                        <CardDescription>Household and resident counts by barangay</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReportsCharts
                            householdsByBarangay={householdsByBarangay}
                            hideGenderChart={true}
                            hideAgeChart={true}
                            hideCivilStatusChart={true}
                            showHeader={false}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Reports List Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Reports</CardTitle>
                    <CardDescription>Download or view detailed reports</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReportsList />
                </CardContent>
            </Card>
        </div>
    )
} 