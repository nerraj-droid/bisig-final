"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Download, FileText, BarChart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

interface FiscalYear {
    id: string;
    year: string;
    isActive: boolean;
}

interface AIPSummary {
    id: string;
    title: string;
    status: string;
    totalAmount: number;
    fiscalYear: string;
    projectCount: number;
    expenditureAmount: number;
    completedProjects: number;
    ongoingProjects: number;
    plannedProjects: number;
    delayedProjects: number;
    cancelledProjects: number;
}

interface SectorData {
    sector: string;
    budget: number;
    expenditure: number;
    projectCount: number;
}

interface AIPReportData {
    summary: AIPSummary | null;
    projectsByStatus: { status: string; count: number; }[];
    projectsBySector: SectorData[];
    budgetUtilization: { category: string; allocated: number; utilized: number; }[];
    expenditureTimeline: { date: string; amount: number; }[];
}

// Status styles mapping
const statusStyles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    DRAFT: { variant: "outline", label: "Draft" },
    SUBMITTED: { variant: "secondary", label: "Submitted" },
    APPROVED: { variant: "default", label: "Approved" },
    REJECTED: { variant: "destructive", label: "Rejected" },
    IMPLEMENTED: { variant: "default", label: "Implemented" },
    COMPLETED: { variant: "default", label: "Completed" },
};

// Status colors for charts
const statusColors = {
    PLANNED: "rgba(148, 163, 184, 0.7)",
    ONGOING: "rgba(59, 130, 246, 0.7)",
    COMPLETED: "rgba(34, 197, 94, 0.7)",
    DELAYED: "rgba(245, 158, 11, 0.7)",
    CANCELLED: "rgba(239, 68, 68, 0.7)",
};

export default function AIPReportsPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
    const [selectedAIP, setSelectedAIP] = useState<string>("");
    const [aips, setAIPs] = useState<{ id: string; title: string; fiscalYear: string; }[]>([]);
    const [reportData, setReportData] = useState<AIPReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("summary");

    // Chart refs for export
    const statusChartRef = useRef<any>(null);
    const sectorChartRef = useRef<any>(null);
    const budgetChartRef = useRef<any>(null);
    const timelineChartRef = useRef<any>(null);

    // Verify user is authenticated
    useEffect(() => {
        if (sessionStatus === "unauthenticated") {
            router.push("/login");
        }
    }, [sessionStatus, router]);

    // Fetch fiscal years and AIPs when component mounts
    useEffect(() => {
        if (sessionStatus === "authenticated") {
            fetchFiscalYears();
            fetchAIPs();
        }
    }, [sessionStatus]);

    // Fetch report data when AIP selection changes
    useEffect(() => {
        if (selectedAIP) {
            fetchReportData(selectedAIP);
        }
    }, [selectedAIP]);

    const fetchFiscalYears = async () => {
        try {
            const response = await fetch("/api/finance/fiscal-years");
            if (!response.ok) throw new Error("Failed to fetch fiscal years");
            const data = await response.json();
            setFiscalYears(data);
        } catch (err) {
            console.error("Error fetching fiscal years:", err);
            setError("Failed to load fiscal year data");
        }
    };

    const fetchAIPs = async () => {
        try {
            const response = await fetch("/api/finance/aip");
            if (!response.ok) throw new Error("Failed to fetch AIPs");
            const data = await response.json();

            // Format AIPs for dropdown
            const formattedAIPs = data.map((aip: any) => ({
                id: aip.id,
                title: aip.title,
                fiscalYear: aip.fiscalYear.year
            }));

            setAIPs(formattedAIPs);

            // Auto-select first AIP if available
            if (formattedAIPs.length > 0 && !selectedAIP) {
                setSelectedAIP(formattedAIPs[0].id);
            }
        } catch (err) {
            console.error("Error fetching AIPs:", err);
            setError("Failed to load AIP data");
            setLoading(false);
        }
    };

    const fetchReportData = async (aipId: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/finance/aip/${aipId}/report`);
            if (!response.ok) throw new Error("Failed to fetch report data");

            const data = await response.json();
            setReportData(data);
        } catch (err) {
            console.error("Error fetching report data:", err);
            setError("Failed to load report data");
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = async () => {
        if (!reportData?.summary) {
            toast.error("No report data available to export");
            return;
        }

        try {
            toast.info("Generating PDF report...");
            const response = await fetch(`/api/finance/aip/${selectedAIP}/report/pdf`, {
                method: 'POST'
            });

            if (!response.ok) throw new Error("Failed to generate PDF");

            // Handle PDF download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `aip-report-${reportData.summary.fiscalYear}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            toast.success("Report exported successfully");
        } catch (err) {
            console.error("PDF export error:", err);
            toast.error("Failed to export PDF report");
        }
    };

    const exportCSV = async () => {
        if (!reportData?.summary) {
            toast.error("No report data available to export");
            return;
        }

        try {
            toast.info("Generating CSV report...");
            const response = await fetch(`/api/finance/aip/${selectedAIP}/report/csv`, {
                method: 'POST'
            });

            if (!response.ok) throw new Error("Failed to generate CSV");

            // Handle CSV download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `aip-report-${reportData.summary.fiscalYear}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);

            toast.success("CSV exported successfully");
        } catch (err) {
            console.error("CSV export error:", err);
            toast.error("Failed to export CSV report");
        }
    };

    // Chart data for projects by status
    const statusChartData = {
        labels: reportData?.projectsByStatus.map(s => s.status) || [],
        datasets: [
            {
                label: 'Number of Projects',
                data: reportData?.projectsByStatus.map(s => s.count) || [],
                backgroundColor: reportData?.projectsByStatus.map(s => statusColors[s.status as keyof typeof statusColors] || "rgba(156, 163, 175, 0.7)") || [],
                borderColor: "rgba(255, 255, 255, 0.8)",
                borderWidth: 1,
            },
        ],
    };

    // Chart data for projects by sector
    const sectorChartData = {
        labels: reportData?.projectsBySector.map(s => s.sector) || [],
        datasets: [
            {
                label: 'Budget Allocation',
                data: reportData?.projectsBySector.map(s => s.budget) || [],
                backgroundColor: [
                    "rgba(59, 130, 246, 0.6)",
                    "rgba(16, 185, 129, 0.6)",
                    "rgba(245, 158, 11, 0.6)",
                    "rgba(99, 102, 241, 0.6)",
                    "rgba(236, 72, 153, 0.6)",
                    "rgba(124, 58, 237, 0.6)",
                ],
            },
        ],
    };

    // Chart data for budget utilization
    const budgetChartData = {
        labels: reportData?.budgetUtilization.map(b => b.category) || [],
        datasets: [
            {
                label: 'Allocated',
                data: reportData?.budgetUtilization.map(b => b.allocated) || [],
                backgroundColor: "rgba(59, 130, 246, 0.6)",
            },
            {
                label: 'Utilized',
                data: reportData?.budgetUtilization.map(b => b.utilized) || [],
                backgroundColor: "rgba(16, 185, 129, 0.6)",
            },
        ],
    };

    // Chart data for expenditure timeline
    const timelineChartData = {
        labels: reportData?.expenditureTimeline.map(e => e.date) || [],
        datasets: [
            {
                label: 'Expenditure Amount',
                data: reportData?.expenditureTimeline.map(e => e.amount) || [],
                borderColor: "rgba(59, 130, 246, 1)",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                tension: 0.3,
                fill: true,
            },
        ],
    };

    // Chart options for standardizing chart appearance
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== undefined) {
                            label += new Intl.NumberFormat('en-PH', {
                                style: 'currency',
                                currency: 'PHP'
                            }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
    };

    // Calculate progress percentage
    const calculateProgress = () => {
        if (!reportData?.summary) return 0;
        const { totalAmount, expenditureAmount } = reportData.summary;
        return totalAmount > 0 ? Math.min(Math.round((expenditureAmount / totalAmount) * 100), 100) : 0;
    };

    return (
        <div className="container p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">AIP Reports & Analytics</h1>
                    <p className="text-muted-foreground">
                        Generate detailed reports and visualizations for Annual Investment Programs
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={exportCSV}
                        disabled={!reportData?.summary}
                    >
                        <FileText className="h-4 w-4" />
                        Export CSV
                    </Button>
                    <Button
                        className="flex items-center gap-2"
                        onClick={exportPDF}
                        disabled={!reportData?.summary}
                    >
                        <Download className="h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card className="mb-6">
                <CardHeader className="pb-3">
                    <CardTitle>Select Report</CardTitle>
                    <CardDescription>
                        Choose an Annual Investment Program to generate reports
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Label htmlFor="aip">Annual Investment Program</Label>
                            <Select
                                value={selectedAIP}
                                onValueChange={setSelectedAIP}
                                disabled={aips.length === 0}
                            >
                                <SelectTrigger id="aip">
                                    <SelectValue placeholder="Select AIP" />
                                </SelectTrigger>
                                <SelectContent>
                                    {aips.map((aip) => (
                                        <SelectItem key={aip.id} value={aip.id}>
                                            {aip.title} ({aip.fiscalYear})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-5 w-40 mb-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-16 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : reportData?.summary ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Total Budget</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {formatCurrency(reportData.summary.totalAmount)}
                                </div>
                                <p className="text-muted-foreground">
                                    Fiscal Year {reportData.summary.fiscalYear}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Budget Utilization</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {formatCurrency(reportData.summary.expenditureAmount)}
                                </div>
                                <p className="text-muted-foreground">
                                    {calculateProgress()}% of total budget used
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Projects</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {reportData.summary.projectCount}
                                </div>
                                <p className="text-muted-foreground">
                                    {reportData.summary.completedProjects} completed,
                                    {' '}{reportData.summary.ongoingProjects} ongoing
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center">
                                    <Badge
                                        variant={statusStyles[reportData.summary.status]?.variant || "outline"}
                                    >
                                        {statusStyles[reportData.summary.status]?.label || reportData.summary.status}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground mt-2">
                                    {reportData.summary.title}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="summary">Summary</TabsTrigger>
                            <TabsTrigger value="projects">Projects</TabsTrigger>
                            <TabsTrigger value="budget">Budget</TabsTrigger>
                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                        </TabsList>

                        <TabsContent value="summary">
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>AIP Summary</CardTitle>
                                        <CardDescription>
                                            {reportData.summary.title} - FY {reportData.summary.fiscalYear}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Budget</span>
                                                <span className="font-medium">{formatCurrency(reportData.summary.totalAmount)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Expenditure</span>
                                                <span className="font-medium">{formatCurrency(reportData.summary.expenditureAmount)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Remaining Budget</span>
                                                <span className="font-medium">{formatCurrency(reportData.summary.totalAmount - reportData.summary.expenditureAmount)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Projects</span>
                                                <span className="font-medium">{reportData.summary.projectCount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Completed Projects</span>
                                                <span className="font-medium">{reportData.summary.completedProjects}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Ongoing Projects</span>
                                                <span className="font-medium">{reportData.summary.ongoingProjects}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Planned Projects</span>
                                                <span className="font-medium">{reportData.summary.plannedProjects}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Projects by Status</CardTitle>
                                        <CardDescription>
                                            Distribution of projects by current status
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="aspect-square">
                                            <Pie
                                                ref={statusChartRef}
                                                data={statusChartData}
                                                options={{
                                                    ...chartOptions,
                                                    plugins: {
                                                        ...chartOptions.plugins,
                                                        tooltip: {
                                                            callbacks: {
                                                                label: function (context) {
                                                                    const label = context.label || '';
                                                                    const value = context.raw as number;
                                                                    return `${label}: ${value} projects`;
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="projects">
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Projects by Sector</CardTitle>
                                        <CardDescription>
                                            Budget allocation across different sectors
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-80">
                                        <Pie
                                            ref={sectorChartRef}
                                            data={sectorChartData}
                                            options={{
                                                ...chartOptions,
                                                maintainAspectRatio: false,
                                            }}
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Project Distribution</CardTitle>
                                        <CardDescription>
                                            Number of projects by sector
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-80">
                                        <Bar
                                            data={{
                                                labels: reportData.projectsBySector.map(s => s.sector),
                                                datasets: [
                                                    {
                                                        label: 'Number of Projects',
                                                        data: reportData.projectsBySector.map(s => s.projectCount),
                                                        backgroundColor: "rgba(59, 130, 246, 0.7)",
                                                    }
                                                ]
                                            }}
                                            options={{
                                                ...chartOptions,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    ...chartOptions.plugins,
                                                    tooltip: {
                                                        callbacks: {
                                                            label: function (context) {
                                                                const label = context.dataset.label || '';
                                                                const value = context.raw as number;
                                                                return `${label}: ${value}`;
                                                            }
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="budget">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Budget Utilization by Category</CardTitle>
                                    <CardDescription>
                                        Allocated vs utilized budget by category
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="h-96">
                                    <Bar
                                        ref={budgetChartRef}
                                        data={budgetChartData}
                                        options={{
                                            ...chartOptions,
                                            maintainAspectRatio: false,
                                            scales: {
                                                x: {
                                                    stacked: false,
                                                    title: {
                                                        display: true,
                                                        text: 'Budget Categories'
                                                    }
                                                },
                                                y: {
                                                    stacked: false,
                                                    title: {
                                                        display: true,
                                                        text: 'Amount (PHP)'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="timeline">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Expenditure Timeline</CardTitle>
                                    <CardDescription>
                                        Monthly expenditure for the AIP
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="h-96">
                                    <Line
                                        ref={timelineChartRef}
                                        data={timelineChartData}
                                        options={{
                                            ...chartOptions,
                                            maintainAspectRatio: false,
                                            scales: {
                                                x: {
                                                    title: {
                                                        display: true,
                                                        text: 'Month'
                                                    }
                                                },
                                                y: {
                                                    title: {
                                                        display: true,
                                                        text: 'Expenditure (PHP)'
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </>
            ) : (
                !loading && (
                    <div className="text-center p-12 bg-muted rounded-lg">
                        <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No Report Data</h3>
                        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                            Select an Annual Investment Program to generate reports and analytics.
                        </p>
                    </div>
                )
            )}
        </div>
    );
} 