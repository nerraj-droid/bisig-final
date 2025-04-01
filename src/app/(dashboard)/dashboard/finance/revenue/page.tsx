"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { PlusCircle, FileDown, Filter, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

// Types
type Transaction = {
    id: number;
    type: "REVENUE" | "EXPENSE" | "TRANSFER";
    referenceNumber: string;
    date: string;
    amount: number;
    description: string;
    status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "VOIDED";
    createdAt: string;
    updatedAt: string;
    resident?: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
    household?: {
        id: string;
        householdCode: string;
    } | null;
    budget?: {
        id: number;
        category: {
            id: number;
            code: string;
            name: string;
        };
    } | null;
};

type PaginationData = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export default function RevenuePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchTransactions = async (page = 1, status = "all") => {
        setIsLoading(true);
        setError(null);

        try {
            // Build query params
            const params = new URLSearchParams();
            params.append("type", "REVENUE");
            params.append("page", page.toString());
            params.append("limit", "10");

            if (status !== "all") {
                params.append("status", status);
            }

            // Fetch transactions
            const response = await fetch(`/api/finance/transactions?${params.toString()}`);

            if (!response.ok) {
                throw new Error("Failed to fetch revenue transactions");
            }

            const data = await response.json();
            setTransactions(data.transactions);
            setPagination(data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            console.error("Error fetching transactions:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchTransactions(pagination.page, filterStatus);
        }
    }, [session, pagination.page, filterStatus]);

    const handleStatusChange = (value: string) => {
        setFilterStatus(value);
        // Reset to first page when changing filters
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement search functionality
        console.log("Searching for:", searchQuery);
        // Reset to first page when searching
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleRefresh = () => {
        fetchTransactions(pagination.page, filterStatus);
    };

    const handlePageChange = (newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!session) {
        router.push("/login");
        return null;
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Revenue Management</h1>
                    <p className="text-muted-foreground">
                        Record and manage revenue transactions
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleRefresh}>
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                    <Button size="sm" className="h-8 gap-1" asChild>
                        <Link href="/dashboard/finance/revenue/new">
                            <PlusCircle className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">New Revenue</span>
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                        <FileDown className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Revenue Transactions</CardTitle>
                    <CardDescription>
                        View and manage your revenue transactions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Select value={filterStatus} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-36 h-8">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                    <SelectItem value="VOIDED">Voided</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                <Filter className="h-3.5 w-3.5" />
                                <span>More Filters</span>
                            </Button>
                        </div>

                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <Input
                                type="search"
                                placeholder="Search reference number..."
                                className="h-8 w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Button type="submit" size="sm" className="h-8">
                                Search
                            </Button>
                        </form>
                    </div>

                    {error ? (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <h3 className="mt-4 text-lg font-semibold">No Revenue Transactions</h3>
                            <p className="mt-2 text-sm text-muted-foreground max-w-md">
                                There are no revenue transactions to display. Start recording your barangay revenue by creating a new transaction.
                            </p>
                            <Button className="mt-4" size="sm" asChild>
                                <Link href="/dashboard/finance/revenue/new">Create New Revenue</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="border-b bg-muted/50">
                                        <tr>
                                            <th className="h-10 px-4 text-left font-medium">Reference</th>
                                            <th className="h-10 px-4 text-left font-medium">Date</th>
                                            <th className="h-10 px-4 text-left font-medium">Description</th>
                                            <th className="h-10 px-4 text-left font-medium">Source</th>
                                            <th className="h-10 px-4 text-left font-medium">Category</th>
                                            <th className="h-10 px-4 text-right font-medium">Amount</th>
                                            <th className="h-10 px-4 text-left font-medium">Status</th>
                                            <th className="h-10 px-4 text-left font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((transaction) => (
                                            <tr key={transaction.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle font-medium">
                                                    {transaction.referenceNumber}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    {format(new Date(transaction.date), "MMM d, yyyy")}
                                                </td>
                                                <td className="p-4 align-middle max-w-xs truncate">
                                                    {transaction.description}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    {transaction.resident
                                                        ? `${transaction.resident.firstName} ${transaction.resident.lastName}`
                                                        : transaction.household
                                                            ? `Household ${transaction.household.householdCode}`
                                                            : "General"}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    {transaction.budget?.category
                                                        ? `${transaction.budget.category.code} - ${transaction.budget.category.name}`
                                                        : "Uncategorized"}
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    ₱{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${transaction.status === "APPROVED"
                                                        ? "bg-green-100 text-green-800"
                                                        : transaction.status === "PENDING"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : transaction.status === "REJECTED"
                                                                ? "bg-red-100 text-red-800"
                                                                : transaction.status === "VOIDED"
                                                                    ? "bg-gray-100 text-gray-800"
                                                                    : "bg-blue-100 text-blue-800"
                                                        }`}>
                                                        {transaction.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/dashboard/finance/revenue/${transaction.id}`}>
                                                            View
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-4 py-2 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Showing {Math.min(((pagination.page - 1) * pagination.limit) + 1, pagination.total)} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                    >
                                        Previous
                                    </Button>
                                    {Array.from({ length: pagination.totalPages }, (_, pageIndex) => (
                                        <Button
                                            key={pageIndex}
                                            variant={pagination.page === pageIndex + 1 ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageIndex + 1)}
                                            className="w-8"
                                        >
                                            {pageIndex + 1}
                                        </Button>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 