"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import Link from "next/link";
import {
    ArrowLeft,
    Printer,
    Download,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Ban,
    FileEdit,
    History
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

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
    supplier?: {
        id: number;
        name: string;
        contactPerson: string;
        phone: string;
        email: string;
    } | null;
    budget?: {
        id: number;
        amount: number;
        category: {
            id: number;
            code: string;
            name: string;
        };
    } | null;
    fiscalYear?: {
        id: number;
        year: number;
        isActive: boolean;
    } | null;
    receiptNumber?: string | null;
    createdBy: {
        id: number;
        name: string;
        email: string;
    };
    approvedBy?: {
        id: number;
        name: string;
        email: string;
    } | null;
    statusHistory?: {
        id: number;
        status: string;
        notes: string;
        createdAt: string;
        user: {
            id: number;
            name: string;
        };
    }[];
};

export default function ExpenseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [approvalNotes, setApprovalNotes] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [voidReason, setVoidReason] = useState("");
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [showRejectionDialog, setShowRejectionDialog] = useState(false);
    const [showVoidDialog, setShowVoidDialog] = useState(false);

    // Extract id to avoid params.id in dependency arrays
    const transactionId = params.id as string;

    // Define fetchTransaction with useCallback
    const fetchTransaction = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/finance/transactions/${transactionId}`);
            if (!response.ok) {
                throw new Error("Failed to load transaction");
            }
            const data = await response.json();
            setTransaction(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    }, [transactionId]);

    useEffect(() => {
        if (session) {
            fetchTransaction();
        }
    }, [session, fetchTransaction]);

    // Handle transaction approval
    const handleApprove = async () => {
        setActionLoading(true);

        try {
            const response = await fetch(`/api/finance/transactions/${transactionId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: "APPROVED",
                    notes: approvalNotes,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to approve transaction");
            }

            toast.success("Transaction approved successfully");
            setShowApprovalDialog(false);
            setApprovalNotes("");
            fetchTransaction();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to approve transaction");
        } finally {
            setActionLoading(false);
        }
    };

    // Handle transaction rejection
    const handleReject = async () => {
        if (!rejectionReason) {
            toast.error("Please provide a reason for rejection");
            return;
        }

        setActionLoading(true);

        try {
            const response = await fetch(`/api/finance/transactions/${transactionId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: "REJECTED",
                    notes: rejectionReason,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to reject transaction");
            }

            toast.success("Transaction rejected");
            setShowRejectionDialog(false);
            setRejectionReason("");
            fetchTransaction();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to reject transaction");
        } finally {
            setActionLoading(false);
        }
    };

    // Handle transaction void
    const handleVoid = async () => {
        if (!voidReason) {
            toast.error("Please provide a reason for voiding");
            return;
        }

        setActionLoading(true);

        try {
            const response = await fetch(`/api/finance/transactions/${transactionId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: "VOIDED",
                    notes: voidReason,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to void transaction");
            }

            toast.success("Transaction voided");
            setShowVoidDialog(false);
            setVoidReason("");
            fetchTransaction();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to void transaction");
        } finally {
            setActionLoading(false);
        }
    };

    // Generate PDF receipt
    const handlePrintReceipt = () => {
        toast.info("Generating receipt...");
        // This would be implemented to generate and download a PDF receipt
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approved</Badge>;
            case "PENDING":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
            case "REJECTED":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
            case "VOIDED":
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Voided</Badge>;
            case "DRAFT":
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Draft</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
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

    if (error) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center">
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                        <Link href="/dashboard/finance/expenses">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Expenses</span>
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

    if (!transaction) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center">
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                        <Link href="/dashboard/finance/expenses">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back to Expenses</span>
                        </Link>
                    </Button>
                </div>

                <Alert>
                    <AlertTitle>Not Found</AlertTitle>
                    <AlertDescription>Transaction not found or you don't have permission to view it.</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                        <Link href="/dashboard/finance/expenses">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back</span>
                        </Link>
                    </Button>
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Expense Details</h1>
                    <p className="text-muted-foreground">
                        View and manage expense transaction
                    </p>
                </div>
                <div className="flex gap-2">
                    {transaction.status === "PENDING" && (
                        <>
                            <Button size="sm" className="gap-1" onClick={() => setShowApprovalDialog(true)}>
                                <CheckCircle className="h-4 w-4" />
                                <span>Approve</span>
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowRejectionDialog(true)}>
                                <XCircle className="h-4 w-4" />
                                <span>Reject</span>
                            </Button>
                        </>
                    )}

                    {transaction.status !== "VOIDED" && (
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowVoidDialog(true)}>
                            <Ban className="h-4 w-4" />
                            <span>Void</span>
                        </Button>
                    )}

                    {transaction.status === "DRAFT" && (
                        <Button variant="outline" size="sm" className="gap-1" asChild>
                            <Link href={`/dashboard/finance/expenses/${transaction.id}/edit`}>
                                <FileEdit className="h-4 w-4" />
                                <span>Edit</span>
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Status & Quick Info */}
            <div className="flex flex-col md:flex-row gap-4">
                <Card className="flex-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Transaction Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <dt className="font-medium text-muted-foreground">Reference Number</dt>
                                <dd className="mt-1">{transaction.referenceNumber}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-muted-foreground">Date</dt>
                                <dd className="mt-1">{format(new Date(transaction.date), "PPP")}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-muted-foreground">Amount</dt>
                                <dd className="mt-1 text-lg font-semibold">
                                    ₱{transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-medium text-muted-foreground">Status</dt>
                                <dd className="mt-1">{getStatusBadge(transaction.status)}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-muted-foreground">Fiscal Year</dt>
                                <dd className="mt-1">{transaction.fiscalYear?.year || "Not assigned"}</dd>
                            </div>
                            <div>
                                <dt className="font-medium text-muted-foreground">Receipt Number</dt>
                                <dd className="mt-1">{transaction.receiptNumber || "Not assigned"}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Expense Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                                    <p className="mt-1 text-sm">{transaction.description}</p>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Budget Category</h4>
                                        <p className="mt-1">
                                            {transaction.budget?.category ? (
                                                <span>
                                                    {transaction.budget.category.code} - {transaction.budget.category.name}
                                                </span>
                                            ) : (
                                                "Not assigned"
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Created By</h4>
                                        <p className="mt-1">
                                            {transaction.createdBy.name} ({transaction.createdBy.email})
                                            <br />
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(transaction.createdAt), "PPP p")}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {transaction.approvedBy && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground">Approved By</h4>
                                        <p className="mt-1">
                                            {transaction.approvedBy.name} ({transaction.approvedBy.email})
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Supplier Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {transaction.supplier ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Supplier Name</h4>
                                            <p className="mt-1">{transaction.supplier.name}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Contact Person</h4>
                                            <p className="mt-1">{transaction.supplier.contactPerson || "Not specified"}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                                            <p className="mt-1">{transaction.supplier.phone || "Not specified"}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                                            <p className="mt-1">{transaction.supplier.email || "Not specified"}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No supplier information available.</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex flex-col md:flex-row justify-end gap-2">
                        <Button variant="outline" size="sm" className="gap-1" onClick={handlePrintReceipt}>
                            <Printer className="h-4 w-4" />
                            <span>Print Receipt</span>
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                            <FileText className="h-4 w-4" />
                            <span>Export as PDF</span>
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Status History</CardTitle>
                            <CardDescription>
                                Track changes to this transaction
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {transaction.statusHistory && transaction.statusHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {transaction.statusHistory.map((record) => (
                                        <div key={record.id} className="flex items-start gap-2 p-3 border rounded-md">
                                            <div className="mt-0.5">
                                                {record.status === "APPROVED" ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                ) : record.status === "REJECTED" ? (
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                ) : record.status === "VOIDED" ? (
                                                    <Ban className="h-5 w-5 text-gray-500" />
                                                ) : record.status === "DRAFT" ? (
                                                    <FileEdit className="h-5 w-5 text-blue-500" />
                                                ) : (
                                                    <Clock className="h-5 w-5 text-yellow-500" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <p className="font-medium">
                                                        Status changed to <span className="font-semibold">{record.status}</span>
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(new Date(record.createdAt), "PPP p")}
                                                    </p>
                                                </div>
                                                <p className="text-sm mt-1">By: {record.user.name}</p>
                                                {record.notes && (
                                                    <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                                                        {record.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <History className="h-10 w-10 text-muted-foreground opacity-50" />
                                    <h3 className="mt-4 text-lg font-semibold">No History Available</h3>
                                    <p className="mt-2 text-sm text-muted-foreground max-w-md">
                                        Status change history will appear here when updates are made to this transaction.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Approval Dialog */}
            <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Expense Transaction</DialogTitle>
                        <DialogDescription>
                            Approving this expense will authorize the payment and update budget allocations.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="approvalNotes">Approval Notes (Optional)</Label>
                            <Textarea
                                id="approvalNotes"
                                placeholder="Add any notes or comments regarding this approval"
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
                        <Button onClick={handleApprove} disabled={actionLoading}>
                            {actionLoading ? (
                                <>
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></div>
                                    Processing...
                                </>
                            ) : (
                                "Confirm Approval"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Expense Transaction</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this expense transaction.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejectionReason">Reason for Rejection <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="rejectionReason"
                                placeholder="Explain why this expense is being rejected"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={actionLoading || !rejectionReason}>
                            {actionLoading ? (
                                <>
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></div>
                                    Processing...
                                </>
                            ) : (
                                "Confirm Rejection"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Void Dialog */}
            <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Void Expense Transaction</DialogTitle>
                        <DialogDescription>
                            Voiding this transaction will permanently mark it as invalid. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="voidReason">Reason for Voiding <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="voidReason"
                                placeholder="Explain why this expense is being voided"
                                value={voidReason}
                                onChange={(e) => setVoidReason(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowVoidDialog(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleVoid} disabled={actionLoading || !voidReason}>
                            {actionLoading ? (
                                <>
                                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></div>
                                    Processing...
                                </>
                            ) : (
                                "Confirm Void"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 