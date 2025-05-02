"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { format } from "date-fns";
import {
    ArrowLeft,
    Plus,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Loader2,
    PenLine,
    Trash2,
    ClipboardList,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Progress } from "@/components/ui/progress";

// Status style mapping
const milestoneStatusStyles: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" | "success" }> = {
    PENDING: { label: "Pending", variant: "outline" },
    COMPLETED: { label: "Completed", variant: "success" },
    DELAYED: { label: "Delayed", variant: "destructive" },
    CANCELLED: { label: "Cancelled", variant: "secondary" },
};

// Define interfaces
interface Milestone {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    completedAt: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface Project {
    id: string;
    aipId: string;
    title: string;
    status: string;
    progress: number;
    aip: {
        title: string;
    };
}

export default function ProjectMilestonesPage() {
    const params = useParams();
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();

    // Extract IDs from params
    const aipId = params.id as string;
    const projectId = params.projectId as string;

    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [isAddingMilestone, setIsAddingMilestone] = useState(false);
    const [isEditingMilestone, setIsEditingMilestone] = useState<string | null>(null);
    const [isDeletingMilestone, setIsDeletingMilestone] = useState<string | null>(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        status: "PENDING",
    });

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

    // Fetch milestones
    const fetchMilestones = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/finance/aip/projects/${projectId}/milestones`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to fetch milestones");
            }

            const data = await response.json();
            setMilestones(data);
        } catch (err: any) {
            console.error("Error fetching milestones:", err);
            setError(err.message || "Failed to load milestone data");
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

    // Fetch data
    useEffect(() => {
        if (sessionStatus === "authenticated") {
            fetchProjectData();
            fetchMilestones();
        }
    }, [sessionStatus, fetchProjectData, fetchMilestones]);

    // Format date
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "PPP");
    };

    // Handle form change
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle status change
    const handleStatusChange = (value: string) => {
        setFormData({ ...formData, status: value });
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            dueDate: "",
            status: "PENDING",
        });
    };

    // Close add dialog
    const closeAddDialog = () => {
        setIsAddingMilestone(false);
        resetForm();
    };

    // Open edit dialog
    const openEditDialog = (milestone: Milestone) => {
        setIsEditingMilestone(milestone.id);
        setFormData({
            title: milestone.title,
            description: milestone.description || "",
            dueDate: milestone.dueDate.split("T")[0], // YYYY-MM-DD format
            status: milestone.status,
        });
    };

    // Close edit dialog
    const closeEditDialog = () => {
        setIsEditingMilestone(null);
        resetForm();
    };

    // Create milestone
    const createMilestone = async () => {
        try {
            setSubmitLoading(true);
            const response = await fetch(`/api/finance/aip/projects/${projectId}/milestones`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create milestone");
            }

            await fetchMilestones();
            await fetchProjectData();
            closeAddDialog();
        } catch (err: any) {
            console.error("Error creating milestone:", err);
            setError(err.message || "Failed to create milestone");
        } finally {
            setSubmitLoading(false);
        }
    };

    // Update milestone
    const updateMilestone = async () => {
        if (!isEditingMilestone) return;

        try {
            setSubmitLoading(true);
            const response = await fetch(`/api/finance/aip/projects/${projectId}/milestones/${isEditingMilestone}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update milestone");
            }

            await fetchMilestones();
            await fetchProjectData();
            closeEditDialog();
        } catch (err: any) {
            console.error("Error updating milestone:", err);
            setError(err.message || "Failed to update milestone");
        } finally {
            setSubmitLoading(false);
        }
    };

    // Delete milestone
    const deleteMilestone = async () => {
        if (!isDeletingMilestone) return;

        try {
            setSubmitLoading(true);
            const response = await fetch(`/api/finance/aip/projects/${projectId}/milestones/${isDeletingMilestone}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to delete milestone");
            }

            await fetchMilestones();
            await fetchProjectData();
            setIsDeletingMilestone(null);
        } catch (err: any) {
            console.error("Error deleting milestone:", err);
            setError(err.message || "Failed to delete milestone");
        } finally {
            setSubmitLoading(false);
        }
    };

    // Calculate completion statistics
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === "COMPLETED").length;
    const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    if (loading && !project) {
        return (
            <div className="container p-6">
                <div className="flex items-center mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        asChild
                    >
                        <Link href={`/dashboard/finance/aip/${aipId}/projects/${projectId}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Project
                        </Link>
                    </Button>
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="h-[100px]" />
                        <Skeleton className="h-[100px]" />
                        <Skeleton className="h-[100px]" />
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
                        <Link href={`/dashboard/finance/aip/${aipId}/projects/${projectId}`}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Project
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
                    <Link href={`/dashboard/finance/aip/${aipId}/projects/${projectId}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Project
                    </Link>
                </Button>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold">Project Milestones</h1>
                    <p className="text-muted-foreground">
                        {project.title} - {project.aip.title}
                    </p>
                </div>

                {hasEditPermission && (
                    <Button
                        onClick={() => setIsAddingMilestone(true)}
                        className="md:ml-auto mt-4 md:mt-0"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Milestone
                    </Button>
                )}
            </div>

            {/* Progress bar */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="font-medium">Milestone Completion</span>
                            <div className="space-x-2">
                                <Badge variant="outline">{completedMilestones} of {totalMilestones} Completed</Badge>
                                <Badge variant="outline">{progressPercentage}%</Badge>
                            </div>
                        </div>
                        <Progress value={progressPercentage} className="h-2 w-full" />
                    </div>
                </CardContent>
            </Card>

            {/* Milestones List */}
            <div className="space-y-6">
                {milestones.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-10">
                            <ClipboardList className="h-10 w-10 text-muted-foreground mb-3" />
                            <h3 className="text-lg font-medium">No Milestones Found</h3>
                            <p className="text-muted-foreground text-center max-w-md mt-1">
                                Create milestones to track progress of the project implementation.
                            </p>
                            {hasEditPermission && (
                                <Button
                                    onClick={() => setIsAddingMilestone(true)}
                                    className="mt-4"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add First Milestone
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    milestones.map((milestone) => (
                        <Card key={milestone.id} className="relative overflow-hidden">
                            {milestone.status === "COMPLETED" && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                            )}
                            {milestone.status === "DELAYED" && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                            )}
                            {milestone.status === "CANCELLED" && (
                                <div className="absolute top-0 left-0 w-1 h-full bg-gray-500"></div>
                            )}
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">{milestone.title}</CardTitle>
                                        <CardDescription>
                                            Due: {formatDate(milestone.dueDate)}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={milestoneStatusStyles[milestone.status]?.variant || "default"}>
                                        {milestoneStatusStyles[milestone.status]?.label || milestone.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {milestone.description && (
                                    <p className="mb-4">{milestone.description}</p>
                                )}
                                <div className="flex items-center text-sm text-muted-foreground">
                                    {milestone.status === "COMPLETED" && milestone.completedAt ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                            <span>Completed on {formatDate(milestone.completedAt)}</span>
                                        </>
                                    ) : milestone.status === "DELAYED" ? (
                                        <>
                                            <AlertCircle className="h-4 w-4 mr-1 text-red-500" />
                                            <span>Delayed</span>
                                        </>
                                    ) : milestone.status === "CANCELLED" ? (
                                        <>
                                            <XCircle className="h-4 w-4 mr-1 text-gray-500" />
                                            <span>Cancelled</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="h-4 w-4 mr-1" />
                                            <span>Pending</span>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                            {hasEditPermission && (
                                <CardFooter className="flex justify-end space-x-2 pt-0 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditDialog(milestone)}
                                    >
                                        <PenLine className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setIsDeletingMilestone(milestone.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    ))
                )}
            </div>

            {/* Add Milestone Dialog */}
            <Dialog open={isAddingMilestone} onOpenChange={setIsAddingMilestone}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Milestone</DialogTitle>
                        <DialogDescription>
                            Create a new milestone for tracking project progress.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Milestone Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="E.g., Site Preparation, Foundation Work"
                                value={formData.title}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Provide details about this milestone"
                                value={formData.description}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                                id="dueDate"
                                name="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="DELAYED">Delayed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeAddDialog} disabled={submitLoading}>
                            Cancel
                        </Button>
                        <Button onClick={createMilestone} disabled={submitLoading}>
                            {submitLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Milestone"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Milestone Dialog */}
            <Dialog open={!!isEditingMilestone} onOpenChange={(open) => !open && closeEditDialog()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Milestone</DialogTitle>
                        <DialogDescription>
                            Update milestone details and progress.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-title">Milestone Title</Label>
                            <Input
                                id="edit-title"
                                name="title"
                                value={formData.title}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description (Optional)</Label>
                            <Textarea
                                id="edit-description"
                                name="description"
                                value={formData.description}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-dueDate">Due Date</Label>
                            <Input
                                id="edit-dueDate"
                                name="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="DELAYED">Delayed</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeEditDialog} disabled={submitLoading}>
                            Cancel
                        </Button>
                        <Button onClick={updateMilestone} disabled={submitLoading}>
                            {submitLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Milestone"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!isDeletingMilestone} onOpenChange={(open) => !open && setIsDeletingMilestone(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this milestone and remove it from the project progress calculation.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deleteMilestone}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={submitLoading}
                        >
                            {submitLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Milestone"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 