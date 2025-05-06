"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import {
    ArrowLeft,
    Calendar,
    Check,
    ChevronDown,
    Edit,
    File,
    FileCheck,
    Loader2,
    MoreHorizontal,
    Plus,
    Trash2,
    UserCheck,
    X,
    BrainCircuit,
    Pencil,
    Send,
    Banknote,
    CheckCircle,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AIAdvisor } from "@/components/aip/AIAdvisor";

// Define type for AIP and related entities
interface AIP {
    id: string;
    title: string;
    description: string | null;
    status: string;
    totalAmount: number;
    createdAt: string;
    approvedDate: string | null;
    fiscalYear: {
        id: string;
        year: string;
        startDate: string;
        endDate: string;
        isActive: boolean;
    };
    projects: Project[];
    createdBy: {
        id: string;
        name: string | null;
        email: string;
    };
    approvedBy: {
        id: string;
        name: string | null;
        email: string;
    } | null;
    attachments: Attachment[];
}

interface Project {
    id: string;
    title: string;
    projectCode: string;
    description: string;
    sector: string;
    location: string | null;
    startDate: string;
    endDate: string;
    totalCost: number;
    status: string;
    progress: number;
    fundSource: string | null;
    budgetCategory: {
        id: string;
        name: string;
        code: string;
    } | null;
    milestones: Milestone[];
    expenses: Expense[];
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
    transaction: {
        id: string;
        referenceNumber: string;
    } | null;
}

interface Attachment {
    id: string;
    filename: string;
    filepath: string;
    filetype: string;
    filesize: number;
    description: string | null;
    uploadedAt: string;
    uploadedBy: {
        id: string;
        name: string | null;
    };
}

// Status badge styling
const statusStyles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    DRAFT: { variant: "outline", label: "Draft" },
    SUBMITTED: { variant: "secondary", label: "Submitted" },
    APPROVED: { variant: "default", label: "Approved" },
    REJECTED: { variant: "destructive", label: "Rejected" },
    IMPLEMENTED: { variant: "default", label: "Implemented" },
    COMPLETED: { variant: "default", label: "Completed" },
};

// Project status badge styling
const projectStatusStyles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    PLANNED: { variant: "outline", label: "Planned" },
    ONGOING: { variant: "secondary", label: "Ongoing" },
    COMPLETED: { variant: "default", label: "Completed" },
    CANCELLED: { variant: "destructive", label: "Cancelled" },
    DELAYED: { variant: "destructive", label: "Delayed" },
};

// Import the AttachmentsManager component
const AttachmentsManager = dynamic(() => import("@/components/aip/AttachmentsManager"), {
    loading: () => (
        <div className="space-y-2">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-2">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    ),
});

export default function AIPDetailPage() {
    const params = useParams();
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [aip, setAip] = useState<AIP | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmingAction, setConfirmingAction] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Extract id from params
    const aipId = params.id as string;

    // Role-based permissions
    const hasEditPermission = session?.user?.role && ["TREASURER", "CAPTAIN", "SUPER_ADMIN"].includes(session.user.role);
    const hasApprovePermission = session?.user?.role && ["CAPTAIN", "SUPER_ADMIN"].includes(session.user.role);
    const hasDeletePermission = session?.user?.role && ["CAPTAIN", "SUPER_ADMIN"].includes(session.user.role);

    useEffect(() => {
        if (sessionStatus === "unauthenticated") {
            router.push("/login");
        }
    }, [sessionStatus, router]);

    // Define fetchAIPData function with useCallback
    const fetchAIPData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

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
        } catch (err: any) {
            console.error("Error fetching AIP details:", err);
            setError(err.message || "Failed to load AIP data");
        } finally {
            setLoading(false);
        }
    }, [aipId]);

    // Fetch AIP data
    useEffect(() => {
        if (sessionStatus === "authenticated" && aipId) {
            fetchAIPData();
        }
    }, [sessionStatus, fetchAIPData]);

    // Calculate statistics
    const totalProjects = aip?.projects.length || 0;
    const completedProjects = aip?.projects.filter(p => p.status === "COMPLETED").length || 0;
    const ongoingProjects = aip?.projects.filter(p => p.status === "ONGOING").length || 0;
    const plannedProjects = aip?.projects.filter(p => p.status === "PLANNED").length || 0;

    const totalExpenses = aip?.projects.reduce(
        (sum, project) => sum + project.expenses.reduce((s, e) => s + e.amount, 0),
        0
    ) || 0;

    const progress = aip ? Math.min(
        Math.round((totalExpenses / aip.totalAmount) * 100),
        100
    ) : 0;

    // Format dates
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Handle status change
    const handleStatusChange = async (newStatus: string) => {
        try {
            setActionLoading(true);
            setError(null);

            const response = await fetch(`/api/finance/aip/${aipId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update AIP status to ${newStatus}`);
            }

            // Refresh AIP data after status change
            await fetchAIPData();
            setConfirmingAction(null);
        } catch (err: any) {
            console.error("Error updating AIP status:", err);
            setError(err.message || "Failed to update AIP status");
        } finally {
            setActionLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        try {
            setActionLoading(true);
            setError(null);

            const response = await fetch(`/api/finance/aip/${aipId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete AIP");
            }

            // Redirect back to the AIP list
            router.push("/dashboard/finance/aip");
        } catch (err: any) {
            console.error("Error deleting AIP:", err);
            setError(err.message || "Failed to delete AIP");
            setConfirmingAction(null);
        } finally {
            setActionLoading(false);
        }
    };

    // Status transition options
    const getAvailableStatusTransitions = (currentStatus: string): { value: string, label: string }[] => {
        const transitions: Record<string, { value: string, label: string }[]> = {
            DRAFT: [{ value: "SUBMITTED", label: "Submit for Approval" }],
            SUBMITTED: [
                { value: "APPROVED", label: "Approve" },
                { value: "REJECTED", label: "Reject" },
                { value: "DRAFT", label: "Return to Draft" }
            ],
            APPROVED: [{ value: "IMPLEMENTED", label: "Mark as Implemented" }],
            REJECTED: [{ value: "DRAFT", label: "Return to Draft" }],
            IMPLEMENTED: [{ value: "COMPLETED", label: "Mark as Completed" }],
            COMPLETED: []
        };

        return transitions[currentStatus] || [];
    };

    // Check if user can see status action buttons
    const canChangeStatus = (aip: AIP, toStatus: string): boolean => {
        if (!hasEditPermission) return false;

        // Special permissions for approval actions
        if (toStatus === "APPROVED" && !hasApprovePermission) return false;

        // Prevent approving your own submissions for accountability
        if (toStatus === "APPROVED" && session?.user?.id === aip.createdBy.id) return false;

        return true;
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
                        <Link href="/dashboard/finance/aip">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to AIP List
                        </Link>
                    </Button>
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Skeleton className="h-36" />
                        <Skeleton className="h-36" />
                        <Skeleton className="h-36" />
                    </div>
                    <Skeleton className="h-64" />
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
                        <Link href="/dashboard/finance/aip">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to AIP List
                        </Link>
                    </Button>
                </div>
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button onClick={fetchAIPData}>Retry</Button>
                </div>
            </div>
        );
    }

    if (!aip) {
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
                <Alert>
                    <AlertTitle>AIP Not Found</AlertTitle>
                    <AlertDescription>
                        The requested Annual Investment Program could not be found.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container p-6">
            {/* Top navigation */}
            <div className="flex justify-between items-center mb-6">
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                >
                    <Link href="/dashboard/finance/aip">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to AIP List
                    </Link>
                </Button>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        asChild
                    >
                        <Link href={`/dashboard/finance/aip/${aipId}/insights`}>
                            <BrainCircuit className="h-4 w-4 mr-2" />
                            AI Insights
                        </Link>
                    </Button>
                    
                    {hasEditPermission && aip.status === "DRAFT" && (
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/dashboard/finance/aip/${aip.id}/edit`)}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>

                            {/* Status change options */}
                            {getAvailableStatusTransitions(aip.status).length > 0 && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                    {getAvailableStatusTransitions(aip.status).map((transition) => (
                                        canChangeStatus(aip, transition.value) && (
                                            <AlertDialog key={transition.value} open={confirmingAction === transition.value} onOpenChange={() => setConfirmingAction(null)}>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setConfirmingAction(transition.value);
                                                        }}
                                                    >
                                                        {transition.label}
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to {transition.label.toLowerCase()} this AIP?
                                                            {transition.value === "APPROVED" && (
                                                                <p className="mt-2 font-medium">By approving, you validate that this AIP meets all requirements and can be implemented.</p>
                                                            )}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleStatusChange(transition.value)}
                                                            disabled={actionLoading}
                                                        >
                                                            {actionLoading ? (
                                                                <>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    Processing...
                                                                </>
                                                            ) : (
                                                                "Confirm"
                                                            )}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )
                                    ))}
                                </>
                            )}

                            {/* Delete option */}
                            {hasDeletePermission && ["DRAFT", "REJECTED"].includes(aip.status) && (
                                <>
                                    <DropdownMenuSeparator />
                                    <AlertDialog open={confirmingAction === "DELETE"} onOpenChange={() => setConfirmingAction(null)}>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setConfirmingAction("DELETE");
                                                }}
                                            >
                                                Delete AIP
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete this AIP? This action cannot be undone and will remove all associated projects, milestones, and expenses.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleDelete}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    disabled={actionLoading}
                                                >
                                                    {actionLoading ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Deleting...
                                                        </>
                                                    ) : (
                                                        "Delete"
                                                    )}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Title and description */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{aip.title}</h1>
                    <Badge variant={statusStyles[aip.status]?.variant || "outline"}>
                        {statusStyles[aip.status]?.label || aip.status}
                    </Badge>
                </div>
                {aip.description && (
                    <p className="text-muted-foreground">{aip.description}</p>
                )}
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Budget Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Budget</span>
                                <span className="font-medium">{formatCurrency(aip.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Spent</span>
                                <span className="font-medium">{formatCurrency(totalExpenses)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Remaining</span>
                                <span className="font-medium">{formatCurrency(aip.totalAmount - totalExpenses)}</span>
                            </div>
                            <div className="pt-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Budget Utilization</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Project Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Projects</span>
                                <span className="font-medium">{totalProjects}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Completed</span>
                                <span className="font-medium">{completedProjects}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Ongoing</span>
                                <span className="font-medium">{ongoingProjects}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Planned</span>
                                <span className="font-medium">{plannedProjects}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Fiscal Year</span>
                                <span className="font-medium">{aip.fiscalYear.year}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created By</span>
                                <span className="font-medium">{aip.createdBy.name || aip.createdBy.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created On</span>
                                <span className="font-medium">{formatDate(aip.createdAt)}</span>
                            </div>
                            {aip.approvedBy && aip.approvedDate && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Approved By</span>
                                    <span className="font-medium">{aip.approvedBy.name || aip.approvedBy.email}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* AI Advisor */}
            <div className="mb-6">
                <AIAdvisor aipId={aipId} />
            </div>

            {/* Content tabs */}
            <Tabs defaultValue="projects" className="mt-6">
                <TabsList className="mb-4">
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="attachments">Attachments</TabsTrigger>
                </TabsList>

                {/* Projects tab */}
                <TabsContent value="projects">
                    <Card className="mb-6">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Projects</CardTitle>
                                <CardDescription>
                                    View and manage projects under this Annual Investment Program
                                </CardDescription>
                            </div>
                            {hasEditPermission && ["DRAFT", "SUBMITTED", "APPROVED"].includes(aip.status) && (
                                <Button onClick={() => router.push(`/dashboard/finance/aip/${aip.id}/projects/new`)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Project
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {aip.projects.length === 0 ? (
                                <div className="text-center py-10">
                                    <File className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                                    <h3 className="text-lg font-medium">No Projects Found</h3>
                                    <p className="text-muted-foreground">
                                        Start creating projects to implement this Annual Investment Program.
                                    </p>
                                    {hasEditPermission && ["DRAFT", "SUBMITTED", "APPROVED"].includes(aip.status) && (
                                        <Button
                                            className="mt-4"
                                            onClick={() => router.push(`/dashboard/finance/aip/${aip.id}/projects/new`)}
                                        >
                                            Add First Project
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {aip.projects.map((project) => (
                                        <Card key={project.id} className="overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/finance/aip/${aip.id}/projects/${project.id}`)}>
                                            <CardContent className="p-0">
                                                <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold truncate">{project.title}</h3>
                                                            <Badge variant={projectStatusStyles[project.status]?.variant || "outline"}>
                                                                {projectStatusStyles[project.status]?.label || project.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                                                            <span className="text-muted-foreground">
                                                                Code: <span className="font-medium">{project.projectCode}</span>
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                Budget: <span className="font-medium">{formatCurrency(project.totalCost)}</span>
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                Sector: <span className="font-medium">{project.sector}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full md:w-48">
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span>Progress</span>
                                                            <span>{project.progress}%</span>
                                                        </div>
                                                        <Progress value={project.progress} className="h-2" />
                                                        <div className="flex justify-between text-xs mt-1">
                                                            <span>{formatDate(project.startDate)}</span>
                                                            <span>{formatDate(project.endDate)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Attachments tab */}
                <TabsContent value="attachments">
                    <AttachmentsManager
                        entityId={aipId}
                        entityType="aip"
                        onAttachmentAdded={fetchAIPData}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
} 