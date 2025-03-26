"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Download, Filter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

type ReportType = "households" | "residents" | "disaster-relief"
type ReliefReportType = "summary" | "detailed"

export function ReportsList() {
    const [filter, setFilter] = useState("")
    const [loading, setLoading] = useState(false)
    const [seedingRelief, setSeedingRelief] = useState(false)
    const [reportType, setReportType] = useState<ReportType>("households")
    const [genderFilter, setGenderFilter] = useState("")
    const [ageGroupFilter, setAgeGroupFilter] = useState("")
    const [civilStatusFilter, setCivilStatusFilter] = useState("")
    const [barangayFilter, setBarangayFilter] = useState("")
    const [voterStatusFilter, setVoterStatusFilter] = useState("")
    const [reliefReportType, setReliefReportType] = useState<ReliefReportType>("summary")
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const resetFilters = () => {
        setFilter("")
        setGenderFilter("")
        setAgeGroupFilter("")
        setCivilStatusFilter("")
        setBarangayFilter("")
        setVoterStatusFilter("")
    }

    const getActiveFilters = () => {
        const filters = []
        if (filter) filters.push({ name: "Text", value: filter })
        if (genderFilter) filters.push({ name: "Gender", value: genderFilter })
        if (ageGroupFilter) filters.push({ name: "Age Group", value: ageGroupFilter })
        if (civilStatusFilter) filters.push({ name: "Civil Status", value: civilStatusFilter })
        if (barangayFilter) filters.push({ name: "Barangay", value: barangayFilter })
        if (voterStatusFilter) filters.push({ name: "Voter Status", value: voterStatusFilter === "true" ? "Voters Only" : "Non-Voters Only" })
        return filters
    }

    const activeFilters = getActiveFilters()

    const buildQueryParams = () => {
        const params = new URLSearchParams()
        params.set("format", "csv") // Always CSV format
        if (filter) params.set("filter", filter)
        if (genderFilter) params.set("gender", genderFilter)
        if (ageGroupFilter) params.set("ageGroup", ageGroupFilter)
        if (civilStatusFilter) params.set("civilStatus", civilStatusFilter)
        if (barangayFilter) params.set("barangay", barangayFilter)
        if (voterStatusFilter) params.set("voter", voterStatusFilter)
        if (reportType === "disaster-relief") {
            params.set("reliefType", reliefReportType)
        }
        return params
    }

    const handleDownload = async () => {
        setLoading(true)
        setErrorMessage(null)

        try {
            const params = buildQueryParams()

            // Determine the correct endpoint based on report type
            const endpoint = reportType === "disaster-relief"
                ? `/api/reports/disaster-relief`
                : `/api/reports/${reportType}`

            const fullUrl = `${endpoint}?${params.toString()}`
            console.log("Downloading from:", fullUrl)

            // Proceed directly with the download request
            // Removing the HEAD request check that was causing the 500 error
            const res = await fetch(fullUrl, {
                method: "GET",
                headers: {
                    "Accept": "text/csv"
                }
            })

            if (!res.ok) {
                console.error("Download request failed:", res.status, res.statusText)
                try {
                    // Try to get detailed error information if available
                    const errorText = await res.text()
                    console.error("Error details:", errorText)

                    // If the response is JSON, try to parse it for a more specific error message
                    if (errorText.startsWith('{')) {
                        try {
                            const errorJson = JSON.parse(errorText)
                            if (errorJson.error || errorJson.message) {
                                throw new Error(errorJson.error || errorJson.message)
                            }
                        } catch (e) {
                            // JSON parsing failed, use the text as is
                        }
                    }

                    throw new Error(`Failed to generate report: ${res.statusText || 'Server error'}`)
                } catch (parseError) {
                    throw new Error(`Report generation failed: ${res.status} ${res.statusText}`)
                }
            }

            // Process the CSV download
            const contentType = res.headers.get('content-type')

            // Check if the response is actually a CSV
            if (!contentType || !contentType.includes('text/csv')) {
                console.warn('Response may not be a CSV file:', contentType)
            }

            const blob = await res.blob()

            // Check if the blob is empty
            if (blob.size === 0) {
                throw new Error('The generated report is empty. There might be no data matching your filters.')
            }

            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${reportType}-${new Date().toISOString().split("T")[0]}.csv`
            document.body.appendChild(a)
            a.click()
            a.remove()

            // Clean up the URL
            setTimeout(() => {
                window.URL.revokeObjectURL(url)
            }, 100)

            toast.success(`Your ${reportType} report has been downloaded successfully.`)
        } catch (error) {
            console.error("Download error:", error)
            setErrorMessage((error as Error).message || "Failed to download report")
            toast.error((error as Error).message || "Could not generate report")
        } finally {
            setLoading(false)
        }
    }

    const handleSeedDisasterRelief = async () => {
        setSeedingRelief(true)
        try {
            const res = await fetch('/api/seed/disaster-relief', {
                method: 'POST',
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || 'Failed to seed disaster relief data')
            }

            const data = await res.json()
            toast.success(`Successfully created ${data.count} sample disaster relief records`)
        } catch (error) {
            console.error('Error seeding disaster relief data:', error)
            toast.error((error as Error).message || 'Failed to seed disaster relief data')
        } finally {
            setSeedingRelief(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h2 className="text-lg font-semibold">Generate Reports</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Download customized reports in CSV format
                    </p>
                </div>
                {activeFilters.length > 0 && (
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                        <Filter className="h-4 w-4 mr-2" />
                        Clear All Filters
                    </Button>
                )}
            </div>

            <Tabs defaultValue="type" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="type">Report Type</TabsTrigger>
                    <TabsTrigger value="filters">Filters {activeFilters.length > 0 && `(${activeFilters.length})`}</TabsTrigger>
                </TabsList>

                <TabsContent value="type" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className={`cursor-pointer border-2 transition-all ${reportType === "households" ? "border-primary" : "border-muted hover:border-muted-foreground"}`}
                            onClick={() => setReportType("households")}>
                            <CardContent className="p-4 flex flex-col items-center text-center">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 mt-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-medium">Households Report</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Complete information about all households
                                </p>
                            </CardContent>
                        </Card>

                        <Card className={`cursor-pointer border-2 transition-all ${reportType === "residents" ? "border-primary" : "border-muted hover:border-muted-foreground"}`}
                            onClick={() => setReportType("residents")}>
                            <CardContent className="p-4 flex flex-col items-center text-center">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 mt-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-medium">Residents Report</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Detailed information about all residents
                                </p>
                            </CardContent>
                        </Card>

                        <Card className={`cursor-pointer border-2 transition-all ${reportType === "disaster-relief" ? "border-primary" : "border-muted hover:border-muted-foreground"}`}
                            onClick={() => setReportType("disaster-relief")}>
                            <CardContent className="p-4 flex flex-col items-center text-center">
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mb-3 mt-2">
                                    <FileText className="h-5 w-5 text-red-600" />
                                </div>
                                <h3 className="font-medium">Disaster Relief</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Reports for disaster response planning
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {reportType === "disaster-relief" && (
                        <div className="mt-4 p-4 border rounded-md">
                            <h4 className="text-sm font-medium mb-2">Relief Report Type</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <Card className={`cursor-pointer border-2 transition-all ${reliefReportType === "summary" ? "border-red-600" : "border-muted hover:border-muted-foreground"}`}
                                    onClick={() => setReliefReportType("summary")}>
                                    <CardContent className="p-3">
                                        <h4 className="font-medium">Summary Report</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Basic household information and resident counts
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className={`cursor-pointer border-2 transition-all ${reliefReportType === "detailed" ? "border-red-600" : "border-muted hover:border-muted-foreground"}`}
                                    onClick={() => setReliefReportType("detailed")}>
                                    <CardContent className="p-3">
                                        <h4 className="font-medium">Detailed Report</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Complete household and resident details
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="filters" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Text Search</label>
                            <Input
                                type="text"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                placeholder={`Search in ${reportType}...`}
                                className="w-full"
                            />
                        </div>

                        {(reportType === "residents" || reportType === "disaster-relief") && (
                            <>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Gender</label>
                                    <Select value={genderFilter} onValueChange={setGenderFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All genders" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All genders</SelectItem>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Age Group</label>
                                    <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All ages" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All ages</SelectItem>
                                            <SelectItem value="0-17">0-17 years</SelectItem>
                                            <SelectItem value="18-24">18-24 years</SelectItem>
                                            <SelectItem value="25-34">25-34 years</SelectItem>
                                            <SelectItem value="35-44">35-44 years</SelectItem>
                                            <SelectItem value="45-54">45-54 years</SelectItem>
                                            <SelectItem value="55-64">55-64 years</SelectItem>
                                            <SelectItem value="65+">65+ years</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Civil Status</label>
                                    <Select value={civilStatusFilter} onValueChange={setCivilStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All statuses</SelectItem>
                                            <SelectItem value="SINGLE">Single</SelectItem>
                                            <SelectItem value="MARRIED">Married</SelectItem>
                                            <SelectItem value="WIDOWED">Widowed</SelectItem>
                                            <SelectItem value="DIVORCED">Divorced</SelectItem>
                                            <SelectItem value="SEPARATED">Separated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Voter Status</label>
                                    <Select value={voterStatusFilter} onValueChange={setVoterStatusFilter}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All residents" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">All residents</SelectItem>
                                            <SelectItem value="true">Voters only</SelectItem>
                                            <SelectItem value="false">Non-voters only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="text-sm font-medium mb-1 block">Barangay</label>
                            <Input
                                type="text"
                                value={barangayFilter}
                                onChange={(e) => setBarangayFilter(e.target.value)}
                                placeholder="Filter by barangay"
                                className="w-full"
                            />
                        </div>
                    </div>

                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {activeFilters.map((filter, index) => (
                                <Badge key={index} variant="outline">
                                    {filter.name}: {filter.value}
                                </Badge>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {errorMessage && (
                <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <div className="mt-6 flex flex-col sm:flex-row sm:justify-between gap-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 flex-1">
                    <h3 className="font-medium mb-2">Report Contents</h3>
                    {reportType === "households" ? (
                        <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                            <li>House number and complete address</li>
                            <li>Number of residents per household</li>
                            <li>Mapping status (coordinates)</li>
                            <li>Registration date</li>
                        </ul>
                    ) : reportType === "residents" ? (
                        <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                            <li>Resident name and demographics</li>
                            <li>Contact information</li>
                            <li>Household address</li>
                            <li>Civil status and gender</li>
                            <li>Voter status and ID information</li>
                        </ul>
                    ) : (
                        <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                            <li>Household location and address</li>
                            <li>{reliefReportType === "summary" ? "Number of residents" : "Complete resident details"}</li>
                            <li>GPS coordinates for mapping</li>
                            <li>{reliefReportType === "detailed" && "Contact information for emergency response"}</li>
                        </ul>
                    )}
                </div>

                <div className="flex flex-col justify-end sm:justify-center">
                    <Button
                        onClick={handleDownload}
                        disabled={loading}
                        className="whitespace-nowrap bg-blue-600 hover:bg-blue-500"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                Download CSV
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
} 