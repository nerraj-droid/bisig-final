"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Form schema
const fiscalYearSchema = z.object({
    year: z.string().min(5, {
        message: "Fiscal year must be in format YYYY-YYYY",
    }).max(9).regex(/^\d{4}-\d{4}$/, {
        message: "Fiscal year must be in format YYYY-YYYY",
    }),
    startDate: z.date({
        required_error: "Start date is required",
    }),
    endDate: z.date({
        required_error: "End date is required",
    }),
    isActive: z.boolean().default(false),
}).refine((data) => {
    return data.startDate < data.endDate;
}, {
    message: "End date must be after start date",
    path: ["endDate"],
});

type FiscalYearFormValues = z.infer<typeof fiscalYearSchema>;

export default function NewFiscalYearPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Role-based access control
    const canAccessFinancialModule = session?.user?.role && ["TREASURER", "CAPTAIN", "SUPER_ADMIN"].includes(session.user.role);

    // Initialize form
    const form = useForm<FiscalYearFormValues>({
        resolver: zodResolver(fiscalYearSchema),
        defaultValues: {
            year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
            startDate: new Date(new Date().getFullYear(), 0, 1), // January 1st of current year
            endDate: new Date(new Date().getFullYear(), 11, 31), // December 31st of current year
            isActive: false,
        },
    });

    // Form submission handler
    const onSubmit = async (values: FiscalYearFormValues) => {
        try {
            setIsSubmitting(true);
            setError(null);
            setSuccess(null);

            const response = await fetch("/api/finance/fiscal-years", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...values,
                    startDate: values.startDate.toISOString(),
                    endDate: values.endDate.toISOString(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create fiscal year");
            }

            setSuccess("Fiscal year created successfully!");

            // Redirect to fiscal years list after a short delay
            setTimeout(() => {
                router.push("/dashboard/finance/fiscal-years");
            }, 1500);
        } catch (err: any) {
            console.error("Error creating fiscal year:", err);
            setError(err.message || "Failed to create fiscal year. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (status === "unauthenticated") {
        router.push("/login");
        return null;
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
            <div className="flex items-center mb-6">
                <Button
                    variant="outline"
                    className="mr-4"
                    onClick={() => router.push("/dashboard/finance/fiscal-years")}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">New Fiscal Year</h1>
                    <p className="text-muted-foreground">
                        Create a new fiscal year for budgeting and financial reporting
                    </p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Fiscal Year Details</CardTitle>
                    <CardDescription>
                        Create a new fiscal year period for financial management
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fiscal Year</FormLabel>
                                        <FormControl>
                                            <Input placeholder="2023-2024" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the fiscal year in YYYY-YYYY format
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
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
                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>
                                                The start date of the fiscal year
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>End Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
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
                                                        disabled={(date) => date < form.getValues().startDate || date < new Date("1900-01-01")}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>
                                                The end date of the fiscal year
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Set as Active Fiscal Year
                                            </FormLabel>
                                            <FormDescription>
                                                If checked, this will be set as the active fiscal year for budgeting and expenses
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mr-2"
                                    onClick={() => router.push("/dashboard/finance/fiscal-years")}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Fiscal Year"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
} 