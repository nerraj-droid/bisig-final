"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Calendar, Download, FileText, BarChart3, TrendingUp, FileBarChart, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { BarChart, PieChart, LineChart } from "@/components/charts/charts";
import Link from "next/link";

// Types for AIP data
interface AIP {
    id: string;
    title: string;
    status: string;
    totalAmount: number;
    totalExpenses: number;
    fiscalYear: {
        year: string;
    };
    completedProjects: number;
    ongoingProjects: number;
    plannedProjects: number;
    totalProjects: number;
}

interface FiscalYear {
    id: string;
    year: string;
    isActive: boolean;
}

// Component to render project status chart
const ProjectStatusChart = ({ data }: { data: any }) => {
    const seriesData = [
        { name: "Completed", value: data.completedProjects },
        { name: "Ongoing", value: data.ongoingProjects },
        { name: "Planned", value: data.plannedProjects },
    ];

    return (
        <PieChart
            data={seriesData}
            colors={["#10b981", "#f59e0b", "#6b7280"]}
            height={300}
            width={300}
            hideLabels={false}
        />
    );
};

// Component to render budget utilization chart
const BudgetUtilizationChart = ({ data }: { data: any }) => {
    const seriesData = [
        { name: "Utilized", value: data.totalExpenses },
        { name: "Remaining", value: data.totalAmount - data.totalExpenses },
    ];

    return (
        <PieChart
            data={seriesData}
            colors={["#3b82f6", "#e5e7eb"]}
            height={300}
            width={300}
            hideLabels={false}
        />
    );
};

// Component to render sector allocation chart
const SectorAllocationChart = ({ data }: { data: any }) => {
    return (
        <BarChart
            data={data}
            xAxis="sector"
            series={[
                {
                    name: "Budget Allocation",
                    dataKey: "allocation",
                    valueFormatter: (value: number) => `₱${value.toLocaleString()}`,
                    color: "#6366f1",
                },
                {
                    name: "Actual Expenses",
                    dataKey: "expenses",
                    valueFormatter: (value: number) => `₱${value.toLocaleString()}`,
                    color: "#f43f5e",
                },
            ]}
            height={400}
            width={600}
        />
    );
};

// Component to render monthly expense trend chart
const MonthlyExpenseTrendChart = ({ data }: { data: any }) => {
    return (
        <LineChart
            data={data}
            xAxis="month"
            series={[
                {
                    name: "Monthly Expenses",
                    dataKey: "amount",
                    valueFormatter: (value: number) => `₱${value.toLocaleString()}`,
                    color: "#0ea5e9",
                },
            ]}
            height={300}
            width={600}
        />
    );
};

export default function AIPReportsPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
    const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("");
    const [aipData, setAipData] = useState<AIP | null>(null);
    const [sectorData, setSectorData] = useState<any[]>([]);
    const [monthlyExpenseData, setMonthlyExpenseData] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch fiscal years on component load
    useEffect(() => {
        if (sessionStatus === "unauthenticated") {
            router.push("/login");
            return;
        }

        const fetchFiscalYears = async () => {
            try {
                const response = await fetch("/api/finance/fiscal-years");
                if (!response.ok) {
                    throw new Error("Failed to fetch fiscal years");
                }
                const data = await response.json();
                setFiscalYears(data);

                // Set active fiscal year as default if available
                const activeYear = data.find((fy: FiscalYear) => fy.isActive);
                if (activeYear) {
                    setSelectedFiscalYear(activeYear.id);
                } else if (data.length > 0) {
                    setSelectedFiscalYear(data[0].id);
                }
            } catch (error) {
                console.error("Error fetching fiscal years:", error);
                setError("Failed to load fiscal years");
            }
        };

        fetchFiscalYears();
    }, [sessionStatus, router]);

    // Fetch AIP data when fiscal year changes
    useEffect(() => {
        if (!selectedFiscalYear) return;

        const fetchAIPData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch AIP summary data for the selected fiscal year
                const response = await fetch(`/api/reports/aip/summary?fiscalYearId=${selectedFiscalYear}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch AIP data");
                }
                const data = await response.json();
                setAipData(data);

                // Fetch sector allocation data
                const sectorResponse = await fetch(`/api/reports/aip/sectors?fiscalYearId=${selectedFiscalYear}`);
                if (!sectorResponse.ok) {
                    throw new Error("Failed to fetch sector data");
                }
                const sectorData = await sectorResponse.json();
                setSectorData(sectorData);

                // Fetch monthly expense data
                const expenseResponse = await fetch(`/api/reports/aip/expenses/monthly?fiscalYearId=${selectedFiscalYear}`);
                if (!expenseResponse.ok) {
                    throw new Error("Failed to fetch expense data");
                }
                const expenseData = await expenseResponse.json();
                setMonthlyExpenseData(expenseData);
            } catch (error) {
                console.error("Error fetching AIP data:", error);
                setError("Failed to load AIP reports data");
            } finally {
                setLoading(false);
            }
        };

        fetchAIPData();
    }, [selectedFiscalYear]);

    // Handle export reports
    const handleExportCSV = async (reportType: string) => {
        if (!selectedFiscalYear) {
            toast.error("Please select a fiscal year first");
            return;
        }

        setExportLoading(true);
        try {
            const response = await fetch(`/api/reports/aip/${reportType}/export?fiscalYearId=${selectedFiscalYear}&format=csv`);

            if (!response.ok) {
                throw new Error("Failed to generate report");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `aip-${reportType}-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            // Clean up URL
            setTimeout(() => window.URL.revokeObjectURL(url), 100);

            toast.success(`Report downloaded successfully`);
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export report");
        } finally {
            setExportLoading(false);
        }
    };

    // Handle PDF export
    const handleExportPDF = async (reportType: string) => {
        if (!selectedFiscalYear) {
            toast.error("Please select a fiscal year first");
            return;
        }

        setExportLoading(true);
        try {
            const response = await fetch(`/api/reports/aip/${reportType}/export?fiscalYearId=${selectedFiscalYear}&format=pdf`);

            if (!response.ok) {
                throw new Error("Failed to generate PDF report");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `aip-${reportType}-${new Date().toISOString().split("T")[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            // Clean up URL
            setTimeout(() => window.URL.revokeObjectURL(url), 100);

            toast.success(`PDF report downloaded successfully`);
        } catch (error) {
            console.error("PDF export error:", error);
            toast.error("Failed to export PDF report");
        } finally {
            setExportLoading(false);
        }
    };

    // Calculate budget utilization percentage
    const calculateUtilizationPercentage = () => {
        if (!aipData) return 0;
        return Math.min(Math.round((aipData.totalExpenses / aipData.totalAmount) * 100), 100);
    };

    if (loading && !aipData) {
        return (
            <div className="container p-6 space-y-6">
                <div className="flex items-center mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        asChild
                    >
                        <Link href="/dashboard/reports">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Reports
                        </Link>
                    </Button>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
                <Skeleton className="h-80" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container p-6">
                <div className="flex items-center mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        asChild
                    >
                        <Link href="/dashboard/reports">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Reports
                        </Link>
                    </Button>
                </div>
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mr-2 -ml-2"
                            asChild
                        >
                            <Link href="/dashboard/reports">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-2xl font-bold">AIP Analytics Dashboard</h1>
                    <p className="text-muted-foreground">
                        Advanced reporting and analytics for Annual Investment Programs
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select
                        value={selectedFiscalYear}
                        onValueChange={setSelectedFiscalYear}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Fiscal Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {fiscalYears.map((year) => (
                                <SelectItem key={year.id} value={year.id}>
                                    FY {year.year} {year.isActive && "(Active)"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary Cards */}
            {aipData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Budget Utilization</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Total Budget</span>
                                    <span className="font-medium">₱{aipData.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Utilized</span>
                                    <span className="font-medium">₱{aipData.totalExpenses.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Remaining</span>
                                    <span className="font-medium">₱{(aipData.totalAmount - aipData.totalExpenses).toLocaleString()}</span>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Utilization</span>
                                        <span>{calculateUtilizationPercentage()}%</span>
                                    </div>
                                    <Progress value={calculateUtilizationPercentage()} className="h-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Project Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Total Projects</span>
                                    <span className="font-medium">{aipData.totalProjects}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Completed</span>
                                    <span className="font-medium">{aipData.completedProjects}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Ongoing</span>
                                    <span className="font-medium">{aipData.ongoingProjects}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Planned</span>
                                    <span className="font-medium">{aipData.plannedProjects}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">AIP Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Fiscal Year</span>
                                    <span className="font-medium">{aipData.fiscalYear.year}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Status</span>
                                    <Badge variant={
                                        aipData.status === "APPROVED" ? "default" :
                                            aipData.status === "COMPLETED" ? "success" :
                                                aipData.status === "DRAFT" ? "outline" :
                                                    "secondary"
                                    }>
                                        {aipData.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">AIP Title</span>
                                    <span className="font-medium truncate max-w-[150px]">{aipData.title}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Report Tabs */}
            <Tabs defaultValue="charts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="charts">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                {/* Charts Tab */}
                <TabsContent value="charts" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Budget Utilization</CardTitle>
                                <CardDescription>Allocated vs utilized budget</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                {aipData ? (
                                    <BudgetUtilizationChart data={aipData} />
                                ) : (
                                    <div className="flex items-center justify-center h-[300px]">
                                        <Skeleton className="h-[300px] w-[300px] rounded-full" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Project Status</CardTitle>
                                <CardDescription>Distribution of project statuses</CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                {aipData ? (
                                    <ProjectStatusChart data={aipData} />
                                ) : (
                                    <div className="flex items-center justify-center h-[300px]">
                                        <Skeleton className="h-[300px] w-[300px] rounded-full" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sector Budget Allocation vs Actual Expenses</CardTitle>
                            <CardDescription>Distribution of budget across sectors</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            {sectorData.length > 0 ? (
                                <SectorAllocationChart data={sectorData} />
                            ) : (
                                <div className="flex items-center justify-center h-[400px] w-full">
                                    <Skeleton className="h-[400px] w-full" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Expense Trend</CardTitle>
                            <CardDescription>Expenses over time for the fiscal year</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            {monthlyExpenseData.length > 0 ? (
                                <MonthlyExpenseTrendChart data={monthlyExpenseData} />
                            ) : (
                                <div className="flex items-center justify-center h-[300px] w-full">
                                    <Skeleton className="h-[300px] w-full" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Reports Tab */}
                <TabsContent value="reports" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Reports</CardTitle>
                            <CardDescription>Generate and download reports in various formats</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center">
                                                <FileBarChart className="h-5 w-5 mr-2 text-blue-500" />
                                                AIP Summary Report
                                            </CardTitle>
                                            <CardDescription>
                                                Overall AIP data with budget utilization and project statistics
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-2">
                                            <p className="text-sm text-muted-foreground">
                                                Includes summary of the AIP, budget allocation, project status, and key metrics.
                                            </p>
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleExportCSV("summary")}
                                                disabled={exportLoading || !selectedFiscalYear}
                                            >
                                                {exportLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                                                CSV
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleExportPDF("summary")}
                                                disabled={exportLoading || !selectedFiscalYear}
                                            >
                                                {exportLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                                                PDF
                                            </Button>
                                        </CardFooter>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center">
                                                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                                                Projects Status Report
                                            </CardTitle>
                                            <CardDescription>
                                                Detailed breakdown of all projects and their current status
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-2">
                                            <p className="text-sm text-muted-foreground">
                                                Includes project details, progress, budget allocation, and expenses.
                                            </p>
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleExportCSV("projects")}
                                                disabled={exportLoading || !selectedFiscalYear}
                                            >
                                                {exportLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                                                CSV
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleExportPDF("projects")}
                                                disabled={exportLoading || !selectedFiscalYear}
                                            >
                                                {exportLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                                                PDF
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center">
                                                <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                                                Sector Allocation Report
                                            </CardTitle>
                                            <CardDescription>
                                                Budget allocation and utilization by sector
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-2">
                                            <p className="text-sm text-muted-foreground">
                                                Includes detailed breakdown of budget allocation and expenses by sector.
                                            </p>
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleExportCSV("sectors")}
                                                disabled={exportLoading || !selectedFiscalYear}
                                            >
                                                {exportLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                                                CSV
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleExportPDF("sectors")}
                                                disabled={exportLoading || !selectedFiscalYear}
                                            >
                                                {exportLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                                                PDF
                                            </Button>
                                        </CardFooter>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center">
                                                <Calendar className="h-5 w-5 mr-2 text-amber-500" />
                                                Financial Transactions Report
                                            </CardTitle>
                                            <CardDescription>
                                                Detailed financial transactions related to AIP
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-2">
                                            <p className="text-sm text-muted-foreground">
                                                Includes all financial transactions with dates, amounts, and references.
                                            </p>
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleExportCSV("transactions")}
                                                disabled={exportLoading || !selectedFiscalYear}
                                            >
                                                {exportLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                                                CSV
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handleExportPDF("transactions")}
                                                disabled={exportLoading || !selectedFiscalYear}
                                            >
                                                {exportLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                                                PDF
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 