"use client";

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
    Upload
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";

export default function BudgetsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>;
    }

    if (!session) {
        router.push("/login");
        return null;
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Budget Management</h1>
                <p className="text-muted-foreground">
                    Plan, allocate and monitor your financial resources
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Fiscal Year
                        </CardTitle>
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2025-2026</div>
                        <p className="text-xs text-muted-foreground">
                            July 1, 2025 - June 30, 2026
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
                        <div className="text-2xl font-bold">₱0.00</div>
                        <p className="text-xs text-muted-foreground">
                            ₱0.00 allocated (0%)
                        </p>
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
                        <div className="text-2xl font-bold">0%</div>
                        <p className="text-xs text-muted-foreground">
                            ₱0.00 spent of ₱0.00
                        </p>
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
            </div>
        </div>
    );
} 