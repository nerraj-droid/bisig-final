"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define types
interface AIP {
    id: string;
    title: string;
    fiscalYear: {
        startDate: string;
        endDate: string;
    };
    status: string;
}

interface BudgetCategory {
    id: string;
    name: string;
    code: string;
}

// Common sectors for barangay projects
const PROJECT_SECTORS = [
    "Infrastructure",
    "Health",
    "Education",
    "Agriculture",
    "Livelihood",
    "Social Welfare",
    "Disaster Risk Reduction",
    "Environment",
    "Peace and Order",
    "Tourism",
    "Other"
];

// Common funding sources for barangay projects
const FUNDING_SOURCES = [
    "Barangay Development Fund",
    "SK Fund",
    "DILG Funding",
    "Municipal Allocation",
    "Provincial Allocation",
    "Congressional Allocation",
    "NGO Grant",
    "Private Sector",
    "Other"
];

// Form validation schema
const formSchema = z.object({
    projectCode: z.string()
        .min(2, { message: "Project code must be at least 2 characters" }),
    title: z.string()
        .min(3, { message: "Title must be at least 3 characters" }),
    description: z.string()
        .min(10, { message: "Description must be at least 10 characters" }),
    sector: z.string({
        required_error: "Please select a sector",
    }),
    location: z.string().optional(),
    expectedBeneficiaries: z.string().optional(),
    startDate: z.date({
        required_error: "Start date is required",
    }),
    endDate: z.date({
        required_error: "End date is required",
    }),
    totalCost: z.string().refine(
        (val) => {
            const num = parseFloat(val);
            return !isNaN(num) && num > 0;
        },
        {
            message: "Total cost must be a positive number",
        }
    ),
    budgetCategoryId: z.string().optional(),
    fundSource: z.string().optional(),
}).refine(
    (data) => data.endDate > data.startDate,
    {
        message: "End date must be after start date",
        path: ["endDate"],
    }
);

type FormValues = z.infer<typeof formSchema>;

export default function NewProjectPage() {
    const params = useParams();
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [aip, setAip] = useState<AIP | null>(null);
    const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
    const [loadingAIP, setLoadingAIP] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Extract id from params
    const aipId = params.id as string;

    // Set up form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectCode: "",
            title: "",
            description: "",
            location: "",
            expectedBeneficiaries: "",
            totalCost: "",
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
            router.push(`/dashboard/finance/aip/${aipId}`);
        }
    }, [sessionStatus, router, session, aipId]);

    // Fetch AIP data
    useEffect(() => {
        if (sessionStatus === "authenticated" && aipId) {
            const fetchAIPData = async () => {
                try {
                    setLoadingAIP(true);
                    const response = await fetch(`/api/finance/aip/${aipId}`);

                    if (!response.ok) {
                        throw new Error(
                            response.status === 404
                                ? "AIP record not found"
                                : "Failed to fetch AIP data"
                        );
                    }

                    const data = await response.json();
                    setAip(data);

                    // Ensure AIP is in an editable state
                    if (!["DRAFT", "SUBMITTED", "APPROVED"].includes(data.status)) {
                        setError("This AIP is not in an editable state");
                    }
                } catch (err: any) {
                    console.error("Error fetching AIP:", err);
                    setError(err.message || "Failed to load AIP data");
                } finally {
                    setLoadingAIP(false);
                }
            };

            fetchAIPData();
        }
    }, [sessionStatus, aipId]);

    // Fetch budget categories
    useEffect(() => {
        if (sessionStatus === "authenticated") {
            const fetchBudgetCategories = async () => {
                try {
                    setLoadingCategories(true);
                    const response = await fetch("/api/finance/budget-categories");

                    if (!response.ok) {
                        throw new Error("Failed to fetch budget categories");
                    }

                    const data = await response.json();
                    setBudgetCategories(data);
                } catch (err) {
                    console.error("Error fetching budget categories:", err);
                    // Non-blocking error, we can proceed without categories
                } finally {
                    setLoadingCategories(false);
                }
            };

            fetchBudgetCategories();
        }
    }, [sessionStatus]);

    const onSubmit = async (values: FormValues) => {
        try {
            setSubmitLoading(true);
            setError(null);

            const response = await fetch(`/api/finance/aip/${aipId}/projects`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...values,
                    startDate: values.startDate.toISOString(),
                    endDate: values.endDate.toISOString(),
                    totalCost: values.totalCost,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create project");
            }

            router.push(`/dashboard/finance/aip/${aipId}`);
        } catch (err: any) {
            console.error("Error creating project:", err);
            setError(err.message || "Failed to create project. Please try again.");
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loadingAIP) {
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
                <div className="space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        );
    }

    if (error && !aip) {
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
                    <Link href={`/dashboard/finance/aip/${aipId}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to AIP
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Project</CardTitle>
                    <CardDescription>
                        {aip ? `Create a new project for ${aip.title}` : "Loading AIP..."}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Project Code */}
                                <FormField
                                    control={form.control}
                                    name="projectCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Code</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., INFRA-2024-001"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                A unique code to identify this project
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Title */}
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Barangay Road Improvement Project"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                A descriptive title for the project
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Provide a detailed description of the project, its goals, and expected outcomes"
                                                rows={4}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Detailed information about the project
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sector */}
                                <FormField
                                    control={form.control}
                                    name="sector"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sector</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a sector" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {PROJECT_SECTORS.map((sector) => (
                                                        <SelectItem key={sector} value={sector}>
                                                            {sector}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                The development sector this project belongs to
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Budget Category */}
                                <FormField
                                    control={form.control}
                                    name="budgetCategoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Budget Category</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a budget category (optional)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {loadingCategories ? (
                                                        <div className="p-2 text-center">Loading categories...</div>
                                                    ) : budgetCategories.length === 0 ? (
                                                        <div className="p-2 text-center">No categories available</div>
                                                    ) : (
                                                        budgetCategories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id}>
                                                                {category.code} - {category.name}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                The budget category this project is allocated under
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Location */}
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Sitio Malakas, Purok 3"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                The specific location where the project will be implemented
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Expected Beneficiaries */}
                                <FormField
                                    control={form.control}
                                    name="expectedBeneficiaries"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Expected Beneficiaries</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., 200 households in Purok 3"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                The target beneficiaries of this project
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Start Date */}
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
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Select start date</span>
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
                                                            // Disable dates before fiscal year start or after fiscal year end
                                                            aip ? (date < new Date(aip.fiscalYear.startDate) ||
                                                                date > new Date(aip.fiscalYear.endDate)) : false
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>
                                                The date when the project will start
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* End Date */}
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
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Select end date</span>
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
                                                            // Disable dates before start date (if selected) or before fiscal year start or after fiscal year end
                                                            (form.getValues().startDate ? date < form.getValues().startDate : false) ||
                                                            (aip ? (date < new Date(aip.fiscalYear.startDate) ||
                                                                date > new Date(aip.fiscalYear.endDate)) : false)
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>
                                                The date when the project will be completed
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Total Cost */}
                                <FormField
                                    control={form.control}
                                    name="totalCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Cost (₱)</FormLabel>
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
                                                The total budget required for this project
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Fund Source */}
                                <FormField
                                    control={form.control}
                                    name="fundSource"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fund Source</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a funding source (optional)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {FUNDING_SOURCES.map((source) => (
                                                        <SelectItem key={source} value={source}>
                                                            {source}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                The source of funds for this project
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push(`/dashboard/finance/aip/${aipId}`)}
                                    disabled={submitLoading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitLoading}>
                                    {submitLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Project"
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