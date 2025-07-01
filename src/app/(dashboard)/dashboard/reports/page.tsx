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
    Heart,
    BarChart3,
    FileText,
    Download,
    Calendar,
    Activity,
    PieChart,
    MapPin
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

    // Calculate age-based metrics
    const currentDate = new Date()
    const seniorCitizens = residents.filter(resident =>
        differenceInYears(currentDate, resident.birthDate) >= 65
    ).length
    const minors = residents.filter(resident =>
        differenceInYears(currentDate, resident.birthDate) < 18
    ).length

    // Calculate key metrics
    const marriedCount = civilStatusDistribution.find(g => g.civilStatus === "MARRIED")?.count || 0
    const singleCount = civilStatusDistribution.find(g => g.civilStatus === "SINGLE")?.count || 0
    const averageHouseholdSize = totalHouseholds > 0 ? (totalResidents / totalHouseholds).toFixed(1) : "0"

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Toaster richColors position="top-right" />

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-blue-600 rounded-xl text-white shadow-sm">
                                    <BarChart3 className="h-8 w-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                                    <p className="text-gray-600 text-lg">Comprehensive barangay statistics and insights</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Last Updated</div>
                                <div className="text-base font-semibold text-gray-900">
                                    {new Date().toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                            <div className="p-2 bg-green-100 rounded-full">
                                <Activity className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-white border-gray-200 hover:shadow-md transition-all duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-1">Total Residents</p>
                                    <p className="text-3xl font-bold text-gray-900">{totalResidents.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 mt-1">Active Population</p>
                                </div>
                                <div className="p-4 bg-blue-100 rounded-xl text-blue-700">
                                    <Users size={28} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-200 hover:shadow-md transition-all duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-1">Total Households</p>
                                    <p className="text-3xl font-bold text-gray-900">{totalHouseholds.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 mt-1">Avg: {averageHouseholdSize} per household</p>
                                </div>
                                <div className="p-4 bg-gray-100 rounded-xl text-gray-700">
                                    <Home size={28} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-200 hover:shadow-md transition-all duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-1">Senior Citizens</p>
                                    <p className="text-3xl font-bold text-gray-900">{seniorCitizens.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 mt-1">{((seniorCitizens / totalResidents) * 100).toFixed(1)}% of population</p>
                                </div>
                                <div className="p-4 bg-slate-100 rounded-xl text-slate-700">
                                    <User2 size={28} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-200 hover:shadow-md transition-all duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-1">Minors</p>
                                    <p className="text-3xl font-bold text-gray-900">{minors.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 mt-1">{((minors / totalResidents) * 100).toFixed(1)}% of population</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
                                    <Baby size={28} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white border-gray-200 hover:shadow-md transition-all duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-1">Married Residents</p>
                                    <p className="text-2xl font-bold text-gray-900">{marriedCount.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 mt-1">{((marriedCount / totalResidents) * 100).toFixed(1)}% of population</p>
                                </div>
                                <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                                    <Heart size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-200 hover:shadow-md transition-all duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-1">Single Residents</p>
                                    <p className="text-2xl font-bold text-gray-900">{singleCount.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 mt-1">{((singleCount / totalResidents) * 100).toFixed(1)}% of population</p>
                                </div>
                                <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
                                    <User2 size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-gray-200 hover:shadow-md transition-all duration-300">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-1">Barangays Covered</p>
                                    <p className="text-2xl font-bold text-gray-900">{householdsByBarangay.length}</p>
                                    <p className="text-xs text-gray-500 mt-1">Active locations</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                    <MapPin size={24} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                        <CardHeader className="bg-gray-800 text-white pb-6">
                            <div className="flex items-center gap-3">
                                <PieChart className="h-6 w-6" />
                                <div>
                                    <CardTitle className="text-xl font-bold">Demographic Distribution</CardTitle>
                                    <CardDescription className="text-gray-300">Population statistics by gender and civil status</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 h-[500px] flex flex-col">
                            <div className="flex-1 min-h-0">
                                <ReportsCharts
                                    genderDistribution={genderDistribution}
                                    civilStatusDistribution={civilStatusDistribution}
                                    hideBarangayChart={true}
                                    hideAgeChart={true}
                                    showHeader={false}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                        <CardHeader className="bg-gray-800 text-white pb-6">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="h-6 w-6" />
                                <div>
                                    <CardTitle className="text-xl font-bold">Geographic Distribution</CardTitle>
                                    <CardDescription className="text-gray-300">Household and resident counts across barangays</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 h-[500px] flex flex-col">
                            <div className="flex-1 min-h-0">
                                <ReportsCharts
                                    householdsByBarangay={householdsByBarangay}
                                    hideGenderChart={true}
                                    hideCivilStatusChart={true}
                                    hideAgeChart={true}
                                    showHeader={false}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Reports List Section */}
                <Card className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                    <CardHeader className="bg-gray-800 text-white pb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6" />
                                <div>
                                    <CardTitle className="text-xl font-bold">Available Reports</CardTitle>
                                    <CardDescription className="text-gray-300">Download comprehensive reports and analytics</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-lg">
                                <Download className="h-4 w-4" />
                                <span className="text-sm font-medium">Export Ready</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <ReportsList />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 