"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define schema for the form
const formSchema = z.object({
    fiscalYearId: z.string().min(1, "Please select a fiscal year"),
    categoryId: z.string().min(1, "Please select a budget category"),
    amount: z.coerce.number()
        .min(0, "Amount must be a positive number")
        .max(1000000000, "Amount is too large"),
    description: z.string().optional(),
    isAuthorized: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

// Fiscal year type for API response
type FiscalYear = {
    id: number;
    year: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
};

// Budget category type for API response
type BudgetCategory = {
    id: number;
    code: string;
    name: string;
    description: string | null;
    parentId: number | null;
};

export default function NewBudgetPlanPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
    const [categories, setCategories] = useState<BudgetCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fiscalYearId: "",
            categoryId: "",
            amount: 0,
            description: "",
            isAuthorized: false,
        },
    });

    // Fetch fiscal years and categories on component mount
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

                // Fetch budget categories
                const catResponse = await fetch("/api/finance/budget-categories");
                if (!catResponse.ok) {
                    throw new Error("Failed to fetch budget categories");
                }
                const catData = await catResponse.json();
                setCategories(catData);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle form submission
    async function onSubmit(data: FormValues) {
        setIsSubmitting(true);

        try {
            // Convert string IDs to numbers
            const formData = {
                fiscalYearId: parseInt(data.fiscalYearId),
                categoryId: parseInt(data.categoryId),
                amount: data.amount,
                description: data.description || "",
            };

            // Submit to API
            const response = await fetch("/api/finance/budgets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create budget");
            }

            toast.success("Budget created successfully");
            router.push("/dashboard/finance/budgets/plan");
        } catch (error) {
            console.error("Error creating budget:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create budget");
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
                <h1 className="text-2xl font-bold tracking-tight">Create Budget Item</h1>
                <p className="text-muted-foreground">
                    Allocate budget funds to a specific category
                </p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Budget Allocation Details</CardTitle>
                    <CardDescription>
                        Select fiscal year, category, and set amount
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                            The fiscal year for this budget allocation
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Budget Category</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select budget category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem
                                                        key={cat.id}
                                                        value={cat.id.toString()}
                                                    >
                                                        {cat.code} - {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            The category where funds will be allocated
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                            Amount allocated to this budget category
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter budget details or notes"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Optional notes about this budget allocation
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Separator />

                            <FormField
                                control={form.control}
                                name="isAuthorized"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">
                                                Authorization
                                            </FormLabel>
                                            <FormDescription>
                                                I confirm that I am authorized to create this budget allocation
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

                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !form.getValues().isAuthorized}
                                >
                                    {isSubmitting ? "Creating..." : "Create Budget"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
} 