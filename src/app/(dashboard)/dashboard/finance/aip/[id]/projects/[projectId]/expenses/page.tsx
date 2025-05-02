"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { format } from "date-fns";
import {
    ArrowLeft,
    Plus,
    Receipt,
    Calendar,
    Loader2,
    PenLine,
    Trash2,
    AlertCircle,
    DollarSign,
    ReceiptText,
    ArrowUpDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

// Define interfaces
interface Expense {
    id: string;
    amount: number;
    description: string;
    date: string;
    reference: string | null;
    transactionId: string | null;
    transaction: {
        id: string;
        referenceNumber: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

interface Project {
    id: string;
    aipId: string;
    title: string;
    status: string;
    totalCost: number;
    progress: number;
    aip: {
        title: string;
    };
}

export default function ProjectExpensesPage() {
    const params = useParams();
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();

    // Extract IDs from params
    const aipId = params.id as string;
    const projectId = params.projectId as string;

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [isEditingExpense, setIsEditingExpense] = useState<string | null>(null);
    const [isDeletingExpense, setIsDeletingExpense] = useState<string | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        amount: "",
        description: "",
        date: "",
        reference: "",
    });

    // Role-based permissions
    const hasEditPermission = session?.user?.role && ["TREASURER", "CAPTAIN", "SUPER_ADMIN"].includes(session.user.role);

    // Fetch project data
    const fetchProjectData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/finance/aip/projects/${projectId}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to fetch project");
            }

            const data = await response.json();
            setProject(data);
        } catch (err: any) {
            console.error("Error fetching project:", err);
            setError(err.message || "Failed to load project data");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    // Fetch expenses
    const fetchExpenses = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/finance/aip/projects/${projectId}/expenses`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to fetch expenses");
            }

            const data = await response.json();
            setExpenses(data);
        } catch (err: any) {
            console.error("Error fetching expenses:", err);
            setError(err.message || "Failed to load expense data");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    // Redirect if unauthenticated
    useEffect(() => {
        if (sessionStatus === "unauthenticated") {
            router.push("/login");
        }
    }, [sessionStatus, router]);

    // Fetch data
    useEffect(() => {
        if (sessionStatus === "authenticated") {
            fetchProjectData();
            fetchExpenses();
        }
    }, [sessionStatus, fetchProjectData, fetchExpenses]);

    // Format date
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "PPP");
    };

    // Handle form change
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            amount: "",
            description: "",
            date: "",
            reference: "",
        });
    };

    // Close add dialog
    const closeAddDialog = () => {
        setIsAddingExpense(false);
        resetForm();
    };

    // Open edit dialog
    const openEditDialog = (expense: Expense) => {
        setIsEditingExpense(expense.id);
        setFormData({
            amount: expense.amount.toString(),
            description: expense.description,
            date: expense.date.split("T")[0], // YYYY-MM-DD format
            reference: expense.reference || "",
        });
    };

    // Close edit dialog
    const closeEditDialog = () => {
        setIsEditingExpense(null);
        resetForm();
    };

    // Create expense
    const createExpense = async () => {
        try {
            setSubmitLoading(true);
            const response = await fetch(`/api/finance/aip/projects/${projectId}/expenses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create expense");
            }

            await fetchExpenses();
            await fetchProjectData();
            closeAddDialog();
        } catch (err: any) {
            console.error("Error creating expense:", err);
            setError(err.message || "Failed to create expense");
        } finally {
            setSubmitLoading(false);
        }
    };

    // Update expense
    const updateExpense = async () => {
        if (!isEditingExpense) return;

        try {
            setSubmitLoading(true);
            const response = await fetch(`/api/finance/aip/projects/${projectId}/expenses/${isEditingExpense}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update expense");
            }

            await fetchExpenses();
            await fetchProjectData();
            closeEditDialog();
        } catch (err: any) {
            console.error("Error updating expense:", err);
            setError(err.message || "Failed to update expense");
        } finally {
            setSubmitLoading(false);
        }
    };

    // Delete expense
    const deleteExpense = async () => {
        if (!isDeletingExpense) return;

        try {
            setSubmitLoading(true);
            const response = await fetch(`/api/finance/aip/projects/${projectId}/expenses/${isDeletingExpense}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to delete expense");
            }

            await fetchExpenses();
            await fetchProjectData();
            setIsDeletingExpense(null);
        } catch (err: any) {
            console.error("Error deleting expense:", err);
            setError(err.message || "Failed to delete expense");
        } finally {
            setSubmitLoading(false);
        }
    };

    // Calculate budget statistics
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const budgetRemaining = project ? project.totalCost - totalExpenses : 0;
    const budgetUtilization = project && project.totalCost > 0
        ? Math.min(Math.round((totalExpenses / project.totalCost) * 100), 100)
        : 0;

    if (loading && !project) {
        return (
            <div className="container p-6">
                <div className="flex items-center mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        asChild
                    >
                        <Link href={`/dashboard/finance/aip/${aipId}/projects/${projectId}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Project
                        </Link>
                    </Button>
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="h-[100px]" />
                        <Skeleton className="h-[100px]" />
                        <Skeleton className="h-[100px]" />
                    </div>
                    <Skeleton className="h-[400px]" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container p-6">
                <div className="flex items-center mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        asChild
                    >
                        <Link href={`/dashboard/finance/aip/${aipId}/projects/${projectId}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Project
                        </Link>
                    </Button>
                </div>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="container p-6">
                <div className="flex items-center mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        asChild
                    >
                        <Link href={`/dashboard/finance/aip/${aipId}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to AIP
                        </Link>
                    </Button>
                </div>
                <Alert>
                    <AlertTitle>Project Not Found</AlertTitle>
                    <AlertDescription>
                        The requested project could not be found.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container p-6">
            {/* Top navigation */}
            <div className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mr-2"
                    asChild
                >
                    <Link href={`/dashboard/finance/aip/${aipId}/projects/${projectId}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Project
                    </Link>
                </Button>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold">Project Expenses</h1>
                    <p className="text-muted-foreground">
                        {project.title} - {project.aip.title}
                    </p>
                </div>

                {hasEditPermission && (
                    <Button
                        onClick={() => setIsAddingExpense(true)}
                        className="md:ml-auto mt-4 md:mt-0"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Expense
                    </Button>
                )}
            </div>

            {/* Budget summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                            Total Budget
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(project.totalCost)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                            <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
                            Total Expenses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                            <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                            Budget Remaining
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-2xl font-bold ${budgetRemaining < 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {formatCurrency(budgetRemaining)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Budget utilization progress */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="font-medium">Budget Utilization</span>
                            <Badge variant="outline">{budgetUtilization}%</Badge>
                        </div>
                        <Progress value={budgetUtilization} className="h-2 w-full" />
                    </div>
                </CardContent>
            </Card>

            {/* Expenses table */}
            <Card>
                <CardHeader>
                    <CardTitle>Expense Records</CardTitle>
                    <CardDescription>
                        All expenses recorded for this project
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {expenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10">
                            <ReceiptText className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-lg font-medium">No Expenses Found</h3>
                            <p className="text-muted-foreground text-center max-w-md mt-1">
                                Start recording expenses to track the financial progress of this project.
                            </p>
                            {hasEditPermission && (
                                <Button
                                    onClick={() => setIsAddingExpense(true)}
                                    className="mt-4"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add First Expense
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        {hasEditPermission && <TableHead className="text-right">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses.map((expense) => (
                                        <TableRow key={expense.id}>
                                            <TableCell>{formatDate(expense.date)}</TableCell>
                                            <TableCell>{expense.description}</TableCell>
                                            <TableCell>
                                                {expense.transaction ? (
                                                    <Badge variant="outline" className="font-mono">
                                                        {expense.transaction.referenceNumber}
                                                    </Badge>
                                                ) : expense.reference ? (
                                                    expense.reference
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(expense.amount)}
                                            </TableCell>
                                            {hasEditPermission && (
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditDialog(expense)}
                                                            disabled={!!expense.transactionId}
                                                        >
                                                            <PenLine className="h-4 w-4" />
                                                            <span className="sr-only">Edit</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => setIsDeletingExpense(expense.id)}
                                                            disabled={!!expense.transactionId}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Expense Dialog */}
            <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Expense</DialogTitle>
                        <DialogDescription>
                            Record a new expense for this project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (₱)</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="What was this expense for?"
                                value={formData.description}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reference">Reference (Optional)</Label>
                            <Input
                                id="reference"
                                name="reference"
                                placeholder="Invoice/Receipt number"
                                value={formData.reference}
                                onChange={handleFormChange}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeAddDialog} disabled={submitLoading}>
                            Cancel
                        </Button>
                        <Button onClick={createExpense} disabled={submitLoading}>
                            {submitLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Expense"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Expense Dialog */}
            <Dialog open={!!isEditingExpense} onOpenChange={(open) => !open && closeEditDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Expense</DialogTitle>
                        <DialogDescription>
                            Update expense details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-amount">Amount (₱)</Label>
                            <Input
                                id="edit-amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-date">Date</Label>
                            <Input
                                id="edit-date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-reference">Reference (Optional)</Label>
                            <Input
                                id="edit-reference"
                                name="reference"
                                value={formData.reference}
                                onChange={handleFormChange}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeEditDialog} disabled={submitLoading}>
                            Cancel
                        </Button>
                        <Button onClick={updateExpense} disabled={submitLoading}>
                            {submitLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Expense"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!isDeletingExpense} onOpenChange={(open) => !open && setIsDeletingExpense(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this expense record.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteExpense}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={submitLoading}
                        >
                            {submitLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Expense"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 