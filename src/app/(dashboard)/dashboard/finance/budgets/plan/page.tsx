"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, PieChart, Calculator, Calendar, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function BudgetPlanPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    if (status === "loading") {
        return <div className="flex justify-center items-center h-[60vh]">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading budget planning...</p>
            </div>
        </div>;
    }

    if (!session) {
        router.push("/login");
        return null;
    }

    const handleStartPlanning = () => {
        setActiveTab("revenue");
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Button variant="ghost" size="sm" asChild className="-ml-2">
                            <Link href="/dashboard/finance/budgets">
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back
                            </Link>
                        </Button>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Budget Planning</h1>
                    <p className="text-muted-foreground">
                        Create and manage annual budget plans including revenue and expense projections
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                        Save Plan
                    </Button>
                </div>
            </div>

            <Alert>
                <Calculator className="h-4 w-4" />
                <AlertTitle>Budget Planning Tool</AlertTitle>
                <AlertDescription>
                    The budget planning feature allows you to create and manage budget plans for the fiscal year. You can set revenue projections, expense allocations, and monitor budget utilization.
                </AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                    <TabsTrigger value="projections">Projections</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Budget Overview</CardTitle>
                            <CardDescription>
                                Summary of the budget plan for the fiscal year
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-muted rounded-lg flex flex-col items-center justify-center">
                                    <PieChart className="h-8 w-8 mb-2 text-primary" />
                                    <h3 className="text-xl font-bold">₱0.00</h3>
                                    <p className="text-sm text-muted-foreground">Total Budget</p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg flex flex-col items-center justify-center">
                                    <Calculator className="h-8 w-8 mb-2 text-primary" />
                                    <h3 className="text-xl font-bold">₱0.00</h3>
                                    <p className="text-sm text-muted-foreground">Projected Revenue</p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg flex flex-col items-center justify-center">
                                    <Calendar className="h-8 w-8 mb-2 text-primary" />
                                    <h3 className="text-xl font-bold">FY Not Set</h3>
                                    <p className="text-sm text-muted-foreground">Fiscal Year</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Getting Started</CardTitle>
                            <CardDescription>
                                Follow these steps to create your budget plan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                        1
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-medium">Set Fiscal Year</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Select the fiscal year for which you are creating the budget plan.
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                        2
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-medium">Define Revenue Sources</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Add expected revenue sources and projected amounts for the fiscal year.
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                        3
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-medium">Allocate Budget for Expenses</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Distribute budget to different categories and expense items based on priorities.
                                        </p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex items-start gap-4">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                        4
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-medium">Review and Finalize</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Review budget allocations, make necessary adjustments, and finalize the plan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" onClick={handleStartPlanning}>Start Budget Planning</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="revenue" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Sources</CardTitle>
                            <CardDescription>
                                Define expected income from various sources
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Revenue sources will be implemented in the next phase.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="expenses" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Expense Categories</CardTitle>
                            <CardDescription>
                                Allocate budget to expense categories
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Expense categories will be implemented in the next phase.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="projections" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Budget Projections</CardTitle>
                            <CardDescription>
                                View projected budget utilization over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Budget projections will be implemented in the next phase.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 