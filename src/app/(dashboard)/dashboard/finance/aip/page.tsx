"use client";

import { useState, useEffect } from "react";
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, FileText, Plus, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface FiscalYear {
    id: string;
    year: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

interface AIP {
    id: string;
    title: string;
    description: string | null;
    status: string;
    totalAmount: number;
    createdAt: string;
    approvedDate: string | null;
    fiscalYear: FiscalYear;
    projects: Array<{
        id: string;
        title: string;
        totalCost: number;
        status: string;
    }>;
    createdBy: {
        name: string | null;
    };
    approvedBy: {
        name: string | null;
    } | null;
}

// Status badge styling
const statusStyles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    DRAFT: { variant: "outline", label: "Draft" },
    SUBMITTED: { variant: "secondary", label: "Submitted" },
    APPROVED: { variant: "default", label: "Approved" },
    REJECTED: { variant: "destructive", label: "Rejected" },
    IMPLEMENTED: { variant: "default", label: "Implemented" },
    COMPLETED: { variant: "default", label: "Completed" },
};

export default function AIPPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [aips, setAips] = useState<AIP[]>([]);
    const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Role-based access control
    const hasCreatePermission = session?.user?.role && ["TREASURER", "CAPTAIN", "SUPER_ADMIN"].includes(session.user.role);

    useEffect(() => {
        if (sessionStatus === "unauthenticated") {
            router.push("/login");
        }
    }, [sessionStatus, router]);

    // Fetch fiscal years
    useEffect(() => {
        if (sessionStatus === "authenticated") {
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

            fetchFiscalYears();
        }
    }, [sessionStatus]);

    // Fetch AIP data
    useEffect(() => {
        if (sessionStatus === "authenticated") {
            fetchAIPData();
        }
    }, [sessionStatus, selectedFiscalYear, statusFilter]);

    const fetchAIPData = async () => {
        try {
            setLoading(true);
            setError(null);

            let url = "/api/finance/aip";
            const params = new URLSearchParams();

            if (selectedFiscalYear !== "all") {
                params.append("fiscalYearId", selectedFiscalYear);
            }

            if (statusFilter !== "all") {
                params.append("status", statusFilter);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Failed to fetch AIP data");
            }

            const data = await response.json();
            setAips(data);
        } catch (err) {
            console.error("Error fetching AIP data:", err);
            setError("Failed to load AIP data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const navigateToAIP = (id: string) => {
        router.push(`/dashboard/finance/aip/${id}`);
    };

    const filteredAIPs = aips.filter(aip =>
        aip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (aip.description && aip.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="container p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Annual Investment Program</h1>
                    <p className="text-muted-foreground">
                        Manage your barangay's investment planning and project implementation
                    </p>
                </div>
                {hasCreatePermission && (
                    <Button
                        onClick={() => router.push("/dashboard/finance/aip/new")}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Create New AIP
                    </Button>
                )}
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
                    <CardTitle>Filters</CardTitle>
                    <CardDescription>
                        Filter the AIP records by fiscal year, status, or search by title
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Label htmlFor="fiscal-year">Fiscal Year</Label>
                            <Select
                                value={selectedFiscalYear}
                                onValueChange={setSelectedFiscalYear}
                            >
                                <SelectTrigger id="fiscal-year">
                                    <SelectValue placeholder="Select Fiscal Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Fiscal Years</SelectItem>
                                    {fiscalYears.map((year) => (
                                        <SelectItem key={year.id} value={year.id}>
                                            {year.year} {year.isActive && "(Active)"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                    <SelectItem value="IMPLEMENTED">Implemented</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="search">Search</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="search"
                                    placeholder="Search by title or description"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={fetchAIPData}
                                    title="Refresh"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>AIP Records</CardTitle>
                    <CardDescription>
                        Listing of Annual Investment Programs for the barangay
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : filteredAIPs.length === 0 ? (
                        <div className="text-center py-10">
                            <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-lg font-medium">No AIP Records Found</h3>
                            <p className="text-muted-foreground">
                                {searchTerm || selectedFiscalYear !== "all" || statusFilter !== "all"
                                    ? "No records match your current filters. Try adjusting them or create a new AIP."
                                    : "Get started by creating your first Annual Investment Program."}
                            </p>
                            {hasCreatePermission && (
                                <Button
                                    className="mt-4"
                                    onClick={() => router.push("/dashboard/finance/aip/new")}
                                >
                                    Create New AIP
                                </Button>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Fiscal Year</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Projects</TableHead>
                                    <TableHead className="text-right">Total Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAIPs.map((aip) => (
                                    <TableRow
                                        key={aip.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => navigateToAIP(aip.id)}
                                    >
                                        <TableCell className="font-medium">
                                            <div>
                                                {aip.title}
                                                {aip.description && (
                                                    <p className="text-sm text-muted-foreground truncate max-w-md">
                                                        {aip.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{aip.fiscalYear.year}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusStyles[aip.status]?.variant || "outline"}>
                                                {statusStyles[aip.status]?.label || aip.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{aip.projects.length}</TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(aip.totalAmount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 