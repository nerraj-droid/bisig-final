"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BudgetAllocationsPage() {
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
                <h1 className="text-2xl font-bold tracking-tight">Budget Allocations</h1>
                <p className="text-muted-foreground">
                    Allocate and manage budget funds across categories
                </p>
            </div>

            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                    The budget allocations feature is currently under development.
                    Please check back later to manage your budget allocations.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>What You'll Be Able to Do</CardTitle>
                        <CardDescription>
                            Budget allocation features coming soon
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-medium">Allocate Budget Funds</h3>
                            <p className="text-sm text-muted-foreground">
                                Assign budget amounts to specific categories following your fiscal plan.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium">Track Allocation Status</h3>
                            <p className="text-sm text-muted-foreground">
                                Monitor which categories have been allocated and identify remaining unallocated funds.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium">Adjust Allocations</h3>
                            <p className="text-sm text-muted-foreground">
                                Make adjustments to budget allocations as needs change throughout the fiscal year.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Allocation Requirements</CardTitle>
                        <CardDescription>
                            Prerequisites for budget allocation
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-medium">Active Fiscal Year</h3>
                            <p className="text-sm text-muted-foreground">
                                An active fiscal year must be set up before allocating budget funds.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium">Budget Categories</h3>
                            <p className="text-sm text-muted-foreground">
                                Budget categories should be configured according to your Chart of Accounts.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium">Budget Plan</h3>
                            <p className="text-sm text-muted-foreground">
                                A budget plan with total amounts should be approved before allocating funds.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/finance/budgets")}
                >
                    Back to Budget Management
                </Button>
            </div>
        </div>
    );
} 