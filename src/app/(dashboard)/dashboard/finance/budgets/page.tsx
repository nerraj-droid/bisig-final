"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart3,
    FileText,
    FolderTree,
    Landmark,
    PieChart,
    Plus,
    Settings,
    Upload,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FiscalYear {
    id: string;
    year: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

interface BudgetSummary {
    totalBudget: number;
    allocatedBudget: number;
    spentBudget: number;
    allocationPercentage: number;
    utilizationPercentage: number;
}

export default function BudgetsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFiscalYear, setActiveFiscalYear] = useState<FiscalYear | null>(null);
    const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>({
        totalBudget: 0,
        allocatedBudget: 0,
        spentBudget: 0,
        allocationPercentage: 0,
        utilizationPercentage: 0
    });

    useEffect(() => {
        if (status === "authenticated") {
            fetchData();
        }
    }, [status]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch active fiscal year
            const fyResponse = await fetch('/api/finance/fiscal-years/active');
            if (!fyResponse.ok) {
                if (fyResponse.status === 404) {
                    // No active fiscal year found, not an error
                    setActiveFiscalYear(null);
                } else {
                    throw new Error('Failed to fetch active fiscal year');
                }
            } else {
                const fiscalYearData = await fyResponse.json();
                setActiveFiscalYear(fiscalYearData);

                // Fetch budget summary for active fiscal year
                if (fiscalYearData) {
                    try {
                        const budgetResponse = await fetch(`/api/finance/budgets/summary?fiscalYearId=${fiscalYearData.id}`);
                        if (budgetResponse.ok) {
                            const budgetData = await budgetResponse.json();
                            setBudgetSummary(budgetData);
                        } else {
                            console.log('Budget summary not available, using defaults');
                            // Use default values, not considered an error
                        }
                    } catch (budgetErr) {
                        console.error('Error fetching budget summary:', budgetErr);
                        // Continue with default values, don't set error
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return <div className="flex justify-center items-center h-[60vh]">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading budget information...</p>
            </div>
        </div>;
    }

    if (!session) {
        router.push("/login");
        return null;
    }

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMMM d, yyyy');
        } catch (e) {
            return 'Invalid date';
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Budget Management</h1>
                <p className="text-muted-foreground">
                    Plan, allocate and monitor your financial resources
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!activeFiscalYear && !loading && !error && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Active Fiscal Year</AlertTitle>
                    <AlertDescription>
                        There is no active fiscal year set. Please create or activate a fiscal year to manage budgets.
                        <div className="mt-2">
                            <Button size="sm" asChild>
                                <Link href="/dashboard/finance/fiscal-years">Manage Fiscal Years</Link>
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {activeFiscalYear && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Fiscal Year
                            </CardTitle>
                            <Landmark className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeFiscalYear.year}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatDate(activeFiscalYear.startDate)} - {formatDate(activeFiscalYear.endDate)}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button size="sm" variant="outline" asChild>
                                <Link href="/dashboard/finance/fiscal-years">
                                    Manage Fiscal Years
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Budget
                            </CardTitle>
                            <PieChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(budgetSummary.totalBudget)}</div>
                            <div className="mt-2 space-y-2">
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrency(budgetSummary.allocatedBudget)} allocated ({budgetSummary.allocationPercentage}%)
                                </p>
                                <Progress value={budgetSummary.allocationPercentage} className="h-1.5" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button size="sm" variant="outline" asChild>
                                <Link href="/dashboard/finance/budgets/allocations">
                                    View Allocations
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Budget Utilization
                            </CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{budgetSummary.utilizationPercentage}%</div>
                            <div className="mt-2 space-y-2">
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrency(budgetSummary.spentBudget)} spent of {formatCurrency(budgetSummary.totalBudget)}
                                </p>
                                <Progress
                                    value={budgetSummary.utilizationPercentage}
                                    className="h-1.5"
                                    color={budgetSummary.utilizationPercentage > 90 ? "bg-red-500" : undefined}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button size="sm" variant="outline" asChild>
                                <Link href="/dashboard/finance/reports/budget-utilization">
                                    View Report
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/dashboard/finance/budgets/plan" className="group">
                    <Card className="group-hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Budget Planning
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Create and manage annual budget plans including revenue projections and expense allocations.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/finance/budgets/categories" className="group">
                    <Card className="group-hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FolderTree className="h-5 w-5" /> Budget Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Manage budget categories based on the Chart of Accounts standard for barangay financial management.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/finance/budgets/allocations" className="group">
                    <Card className="group-hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" /> Budget Allocations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Allocate budget amounts to specific categories and manage budget distribution.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/finance/budgets/import" className="group">
                    <Card className="group-hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5" /> Import Budget
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Import budget data from spreadsheets or previous fiscal years to save time on budget creation.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/finance/reports/budget-utilization" className="group">
                    <Card className="group-hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" /> Budget Reports
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                View budget utilization reports, variance analysis, and budget performance metrics.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </Link>

                {activeFiscalYear && (
                    <Link href={`/dashboard/finance/reports/aip?fiscalYear=${activeFiscalYear.id}`} className="group">
                        <Card className="group-hover:border-primary/50 transition-colors">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" /> AIP Reports
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>
                                    View Annual Investment Program reports, charts, and analytics for the current fiscal year.
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                )}
            </div>
        </div>
    );
} 