"use client"

import { useRef, useState } from "react"
import { StatisticsChart } from "./statistics-chart"
import { DemographicsChart } from "./demographics-chart"
import { AgeDistributionChart } from "./age-distribution-chart"
import { ExportAllCharts } from "./export-all-charts"
import { generateReportPDF } from "@/lib/pdf-utils"

interface ReportsChartsProps {
    householdsByBarangay?: {
        barangay: string
        households: number
        residents: number
    }[]
    genderDistribution?: {
        gender: string
        count: number
    }[]
    civilStatusDistribution?: {
        civilStatus: string
        count: number
    }[]
    ageGroups?: {
        range: string
        count: number
    }[]
    hideBarangayChart?: boolean
    hideGenderChart?: boolean
    hideCivilStatusChart?: boolean
    hideAgeChart?: boolean
    showHeader?: boolean
    compact?: boolean
}

export function ReportsCharts({
    householdsByBarangay = [],
    genderDistribution = [],
    civilStatusDistribution = [],
    ageGroups = [],
    hideBarangayChart = false,
    hideGenderChart = false,
    hideCivilStatusChart = false,
    hideAgeChart = false,
    showHeader = true,
    compact = false,
}: ReportsChartsProps) {
    const statisticsChartRef = useRef<HTMLDivElement>(null)
    const demographicsChartRef = useRef<HTMLDivElement>(null)
    const ageDistributionChartRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(false)

    const handlePDFExport = async () => {
        setLoading(true)
        try {
            await generateReportPDF({
                householdsByBarangay,
                genderDistribution,
                civilStatusDistribution,
                ageGroups,
                chartRefs: [
                    { ref: statisticsChartRef as React.RefObject<HTMLDivElement>, name: "households-by-barangay" },
                    { ref: demographicsChartRef as React.RefObject<HTMLDivElement>, name: "demographics" },
                    { ref: ageDistributionChartRef as React.RefObject<HTMLDivElement>, name: "age-distribution" },
                ],
            })
        } catch (error) {
            console.error("PDF export error:", error)
            alert("Failed to generate PDF report")
        } finally {
            setLoading(false)
        }
    }

    // Calculate totals for summary stats
    const totalHouseholds = householdsByBarangay.reduce((sum, b) => sum + b.households, 0)
    const totalResidents = householdsByBarangay.reduce((sum, b) => sum + b.residents, 0)
    const averageHouseholdSize = totalHouseholds > 0
        ? (totalResidents / totalHouseholds).toFixed(1)
        : "0.0"

    return (
        <div>
            {showHeader && (
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold">Reports</h1>
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                        <button
                            onClick={handlePDFExport}
                            disabled={loading}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                        >
                            {loading ? "Generating PDF..." : "Export PDF Report"}
                        </button>
                        <ExportAllCharts
                            chartRefs={[
                                { ref: statisticsChartRef as React.RefObject<HTMLDivElement>, name: "households-by-barangay" },
                                { ref: demographicsChartRef as React.RefObject<HTMLDivElement>, name: "demographics" },
                                { ref: ageDistributionChartRef as React.RefObject<HTMLDivElement>, name: "age-distribution" },
                            ]}
                        />
                    </div>
                </div>
            )}

            {showHeader && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
                        <dt className="text-sm font-medium text-gray-500">Total Households</dt>
                        <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">
                            {totalHouseholds}
                        </dd>
                    </div>
                    <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
                        <dt className="text-sm font-medium text-gray-500">Total Residents</dt>
                        <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">
                            {totalResidents}
                        </dd>
                    </div>
                    <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
                        <dt className="text-sm font-medium text-gray-500">Average Household Size</dt>
                        <dd className="mt-1 text-2xl sm:text-3xl font-semibold text-gray-900">
                            {averageHouseholdSize}
                        </dd>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {!hideBarangayChart && householdsByBarangay.length > 0 && (
                    <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm overflow-x-auto">
                        <StatisticsChart
                            ref={statisticsChartRef}
                            householdsByBarangay={householdsByBarangay}
                            compact={compact}
                        />
                    </div>
                )}

                {(!hideGenderChart || !hideCivilStatusChart) && (
                    <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
                        <DemographicsChart
                            ref={demographicsChartRef}
                            genderDistribution={hideGenderChart ? [] : genderDistribution}
                            civilStatusDistribution={hideCivilStatusChart ? [] : civilStatusDistribution}
                            compact={compact}
                        />
                    </div>
                )}
            </div>

            {!hideAgeChart && ageGroups.length > 0 && (
                <div className="mb-8 rounded-lg bg-white p-4 sm:p-6 shadow-sm">
                    <AgeDistributionChart
                        ref={ageDistributionChartRef}
                        ageGroups={ageGroups}
                        compact={compact}
                    />
                </div>
            )}
        </div>
    )
}