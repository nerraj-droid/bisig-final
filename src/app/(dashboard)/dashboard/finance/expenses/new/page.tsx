"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
    referenceNumber: z.string().min(3, "Reference number is required"),
    date: z.date({
        required_error: "Transaction date is required",
    }),
    amount: z.string().min(1, "Amount is required").refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        "Amount must be greater than 0"
    ),
    description: z.string().min(5, "Description must be at least 5 characters"),
    fiscalYearId: z.string().min(1, "Fiscal year is required"),
    budgetId: z.string().min(1, "Budget category is required"),
    supplierId: z.string().optional(),
    isAuthorized: z.boolean().default(false).optional(),
    receiptNumber: z.string().optional(),
    attachments: z.any().optional(),
    status: z.enum(["DRAFT", "PENDING"]).default("DRAFT"),
});

type FormValues = z.infer<typeof formSchema>;

type FiscalYear = {
    id: number;
    year: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
};

type Budget = {
    id: number;
    fiscalYearId: number;
    categoryId: number;
    amount: number;
    spent: number;
    available: number;
    category: {
        id: number;
        code: string;
        name: string;
    };
};

type Supplier = {
    id: number;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
};

export default function NewExpensePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [activeFiscalYear, setActiveFiscalYear] = useState<FiscalYear | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingError, setLoadingError] = useState<string | null>(null);

    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            referenceNumber: "",
            date: new Date(),
            amount: "",
            description: "",
            fiscalYearId: "",
            budgetId: "",
            supplierId: "",
            isAuthorized: false,
            receiptNumber: "",
            status: "DRAFT",
        },
    });

    // Fetch fiscal years
    const fetchFiscalYears = async () => {
        try {
            const response = await fetch("/api/finance/fiscal-years");
            if (!response.ok) {
                throw new Error("Failed to fetch fiscal years");
            }
            const data = await response.json();
            setFiscalYears(data);

            // Set active fiscal year as default
            const active = data.find((fy: FiscalYear) => fy.isActive);
            if (active) {
                setActiveFiscalYear(active);
                form.setValue("fiscalYearId", active.id.toString());
                fetchBudgets(active.id);
            }
        } catch (error) {
            console.error("Error fetching fiscal years:", error);
            setLoadingError("Failed to load fiscal years. Please try again.");
        }
    };

    // Fetch budgets based on selected fiscal year
    const fetchBudgets = async (fiscalYearId: number) => {
        try {
            const response = await fetch(`/api/finance/budgets?fiscalYearId=${fiscalYearId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch budgets");
            }
            const data = await response.json();
            setBudgets(data);
        } catch (error) {
            console.error("Error fetching budgets:", error);
            setLoadingError("Failed to load budget categories. Please try again.");
        }
    };

    // Fetch suppliers
    const fetchSuppliers = async () => {
        try {
            const response = await fetch("/api/finance/suppliers");
            if (!response.ok) {
                throw new Error("Failed to fetch suppliers");
            }
            const data = await response.json();
            setSuppliers(data);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            setLoadingError("Failed to load suppliers. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        if (session) {
            Promise.all([
                fetchFiscalYears(),
                fetchSuppliers(),
            ]);
        }
    }, [session]);

    // Watch for fiscal year changes
    const watchFiscalYearId = form.watch("fiscalYearId");
    useEffect(() => {
        if (watchFiscalYearId) {
            fetchBudgets(parseInt(watchFiscalYearId));
        }
    }, [watchFiscalYearId]);

    // Handle form submission
    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);

        try {
            // Prepare transaction data
            const transactionData = {
                ...data,
                type: "EXPENSE",
                amount: parseFloat(data.amount),
                fiscalYearId: parseInt(data.fiscalYearId),
                budgetId: parseInt(data.budgetId),
                supplierId: data.supplierId && data.supplierId !== "none" ? parseInt(data.supplierId) : null,
            };

            // Send data to API
            const response = await fetch("/api/finance/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(transactionData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create expense transaction");
            }

            const result = await response.json();

            toast.success("Expense transaction created successfully");

            // Redirect to the expense listing page
            router.push("/dashboard/finance/expenses");
        } catch (error) {
            console.error("Error creating expense transaction:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create expense transaction");
        } finally {
            setIsSubmitting(false);
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

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        asChild
                    >
                        <Link href="/dashboard/finance/expenses">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back</span>
                        </Link>
                    </Button>
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create New Expense</h1>
                    <p className="text-muted-foreground">
                        Record a new expense transaction
                    </p>
                </div>
                <div className="w-[100px]"></div>
            </div>

            {loadingError && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{loadingError}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Expense Transaction Details</CardTitle>
                    <CardDescription>
                        Enter the expense transaction information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Basic Information</h3>
                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="referenceNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Reference Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="EXP-2023-001" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Unique identifier for this expense
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Transaction Date</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant={"outline"}
                                                                className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""
                                                                    }`}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP")
                                                                ) : (
                                                                    <span>Pick a date</span>
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
                                                                date > new Date() || date < new Date("1900-01-01")
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <FormDescription>
                                                    When the expense occurred
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount (₱)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0.01" step="0.01" placeholder="0.00" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Total amount of the expense
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="DRAFT">Draft</SelectItem>
                                                        <SelectItem value="PENDING">Pending Approval</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Current status of this expense transaction
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Provide details about this expense"
                                                    className="min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Detailed description of the expense
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Budget Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Budget Information</h3>
                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fiscalYearId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fiscal Year</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select fiscal year" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {fiscalYears.map((fiscalYear) => (
                                                            <SelectItem
                                                                key={fiscalYear.id}
                                                                value={fiscalYear.id.toString()}
                                                            >
                                                                {fiscalYear.year} {fiscalYear.isActive ? "(Active)" : ""}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    The fiscal year this expense belongs to
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="budgetId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Budget Category</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={budgets.length === 0}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={
                                                                budgets.length === 0
                                                                    ? "Select a fiscal year first"
                                                                    : "Select budget category"
                                                            } />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {budgets.map((budget) => (
                                                            <SelectItem
                                                                key={budget.id}
                                                                value={budget.id.toString()}
                                                            >
                                                                {budget.category.code} - {budget.category.name} (₱{budget.available.toLocaleString()} available)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    The budget category this expense belongs to
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Supplier Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Supplier Information</h3>
                                <Separator />

                                <FormField
                                    control={form.control}
                                    name="supplierId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Supplier</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select supplier (optional)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">No Supplier</SelectItem>
                                                    {suppliers.map((supplier) => (
                                                        <SelectItem
                                                            key={supplier.id}
                                                            value={supplier.id.toString()}
                                                        >
                                                            {supplier.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                The supplier or vendor for this expense
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="receiptNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Receipt Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="RC-12345 (Optional)" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Reference number from the supplier's receipt
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="isAuthorized"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-8">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        Pre-authorized Expense
                                                    </FormLabel>
                                                    <FormDescription>
                                                        Indicates this expense was pre-approved or budgeted
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/dashboard/finance/expenses")}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Expense"
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