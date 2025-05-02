"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { format } from "date-fns";
import {
    ArrowLeft,
    Calendar,
    Landmark,
    MapPin,
    Users,
    FileText,
    Edit,
    Trash2,
    AlertCircle,
    Loader2,
    CheckCircle,
    ClipboardList,
    Receipt,
    ExternalLink,
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

// Status style mapping
const projectStatusStyles: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" | "success" }> = {
    PLANNED: { label: "Planned", variant: "outline" },
    ONGOING: { label: "Ongoing", variant: "secondary" },
    COMPLETED: { label: "Completed", variant: "success" },
    CANCELLED: { label: "Cancelled", variant: "destructive" },
    DELAYED: { label: "Delayed", variant: "destructive" },
};

// Define interfaces
interface Project {
    id: string;
    title: string;
    projectCode: string;
    description: string;
    sector: string;
    location: string | null;
    expectedBeneficiaries: string | null;
    startDate: string;
    endDate: string;
    totalCost: number;
    status: string;
    progress: number;
    fundSource: string | null;
    createdAt: string;
    updatedAt: string;
    budgetCategory: {
        id: string;
        name: string;
        code: string;
    } | null;
    milestones: Milestone[];
    expenses: Expense[];
    aip: {
        id: string;
        title: string;
        fiscalYear: {
            id: string;
            year: string;
        };
        status: string;
    };
}

interface Milestone {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    completedAt: string | null;
    status: string;
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
    } | null;
}

export default function ProjectDetailPage() {
    const params = useParams();
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();

    // Extract IDs from params
    const aipId = params.id as string;
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

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

    // Redirect if unauthenticated
    useEffect(() => {
        if (sessionStatus === "unauthenticated") {
            router.push("/login");
        }
    }, [sessionStatus, router]);

    // Fetch project data
    useEffect(() => {
        if (sessionStatus === "authenticated") {
            fetchProjectData();
        }
    }, [sessionStatus, fetchProjectData]);

    // Format dates
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "PPP");
    };

    // Delete project
    const deleteProject = async () => {
        try {
            setDeleteLoading(true);
            const response = await fetch(`/api/finance/aip/projects/${projectId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to delete project");
            }

            router.push(`/dashboard/finance/aip/${aipId}`);
        } catch (err: any) {
            console.error("Error deleting project:", err);
            setError(err.message || "Failed to delete project");
        } finally {
            setDeleteLoading(false);
            setConfirmingDelete(false);
        }
    };

    // Calculate statistics
    const totalMilestones = project?.milestones.length || 0;
    const completedMilestones = project?.milestones.filter(m => m.status === "COMPLETED").length || 0;
    const totalExpensesAmount = project?.expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    const budgetRemaining = project ? project.totalCost - totalExpensesAmount : 0;
    const budgetUtilization = project && project.totalCost > 0
        ? Math.min(Math.round((totalExpensesAmount / project.totalCost) * 100), 100)
        : 0;

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
                        <Link href={`/dashboard/finance/aip/${aipId}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to AIP
                        </Link>
                    </Button>
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="h-[200px]" />
                        <Skeleton className="h-[200px]" />
                        <Skeleton className="h-[200px]" />
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
                    <Link href={`/dashboard/finance/aip/${aipId}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to AIP
                    </Link>
                </Button>
            </div>

            {/* Project header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold">{project.title}</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Project Code: {project.projectCode}</span>
                        <Badge variant={projectStatusStyles[project.status]?.variant || "outline"}>
                            {projectStatusStyles[project.status]?.label || project.status}
                        </Badge>
                    </div>
                </div>

                {hasEditPermission && (
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/finance/aip/${aipId}/projects/${projectId}/edit`)}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the project and all associated data,
                                        including milestones and expenses. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={deleteProject}
                                        disabled={deleteLoading}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        {deleteLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            "Delete Project"
                                        )}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>

            {/* Progress indicator */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="font-medium">Project Progress</span>
                            <Badge variant="outline">{project.progress}% Complete</Badge>
                        </div>
                        <Progress value={project.progress} className="h-2 w-full" />
                    </div>
                </CardContent>
            </Card>

            {/* Feature cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Milestones card with link */}
                <Card className="hover:bg-accent/50 transition-colors">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Milestones</CardTitle>
                            <ClipboardList className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-medium">{totalMilestones}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Completed</span>
                                <span className="font-medium">{completedMilestones}</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => router.push(`/dashboard/finance/aip/${aipId}/projects/${projectId}/milestones`)}
                        >
                            View Milestones
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Expenses card with link */}
                <Card className="hover:bg-accent/50 transition-colors">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Expenses</CardTitle>
                            <Receipt className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Spent</span>
                                <span className="font-medium">{formatCurrency(totalExpensesAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Budget Utilization</span>
                                <span className="font-medium">{budgetUtilization}%</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => router.push(`/dashboard/finance/aip/${aipId}/projects/${projectId}/expenses`)}
                        >
                            Manage Expenses
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Budget summary card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Budget</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Budget</span>
                                <span className="font-medium">{formatCurrency(project.totalCost)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Remaining</span>
                                <span className={`font-medium ${budgetRemaining < 0 ? 'text-destructive' : 'text-green-600'}`}>
                                    {formatCurrency(budgetRemaining)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Budget Category</span>
                                <span className="font-medium">{project.budgetCategory?.name || "—"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Project details */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                            <p>{project.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Timeline</h3>
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>
                                        {formatDate(project.startDate)} — {formatDate(project.endDate)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Sector</h3>
                                <div className="flex items-center">
                                    <Landmark className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <span>{project.sector}</span>
                                </div>
                            </div>

                            {project.location && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Location</h3>
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>{project.location}</span>
                                    </div>
                                </div>
                            )}

                            {project.expectedBeneficiaries && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Expected Beneficiaries</h3>
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>{project.expectedBeneficiaries}</span>
                                    </div>
                                </div>
                            )}

                            {project.fundSource && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Fund Source</h3>
                                    <div className="flex items-center">
                                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                        <span>{project.fundSource}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent activity - can be expanded in future versions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates on this project</CardDescription>
                </CardHeader>
                <CardContent>
                    {project.milestones.length === 0 && project.expenses.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <p>No recent activity to display</p>
                            <p className="text-sm">Add milestones or expenses to track project implementation</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Show 3 most recent milestones or expenses by date */}
                            {[
                                ...project.milestones.map(m => ({
                                    type: "milestone" as const,
                                    date: new Date(m.completedAt || m.dueDate),
                                    data: m
                                })),
                                ...project.expenses.map(e => ({
                                    type: "expense" as const,
                                    date: new Date(e.date),
                                    data: e
                                }))
                            ]
                                .sort((a, b) => b.date.getTime() - a.date.getTime())
                                .slice(0, 3)
                                .map((activity, i) => (
                                    <div key={i} className="flex">
                                        <div className="mr-4 flex-shrink-0">
                                            {activity.type === "milestone" ? (
                                                <CheckCircle className="h-5 w-5 text-primary" />
                                            ) : (
                                                <Receipt className="h-5 w-5 text-amber-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {activity.type === "milestone"
                                                    ? `Milestone: ${activity.data.title}`
                                                    : `Expense: ${formatCurrency(activity.data.amount)}`
                                                }
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {activity.type === "milestone"
                                                    ? activity.data.completedAt
                                                        ? `Completed on ${formatDate(activity.data.completedAt)}`
                                                        : `Due on ${formatDate(activity.data.dueDate)}`
                                                    : `Recorded on ${formatDate(activity.data.date)}`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}