"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type ReportType = "households" | "residents"

export function ReportsList() {
    const [filter, setFilter] = useState("")
    const [loading, setLoading] = useState(false)
    const [reportType, setReportType] = useState<ReportType>("households")

    const handleDownload = async (format: string) => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.set("format", format)
            if (filter) params.set("filter", filter)

            const res = await fetch(`/api/reports/${reportType}?${params.toString()}`)
            if (!res.ok) throw new Error("Failed to generate report")

            // For CSV, trigger download
            if (format === "csv") {
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `${reportType}-${new Date().toISOString().split("T")[0]}.csv`
                document.body.appendChild(a)
                a.click()
                a.remove()
                window.URL.revokeObjectURL(url)
            }
        } catch (error) {
            console.error("Download error:", error)
            alert("Failed to download report")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Generate Reports</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Download reports in different formats
                </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
                <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                    className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                >
                    <option value="households">Households Report</option>
                    <option value="residents">Residents Report</option>
                </select>

                <input
                    type="text"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder={`Filter ${reportType}...`}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />

                <button
                    onClick={() => handleDownload("csv")}
                    disabled={loading}
                    className="whitespace-nowrap rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                    {loading ? "Generating..." : "Download CSV"}
                </button>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="font-medium">Report Contents</h3>
                {reportType === "households" ? (
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
                        <li>House number and complete address</li>
                        <li>Number of residents per household</li>
                        <li>Mapping status</li>
                        <li>Registration date</li>
                    </ul>
                ) : (
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
                        <li>Resident name and demographics</li>
                        <li>Contact information</li>
                        <li>Household address</li>
                        <li>Civil status and gender</li>
                    </ul>
                )}
            </div>
        </div>
    )
} 