"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, FileText, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function FinanceDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeFiscalYear, setActiveFiscalYear] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        // Fetch active fiscal year data
        if (status === "authenticated") {
            const fetchActiveFiscalYear = async () => {
                try {
                    setLoading(true);
                    const response = await fetch("/api/finance/fiscal-years?isActive=true");

                    if (!response.ok) {
                        // If we get a 503, database tables aren't ready yet
                        if (response.status === 503) {
                            setError("Financial module database tables not yet created. Please run migrations.");
                            return;
                        }
                        throw new Error("Failed to fetch fiscal year data");
                    }

                    const data = await response.json();
                    if (data && data.length > 0) {
                        setActiveFiscalYear(data[0]);
                    }
                } catch (err) {
                    console.error("Error fetching fiscal year:", err);
                    setError("Failed to load financial data. Please try again later.");
                } finally {
                    setLoading(false);
                }
            };

            fetchActiveFiscalYear();
        }
    }, [status]);

    // Role-based access control
    const canAccessFinancialModule = session?.user?.role && ["TREASURER", "CAPTAIN", "SUPER_ADMIN"].includes(session.user.role);

    if (status === "loading") {
        return <div className="flex items-center justify-center h-96"><Skeleton className="w-full h-96" /></div>;
    }

    if (!canAccessFinancialModule) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have permission to access the Financial Management module.
                        Please contact an administrator if you believe this is an error.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Financial Management Dashboard</h1>
                    <p className="text-muted-foreground">
                        {activeFiscalYear
                            ? `Active Fiscal Year: ${activeFiscalYear.year} (${new Date(activeFiscalYear.startDate).toLocaleDateString()} - ${new Date(activeFiscalYear.endDate).toLocaleDateString()})`
                            : loading
                                ? "Loading fiscal year data..."
                                : "No active fiscal year set"
                        }
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/finance/fiscal-years")}
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        Manage Fiscal Years
                    </Button>
                    {!activeFiscalYear && !loading && (
                        <Button
                            onClick={() => router.push("/dashboard/finance/fiscal-years/new")}
                        >
                            Create Fiscal Year
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Main Dashboard Content */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="budget">Budget</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Financial Summary Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Budget Summary</CardTitle>
                                <CardDescription>Current fiscal year budget overview</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-5/6" />
                                    </div>
                                ) : activeFiscalYear ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Budget</span>
                                            <span className="font-medium">₱0.00</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Utilized</span>
                                            <span className="font-medium">₱0.00 (0%)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Remaining</span>
                                            <span className="font-medium">₱0.00 (0%)</span>
                                        </div>
                                        <Separator />
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.push("/dashboard/finance/budgets")}
                                        >
                                            View Budget Details
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        No active fiscal year set
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Transactions Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                                <CardDescription>Last 5 financial transactions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-3">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                ) : activeFiscalYear ? (
                                    <div className="space-y-4">
                                        <div className="text-center py-6 text-muted-foreground">
                                            No transactions recorded yet
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.push("/dashboard/finance/transactions")}
                                        >
                                            View All Transactions
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-muted-foreground">
                                        No active fiscal year set
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions Card */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                                <CardDescription>Financial management actions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => router.push("/dashboard/finance/revenue/new")}
                                        disabled={!activeFiscalYear}
                                    >
                                        <PiggyBank className="h-4 w-4 mr-2" />
                                        Record Revenue
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => router.push("/dashboard/finance/expenses/new")}
                                        disabled={!activeFiscalYear}
                                    >
                                        <Wallet className="h-4 w-4 mr-2" />
                                        Record Expense
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => router.push("/dashboard/finance/reports/financial-statements")}
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Generate Financial Statement
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => router.push("/dashboard/finance/reports/budget-utilization")}
                                    >
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Budget Utilization Report
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => router.push("/dashboard/finance/aip")}
                                    >
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Annual Investment Program
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => router.push("/dashboard/finance/suppliers")}
                                    >
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        Manage Suppliers
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Placeholder content for other tabs */}
                <TabsContent value="budget">
                    <div className="p-6 bg-card rounded-lg border">
                        <h2 className="text-2xl font-bold mb-4">Budget Management</h2>
                        <p className="text-muted-foreground mb-4">
                            Manage and track your barangay budget across different categories and programs.
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={() => router.push("/dashboard/finance/budgets")}>View Budgets</Button>
                            <Button variant="outline" onClick={() => router.push("/dashboard/finance/budget-categories")}>
                                Manage Categories
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="transactions">
                    <div className="p-6 bg-card rounded-lg border">
                        <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
                        <p className="text-muted-foreground mb-4">
                            Track all financial transactions including revenue, expenses, and transfers.
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={() => router.push("/dashboard/finance/transactions")}>All Transactions</Button>
                            <Button variant="outline" onClick={() => router.push("/dashboard/finance/revenue")}>
                                Revenue
                            </Button>
                            <Button variant="outline" onClick={() => router.push("/dashboard/finance/expenses")}>
                                Expenses
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="reports">
                    <div className="p-6 bg-card rounded-lg border">
                        <h2 className="text-2xl font-bold mb-4">Financial Reports</h2>
                        <p className="text-muted-foreground mb-4">
                            Generate comprehensive financial reports required by COA and other oversight agencies.
                        </p>
                        <div className="flex gap-2">
                            <Button onClick={() => router.push("/dashboard/finance/reports/financial-statements")}>
                                Financial Statements
                            </Button>
                            <Button variant="outline" onClick={() => router.push("/dashboard/finance/reports/budget-utilization")}>
                                Budget Utilization
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 