"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Plus, RefreshCw, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface FiscalYear {
    id: string;
    year: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function FiscalYearsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        // Fetch fiscal years data
        if (status === "authenticated") {
            fetchFiscalYears();
        }
    }, [status]);

    const fetchFiscalYears = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/finance/fiscal-years");

            if (!response.ok) {
                // If we get a 503, database tables aren't ready yet
                if (response.status === 503) {
                    setError("Financial module database tables not yet created. Please run migrations.");
                    return;
                }
                throw new Error("Failed to fetch fiscal years");
            }

            const data = await response.json();
            setFiscalYears(data);
        } catch (err) {
            console.error("Error fetching fiscal years:", err);
            setError("Failed to load fiscal years. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const setFiscalYearActive = async (id: string) => {
        try {
            const response = await fetch(`/api/finance/fiscal-years/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isActive: true }),
            });

            if (!response.ok) {
                throw new Error("Failed to update fiscal year");
            }

            // Refresh the fiscal years list
            fetchFiscalYears();
        } catch (err) {
            console.error("Error updating fiscal year:", err);
            setError("Failed to set fiscal year as active. Please try again later.");
        }
    };

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
                    <h1 className="text-3xl font-bold">Fiscal Years</h1>
                    <p className="text-muted-foreground">
                        Manage fiscal years for budgeting and financial reporting
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={fetchFiscalYears}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button
                        onClick={() => router.push("/dashboard/finance/fiscal-years/new")}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Fiscal Year
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Fiscal Years</CardTitle>
                    <CardDescription>
                        A list of all fiscal years in the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : fiscalYears.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fiscalYears.map((fiscalYear) => (
                                    <TableRow key={fiscalYear.id}>
                                        <TableCell className="font-medium">{fiscalYear.year}</TableCell>
                                        <TableCell>{new Date(fiscalYear.startDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(fiscalYear.endDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {fiscalYear.isActive ? (
                                                <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => router.push(`/dashboard/finance/fiscal-years/${fiscalYear.id}`)}
                                                >
                                                    View
                                                </Button>
                                                {!fiscalYear.isActive && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setFiscalYearActive(fiscalYear.id)}
                                                    >
                                                        Set Active
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-10">
                            <Calendar className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                            <h3 className="text-lg font-medium mb-1">No Fiscal Years Found</h3>
                            <p className="text-muted-foreground mb-4">
                                Get started by creating your first fiscal year.
                            </p>
                            <Button
                                onClick={() => router.push("/dashboard/finance/fiscal-years/new")}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Fiscal Year
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 