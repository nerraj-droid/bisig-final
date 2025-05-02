import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, File, FileText, Image, Paperclip, Trash2, Upload, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getFileIconByType, formatBytes } from "@/lib/utils";

interface Attachment {
    id: string;
    filename: string;
    filepath: string;
    filesize: number;
    filetype: string;
    description?: string;
    uploadedAt: string;
    uploadedBy: {
        id: string;
        name: string;
    };
    category?: string;
}

interface AttachmentsManagerProps {
    entityId: string; // AIP ID or Project ID
    entityType: "aip" | "project"; // Type of entity
    onAttachmentAdded?: () => void;
}

const AttachmentsManager: React.FC<AttachmentsManagerProps> = ({
    entityId,
    entityType,
    onAttachmentAdded,
}) => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [error, setError] = useState("");

    const router = useRouter();

    // Fetch attachments
    const fetchAttachments = useCallback(async () => {
        try {
            setLoading(true);
            const endpoint = entityType === "aip"
                ? `/api/finance/aip/${entityId}/attachments`
                : `/api/finance/aip/projects/${entityId}/attachments`;

            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error("Failed to fetch attachments");
            }

            const data = await response.json();
            setAttachments(data);
        } catch (error) {
            console.error("Error fetching attachments:", error);
            toast.error("Failed to load attachments");
        } finally {
            setLoading(false);
        }
    }, [entityId, entityType]);

    useEffect(() => {
        fetchAttachments();
    }, [fetchAttachments]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setSelectedFile(files[0]);
            setError("");
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a file to upload");
            return;
        }

        // Validate file size (5MB limit)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("File size exceeds 5MB limit");
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(10);

            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("type", entityType === "aip" ? "aip-attachment" : "aip-project");
            formData.append("entityId", entityId);
            formData.append("description", description);
            if (entityType === "project" && category) {
                formData.append("category", category);
            }

            setUploadProgress(30);

            // Upload the file
            const uploadResponse = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.error || "Upload failed");
            }

            setUploadProgress(70);

            const uploadData = await uploadResponse.json();

            // Create attachment record in database
            const attachmentData = {
                filename: selectedFile.name,
                filepath: uploadData.url,
                filesize: selectedFile.size,
                filetype: selectedFile.type,
                description: description,
                ...(entityType === "project" && category ? { category } : {}),
            };

            const endpoint = entityType === "aip"
                ? `/api/finance/aip/${entityId}/attachments`
                : `/api/finance/aip/projects/${entityId}/attachments`;

            const attachmentResponse = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(attachmentData),
            });

            setUploadProgress(100);

            if (!attachmentResponse.ok) {
                const errorData = await attachmentResponse.json();
                throw new Error(errorData.error || "Failed to save attachment record");
            }

            toast.success("File uploaded successfully");

            // Reset form
            setSelectedFile(null);
            setDescription("");
            setCategory("");

            // Refresh attachments list
            fetchAttachments();

            // Trigger callback if provided
            if (onAttachmentAdded) {
                onAttachmentAdded();
            }

            // Refresh the page to reflect changes
            router.refresh();
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error instanceof Error ? error.message : "An error occurred during upload");
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDelete = async (attachmentId: string) => {
        if (!confirm("Are you sure you want to delete this attachment?")) {
            return;
        }

        try {
            const endpoint = entityType === "aip"
                ? `/api/finance/aip/${entityId}/attachments?attachmentId=${attachmentId}`
                : `/api/finance/aip/projects/${entityId}/attachments?attachmentId=${attachmentId}`;

            const response = await fetch(endpoint, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete attachment");
            }

            toast.success("Attachment deleted successfully");

            // Refresh the list
            fetchAttachments();
            router.refresh();
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete attachment");
        }
    };

    const renderFileIcon = (fileType: string) => {
        if (fileType.includes("image")) {
            return <Image className="h-4 w-4 mr-2" />;
        } else if (fileType.includes("pdf")) {
            return <FileText className="h-4 w-4 mr-2" />;
        } else {
            return <File className="h-4 w-4 mr-2" />;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg flex items-center">
                    <Paperclip className="h-5 w-5 mr-2" />
                    {entityType === "aip" ? "AIP Attachments" : "Project Attachments"}
                </CardTitle>
                <CardDescription>
                    Manage {entityType === "aip" ? "AIP" : "project"} documents and files
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Upload Form */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Upload New File</h3>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="file-upload">File</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                        className="flex-1"
                                    />
                                    {selectedFile && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setSelectedFile(null)}
                                                        disabled={uploading}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Clear selection</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                                {selectedFile && (
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
                                    </div>
                                )}
                                {error && (
                                    <div className="mt-2 text-sm text-destructive flex items-center">
                                        <AlertCircle className="h-4 w-4 mr-1" />
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={uploading}
                                    placeholder="Enter a description for this file"
                                    className="mt-1"
                                />
                            </div>

                            {entityType === "project" && (
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        disabled={uploading}
                                        placeholder="E.g., proposal, contract, photo, report"
                                        className="mt-1"
                                    />
                                </div>
                            )}

                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="w-full"
                            >
                                {uploading ? (
                                    <>
                                        Uploading... {uploadProgress}%
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload File
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Attachments List */}
                    <div>
                        <h3 className="font-medium mb-3">Uploaded Files</h3>
                        {loading ? (
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
                        ) : attachments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border rounded-md">
                                No attachments found. Upload files to get started.
                            </div>
                        ) : (
                            <div className="border rounded-md overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>File</TableHead>
                                            <TableHead>Description</TableHead>
                                            {entityType === "project" && <TableHead>Category</TableHead>}
                                            <TableHead>Uploaded</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attachments.map((attachment) => (
                                            <TableRow key={attachment.id}>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        {renderFileIcon(attachment.filetype)}
                                                        <a
                                                            href={attachment.filepath}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline flex-1 truncate max-w-[200px]"
                                                        >
                                                            {attachment.filename}
                                                        </a>
                                                        <Badge variant="outline" className="ml-2">
                                                            {formatBytes(attachment.filesize)}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    {attachment.description || "-"}
                                                </TableCell>
                                                {entityType === "project" && (
                                                    <TableCell>
                                                        {attachment.category ? (
                                                            <Badge variant="secondary">{attachment.category}</Badge>
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {formatDistanceToNow(new Date(attachment.uploadedAt), {
                                                                        addSuffix: true,
                                                                    })}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                By {attachment.uploadedBy.name || "Unknown"}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={attachment.filepath}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent"
                                                        >
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <File className="h-4 w-4" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>View</TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </a>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div
                                                                        className="h-8 w-8 flex items-center justify-center text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                                                                        onClick={() => handleDelete(attachment.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Delete</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AttachmentsManager; 