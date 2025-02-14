"use client"

import { useRef, useState } from "react"
import { StatisticsChart } from "./statistics-chart"
import { DemographicsChart } from "./demographics-chart"
import { AgeDistributionChart } from "./age-distribution-chart"
import { ExportAllCharts } from "./export-all-charts"
import { generateReportPDF } from "@/lib/pdf-utils"

interface ReportsChartsProps {
    householdsByBarangay: {
        barangay: string
        households: number
        residents: number
    }[]
    genderDistribution: {
        gender: string
        count: number
    }[]
    civilStatusDistribution: {
        civilStatus: string
        count: number
    }[]
    ageGroups: {
        range: string
        count: number
    }[]
}

export function ReportsCharts({
    householdsByBarangay,
    genderDistribution,
    civilStatusDistribution,
    ageGroups,
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

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Reports</h1>
                <div className="flex gap-4">
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

            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <dt className="text-sm font-medium text-gray-500">Total Households</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {householdsByBarangay.reduce((sum, b) => sum + b.households, 0)}
                    </dd>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <dt className="text-sm font-medium text-gray-500">Total Residents</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {householdsByBarangay.reduce((sum, b) => sum + b.residents, 0)}
                    </dd>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <dt className="text-sm font-medium text-gray-500">Average Household Size</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                        {(householdsByBarangay.reduce((sum, b) => sum + b.residents, 0) /
                            householdsByBarangay.reduce((sum, b) => sum + b.households, 0)).toFixed(1)}
                    </dd>
                </div>
            </div>

            <div className="mb-8 grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <StatisticsChart
                        ref={statisticsChartRef}
                        householdsByBarangay={householdsByBarangay}
                    />
                </div>
                <div className="rounded-lg bg-white p-6 shadow-sm">
                    <DemographicsChart
                        ref={demographicsChartRef}
                        genderDistribution={genderDistribution}
                        civilStatusDistribution={civilStatusDistribution}
                    />
                </div>
            </div>

            <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
                <AgeDistributionChart
                    ref={ageDistributionChartRef}
                    ageGroups={ageGroups}
                />
            </div>
        </div>
    )
}