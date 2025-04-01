"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CalendarIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Define schema for the form
const formSchema = z.object({
    type: z.literal("REVENUE"),
    referenceNumber: z.string().min(1, "Reference number is required"),
    date: z.date({ required_error: "Date is required" }),
    amount: z.coerce.number()
        .positive("Amount must be positive")
        .max(1000000000, "Amount is too large"),
    description: z.string().min(1, "Description is required"),
    fiscalYearId: z.string().min(1, "Please select a fiscal year"),
    budgetId: z.string().optional(),
    revenueSource: z.enum(["GENERAL", "RESIDENT", "HOUSEHOLD"], {
        required_error: "Revenue source is required",
    }),
    residentId: z.string().optional(),
    householdId: z.string().optional(),
    status: z.enum(["DRAFT", "PENDING", "APPROVED"]),
    isAuthorized: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

// Types
type FiscalYear = {
    id: number;
    year: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
};

type Budget = {
    id: number;
    amount: number;
    description: string | null;
    category: {
        id: number;
        code: string;
        name: string;
    };
};

type Resident = {
    id: string;
    firstName: string;
    lastName: string;
};

type Household = {
    id: string;
    householdCode: string;
};

export default function NewRevenuePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [residents, setResidents] = useState<Resident[]>([]);
    const [households, setHouseholds] = useState<Household[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("general");

    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "REVENUE",
            referenceNumber: "",
            date: new Date(),
            amount: 0,
            description: "",
            fiscalYearId: "",
            budgetId: undefined,
            revenueSource: "GENERAL",
            residentId: undefined,
            householdId: undefined,
            status: "DRAFT",
            isAuthorized: false,
        },
    });

    // Handle revenue source change
    const watchRevenueSource = form.watch("revenueSource");

    useEffect(() => {
        if (watchRevenueSource === "GENERAL") {
            form.setValue("residentId", undefined);
            form.setValue("householdId", undefined);
            setActiveTab("general");
        } else if (watchRevenueSource === "RESIDENT") {
            form.setValue("householdId", undefined);
            setActiveTab("resident");
        } else if (watchRevenueSource === "HOUSEHOLD") {
            form.setValue("residentId", undefined);
            setActiveTab("household");
        }
    }, [watchRevenueSource, form]);

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch fiscal years
                const fyResponse = await fetch("/api/finance/fiscal-years");
                if (!fyResponse.ok) {
                    throw new Error("Failed to fetch fiscal years");
                }
                const fyData = await fyResponse.json();
                setFiscalYears(fyData);

                // Set active fiscal year as default if available
                const activeFY = fyData.find((fy: FiscalYear) => fy.isActive);
                if (activeFY) {
                    form.setValue("fiscalYearId", activeFY.id.toString());

                    // Fetch budgets for this fiscal year
                    await fetchBudgets(activeFY.id);
                }

                // Fetch residents (limit 50 for performance)
                const residentsResponse = await fetch("/api/residents?limit=50");
                if (residentsResponse.ok) {
                    const residentsData = await residentsResponse.json();
                    setResidents(residentsData.residents);
                }

                // Fetch households (limit 50 for performance)
                const householdsResponse = await fetch("/api/households?limit=50");
                if (householdsResponse.ok) {
                    const householdsData = await householdsResponse.json();
                    setHouseholds(householdsData.households);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [form]);

    // Fetch budgets when fiscal year changes
    const fetchBudgets = async (fiscalYearId: number) => {
        try {
            const response = await fetch(`/api/finance/budgets?fiscalYearId=${fiscalYearId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch budgets");
            }

            const data = await response.json();

            // Filter revenue-related budgets only (code starting with 1)
            const revenueBudgets = data.filter((budget: Budget) =>
                budget.category && budget.category.code.startsWith("1")
            );

            setBudgets(revenueBudgets);
        } catch (err) {
            console.error("Error fetching budgets:", err);
            setBudgets([]);
        }
    };

    // Handle fiscal year change
    const handleFiscalYearChange = async (value: string) => {
        form.setValue("fiscalYearId", value);
        form.setValue("budgetId", undefined);
        await fetchBudgets(parseInt(value));
    };

    // Generate reference number
    const generateReferenceNumber = () => {
        const prefix = "REV";
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
        return `${prefix}-${timestamp}${random}`;
    };

    useEffect(() => {
        // Auto-generate reference number if empty
        if (!form.getValues("referenceNumber")) {
            const refNumber = generateReferenceNumber();
            form.setValue("referenceNumber", refNumber);
        }
    }, [form]);

    // Handle form submission
    async function onSubmit(data: FormValues) {
        setIsSubmitting(true);

        try {
            // Prepare data for submission
            const formData = {
                type: data.type,
                referenceNumber: data.referenceNumber,
                date: data.date.toISOString(),
                amount: data.amount,
                description: data.description,
                fiscalYearId: parseInt(data.fiscalYearId),
                status: data.status,
                // Only include fields below if they have values
                ...(data.budgetId ? { budgetId: parseInt(data.budgetId) } : {}),
                ...(data.residentId ? { residentId: data.residentId } : {}),
                ...(data.householdId ? { householdId: data.householdId } : {})
            };

            // Submit to API
            const response = await fetch("/api/finance/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create revenue transaction");
            }

            const transaction = await response.json();

            toast.success("Revenue transaction created successfully");
            router.push(`/dashboard/finance/revenue/${transaction.id}`);
        } catch (error) {
            console.error("Error creating revenue transaction:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create revenue transaction");
        } finally {
            setIsSubmitting(false);
        }
    }

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
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Create Revenue Transaction</h1>
                <p className="text-muted-foreground">
                    Record a new revenue transaction with complete details
                </p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction Information</CardTitle>
                            <CardDescription>
                                Basic details about the revenue transaction
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="referenceNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reference Number</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-2">
                                                    <Input placeholder="e.g. REV-123456" {...field} />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            const refNumber = generateReferenceNumber();
                                                            form.setValue("referenceNumber", refNumber);
                                                        }}
                                                        className="whitespace-nowrap"
                                                    >
                                                        Generate
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Unique identifier for this transaction
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
                                            <FormLabel>Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
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
                                                Date when the revenue was received
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount (₱)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Amount received in Philippine Peso
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
                                                    <SelectItem value="APPROVED">Approved</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Current status of this transaction
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
                                                placeholder="Brief description of the revenue"
                                                className="min-h-24"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide details about the revenue source and purpose
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Classification</CardTitle>
                            <CardDescription>
                                Classify the revenue for financial reporting
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="fiscalYearId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fiscal Year</FormLabel>
                                        <Select
                                            onValueChange={(value) => handleFiscalYearChange(value)}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select fiscal year" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {fiscalYears.map((fy) => (
                                                    <SelectItem
                                                        key={fy.id}
                                                        value={fy.id.toString()}
                                                    >
                                                        {fy.year} {fy.isActive && "(Active)"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            The fiscal year to which this revenue belongs
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
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select budget category (optional)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {budgets.length > 0 ? (
                                                    budgets.map((budget) => (
                                                        <SelectItem
                                                            key={budget.id}
                                                            value={budget.id.toString()}
                                                        >
                                                            {budget.category.code} - {budget.category.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem
                                                        value="none"
                                                        disabled
                                                    >
                                                        No revenue budgets available
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            The budget category for this revenue (optional)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Source</CardTitle>
                            <CardDescription>
                                Identify the source of the revenue
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="revenueSource"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Source Type</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="GENERAL" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        General Revenue
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="RESIDENT" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Resident Payment
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="HOUSEHOLD" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Household Payment
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormDescription>
                                            Select the type of revenue source
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsContent value="resident" className={watchRevenueSource !== "RESIDENT" ? "hidden" : ""}>
                                    <FormField
                                        control={form.control}
                                        name="residentId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Resident</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select resident" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {residents.length > 0 ? (
                                                            residents.map((resident) => (
                                                                <SelectItem
                                                                    key={resident.id}
                                                                    value={resident.id}
                                                                >
                                                                    {resident.firstName} {resident.lastName}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <SelectItem value="none" disabled>
                                                                No residents available
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    The resident who made the payment
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                <TabsContent value="household" className={watchRevenueSource !== "HOUSEHOLD" ? "hidden" : ""}>
                                    <FormField
                                        control={form.control}
                                        name="householdId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Household</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select household" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {households.length > 0 ? (
                                                            households.map((household) => (
                                                                <SelectItem
                                                                    key={household.id}
                                                                    value={household.id}
                                                                >
                                                                    Household {household.householdCode}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <SelectItem value="none" disabled>
                                                                No households available
                                                            </SelectItem>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    The household that made the payment
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                <TabsContent value="general">
                                    {watchRevenueSource === "GENERAL" && (
                                        <div className="text-sm text-muted-foreground">
                                            This is a general revenue not associated with any specific resident or household.
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Authorization</CardTitle>
                            <CardDescription>
                                Confirm that you're authorized to record this transaction
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="isAuthorized"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Authorization Confirmation
                                            </FormLabel>
                                            <FormDescription>
                                                I confirm that I am authorized to record this revenue transaction
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
                        </CardContent>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/dashboard/finance/revenue")}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !form.getValues().isAuthorized}
                        >
                            {isSubmitting ? "Creating..." : "Create Revenue Transaction"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
} 