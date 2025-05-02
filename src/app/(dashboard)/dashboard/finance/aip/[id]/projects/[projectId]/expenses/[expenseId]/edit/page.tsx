"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import { ArrowLeft, CalendarIcon, AlertCircle, Loader2, Link2Off } from "lucide-react";

// Define interfaces
interface Project {
    id: string;
    title: string;
    projectCode: string;
    status: string;
    aip: {
        id: string;
        title: string;
        fiscalYear: {
            id: string;
            year: string;
        };
    };
}

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
        date: string;
        amount: number;
        description: string;
        status: string;
    } | null;
}

interface Transaction {
    id: string;
    referenceNumber: string;
    date: string;
    amount: number;
    description: string;
    status: string;
}

// Form validation schema
const formSchema = z.object({
    amount: z.string().refine(
        (val) => {
            const num = parseFloat(val);
            return !isNaN(num) && num > 0;
        },
        {
            message: "Amount must be a positive number",
        }
    ),
    description: z.string().min(3, { message: "Description must be at least 3 characters long" }),
    date: z.date({
        required_error: "Date is required",
    }),
    reference: z.string().optional(),
    linkToTransaction: z.boolean().default(false),
    transactionId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditExpensePage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();

    // Extract ids from params
    const aipId = params.id as string;
    const projectId = params.projectId as string;
    const expenseId = params.expenseId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [expense, setExpense] = useState<Expense | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Set up form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: "",
            description: "",
            reference: "",
            linkToTransaction: false,
        },
    });

    // Watch linkToTransaction to conditionally show/hide the transaction selector
    const linkToTransaction = form.watch("linkToTransaction");

    // Redirect if unauthenticated
    useEffect(() => {
        if (sessionStatus === "unauthenticated") {
            router.push("/login");
            return;
        }

        // Check role permissions
        if (
            sessionStatus === "authenticated" &&
            session?.user?.role &&
            !["TREASURER", "CAPTAIN", "SUPER_ADMIN"].includes(session.user.role)
        ) {
            router.push(`/dashboard/finance/aip/${aipId}/projects/${projectId}/expenses`);
        }
    }, [sessionStatus, router, session, aipId, projectId]);

    // Fetch expense, project data and available transactions
    useEffect(() => {
        if (sessionStatus === "authenticated") {
            const fetchData = async () => {
                try {
                    setLoading(true);

                    // Fetch expense data
                    const expenseResponse = await fetch(`/api/finance/aip/projects/${projectId}/expenses/${expenseId}`);
                    if (!expenseResponse.ok) {
                        throw new Error(
                            expenseResponse.status === 404
                                ? "Expense not found"
                                : "Failed to fetch expense data"
                        );
                    }
                    const expenseData = await expenseResponse.json();
                    setExpense(expenseData);

                    // Format the date for the form
                    form.setValue("amount", expenseData.amount.toString());
                    form.setValue("description", expenseData.description);
                    form.setValue("date", new Date(expenseData.date));
                    form.setValue("reference", expenseData.reference || "");
                    form.setValue("linkToTransaction", !!expenseData.transactionId);

                    if (expenseData.transactionId) {
                        form.setValue("transactionId", expenseData.transactionId);
                    }

                    // Fetch project data
                    const projectResponse = await fetch(`/api/finance/aip/projects/${projectId}`);
                    if (projectResponse.ok) {
                        const projectData = await projectResponse.json();
                        setProject(projectData);

                        // Only fetch transactions if project data is available
                        if (projectData && projectData.aip && projectData.aip.fiscalYear) {
                            // Fetch available expense transactions for the fiscal year
                            const transactionsResponse = await fetch(
                                `/api/finance/transactions?type=EXPENSE&fiscalYear=${projectData.aip.fiscalYear.id}&unassigned=true`
                            );

                            if (transactionsResponse.ok) {
                                const transactionsData = await transactionsResponse.json();
                                // Add the currently linked transaction if any
                                if (expenseData.transactionId && expenseData.transaction) {
                                    const currentTransactionExists = transactionsData.some(
                                        (t: Transaction) => t.id === expenseData.transactionId
                                    );

                                    if (!currentTransactionExists) {
                                        transactionsData.unshift(expenseData.transaction);
                                    }
                                }

                                setTransactions(transactionsData);
                            }
                        }

                        // Ensure project is in an editable state
                        if (projectData && !["PLANNED", "ONGOING"].includes(projectData.status)) {
                            setError("This project is not in an editable state");
                        }
                    }
                } catch (err: any) {
                    console.error("Error fetching data:", err);
                    setError(err.message || "Failed to load data");
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [sessionStatus, projectId, expenseId, form]);

    // Handle transaction selection
    const handleTransactionSelect = (transactionId: string) => {
        // Find the selected transaction
        const selectedTransaction = transactions.find(t => t.id === transactionId);

        if (selectedTransaction) {
            // Pre-fill form with transaction data
            form.setValue("amount", selectedTransaction.amount.toString());
            form.setValue("description", selectedTransaction.description);
            form.setValue("date", new Date(selectedTransaction.date));
            form.setValue("reference", selectedTransaction.referenceNumber);
        }
    };

    const onSubmit = async (values: FormValues) => {
        try {
            setSubmitting(true);
            setError(null);

            const expenseData = {
                ...values,
                amount: parseFloat(values.amount),
                date: values.date.toISOString(),
                // Only include transactionId if linkToTransaction is true
                transactionId: values.linkToTransaction ? values.transactionId : null,
            };

            const response = await fetch(`/api/finance/aip/projects/${projectId}/expenses/${expenseId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(expenseData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update expense");
            }

            router.push(`/dashboard/finance/aip/${aipId}/projects/${projectId}/expenses`);
        } catch (err: any) {
            console.error("Error updating expense:", err);
            setError(err.message || "Failed to update expense. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container p-6">
                <div className="flex items-center mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        asChild
                    >
                        <Link href={`/dashboard/finance/aip/${aipId}/projects/${projectId}/expenses`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Expenses
                        </Link>
                    </Button>
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        );
    }

    if (error && (!project || !expense)) {
        return (
            <div className="container p-6">
                <div className="flex items-center mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        asChild
                    >
                        <Link href={`/dashboard/finance/aip/${aipId}/projects/${projectId}/expenses`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Expenses
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

    return (
        <div className="container p-6">
            <div className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mr-2"
                    asChild
                >
                    <Link href={`/dashboard/finance/aip/${aipId}/projects/${projectId}/expenses`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Expenses
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Edit Expense</CardTitle>
                    <CardDescription>
                        {project ? `Update expense details for ${project.title} (${project.projectCode})` : "Loading project..."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Option to link to existing transaction */}
                            <FormField
                                control={form.control}
                                name="linkToTransaction"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Link to Transaction</FormLabel>
                                            <FormDescription>
                                                Connect this expense to a financial transaction
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {linkToTransaction ? (
                                <FormField
                                    control={form.control}
                                    name="transactionId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Transaction</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    handleTransactionSelect(value);
                                                }}
                                                value={field.value}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a transaction" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {transactions.length === 0 ? (
                                                        <div className="p-2 text-center text-muted-foreground">
                                                            No available transactions found
                                                        </div>
                                                    ) : (
                                                        transactions.map((transaction) => (
                                                            <SelectItem key={transaction.id} value={transaction.id}>
                                                                <div className="flex flex-col">
                                                                    <span>{transaction.referenceNumber}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {format(new Date(transaction.date), "PP")} - ₱{transaction.amount.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                This will link the expense to an existing transaction record
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Amount */}
                                        <FormField
                                            control={form.control}
                                            name="amount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Amount (₱)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="0.00"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        The amount spent for this expense
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Date */}
                                        <FormField
                                            control={form.control}
                                            name="date"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Date</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn(
                                                                        "w-full pl-3 text-left font-normal",
                                                                        !field.value && "text-muted-foreground"
                                                                    )}
                                                                >
                                                                    {field.value ? (
                                                                        format(field.value, "PPP")
                                                                    ) : (
                                                                        <span>Select date</span>
                                                                    )}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) =>
                                                                    // Disable future dates
                                                                    date > new Date()
                                                                }
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormDescription>
                                                        The date when the expense was incurred
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Reference */}
                                    <FormField
                                        control={form.control}
                                        name="reference"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Reference Number</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Invoice #12345"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Optional invoice or receipt reference number
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe what this expense was for"
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide details about this expense and its purpose
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(`/dashboard/finance/aip/${aipId}/projects/${projectId}/expenses`)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
} 