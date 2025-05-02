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

import { ArrowLeft, CalendarIcon, AlertCircle, Loader2 } from "lucide-react";

// Define interfaces
interface Project {
    id: string;
    title: string;
    projectCode: string;
    description: string;
    sector: string;
    startDate: string;
    endDate: string;
    status: string;
    aip: {
        id: string;
        title: string;
    };
}

// Form validation schema
const formSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters" }),
    description: z.string().optional(),
    dueDate: z.date({
        required_error: "Due date is required",
    }),
    status: z.enum(["PENDING", "COMPLETED", "DELAYED", "CANCELLED"], {
        required_error: "Please select a status",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewMilestonePage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();

    // Extract ids from params
    const aipId = params.id as string;
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Set up form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            status: "PENDING",
        },
    });

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
            router.push(`/dashboard/finance/aip/${aipId}/projects/${projectId}`);
        }
    }, [sessionStatus, router, session, aipId, projectId]);

    // Fetch project data
    useEffect(() => {
        if (sessionStatus === "authenticated") {
            const fetchProject = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`/api/finance/aip/projects/${projectId}`);

                    if (!response.ok) {
                        throw new Error(
                            response.status === 404
                                ? "Project not found"
                                : "Failed to fetch project data"
                        );
                    }

                    const data = await response.json();
                    setProject(data);

                    // Ensure project is in an editable state
                    if (!["PLANNED", "ONGOING"].includes(data.status)) {
                        setError("This project is not in an editable state");
                    }
                } catch (err: any) {
                    console.error("Error fetching project:", err);
                    setError(err.message || "Failed to load project data");
                } finally {
                    setLoading(false);
                }
            };

            fetchProject();
        }
    }, [sessionStatus, projectId]);

    const onSubmit = async (values: FormValues) => {
        try {
            setSubmitting(true);
            setError(null);

            const response = await fetch(`/api/finance/aip/projects/${projectId}/milestones`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...values,
                    dueDate: values.dueDate.toISOString(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create milestone");
            }

            router.push(`/dashboard/finance/aip/${aipId}/projects/${projectId}/milestones`);
        } catch (err: any) {
            console.error("Error creating milestone:", err);
            setError(err.message || "Failed to create milestone. Please try again.");
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
                        <Link href={`/dashboard/finance/aip/${aipId}/projects/${projectId}/milestones`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Milestones
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

    if (error && !project) {
        return (
            <div className="container p-6">
                <div className="flex items-center mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        asChild
                    >
                        <Link href={`/dashboard/finance/aip/${aipId}/projects/${projectId}/milestones`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Milestones
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
                    <Link href={`/dashboard/finance/aip/${aipId}/projects/${projectId}/milestones`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Milestones
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add New Milestone</CardTitle>
                    <CardDescription>
                        {project ? `Create a new milestone for ${project.title}` : "Loading project..."}
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
                            {/* Title */}
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Complete site assessment"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            A short, descriptive title for this milestone
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Provide details about this milestone and its criteria for completion"
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            More detailed information about this milestone (optional)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Due Date */}
                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Due Date</FormLabel>
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
                                                                <span>Select due date</span>
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
                                                            // Disable dates outside project timeline
                                                            project ? (
                                                                date < new Date(project.startDate) ||
                                                                date > new Date(project.endDate)
                                                            ) : true
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>
                                                The date when this milestone should be completed
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Status */}
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
                                                        <SelectValue placeholder="Select a status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PENDING">Pending</SelectItem>
                                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                                    <SelectItem value="DELAYED">Delayed</SelectItem>
                                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                The current status of this milestone
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
                                    onClick={() => router.push(`/dashboard/finance/aip/${aipId}/projects/${projectId}/milestones`)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Milestone"
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