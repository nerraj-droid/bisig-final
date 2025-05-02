"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

interface FiscalYear {
    id: string;
    year: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

// Create form schema
const formSchema = z.object({
    fiscalYearId: z.string({
        required_error: "Fiscal year is required",
    }),
    title: z.string().min(3, {
        message: "Title must be at least 3 characters",
    }),
    description: z.string().optional(),
    totalAmount: z.string().refine(
        (val) => {
            const num = parseFloat(val);
            return !isNaN(num) && num > 0;
        },
        {
            message: "Total amount must be a positive number",
        }
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewAIPPage() {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Set up form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            totalAmount: "",
        },
    });

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
            router.push("/dashboard/finance");
        }
    }, [sessionStatus, router, session]);

    // Fetch fiscal years
    useEffect(() => {
        if (sessionStatus === "authenticated") {
            const fetchFiscalYears = async () => {
                try {
                    const response = await fetch("/api/finance/fiscal-years");
                    if (!response.ok) throw new Error("Failed to fetch fiscal years");

                    const data = await response.json();
                    setFiscalYears(data);

                    // Auto-select active fiscal year if available
                    const activeYear = data.find((year: FiscalYear) => year.isActive);
                    if (activeYear) {
                        form.setValue("fiscalYearId", activeYear.id);
                    }
                } catch (err) {
                    console.error("Error fetching fiscal years:", err);
                    setError("Failed to load fiscal year data");
                }
            };

            fetchFiscalYears();
        }
    }, [sessionStatus, form]);

    const onSubmit = async (values: FormValues) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("/api/finance/aip", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create AIP");
            }

            const data = await response.json();
            router.push(`/dashboard/finance/aip/${data.id}`);
        } catch (err: any) {
            console.error("Error creating AIP:", err);
            setError(err.message || "Failed to create AIP. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6">
            <div className="flex items-center mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mr-2"
                    asChild
                >
                    <Link href="/dashboard/finance/aip">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to AIP List
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Annual Investment Program</CardTitle>
                    <CardDescription>
                        Create a new AIP for your barangay's investment planning
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
                            <FormField
                                control={form.control}
                                name="fiscalYearId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fiscal Year</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Fiscal Year" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {fiscalYears.map((year) => (
                                                    <SelectItem key={year.id} value={year.id}>
                                                        {year.year} {year.isActive && "(Active)"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Select the fiscal year this AIP applies to
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Barangay Annual Investment Plan 2024"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            A descriptive title for this AIP
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
                                                placeholder="Provide a brief description of this AIP's purpose and goals"
                                                rows={4}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Optional: Provide additional context about this AIP
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="totalAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Budget Amount (₱)</FormLabel>
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
                                            The total budget allocation for this AIP
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/dashboard/finance/aip")}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create AIP"
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